#!/usr/bin/env python3
"""
Rate Limiting API Security Scanner

Analyzes API responses and behaviors to verify rate limiting is properly enforced.
Tests excessive requests from single IP addresses and verifies responses.

Usage:
    python test-rate-limiting-scanner.py [base_url] [concurrency]

Examples:
    python test-rate-limiting-scanner.py http://localhost:3000
    python test-rate-limiting-scanner.py https://api.amerilendloan.com 20
"""

import requests
import time
import json
import argparse
import threading
from datetime import datetime, timedelta
from collections import defaultdict
from typing import Dict, List, Tuple, Optional
import statistics


class RateLimitScanner:
    """Analyzes API rate limiting behavior."""
    
    def __init__(self, base_url: str = 'http://localhost:3000'):
        self.base_url = base_url.rstrip('/')
        self.results = {
            'test_name': 'Rate Limiting Analysis',
            'timestamp': datetime.now().isoformat(),
            'endpoints_tested': [],
            'violations': [],
            'statistics': {},
            'status': 'PENDING'
        }
        self.lock = threading.Lock()
    
    def test_login_rate_limiting(self, email: str = 'ratelimit@test.com', attempts: int = 10) -> Dict:
        """Test login endpoint rate limiting."""
        print(f"\n[*] Testing login rate limiting ({attempts} attempts)...")
        
        responses = []
        timestamps = []
        blocked_count = 0
        
        for i in range(attempts):
            try:
                start_time = time.time()
                response = requests.post(
                    f'{self.base_url}/api/trpc/auth.login',
                    json={
                        'email': email,
                        'password': 'wrongpassword123'
                    },
                    headers={'Content-Type': 'application/json'},
                    timeout=5
                )
                elapsed = time.time() - start_time
                timestamps.append(elapsed)
                
                responses.append({
                    'attempt': i + 1,
                    'status_code': response.status_code,
                    'elapsed': elapsed,
                    'timestamp': datetime.now().isoformat()
                })
                
                # Check for rate limit response
                if response.status_code == 429:
                    blocked_count += 1
                    print(f"  [{i+1}] ✓ Rate limited (429) - {elapsed:.3f}s")
                elif response.status_code in [400, 401]:
                    print(f"  [{i+1}] • Regular response ({response.status_code}) - {elapsed:.3f}s")
                else:
                    print(f"  [{i+1}] ? Unexpected status ({response.status_code}) - {elapsed:.3f}s")
                
                time.sleep(0.1)  # Small delay between requests
                
            except Exception as e:
                print(f"  [{i+1}] ✗ Error: {str(e)}")
                responses.append({
                    'attempt': i + 1,
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                })
        
        result = {
            'endpoint': 'auth.login',
            'total_attempts': attempts,
            'rate_limited': blocked_count,
            'rate_limit_percentage': (blocked_count / attempts * 100) if attempts > 0 else 0,
            'responses': responses,
            'avg_response_time': statistics.mean(timestamps) if timestamps else 0,
            'violation': blocked_count == 0 and attempts > 5  # Should be rate limited
        }
        
        return result
    
    def test_otp_rate_limiting(self, email: str = 'otp@test.com', attempts: int = 5) -> Dict:
        """Test OTP request rate limiting."""
        print(f"\n[*] Testing OTP rate limiting ({attempts} attempts)...")
        
        responses = []
        blocked_count = 0
        
        for i in range(attempts):
            try:
                response = requests.post(
                    f'{self.base_url}/api/trpc/otp.requestCode',
                    json={
                        'email': email,
                        'purpose': 'login'
                    },
                    headers={'Content-Type': 'application/json'},
                    timeout=5
                )
                
                responses.append({
                    'attempt': i + 1,
                    'status_code': response.status_code,
                    'timestamp': datetime.now().isoformat()
                })
                
                if response.status_code == 429:
                    blocked_count += 1
                    print(f"  [{i+1}] ✓ Rate limited (429)")
                elif response.status_code == 200:
                    print(f"  [{i+1}] • OTP sent (200)")
                else:
                    print(f"  [{i+1}] ? Status: {response.status_code}")
                
                time.sleep(0.5)
                
            except Exception as e:
                print(f"  [{i+1}] ✗ Error: {str(e)}")
        
        result = {
            'endpoint': 'otp.requestCode',
            'total_attempts': attempts,
            'rate_limited': blocked_count,
            'rate_limit_percentage': (blocked_count / attempts * 100) if attempts > 0 else 0,
            'responses': responses,
            'violation': blocked_count == 0 and attempts > 3  # Should be limited after 3
        }
        
        return result
    
    def test_concurrent_requests(self, endpoint: str = 'loans.search', threads: int = 10) -> Dict:
        """Test API with concurrent requests from simulated single IP."""
        print(f"\n[*] Testing concurrent requests ({threads} threads)...")
        
        results = defaultdict(list)
        response_times = []
        
        def make_request(thread_id: int):
            try:
                start_time = time.time()
                response = requests.get(
                    f'{self.base_url}/api/trpc/{endpoint}',
                    headers={
                        'X-Forwarded-For': '192.168.1.100',  # Simulate single IP
                        'Content-Type': 'application/json'
                    },
                    timeout=5
                )
                elapsed = time.time() - start_time
                
                with self.lock:
                    results[response.status_code].append({
                        'thread': thread_id,
                        'elapsed': elapsed,
                        'timestamp': datetime.now().isoformat()
                    })
                    response_times.append(elapsed)
                
                status_emoji = '✓' if response.status_code == 200 else '!' if response.status_code == 429 else '?'
                print(f"  [Thread {thread_id:2d}] {status_emoji} Status: {response.status_code} - {elapsed:.3f}s")
                
            except Exception as e:
                print(f"  [Thread {thread_id:2d}] ✗ Error: {str(e)}")
        
        threads_list = []
        for i in range(threads):
            t = threading.Thread(target=make_request, args=(i,))
            threads_list.append(t)
            t.start()
        
        for t in threads_list:
            t.join()
        
        result = {
            'endpoint': endpoint,
            'concurrent_threads': threads,
            'responses_by_status': dict(results),
            'total_responses': sum(len(v) for v in results.values()),
            'rate_limited_count': len(results.get(429, [])),
            'successful_count': len(results.get(200, [])),
            'avg_response_time': statistics.mean(response_times) if response_times else 0,
            'max_response_time': max(response_times) if response_times else 0,
            'violation': len(results.get(429, [])) == 0 and threads > 5  # Should have 429s
        }
        
        return result
    
    def test_retry_after_header(self) -> Dict:
        """Test that 429 responses include Retry-After header."""
        print(f"\n[*] Testing Retry-After header in rate limit responses...")
        
        # Make multiple requests to trigger rate limit
        for i in range(10):
            try:
                response = requests.post(
                    f'{self.base_url}/api/trpc/auth.login',
                    json={
                        'email': f'user{i}@test.com',
                        'password': 'wrong'
                    },
                    timeout=5
                )
                
                if response.status_code == 429:
                    headers = response.headers
                    has_retry_after = 'Retry-After' in headers or 'retry-after' in headers
                    has_rate_limit_headers = any(
                        h.lower().startswith('x-ratelimit') for h in headers.keys()
                    )
                    
                    result = {
                        'status_code': 429,
                        'has_retry_after': has_retry_after,
                        'retry_after_value': headers.get('Retry-After') or headers.get('retry-after'),
                        'has_rate_limit_headers': has_rate_limit_headers,
                        'rate_limit_headers': {
                            k: v for k, v in headers.items() 
                            if 'ratelimit' in k.lower()
                        },
                        'violation': not has_retry_after
                    }
                    
                    print(f"  ✓ Rate limit response found")
                    print(f"    Retry-After: {result['retry_after_value']}")
                    print(f"    Rate-Limit Headers: {result['has_rate_limit_headers']}")
                    
                    return result
                
                time.sleep(0.1)
                
            except Exception as e:
                print(f"  ✗ Error: {str(e)}")
        
        return {
            'status_code': 'NOT_FOUND',
            'violation': True,
            'message': 'Could not trigger rate limit response'
        }
    
    def test_ip_header_handling(self) -> Dict:
        """Test that various IP header formats are properly handled."""
        print(f"\n[*] Testing IP header extraction...")
        
        test_cases = [
            {
                'name': 'X-Forwarded-For single IP',
                'headers': {'X-Forwarded-For': '192.168.1.100'},
                'expected_ip': '192.168.1.100'
            },
            {
                'name': 'X-Forwarded-For chain',
                'headers': {'X-Forwarded-For': '192.168.1.100, 10.0.0.1'},
                'expected_ip': '192.168.1.100'
            },
            {
                'name': 'X-Real-IP',
                'headers': {'X-Real-IP': '192.168.1.101'},
                'expected_ip': '192.168.1.101'
            },
            {
                'name': 'CF-Connecting-IP (Cloudflare)',
                'headers': {'CF-Connecting-IP': '192.168.1.102'},
                'expected_ip': '192.168.1.102'
            }
        ]
        
        results = []
        for test in test_cases:
            try:
                response = requests.post(
                    f'{self.base_url}/api/trpc/auth.recordAttempt',
                    json={
                        'email': 'test@example.com',
                        'successful': False
                    },
                    headers=test['headers'],
                    timeout=5
                )
                
                results.append({
                    'test_name': test['name'],
                    'status_code': response.status_code,
                    'success': response.status_code in [200, 400],
                    'timestamp': datetime.now().isoformat()
                })
                
                print(f"  ✓ {test['name']}: {response.status_code}")
                
            except Exception as e:
                print(f"  ✗ {test['name']}: {str(e)}")
                results.append({
                    'test_name': test['name'],
                    'error': str(e),
                    'success': False
                })
        
        return {
            'test_cases': results,
            'all_passed': all(r.get('success', False) for r in results),
            'violation': not all(r.get('success', False) for r in results)
        }
    
    def test_error_response_safety(self) -> Dict:
        """Verify rate limit error responses don't leak sensitive data."""
        print(f"\n[*] Testing error response safety...")
        
        try:
            # Trigger rate limit
            for i in range(15):
                response = requests.post(
                    f'{self.base_url}/api/trpc/auth.login',
                    json={'email': 'test@example.com', 'password': 'wrong'},
                    timeout=5
                )
                if response.status_code == 429:
                    break
                time.sleep(0.05)
            
            if response.status_code != 429:
                print(f"  ! Could not trigger rate limit (got {response.status_code})")
                return {'violation': True, 'message': 'Rate limit not triggered'}
            
            # Check response content
            try:
                body = response.json()
            except:
                body = response.text
            
            response_str = json.dumps(body) if isinstance(body, dict) else str(body)
            
            # Sensitive patterns that should NOT be in response
            sensitive_patterns = [
                'password', 'token', 'secret', 'api_key', 'database_url',
                'jwt', 'session', 'auth', 'credential', 'private_key'
            ]
            
            found_sensitive = []
            for pattern in sensitive_patterns:
                if pattern.lower() in response_str.lower():
                    found_sensitive.append(pattern)
            
            print(f"  Response (truncated): {response_str[:200]}...")
            
            result = {
                'status_code': 429,
                'response_safe': len(found_sensitive) == 0,
                'sensitive_patterns_found': found_sensitive,
                'violation': len(found_sensitive) > 0
            }
            
            if result['response_safe']:
                print(f"  ✓ Response contains no sensitive data")
            else:
                print(f"  ✗ Found sensitive patterns: {found_sensitive}")
            
            return result
            
        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            return {'error': str(e), 'violation': True}
    
    def generate_report(self) -> str:
        """Generate comprehensive test report."""
        report = []
        report.append("\n" + "="*70)
        report.append("RATE LIMITING API SECURITY ASSESSMENT REPORT")
        report.append("="*70)
        report.append(f"\nTimestamp: {datetime.now().isoformat()}")
        report.append(f"Base URL: {self.base_url}")
        
        if self.results.get('endpoints_tested'):
            report.append(f"\nEndpoints Tested: {len(self.results['endpoints_tested'])}")
            for ep in self.results['endpoints_tested']:
                report.append(f"  • {ep.get('endpoint', 'N/A')}")
        
        violations = self.results.get('violations', [])
        if violations:
            report.append(f"\n⚠️  VIOLATIONS FOUND: {len(violations)}")
            for violation in violations:
                report.append(f"  ✗ {violation}")
        else:
            report.append(f"\n✓ NO VIOLATIONS FOUND")
        
        if self.results.get('statistics'):
            report.append("\nStatistics:")
            for key, value in self.results['statistics'].items():
                report.append(f"  • {key}: {value}")
        
        report.append("\n" + "="*70)
        
        return '\n'.join(report)
    
    def run_all_tests(self) -> bool:
        """Run all rate limiting tests."""
        print("\n" + "="*70)
        print("RATE LIMITING ANALYSIS")
        print("="*70)
        
        all_passed = True
        
        # Test 1: Login rate limiting
        login_result = self.test_login_rate_limiting()
        self.results['endpoints_tested'].append(login_result)
        if login_result.get('violation'):
            self.results['violations'].append(f"Login endpoint not properly rate limited")
            all_passed = False
        
        # Test 2: OTP rate limiting
        otp_result = self.test_otp_rate_limiting()
        self.results['endpoints_tested'].append(otp_result)
        if otp_result.get('violation'):
            self.results['violations'].append(f"OTP endpoint not properly rate limited")
            all_passed = False
        
        # Test 3: Concurrent requests
        concurrent_result = self.test_concurrent_requests()
        self.results['endpoints_tested'].append(concurrent_result)
        if concurrent_result.get('violation'):
            self.results['violations'].append(f"Concurrent requests not properly handled")
            all_passed = False
        
        # Test 4: Retry-After header
        retry_result = self.test_retry_after_header()
        self.results['endpoints_tested'].append(retry_result)
        if retry_result.get('violation'):
            self.results['violations'].append(f"Rate limit responses missing Retry-After header")
            all_passed = False
        
        # Test 5: IP header handling
        ip_result = self.test_ip_header_handling()
        self.results['endpoints_tested'].append(ip_result)
        if ip_result.get('violation'):
            self.results['violations'].append(f"IP header extraction not working properly")
            all_passed = False
        
        # Test 6: Error response safety
        safety_result = self.test_error_response_safety()
        self.results['endpoints_tested'].append(safety_result)
        if safety_result.get('violation'):
            self.results['violations'].append(f"Rate limit error responses may leak sensitive data")
            all_passed = False
        
        # Generate report
        self.results['status'] = 'PASSED' if all_passed else 'FAILED'
        report = self.generate_report()
        print(report)
        
        # Save report to file
        report_file = 'rate-limiting-test-results.txt'
        with open(report_file, 'w') as f:
            f.write(report)
        print(f"\n[*] Report saved to: {report_file}")
        
        return all_passed


def main():
    parser = argparse.ArgumentParser(description='Rate Limiting API Security Scanner')
    parser.add_argument('--url', default='http://localhost:3000', help='Base URL of the API')
    parser.add_argument('--threads', type=int, default=10, help='Number of concurrent threads')
    
    args = parser.parse_args()
    
    scanner = RateLimitScanner(args.url)
    success = scanner.run_all_tests()
    
    exit(0 if success else 1)


if __name__ == '__main__':
    main()
