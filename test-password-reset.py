#!/usr/bin/env python3
"""
Test script for AmeriLend password reset functionality
Tests the OTP-based password reset endpoint with validation
"""

import requests
import json
import sys

# Configuration
API_URL = "https://www.amerilendloan.com/api/trpc"
TEST_EMAIL = "test@example.com"
TEST_CODE = "123456"
TEST_PASSWORD = "TestPassword123"

def test_missing_required_fields():
    """Test password reset with missing required fields"""
    print("\n=== Test 1: Missing Required Fields ===")
    
    # Test missing email
    payload = {
        "code": TEST_CODE,
        "newPassword": TEST_PASSWORD
    }
    
    url = f"{API_URL}/otp.resetPasswordWithOTP"
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Should return validation error (400)
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        print("✓ PASS: Missing email field returns error")
    except Exception as e:
        print(f"✗ FAIL: {e}")
        return False
    
    return True

def test_invalid_email_format():
    """Test with invalid email format"""
    print("\n=== Test 2: Invalid Email Format ===")
    
    payload = {
        "email": "invalid-email",  # Not a valid email
        "code": TEST_CODE,
        "newPassword": TEST_PASSWORD
    }
    
    url = f"{API_URL}/otp.resetPasswordWithOTP"
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Should return validation error
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        print("✓ PASS: Invalid email format returns error")
    except Exception as e:
        print(f"✗ FAIL: {e}")
        return False
    
    return True

def test_invalid_otp_code_length():
    """Test with invalid OTP code length"""
    print("\n=== Test 3: Invalid OTP Code Length ===")
    
    payload = {
        "email": TEST_EMAIL,
        "code": "12345",  # Should be 6 digits
        "newPassword": TEST_PASSWORD
    }
    
    url = f"{API_URL}/otp.resetPasswordWithOTP"
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Should return validation error
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        print("✓ PASS: Invalid OTP code length returns error")
    except Exception as e:
        print(f"✗ FAIL: {e}")
        return False
    
    return True

def test_weak_password():
    """Test with weak password"""
    print("\n=== Test 4: Weak Password (Less than 8 chars) ===")
    
    payload = {
        "email": TEST_EMAIL,
        "code": TEST_CODE,
        "newPassword": "short"  # Less than 8 characters
    }
    
    url = f"{API_URL}/otp.resetPasswordWithOTP"
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Should return validation error
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        print("✓ PASS: Weak password returns error")
    except Exception as e:
        print(f"✗ FAIL: {e}")
        return False
    
    return True

def test_invalid_otp_code():
    """Test with invalid/expired OTP code"""
    print("\n=== Test 5: Invalid/Expired OTP Code ===")
    
    payload = {
        "email": TEST_EMAIL,
        "code": "000000",  # Valid format but likely invalid code
        "newPassword": TEST_PASSWORD
    }
    
    url = f"{API_URL}/otp.resetPasswordWithOTP"
    try:
        response = requests.post(url, json=payload, timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Should return error (invalid code or user not found)
        assert response.status_code in [400, 404], f"Expected 400/404, got {response.status_code}"
        print("✓ PASS: Invalid OTP code returns error")
    except Exception as e:
        print(f"✗ FAIL: {e}")
        return False
    
    return True

def main():
    """Run all tests"""
    print("=" * 60)
    print("AmeriLend Password Reset Validation Tests")
    print("=" * 60)
    
    tests = [
        test_missing_required_fields,
        test_invalid_email_format,
        test_invalid_otp_code_length,
        test_weak_password,
        test_invalid_otp_code,
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"✗ FAIL: Unexpected error: {e}")
            results.append(False)
    
    print("\n" + "=" * 60)
    print(f"Results: {sum(results)}/{len(results)} tests passed")
    print("=" * 60)
    
    return all(results)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
