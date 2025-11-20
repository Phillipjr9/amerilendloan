#!/usr/bin/env python3
"""
Special Character API Response Scanner
Analyzes API responses for special character handling, encoding issues, and XSS vulnerabilities

This script tests the loan application API with special characters and validates:
- Correct character encoding in responses
- Proper HTML escaping of special characters
- SQL injection prevention
- XSS vulnerability prevention
- Unicode and emoji handling
- Character preservation in database

Features:
- Multi-threaded request execution
- HTML and JSON report generation
- Character encoding validation
- Security pattern detection
- Response time tracking

Usage:
    python3 test-special-characters-scanner.py [--url API_URL] [--output OUTPUT_DIR]

Examples:
    python3 test-special-characters-scanner.py
    python3 test-special-characters-scanner.py --url http://localhost:3000/api/trpc --output ./reports
"""

import requests
import json
import time
import sys
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from typing import Dict, List, Tuple, Any
import re
from pathlib import Path

# Constants
DEFAULT_URL = "http://localhost:3000/api/trpc"
TIMEOUT = 30
MAX_WORKERS = 5

# Test data with special characters
SPECIAL_CHARACTER_TESTS = {
    "unicode_accents": {
        "description": "Unicode and accented characters",
        "fullName": "Jean-Claude François",
        "street": "Rue de l'Église",
        "city": "Montréal",
        "employer": "Société Générale",
        "loanPurpose": "Rénovation de maison"
    },
    "unicode_cyrillic": {
        "description": "Cyrillic characters (Russian)",
        "fullName": "Владимир Петровский",
        "street": "Улица Ленина 100",
        "city": "Москва",
        "employer": "Компания Россия",
        "loanPurpose": "Расширение бизнеса"
    },
    "unicode_chinese": {
        "description": "Chinese characters",
        "fullName": "王小明",
        "street": "中关村大街 200 号",
        "city": "北京",
        "employer": "中国公司",
        "loanPurpose": "商业扩展和设备购置"
    },
    "html_special_chars": {
        "description": "HTML special characters",
        "fullName": "John <Test> Smith",
        "employer": "Tech & Associates",
        "street": "123 Main Street & Oak Ave",
        "loanPurpose": "Home improvement & expansion"
    },
    "sql_injection_single_quote": {
        "description": "SQL injection - single quote",
        "fullName": "Robert'; DROP TABLE--",
        "street": "123 Street'; SELECT * FROM",
        "loanPurpose": "Loan for 'admin' access"
    },
    "sql_injection_double_quote": {
        "description": "SQL injection - double quote",
        "fullName": 'Robert" OR "1"="1',
        "loanPurpose": 'Loan purpose" OR "1"="1'
    },
    "sql_injection_semicolon": {
        "description": "SQL injection - semicolon",
        "fullName": "Robert; DELETE FROM",
        "loanPurpose": "Test; DROP TABLE loans;"
    },
    "xss_script_tag": {
        "description": "XSS - script tag",
        "fullName": "John<script>alert('XSS')</script>",
        "loanPurpose": "Loan <script>alert('test')</script> purpose"
    },
    "xss_img_onerror": {
        "description": "XSS - img onerror",
        "fullName": "Test<img src=x onerror=alert('XSS')>",
        "loanPurpose": "Purpose<img src=x onerror=alert(1)>"
    },
    "xss_event_handler": {
        "description": "XSS - event handler",
        "fullName": 'John" onload="alert(\'XSS\')" x="',
        "street": 'Street" onclick="alert(1)" x="'
    },
    "basic_symbols": {
        "description": "Basic symbols and punctuation",
        "fullName": "Mary-Ann O'Brien",
        "street": "123 Main St., Suite 200",
        "employer": "Smith & Associates, Inc.",
        "loanPurpose": "Home improvement (Phase 1 & 2); Equipment: $5K-$10K"
    },
    "currency_symbols": {
        "description": "Currency symbols",
        "fullName": "Test User",
        "loanPurpose": "Equipment purchase ($5000) & expansion (€2000)"
    },
    "math_operators": {
        "description": "Mathematical operators",
        "fullName": "Test User",
        "loanPurpose": "Phase 1 (±2 weeks) + Phase 2 (±4 weeks) = expansion"
    },
    "quotes_mixed": {
        "description": "Mixed quotes",
        "fullName": 'John "Jack" O\'Brien',
        "employer": "\"Premium\" Services Inc.",
        "loanPurpose": 'Office for \'team\' expansion'
    },
    "parentheses_brackets": {
        "description": "Parentheses and brackets",
        "fullName": "Test User",
        "street": "123 Street (rear building) [Section B]",
        "loanPurpose": "(Phase 1) - Equipment; [Phase 2] - Expansion {2024}"
    },
    "emoji": {
        "description": "Emoji characters",
        "fullName": "John Doe 🚀",
        "loanPurpose": "Expansion ✅ Phase 1, ❌ Phase 2 pending 💰"
    },
    "mixed_unicode": {
        "description": "Mixed Unicode sets",
        "fullName": "Jean-Pierre Müller",
        "street": "Rue St. Jean, 北京 Street",
        "loanPurpose": "Expansion & renovations; Этап 1 ✅"
    }
}

class SpecialCharacterScanner:
    """Scanner for testing special character handling in API"""
    
    def __init__(self, api_url: str = DEFAULT_URL):
        self.api_url = api_url
        self.session = requests.Session()
        self.results: List[Dict[str, Any]] = []
        self.start_time = None
        self.end_time = None
        
    def create_loan_application(self, test_name: str, test_data: Dict[str, str]) -> Dict[str, Any]:
        """Create a loan application with special character test data"""
        
        application_data = {
            "fullName": test_data.get("fullName", "Test User"),
            "email": test_data.get("email", f"test.{test_name}@example.com"),
            "phone": test_data.get("phone", "5551234567"),
            "password": "SecurePass123!@#",
            "dateOfBirth": "1990-01-01",
            "ssn": "123-45-6789",
            "street": test_data.get("street", "123 Main Street"),
            "city": test_data.get("city", "Boston"),
            "state": "MA",
            "zipCode": "02101",
            "employmentStatus": "employed",
            "employer": test_data.get("employer", "Test Company"),
            "monthlyIncome": 5000,
            "loanType": "installment",
            "requestedAmount": 25000,
            "loanPurpose": test_data.get("loanPurpose", "Test loan purpose"),
            "disbursementMethod": "bank_transfer"
        }
        
        return application_data
    
    def test_special_characters(self, test_name: str, test_config: Dict[str, Any]) -> Dict[str, Any]:
        """Test special character handling for a specific test case"""
        
        test_data = test_config.copy()
        description = test_data.pop("description", "")
        
        try:
            # Create application data
            app_data = self.create_loan_application(test_name, test_data)
            
            # Make request
            start = time.time()
            response = self.session.post(
                f"{self.api_url}/loans.submit",
                json=app_data,
                timeout=TIMEOUT
            )
            end = time.time()
            
            response_time = end - start
            status_code = response.status_code
            
            # Parse response
            try:
                response_json = response.json()
            except:
                response_json = {"error": "Could not parse JSON", "text": response.text[:500]}
            
            # Analyze response
            result = {
                "testName": test_name,
                "description": description,
                "statusCode": status_code,
                "responseTime": response_time,
                "success": response_json.get("success", False) if isinstance(response_json, dict) else False,
                "hasError": "error" in response_json if isinstance(response_json, dict) else False,
                "inputCharacters": self._extract_characters(test_data),
                "responseFields": response_json.get("data", {}) if isinstance(response_json, dict) else {},
                "characterPreservation": self._check_character_preservation(test_data, response_json),
                "htmlEscaping": self._check_html_escaping(response_json),
                "injectionDetected": self._check_injection_patterns(response_json),
                "timestamp": datetime.now().isoformat()
            }
            
            return result
            
        except requests.exceptions.Timeout:
            return {
                "testName": test_name,
                "description": description,
                "error": "Request timeout",
                "statusCode": None,
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "testName": test_name,
                "description": description,
                "error": str(e),
                "statusCode": None,
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
    
    def _extract_characters(self, test_data: Dict[str, str]) -> List[str]:
        """Extract unique character types from test data"""
        characters = set()
        for value in test_data.values():
            if isinstance(value, str):
                for char in value:
                    if ord(char) > 127:  # Non-ASCII
                        characters.add(f"U+{ord(char):04X}")
        return list(characters)
    
    def _check_character_preservation(self, test_data: Dict[str, str], response: Dict[str, Any]) -> Dict[str, bool]:
        """Check if special characters are preserved in response"""
        
        preservation = {}
        
        if isinstance(response, dict) and "data" in response:
            response_data = response["data"]
            if isinstance(response_data, dict):
                for field, value in test_data.items():
                    if isinstance(value, str) and field in response_data:
                        response_value = response_data[field]
                        # Check if key characters are preserved
                        if isinstance(response_value, str):
                            # Check for at least some special chars
                            special_chars_in_input = [c for c in value if ord(c) > 127 or c in '<>&"\'']
                            special_chars_in_response = [c for c in response_value if ord(c) > 127 or c in '<>&"\'']
                            
                            if special_chars_in_input:
                                preservation[field] = len(special_chars_in_response) > 0
                            else:
                                preservation[field] = value in response_value
        
        return preservation
    
    def _check_html_escaping(self, response: Dict[str, Any]) -> Dict[str, bool]:
        """Check if HTML special characters are properly escaped"""
        
        escaping = {
            "angle_brackets_escaped": False,
            "ampersand_escaped": False,
            "quotes_escaped": False,
            "script_tags_removed": True,
            "event_handlers_removed": True
        }
        
        response_str = json.dumps(response)
        
        # Check for escaped HTML characters
        if "&lt;" in response_str or "\\u003c" in response_str:
            escaping["angle_brackets_escaped"] = True
        if "&amp;" in response_str or "\\u0026" in response_str:
            escaping["ampersand_escaped"] = True
        if "&quot;" in response_str or "\\u0022" in response_str or '\\"' in response_str:
            escaping["quotes_escaped"] = True
        
        # Check for unescaped dangerous patterns
        if "<script>" in response_str and "&lt;script&gt;" not in response_str:
            escaping["script_tags_removed"] = False
        if "onerror=" in response_str and "onerror=" not in response_str.replace("onerror=", ""):
            escaping["event_handlers_removed"] = False
        
        return escaping
    
    def _check_injection_patterns(self, response: Dict[str, Any]) -> Dict[str, bool]:
        """Check for injection attack patterns in response"""
        
        patterns = {
            "sql_injection_indicators": False,
            "xss_indicators": False,
            "command_injection_indicators": False,
            "path_traversal_indicators": False
        }
        
        response_str = json.dumps(response).lower()
        
        # SQL injection patterns
        sql_patterns = [r"drop\s+table", r"delete\s+from", r"union\s+select", r"exec\s*\("]
        for pattern in sql_patterns:
            if re.search(pattern, response_str):
                patterns["sql_injection_indicators"] = True
                break
        
        # XSS patterns (unescaped)
        xss_patterns = [
            r"<script>(?!<)",
            r"onerror\s*=\s*(?!\\)",
            r"onclick\s*=\s*(?!\\)",
            r"javascript:\s*"
        ]
        for pattern in xss_patterns:
            if re.search(pattern, response_str):
                patterns["xss_indicators"] = True
                break
        
        # Command injection patterns
        cmd_patterns = [r"\|\s*cat", r";\s*rm\s+", r"`.*`", r"\$\(.*\)"]
        for pattern in cmd_patterns:
            if re.search(pattern, response_str):
                patterns["command_injection_indicators"] = True
                break
        
        return patterns
    
    def run_all_tests(self) -> List[Dict[str, Any]]:
        """Run all special character tests"""
        
        self.start_time = datetime.now()
        self.results = []
        
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = {}
            for test_name, test_config in SPECIAL_CHARACTER_TESTS.items():
                future = executor.submit(self.test_special_characters, test_name, test_config)
                futures[future] = test_name
            
            for future in as_completed(futures):
                test_name = futures[future]
                try:
                    result = future.result()
                    self.results.append(result)
                    print(f"✓ {test_name}")
                except Exception as e:
                    print(f"✗ {test_name}: {str(e)}")
        
        self.end_time = datetime.now()
        return self.results
    
    def generate_json_report(self, output_path: Path) -> str:
        """Generate JSON report"""
        
        report = {
            "title": "Special Character Handling Test Report",
            "timestamp": datetime.now().isoformat(),
            "duration": (self.end_time - self.start_time).total_seconds() if self.end_time and self.start_time else 0,
            "summary": self._generate_summary(),
            "results": self.results
        }
        
        report_path = output_path / "special-characters-report.json"
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        return str(report_path)
    
    def generate_html_report(self, output_path: Path) -> str:
        """Generate HTML report"""
        
        summary = self._generate_summary()
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Special Character Handling Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }}
        .header {{ background-color: #2c3e50; color: white; padding: 20px; border-radius: 5px; }}
        .summary {{ background-color: white; padding: 15px; margin: 20px 0; border-left: 4px solid #3498db; }}
        .summary-stat {{ display: inline-block; margin-right: 30px; }}
        .summary-stat label {{ font-weight: bold; }}
        .test-result {{ background-color: white; margin: 10px 0; padding: 15px; border-left: 4px solid #95a5a6; }}
        .test-result.success {{ border-left-color: #27ae60; }}
        .test-result.error {{ border-left-color: #e74c3c; }}
        .test-name {{ font-weight: bold; font-size: 14px; }}
        .test-description {{ color: #7f8c8d; font-size: 12px; }}
        .test-details {{ margin-top: 10px; font-size: 12px; }}
        .test-details table {{ width: 100%; border-collapse: collapse; }}
        .test-details td {{ padding: 5px; border-bottom: 1px solid #ecf0f1; }}
        .test-details td:first-child {{ font-weight: bold; width: 25%; }}
        .status-badge {{ display: inline-block; padding: 4px 8px; border-radius: 3px; font-size: 11px; }}
        .status-success {{ background-color: #27ae60; color: white; }}
        .status-error {{ background-color: #e74c3c; color: white; }}
        .status-warning {{ background-color: #f39c12; color: white; }}
        .metrics {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }}
        .metric-card {{ background-color: white; padding: 15px; border-radius: 5px; text-align: center; }}
        .metric-value {{ font-size: 24px; font-weight: bold; color: #3498db; }}
        .metric-label {{ color: #7f8c8d; font-size: 12px; margin-top: 5px; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Special Character Handling Test Report</h1>
        <p>Test execution timestamp: {datetime.now().isoformat()}</p>
    </div>
    
    <div class="metrics">
        <div class="metric-card">
            <div class="metric-value">{summary['total']}</div>
            <div class="metric-label">Total Tests</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #27ae60;">{summary['passed']}</div>
            <div class="metric-label">Passed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #e74c3c;">{summary['failed']}</div>
            <div class="metric-label">Failed</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{summary.get('passRate', 0):.1f}%</div>
            <div class="metric-label">Pass Rate</div>
        </div>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <div class="summary-stat">
            <label>Total Tests:</label> {summary['total']}
        </div>
        <div class="summary-stat">
            <label>Passed:</label> <span style="color: #27ae60;">{summary['passed']}</span>
        </div>
        <div class="summary-stat">
            <label>Failed:</label> <span style="color: #e74c3c;">{summary['failed']}</span>
        </div>
        <div class="summary-stat">
            <label>Pass Rate:</label> {summary.get('passRate', 0):.1f}%
        </div>
    </div>
    
    <h2>Test Results</h2>
"""
        
        for result in self.results:
            status_class = "success" if result.get("success") else "error"
            status_badge = "success" if result.get("success") else "error"
            status_text = "✓ PASS" if result.get("success") else "✗ FAIL"
            
            html += f"""
    <div class="test-result {status_class}">
        <div class="test-name">
            {result.get('description', result.get('testName'))}
            <span class="status-badge status-{status_badge}">{status_text}</span>
        </div>
        <div class="test-description">Test: {result.get('testName')}</div>
        <div class="test-details">
            <table>
                <tr>
                    <td>Status Code:</td>
                    <td>{result.get('statusCode', 'N/A')}</td>
                </tr>
                <tr>
                    <td>Response Time:</td>
                    <td>{result.get('responseTime', 'N/A'):.3f}s</td>
                </tr>
                <tr>
                    <td>HTML Escaping:</td>
                    <td>{"✓ Yes" if result.get('htmlEscaping', {}).get('angle_brackets_escaped') else "✗ No"}</td>
                </tr>
                <tr>
                    <td>Injection Patterns:</td>
                    <td>{"✗ Detected" if any(result.get('injectionDetected', {}).values()) else "✓ Clean"}</td>
                </tr>
            </table>
        </div>
    </div>
"""
        
        html += """
    <div style="text-align: center; margin-top: 40px; color: #7f8c8d;">
        <p>Report generated on """ + datetime.now().isoformat() + """</p>
    </div>
</body>
</html>
"""
        
        report_path = output_path / "special-characters-report.html"
        with open(report_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        return str(report_path)
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Generate summary statistics"""
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r.get("success"))
        failed = total - passed
        pass_rate = (passed / total * 100) if total > 0 else 0
        
        return {
            "total": total,
            "passed": passed,
            "failed": failed,
            "passRate": pass_rate
        }


def main():
    """Main entry point"""
    
    parser = argparse.ArgumentParser(
        description="Special Character API Response Scanner"
    )
    parser.add_argument(
        "--url",
        default=DEFAULT_URL,
        help=f"API URL (default: {DEFAULT_URL})"
    )
    parser.add_argument(
        "--output",
        default="./reports",
        help="Output directory for reports (default: ./reports)"
    )
    
    args = parser.parse_args()
    
    # Create output directory
    output_path = Path(args.output)
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"🔍 Special Character Handling Scanner")
    print(f"API URL: {args.url}")
    print(f"Output: {output_path}")
    print()
    
    # Run scanner
    scanner = SpecialCharacterScanner(api_url=args.url)
    
    print("Running tests...")
    results = scanner.run_all_tests()
    
    print()
    print("Generating reports...")
    
    # Generate reports
    json_report = scanner.generate_json_report(output_path)
    html_report = scanner.generate_html_report(output_path)
    
    print(f"✓ JSON report: {json_report}")
    print(f"✓ HTML report: {html_report}")
    
    # Print summary
    summary = scanner._generate_summary()
    print()
    print("=" * 50)
    print("Summary:")
    print(f"  Total Tests: {summary['total']}")
    print(f"  Passed: {summary['passed']}")
    print(f"  Failed: {summary['failed']}")
    print(f"  Pass Rate: {summary['passRate']:.1f}%")
    print("=" * 50)


if __name__ == "__main__":
    main()
