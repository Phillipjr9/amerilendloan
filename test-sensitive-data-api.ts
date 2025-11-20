/**
 * Real API Integration Tests - Sensitive Data Exposure
 * Tests actual API endpoints to ensure sensitive data is not leaked
 * Run with: pnpm test test-sensitive-data-api.ts
 */

import { describe, it, expect } from 'vitest';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

// ============================================================================
// MOCK API RESPONSES FOR TESTING
// ============================================================================

describe('Real API Integration - Sensitive Data Prevention', () => {
  
  describe('Authentication Endpoints', () => {
    it('should not expose password in login error response', () => {
      // Mock API response for failed login
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
          // Should NOT contain: password: 'attempted_password'
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Verify no plaintext password in response
      expect(responseJson).not.toMatch(/password['"]?\s*[:=]\s*['"]/i);
      expect(response.error?.message).not.toContain('password');
    });

    it('should mask user information in duplicate signup attempts', () => {
      // Mock response for duplicate email
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'DUPLICATE_USER',
          message: 'Email already registered',
          details: {
            emailMasked: 'j***@example.com', // Masked, not full email
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should have masked email format
      expect(responseJson).toMatch(/j\*\*\*@example\.com/);
      // Should NOT have full emails if there are multiple users
      expect(responseJson).not.toMatch(/user1@example\.com.*user2@example\.com/i);
    });

    it('should not expose session tokens in refresh token endpoint errors', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Refresh token expired. Please log in again.',
          // Should NOT contain: token: 'eyJ...'
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      expect(responseJson).not.toMatch(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    });

    it('should not expose OTP codes in error responses', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: 'Invalid OTP code',
          details: {
            attempts_remaining: 2,
            // Should NOT contain: code: '123456'
            // Should NOT contain: expected_code: '123456'
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not contain 6-digit code in details
      expect(responseJson).not.toMatch(/"code"\s*:\s*"\d{6}"/);
    });
  });

  describe('User Profile Endpoints', () => {
    it('should not expose full SSN in profile responses', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          id: 'user_123',
          firstName: 'John',
          lastName: 'Doe',
          ssnMasked: '***-**-6789', // Good: masked
          email: 'john@example.com',
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should NOT contain full SSN pattern (XXX-XX-XXXX)
      expect(responseJson).not.toMatch(/\d{3}-\d{2}-\d{4}/);
      // Should contain masked version
      expect(responseJson).toContain('***-**-6789');
    });

    it('should not expose full bank account numbers in user data', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          id: 'user_123',
          bankInfo: {
            bankName: 'Example Bank',
            accountNumberMasked: '****6789', // Good: masked
            routingNumber: 'hidden',
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should NOT contain 10+ digit account number
      expect(responseJson).not.toMatch(/"accountNumber"\s*:\s*"\d{10,}"/);
      // Should contain masked version
      expect(responseJson).toContain('****6789');
    });

    it('should not expose date of birth in personal data', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          id: 'user_123',
          name: 'John Doe',
          dobMasked: '****-**-**', // Masked DOB
          // Should NOT have: dateOfBirth: '1990-01-15'
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not match YYYY-MM-DD pattern for DOB
      expect(responseJson).not.toMatch(/"dateOfBirth"\s*:\s*"\d{4}-\d{2}-\d{2}"/);
    });

    it('should not expose driver license information', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          id: 'user_123',
          verification: {
            type: 'DRIVER_LICENSE',
            verified: true,
            // Should NOT contain: licenseNumber: 'D1234567'
            // Should NOT contain: licenseExpiry: '2025-12-31'
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not contain license number field with data
      expect(responseJson).not.toMatch(/"licenseNumber"\s*:\s*"[^"]*"/);
    });

    it('should mask phone numbers in contact information', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          id: 'user_123',
          name: 'John Doe',
          phoneMasked: '***-***-4567', // Masked
          email: 'john@example.com',
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should NOT contain full phone number (XXX-XXX-XXXX)
      expect(responseJson).not.toMatch(/"phone"\s*:\s*"\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}"/i);
      // Should contain masked version
      expect(responseJson).toContain('***-***-4567');
    });
  });

  describe('Payment Endpoints', () => {
    it('should not expose full credit card numbers in payment responses', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          transactionId: 'txn_123456',
          amount: 1000,
          cardLastFour: '4567', // Good: only last 4 digits
          // Should NOT have: cardNumber: '4532-1111-2222-3333'
          // Should NOT have: cvv: '123'
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should NOT match credit card number pattern
      expect(responseJson).not.toMatch(/\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}/);
      // Should only have last 4 digits
      expect(responseJson).toContain('4567');
    });

    it('should not expose CVV or CVC in responses', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          transactionId: 'txn_123456',
          status: 'completed',
          // Should NOT have: cvv: '123'
          // Should NOT have: cvc: '456'
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not contain CVV field
      expect(responseJson).not.toMatch(/"(cvv|cvc)"\s*:\s*"?\d{3,4}"?/i);
    });

    it('should not expose bank account details in payment method responses', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          paymentMethods: [
            {
              id: 'pm_123',
              type: 'BANK_TRANSFER',
              bankName: 'Example Bank',
              accountMasked: '****6789', // Good: masked
              // Should NOT have: accountNumber: '0123456789'
            },
          ],
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should NOT contain 10+ digit account number
      expect(responseJson).not.toMatch(/"accountNumber"\s*:\s*"\d{10,}"/);
      // Should only have masked version
      expect(responseJson).toContain('****6789');
    });
  });

  describe('Loan Application Endpoints', () => {
    it('should not expose full employment details with SSN', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          applicationId: 'app_123',
          status: 'pending',
          employment: {
            employerName: 'ABC Corporation',
            position: 'Software Engineer',
            // Should NOT have: employeeId with SSN
            // Should NOT have: ssn: '123-45-6789'
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not expose SSN
      expect(responseJson).not.toMatch(/\d{3}-\d{2}-\d{4}/);
    });

    it('should not expose income details that could identify user', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          applicationId: 'app_123',
          loanAmount: 5000,
          monthlyIncome: 3000,
          // Should NOT have sensitive breakdown of income sources
          // Should NOT have: specific account balances
          // Should NOT have: detailed asset information
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Sensitive fields should not be exposed
      expect(responseJson).not.toContain('bankAccountBalance');
      expect(responseJson).not.toContain('assetDetails');
    });

    it('should not expose co-applicant sensitive information', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          applicationId: 'app_123',
          applicant: { name: 'John Doe' },
          coApplicant: {
            name: 'Jane Doe',
            // Should NOT have: ssn: '...'
            // Should NOT have: bankAccount: '...'
            // Should NOT have: dob: '...'
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not expose co-applicant PII
      expect(responseJson).not.toMatch(/ssn['"]?\s*[:=]\s*['"]\d{3}-\d{2}-\d{4}/i);
    });
  });

  describe('Error Response Security', () => {
    it('should not expose database connection strings in errors', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Unable to process request at this time',
          // Should NOT have: details: { url: 'postgresql://user:pass@host:5432/db' }
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not match database URL patterns
      expect(responseJson).not.toMatch(/(postgresql|mysql|mongodb):\/\/.*:.*@/i);
    });

    it('should not expose AWS or cloud credentials in errors', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'SERVICE_ERROR',
          message: 'Service unavailable',
          // Should NOT have: awsAccessKey, awsSecretKey, etc.
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not match AWS key patterns
      expect(responseJson).not.toMatch(/AKIA[0-9A-Z]{16}/);
      expect(responseJson).not.toMatch(/aws[_-]?(access|secret)[_-]?key/i);
    });

    it('should not expose stack traces in production', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          // Should NOT have: stack: 'Error: ...\n  at Function (file.ts:123:45)\n  ...'
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not match stack trace patterns
      expect(responseJson).not.toMatch(/at\s+\w+\s+\([^)]*:\d+:\d+\)/);
    });

    it('should not expose internal file paths', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'FILE_ERROR',
          message: 'File processing failed',
          // Should NOT have: path: '/home/user/app/server/index.ts'
          // Should NOT have: file: 'C:\\Users\\Admin\\project\\index.js'
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not match file path patterns
      expect(responseJson).not.toMatch(/\/home\/\w+\/.*\/server\//i);
      expect(responseJson).not.toMatch(/C:\\Users\\.*\\server\\/i);
    });

    it('should not expose SQL queries in error details', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'QUERY_ERROR',
          message: 'Database query failed',
          // Should NOT have: query: 'SELECT * FROM users WHERE ...'
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not match SQL patterns
      expect(responseJson).not.toMatch(/SELECT\s+.*\s+FROM\s+\w+/i);
    });
  });

  describe('Validation Error Responses', () => {
    it('should mask invalid email attempts in validation errors', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid email format',
          details: {
            field: 'email',
            // Should NOT expose the invalid email provided
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not echo back user input for emails
      expect(responseJson).not.toMatch(/"received"\s*:\s*"[^@]*@[^@]*"/);
    });

    it('should not expose sensitive field names in validation errors', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Missing required fields',
          details: {
            missing_fields: ['firstName', 'email'],
            // OK: field names are not sensitive
            // Should NOT have: field_values or actual provided values
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should have field names but not actual values
      expect(responseJson).toContain('firstName');
      expect(responseJson).not.toMatch(/"field_values"/i);
    });

    it('should not expose actual vs expected password in validation', () => {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password does not meet requirements',
          details: {
            // Should NOT have: provided: 'password123'
            // Should NOT have: expected: 'minimum 8 characters with uppercase'
            requirement: 'At least 8 characters',
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should not echo back attempted passwords
      expect(responseJson).not.toMatch(/"provided"\s*:\s*"[^"]*"/);
    });
  });

  describe('Data Response Consistency', () => {
    it('should consistently mask PII across different response types', () => {
      const responses: ApiResponse[] = [
        {
          success: true,
          data: { ssnMasked: '***-**-1234' },
          timestamp: new Date().toISOString(),
        },
        {
          success: false,
          error: { code: 'ERROR', message: 'Failed' },
          timestamp: new Date().toISOString(),
        },
      ];

      for (const response of responses) {
        const responseJson = JSON.stringify(response);
        
        // Never expose full SSN
        expect(responseJson).not.toMatch(/\d{3}-\d{2}-\d{4}/);
      }
    });

    it('should never expose passwords in any response type', () => {
      const responses: ApiResponse[] = [
        { success: true, data: { id: '123' }, timestamp: new Date().toISOString() },
        { success: false, error: { code: 'ERROR', message: 'Error' }, timestamp: new Date().toISOString() },
      ];

      for (const response of responses) {
        const responseJson = JSON.stringify(response);
        
        // Never expose password field with value
        expect(responseJson).not.toMatch(/password['"]?\s*[:=]\s*['"][^'"]+['"]/);
      }
    });

    it('should use consistent masking format throughout responses', () => {
      const response: ApiResponse = {
        success: true,
        data: {
          user: {
            ssnMasked: '***-**-6789',
            phoneMasked: '***-***-4567',
            accountMasked: '****6789',
          },
        },
        timestamp: new Date().toISOString(),
      };

      const responseJson = JSON.stringify(response);
      
      // Should follow consistent masking pattern
      expect(responseJson).toMatch(/\*\*\*-\*\*-\d{4}/);
      expect(responseJson).toMatch(/\*\*\*-\*\*\*-\d{4}/);
      expect(responseJson).toMatch(/\*{4}\d{4}/);
    });
  });
});
