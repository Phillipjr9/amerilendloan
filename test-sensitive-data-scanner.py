#!/usr/bin/env python3
"""
Sensitive Data Exposure Scanner
Scans API responses for leaked passwords, tokens, PII, and internal information
Run with: python test-sensitive-data-scanner.py
"""

import json
import re
from datetime import datetime
from typing import List, Dict, Any

# ============================================================================
# SENSITIVE DATA PATTERNS
# ============================================================================

SENSITIVE_PATTERNS = {
    'passwords': {
        'plaintext_password': [
            r'password["\']?\s*[:=]\s*["\'][^"\']*["\']',
            r'pwd["\']?\s*[:=]\s*["\'][^"\']*["\']',
            r'pass\s*[:=]\s*["\'][^"\']*["\']',
        ],
        'old_password': [
            r'oldPassword["\']?\s*[:=]\s*["\'][^"\']*["\']',
            r'previous.*password',
        ],
    },
    'tokens': {
        'jwt_token': [
            r'bearer\s+eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',
            r'token["\']?\s*[:=]\s*eyJ[A-Za-z0-9_-]+',
        ],
        'session_id': [
            r'session["\']?\s*[:=]\s*["\'][a-f0-9]{32,}["\']',
            r'app_session_id["\']?\s*[:=]\s*["\']',
        ],
        'api_key': [
            r'api[_-]?key["\']?\s*[:=]\s*["\'][^"\']{20,}["\']',
        ],
    },
    'pii': {
        'ssn': [
            r'\d{3}-\d{2}-\d{4}',
            r'ssn["\']?\s*[:=]\s*["\'][0-9]+-[0-9]+-[0-9]+["\']',
        ],
        'bank_account': [
            r'bankAccount["\']?\s*[:=]\s*["\'][0-9]{10,}["\']',
            r'accountNumber["\']?\s*[:=]\s*["\'][0-9]{10,}["\']',
        ],
        'credit_card': [
            r'\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}',
            r'cardNumber["\']?\s*[:=]\s*["\'][0-9]{13,19}["\']',
        ],
        'phone': [
            r'phone["\']?\s*[:=]\s*["\']\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}["\']',
        ],
        'dob': [
            r'dateOfBirth["\']?\s*[:=]\s*["\']([0-9]{4}-[0-9]{2}-[0-9]{2}|[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4})["\']',
        ],
    },
    'secrets': {
        'database_url': [
            r'database[_-]?url["\']?\s*[:=]\s*["\'][^"\']*user=[^"\']*["\']',
            r'(postgresql|mysql|mongodb):\/\/.*:.*@',
        ],
        'aws_credentials': [
            r'AKIA[0-9A-Z]{16}',
            r'aws[_-]?secret["\']?\s*[:=]',
        ],
    },
    'internal': {
        'stack_trace': [
            r'at\s+\w+\s+\([^)]*:\d+:\d+\)',
            r'Error:\s+.*\n\s+at\s+',
        ],
        'file_path': [
            r'\/home\/\w+\/.*\/server\/',
            r'C:\\Users\\.*\\server\\',
        ],
        'sql_query': [
            r'SELECT\s+.*\s+FROM\s+\w+.*WHERE',
            r'INSERT\s+INTO\s+.*VALUES',
        ],
    },
}

SEVERITY_LEVELS = {
    'critical': ['passwords', 'tokens', 'ssn', 'bank_account', 'credit_card', 'database_url', 'aws_credentials'],
    'high': ['phone', 'dob', 'stack_trace', 'sql_query'],
    'medium': ['file_path'],
}

# ============================================================================
# SCANNER FUNCTIONS
# ============================================================================

class SensitiveDataScanner:
    def __init__(self):
        self.findings: List[Dict[str, Any]] = []
        self.stats = {
            'total_scans': 0,
            'critical_issues': 0,
            'high_issues': 0,
            'medium_issues': 0,
            'clean_scans': 0,
        }

    def get_severity(self, pattern_key: str) -> str:
        """Determine severity level of a pattern"""
        for level, keys in SEVERITY_LEVELS.items():
            if pattern_key in keys:
                return level
        return 'low'

    def scan_response(self, response_text: str, endpoint: str = 'Unknown') -> Dict[str, Any]:
        """Scan API response for sensitive data exposure"""
        self.stats['total_scans'] += 1
        findings = []

        for category, patterns_dict in SENSITIVE_PATTERNS.items():
            for pattern_name, patterns in patterns_dict.items():
                severity = self.get_severity(pattern_name)
                
                for pattern in patterns:
                    try:
                        matches = re.finditer(pattern, response_text, re.IGNORECASE)
                        for match in matches:
                            finding = {
                                'endpoint': endpoint,
                                'category': category,
                                'pattern': pattern_name,
                                'severity': severity,
                                'match': match.group()[:100],  # First 100 chars
                                'position': match.start(),
                                'timestamp': datetime.now().isoformat(),
                            }
                            findings.append(finding)
                            
                            if severity == 'critical':
                                self.stats['critical_issues'] += 1
                            elif severity == 'high':
                                self.stats['high_issues'] += 1
                            elif severity == 'medium':
                                self.stats['medium_issues'] += 1
                    except Exception as e:
                        print(f"Error scanning pattern {pattern_name}: {e}")

        self.findings.extend(findings)
        
        if not findings:
            self.stats['clean_scans'] += 1
            return {
                'endpoint': endpoint,
                'status': 'clean',
                'findings': [],
            }
        else:
            return {
                'endpoint': endpoint,
                'status': 'vulnerable',
                'findings': findings,
                'summary': {
                    'critical': len([f for f in findings if f['severity'] == 'critical']),
                    'high': len([f for f in findings if f['severity'] == 'high']),
                    'medium': len([f for f in findings if f['severity'] == 'medium']),
                },
            }

    def scan_json_response(self, json_data: str, endpoint: str = 'Unknown') -> Dict[str, Any]:
        """Scan JSON response by converting to string"""
        try:
            # Try to parse and re-stringify to normalize
            parsed = json.loads(json_data)
            normalized = json.dumps(parsed)
            return self.scan_response(normalized, endpoint)
        except json.JSONDecodeError:
            return self.scan_response(json_data, endpoint)

    def generate_report(self) -> str:
        """Generate a text report of findings"""
        report = []
        report.append("=" * 80)
        report.append("SENSITIVE DATA EXPOSURE SCAN REPORT")
        report.append("=" * 80)
        report.append(f"Generated: {datetime.now().isoformat()}")
        report.append("")
        
        report.append("STATISTICS")
        report.append("-" * 40)
        report.append(f"Total Scans: {self.stats['total_scans']}")
        report.append(f"Clean Scans: {self.stats['clean_scans']} ({self.get_clean_percentage()}%)")
        report.append(f"Critical Issues: {self.stats['critical_issues']}")
        report.append(f"High Issues: {self.stats['high_issues']}")
        report.append(f"Medium Issues: {self.stats['medium_issues']}")
        report.append("")
        
        if self.findings:
            report.append("FINDINGS (sorted by severity)")
            report.append("-" * 40)
            
            # Sort by severity
            sorted_findings = sorted(
                self.findings,
                key=lambda x: {'critical': 0, 'high': 1, 'medium': 2}.get(x['severity'], 3)
            )
            
            for finding in sorted_findings:
                report.append(f"\n[{finding['severity'].upper()}] {finding['endpoint']}")
                report.append(f"  Category: {finding['category']}")
                report.append(f"  Pattern: {finding['pattern']}")
                report.append(f"  Match: {finding['match']}")
                report.append(f"  Position: {finding['position']}")
        else:
            report.append("✅ NO SENSITIVE DATA EXPOSURE FOUND")
        
        report.append("")
        report.append("=" * 80)
        return "\n".join(report)

    def get_clean_percentage(self) -> float:
        """Calculate percentage of clean scans"""
        if self.stats['total_scans'] == 0:
            return 0.0
        return round(100 * self.stats['clean_scans'] / self.stats['total_scans'], 2)

    def to_json(self) -> str:
        """Export findings as JSON"""
        return json.dumps({
            'timestamp': datetime.now().isoformat(),
            'statistics': self.stats,
            'findings': self.findings,
        }, indent=2)

# ============================================================================
# TEST CASES
# ============================================================================

def test_scanner():
    """Run scanner on test responses"""
    scanner = SensitiveDataScanner()
    
    # Test 1: Clean response
    clean_response = json.dumps({
        'success': True,
        'data': {
            'id': '123',
            'name': 'John Doe',
            'email': 'john@example.com',
        },
        'timestamp': datetime.now().isoformat(),
    })
    result1 = scanner.scan_json_response(clean_response, 'GET /api/user/profile')
    print(f"Test 1 (Clean): {result1['status']}")
    
    # Test 2: Exposed password
    bad_response = json.dumps({
        'success': False,
        'error': {
            'code': 'ERROR',
            'message': 'Failed',
            'details': {'password': 'MyPassword123'},
        },
    })
    result2 = scanner.scan_json_response(bad_response, 'POST /api/auth/login')
    print(f"Test 2 (Password Exposed): {result2['status']}")
    
    # Test 3: Exposed SSN
    ssn_response = json.dumps({
        'success': True,
        'data': {'ssn': '123-45-6789'},
    })
    result3 = scanner.scan_json_response(ssn_response, 'GET /api/user/details')
    print(f"Test 3 (SSN Exposed): {result3['status']}")
    
    # Test 4: Stack trace
    trace_response = 'Error: DB failed\n  at Function (file.ts:123:45)\n  at async Server'
    result4 = scanner.scan_response(trace_response, 'POST /api/submit')
    print(f"Test 4 (Stack Trace): {result4['status']}")
    
    # Print full report
    print("\n" + scanner.generate_report())
    print("\nJSON Export:")
    print(scanner.to_json())

if __name__ == '__main__':
    test_scanner()
