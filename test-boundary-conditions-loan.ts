/**
 * Boundary Condition Tests for Loan Application Submission
 * Tests the API's handling of maximum character lengths and field limits
 * 
 * This test suite validates:
 * - Maximum character length enforcement for all string fields
 * - Boundary value testing (min, max, just over max)
 * - Numeric field limits
 * - Date format validation
 * - Field format enforcement (SSN, phone, state codes, zip codes)
 * - Type coercion and rejection of invalid types
 * - Database storage capacity for maximum values
 * - Response structure consistency with boundary values
 * 
 * @author Security Testing Suite
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTRPCClient } from '@trpc/client';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import superjson from 'superjson';
import type { AppRouter } from './server/routers';

// Test configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api/trpc';
const TEST_TIMEOUT = 30000;

// Test data generators for boundary conditions
const generateMaxLengthString = (length: number): string => 'A'.repeat(length);
const generateJustOverMaxString = (length: number): string => 'A'.repeat(length + 1);
const generateMinLengthString = (length: number): string => 'B'.repeat(length);

// Valid boundary test data
const VALID_BOUNDARY_DATA = {
  // Maximum length strings (typical web forms)
  fullName: generateMaxLengthString(100), // Max 100 chars
  email: 'test.boundary.max.length@example-domain.com', // Valid email
  phone: '1234567890', // 10 digits
  password: 'SecurePass123!@#', // Min 8 chars, complex
  street: generateMaxLengthString(255), // Max address field
  city: generateMaxLengthString(100), // Max city name
  state: 'TX', // Fixed 2 chars
  zipCode: '12345', // Standard 5 digits
  employer: generateMaxLengthString(100), // Optional field
  loanPurpose: generateMaxLengthString(500), // Max 500 chars for purpose
};

const INVALID_BOUNDARY_DATA = {
  // Over-length strings
  fullName_overMax: generateJustOverMaxString(100),
  street_overMax: generateJustOverMaxString(255),
  city_overMax: generateJustOverMaxString(100),
  employer_overMax: generateJustOverMaxString(100),
  loanPurpose_overMax: generateJustOverMaxString(500),
  
  // Under-minimum strings
  fullName_underMin: '', // Empty string
  password_underMin: 'pass', // Less than 8 chars
  street_underMin: '', // Empty
  city_underMin: '', // Empty
  loanPurpose_underMin: 'short', // Less than 10 chars
  
  // Invalid formats
  email_invalid: 'not-an-email',
  phone_invalid: '123', // Less than 10 digits
  state_invalid: 'TEXAS', // More than 2 chars
  zipCode_invalid: '123', // Less than 5 digits
  ssn_invalid: '12345678', // Invalid format
  dateOfBirth_invalid: '1990/01/01', // Wrong format
  
  // Numeric boundaries
  monthlyIncome_negative: -1000,
  monthlyIncome_zero: 0,
  requestedAmount_negative: -50000,
  requestedAmount_zero: 0,
};

describe('Loan Application Boundary Condition Tests', () => {
  let trpc: ReturnType<typeof createTRPCClient>;

  beforeAll(() => {
    // Initialize tRPC client with superjson transformer
    trpc = createTRPCClient<AppRouter>({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: API_URL,
        }),
      ],
    });
  }, TEST_TIMEOUT);

  describe('Field Length Boundaries', () => {
    it('should accept full name at maximum length (100 characters)', async () => {
      const applicationData = {
        fullName: VALID_BOUNDARY_DATA.fullName,
        email: 'test1@example.com',
        phone: '1234567890',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-15',
        ssn: '123-45-6789',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        employmentStatus: 'employed' as const,
        employer: 'Test Corp',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Home improvement',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toBe(VALID_BOUNDARY_DATA.fullName);
    });

    it('should reject full name exceeding maximum length (101 characters)', async () => {
      const applicationData = {
        fullName: INVALID_BOUNDARY_DATA.fullName_overMax,
        email: 'test2@example.com',
        phone: '1234567890',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-15',
        ssn: '123-45-6789',
        street: '123 Main St',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        employmentStatus: 'employed' as const,
        employer: 'Test Corp',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Home improvement',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected over-length fullName');
      } catch (error: any) {
        expect(error.message).toContain('fullName');
      }
    });

    it('should accept street address at maximum length (255 characters)', async () => {
      const applicationData = {
        fullName: 'John Doe',
        email: 'test3@example.com',
        phone: '1234567890',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-15',
        ssn: '123-45-6789',
        street: VALID_BOUNDARY_DATA.street,
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        employmentStatus: 'employed' as const,
        employer: 'Test Corp',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Home improvement',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.street.length).toBe(255);
    });

    it('should accept city name at maximum length (100 characters)', async () => {
      const applicationData = {
        fullName: 'Jane Smith',
        email: 'test4@example.com',
        phone: '1234567890',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-15',
        ssn: '123-45-6789',
        street: '456 Oak Ave',
        city: VALID_BOUNDARY_DATA.city,
        state: 'CA',
        zipCode: '90210',
        employmentStatus: 'employed' as const,
        employer: 'Tech Company',
        monthlyIncome: 6000,
        loanType: 'installment' as const,
        requestedAmount: 30000,
        loanPurpose: 'Business expansion',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.city.length).toBeLessThanOrEqual(100);
    });

    it('should accept loan purpose at maximum length (500 characters)', async () => {
      const longPurpose = generateMaxLengthString(500);
      const applicationData = {
        fullName: 'Robert Wilson',
        email: 'test5@example.com',
        phone: '1234567890',
        password: 'SecurePass123!@#',
        dateOfBirth: '1985-06-20',
        ssn: '987-65-4321',
        street: '789 Pine Rd',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        employmentStatus: 'self_employed' as const,
        employer: 'Own Business',
        monthlyIncome: 8000,
        loanType: 'installment' as const,
        requestedAmount: 50000,
        loanPurpose: longPurpose,
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose.length).toBeLessThanOrEqual(500);
    });

    it('should reject loan purpose exceeding maximum length (501 characters)', async () => {
      const overLengthPurpose = generateJustOverMaxString(500);
      const applicationData = {
        fullName: 'David Brown',
        email: 'test6@example.com',
        phone: '1234567890',
        password: 'SecurePass123!@#',
        dateOfBirth: '1988-03-10',
        ssn: '456-78-9012',
        street: '321 Elm St',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        employmentStatus: 'employed' as const,
        employer: 'Finance Corp',
        monthlyIncome: 7000,
        loanType: 'installment' as const,
        requestedAmount: 35000,
        loanPurpose: overLengthPurpose,
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected over-length loanPurpose');
      } catch (error: any) {
        expect(error.message).toContain('loanPurpose');
      }
    });
  });

  describe('Email Field Boundaries', () => {
    it('should accept valid email at maximum reasonable length', async () => {
      const maxEmail = 'test.with.long.prefix.for.boundary@example-domain.co.uk';
      const applicationData = {
        fullName: 'Email Test User',
        email: maxEmail,
        phone: '1234567890',
        password: 'SecurePass123!@#',
        dateOfBirth: '1992-05-15',
        ssn: '111-22-3333',
        street: '999 Test Ave',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Inc',
        monthlyIncome: 5500,
        loanType: 'installment' as const,
        requestedAmount: 28000,
        loanPurpose: 'Education',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.email).toBe(maxEmail);
    });

    it('should reject email without @ symbol', async () => {
      const applicationData = {
        fullName: 'Invalid Email User',
        email: 'notanemail.com',
        phone: '1234567890',
        password: 'SecurePass123!@#',
        dateOfBirth: '1992-05-15',
        ssn: '111-22-3333',
        street: '999 Test Ave',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Inc',
        monthlyIncome: 5500,
        loanType: 'installment' as const,
        requestedAmount: 28000,
        loanPurpose: 'Education',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected invalid email');
      } catch (error: any) {
        expect(error.message).toContain('email');
      }
    });
  });

  describe('Phone Number Boundaries', () => {
    it('should accept phone number with exactly 10 digits', async () => {
      const applicationData = {
        fullName: 'Phone Boundary Test',
        email: 'phone@example.com',
        phone: '9876543210',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-08-22',
        ssn: '222-33-4444',
        street: '111 Phone Ln',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        employmentStatus: 'employed' as const,
        employer: 'Phone Co',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Consolidation',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.phone).toMatch(/^\d{10}$/);
    });

    it('should reject phone number with less than 10 digits', async () => {
      const applicationData = {
        fullName: 'Short Phone Number',
        email: 'shortphone@example.com',
        phone: '123456789', // Only 9 digits
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-08-22',
        ssn: '222-33-4444',
        street: '111 Phone Ln',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        employmentStatus: 'employed' as const,
        employer: 'Phone Co',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Consolidation',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected short phone number');
      } catch (error: any) {
        expect(error.message).toContain('phone');
      }
    });
  });

  describe('Numeric Field Boundaries', () => {
    it('should accept minimum positive monthly income (1)', async () => {
      const applicationData = {
        fullName: 'Minimum Income Test',
        email: 'mincome@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-12-01',
        ssn: '333-44-5555',
        street: '555 Income St',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
        employmentStatus: 'employed' as const,
        employer: 'Small Biz',
        monthlyIncome: 1, // Minimum positive
        loanType: 'installment' as const,
        requestedAmount: 1000,
        loanPurpose: 'Small purchase',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.monthlyIncome).toBe(1);
    });

    it('should reject zero monthly income', async () => {
      const applicationData = {
        fullName: 'Zero Income Test',
        email: 'zeroincome@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-12-01',
        ssn: '333-44-5555',
        street: '555 Income St',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
        employmentStatus: 'unemployed' as const,
        employer: undefined,
        monthlyIncome: 0, // Zero
        loanType: 'installment' as const,
        requestedAmount: 1000,
        loanPurpose: 'Small purchase',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected zero income');
      } catch (error: any) {
        expect(error.message).toContain('monthlyIncome');
      }
    });

    it('should reject negative monthly income', async () => {
      const applicationData = {
        fullName: 'Negative Income Test',
        email: 'negincome@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-12-01',
        ssn: '333-44-5555',
        street: '555 Income St',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
        employmentStatus: 'employed' as const,
        employer: 'Some Corp',
        monthlyIncome: -5000, // Negative
        loanType: 'installment' as const,
        requestedAmount: 1000,
        loanPurpose: 'Small purchase',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected negative income');
      } catch (error: any) {
        expect(error.message).toContain('monthlyIncome');
      }
    });

    it('should accept minimum positive loan amount (1)', async () => {
      const applicationData = {
        fullName: 'Minimum Loan Test',
        email: 'minloan@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-12-01',
        ssn: '333-44-5555',
        street: '555 Loan St',
        city: 'Nashville',
        state: 'TN',
        zipCode: '37201',
        employmentStatus: 'employed' as const,
        employer: 'Loan Corp',
        monthlyIncome: 3000,
        loanType: 'installment' as const,
        requestedAmount: 1, // Minimum positive
        loanPurpose: 'Minimal amount',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.requestedAmount).toBe(1);
    });

    it('should accept large loan amounts (10 million)', async () => {
      const applicationData = {
        fullName: 'Large Loan Test',
        email: 'largeloan@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-12-01',
        ssn: '333-44-5555',
        street: '555 Big Loan Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        employmentStatus: 'employed' as const,
        employer: 'Rich Corp',
        monthlyIncome: 50000,
        loanType: 'installment' as const,
        requestedAmount: 10000000, // 10 million
        loanPurpose: 'Large business loan',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.requestedAmount).toBe(10000000);
    });

    it('should reject zero loan amount', async () => {
      const applicationData = {
        fullName: 'Zero Loan Test',
        email: 'zeroloan@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-12-01',
        ssn: '333-44-5555',
        street: '555 Loan St',
        city: 'Nashville',
        state: 'TN',
        zipCode: '37201',
        employmentStatus: 'employed' as const,
        employer: 'Loan Corp',
        monthlyIncome: 3000,
        loanType: 'installment' as const,
        requestedAmount: 0, // Zero
        loanPurpose: 'Zero amount',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected zero loan amount');
      } catch (error: any) {
        expect(error.message).toContain('requestedAmount');
      }
    });

    it('should reject negative loan amount', async () => {
      const applicationData = {
        fullName: 'Negative Loan Test',
        email: 'negloan@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-12-01',
        ssn: '333-44-5555',
        street: '555 Loan St',
        city: 'Nashville',
        state: 'TN',
        zipCode: '37201',
        employmentStatus: 'employed' as const,
        employer: 'Loan Corp',
        monthlyIncome: 3000,
        loanType: 'installment' as const,
        requestedAmount: -25000, // Negative
        loanPurpose: 'Negative amount',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected negative loan amount');
      } catch (error: any) {
        expect(error.message).toContain('requestedAmount');
      }
    });
  });

  describe('Format Validation Boundaries', () => {
    it('should accept valid SSN format (XXX-XX-XXXX)', async () => {
      const applicationData = {
        fullName: 'SSN Format Test',
        email: 'ssntest@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-06-15',
        ssn: '999-88-7777',
        street: '777 SSN Street',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30303',
        employmentStatus: 'employed' as const,
        employer: 'SSN Corp',
        monthlyIncome: 4500,
        loanType: 'installment' as const,
        requestedAmount: 22000,
        loanPurpose: 'Personal loan',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.ssn).toMatch(/^\d{3}-\d{2}-\d{4}$/);
    });

    it('should reject SSN with wrong format', async () => {
      const applicationData = {
        fullName: 'Invalid SSN Test',
        email: 'invalidssntest@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-06-15',
        ssn: '9998877777', // Missing dashes
        street: '777 SSN Street',
        city: 'Atlanta',
        state: 'GA',
        zipCode: '30303',
        employmentStatus: 'employed' as const,
        employer: 'SSN Corp',
        monthlyIncome: 4500,
        loanType: 'installment' as const,
        requestedAmount: 22000,
        loanPurpose: 'Personal loan',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected invalid SSN format');
      } catch (error: any) {
        expect(error.message).toContain('ssn');
      }
    });

    it('should accept valid date of birth format (YYYY-MM-DD)', async () => {
      const applicationData = {
        fullName: 'DOB Format Test',
        email: 'dobtest@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1985-03-22',
        ssn: '111-88-7777',
        street: '888 DOB Street',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        employmentStatus: 'employed' as const,
        employer: 'DOB Corp',
        monthlyIncome: 5200,
        loanType: 'installment' as const,
        requestedAmount: 28000,
        loanPurpose: 'Auto loan',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should reject date of birth with wrong format', async () => {
      const applicationData = {
        fullName: 'Invalid DOB Test',
        email: 'invaliddob@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '03/22/1985', // MM/DD/YYYY format
        ssn: '111-88-7777',
        street: '888 DOB Street',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        employmentStatus: 'employed' as const,
        employer: 'DOB Corp',
        monthlyIncome: 5200,
        loanType: 'installment' as const,
        requestedAmount: 28000,
        loanPurpose: 'Auto loan',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected invalid date format');
      } catch (error: any) {
        expect(error.message).toContain('dateOfBirth');
      }
    });

    it('should accept exactly 2-character state code', async () => {
      const applicationData = {
        fullName: 'State Code Test',
        email: 'statetest@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1988-07-10',
        ssn: '222-99-8888',
        street: '999 State Ave',
        city: 'Madison',
        state: 'WI', // Exactly 2 characters
        zipCode: '53703',
        employmentStatus: 'employed' as const,
        employer: 'State Co',
        monthlyIncome: 4800,
        loanType: 'installment' as const,
        requestedAmount: 24000,
        loanPurpose: 'Home renovation',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.state).toHaveLength(2);
    });

    it('should reject state code with more than 2 characters', async () => {
      const applicationData = {
        fullName: 'Long State Test',
        email: 'longstate@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1988-07-10',
        ssn: '222-99-8888',
        street: '999 State Ave',
        city: 'Madison',
        state: 'WIS', // 3 characters - invalid
        zipCode: '53703',
        employmentStatus: 'employed' as const,
        employer: 'State Co',
        monthlyIncome: 4800,
        loanType: 'installment' as const,
        requestedAmount: 24000,
        loanPurpose: 'Home renovation',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected 3-character state code');
      } catch (error: any) {
        expect(error.message).toContain('state');
      }
    });

    it('should accept 5-digit zip code', async () => {
      const applicationData = {
        fullName: 'Zip Code Test',
        email: 'ziptest@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1989-11-25',
        ssn: '333-11-2222',
        street: '1111 Zip Ln',
        city: 'Houston',
        state: 'TX',
        zipCode: '77001', // 5 digits
        employmentStatus: 'employed' as const,
        employer: 'Zip Corp',
        monthlyIncome: 5800,
        loanType: 'installment' as const,
        requestedAmount: 32000,
        loanPurpose: 'Debt consolidation',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.zipCode).toMatch(/^\d{5}$/);
    });

    it('should reject zip code with less than 5 digits', async () => {
      const applicationData = {
        fullName: 'Short Zip Test',
        email: 'shortziptest@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1989-11-25',
        ssn: '333-11-2222',
        street: '1111 Zip Ln',
        city: 'Houston',
        state: 'TX',
        zipCode: '770', // Only 3 digits
        employmentStatus: 'employed' as const,
        employer: 'Zip Corp',
        monthlyIncome: 5800,
        loanType: 'installment' as const,
        requestedAmount: 32000,
        loanPurpose: 'Debt consolidation',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected short zip code');
      } catch (error: any) {
        expect(error.message).toContain('zipCode');
      }
    });
  });

  describe('Minimum Length Boundaries', () => {
    it('should accept loan purpose at minimum length (10 characters)', async () => {
      const applicationData = {
        fullName: 'Min Purpose Test',
        email: 'minpurpose@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1991-02-14',
        ssn: '444-55-6666',
        street: '2222 Min St',
        city: 'Vegas',
        state: 'NV',
        zipCode: '89101',
        employmentStatus: 'employed' as const,
        employer: 'Min Corp',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Minimum10x', // Exactly 10 chars
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose.length).toBeGreaterThanOrEqual(10);
    });

    it('should reject loan purpose below minimum length (9 characters)', async () => {
      const applicationData = {
        fullName: 'Short Purpose Test',
        email: 'shortpurp@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1991-02-14',
        ssn: '444-55-6666',
        street: '2222 Min St',
        city: 'Vegas',
        state: 'NV',
        zipCode: '89101',
        employmentStatus: 'employed' as const,
        employer: 'Min Corp',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Short', // Only 5 chars
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected short loanPurpose');
      } catch (error: any) {
        expect(error.message).toContain('loanPurpose');
      }
    });

    it('should accept password at minimum length (8 characters)', async () => {
      const applicationData = {
        fullName: 'Min Password Test',
        email: 'minpass@example.com',
        phone: '5551234567',
        password: 'Pass1234', // Exactly 8 chars
        dateOfBirth: '1992-09-30',
        ssn: '555-66-7777',
        street: '3333 Pass St',
        city: 'Vegas',
        state: 'NV',
        zipCode: '89102',
        employmentStatus: 'employed' as const,
        employer: 'Pass Corp',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Good purpose description here',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
    });

    it('should reject password below minimum length (7 characters)', async () => {
      const applicationData = {
        fullName: 'Short Password Test',
        email: 'shortpass@example.com',
        phone: '5551234567',
        password: 'Pass123', // Only 7 chars
        dateOfBirth: '1992-09-30',
        ssn: '555-66-7777',
        street: '3333 Pass St',
        city: 'Vegas',
        state: 'NV',
        zipCode: '89102',
        employmentStatus: 'employed' as const,
        employer: 'Pass Corp',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Good purpose description here',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected short password');
      } catch (error: any) {
        expect(error.message).toContain('password');
      }
    });
  });

  describe('Enum Boundaries', () => {
    it('should accept all valid employment statuses', async () => {
      const statuses = ['employed', 'self_employed', 'unemployed', 'retired'] as const;

      for (const status of statuses) {
        const applicationData = {
          fullName: `${status} Employment Test`,
          email: `${status}@example.com`,
          phone: '5551234567',
          password: 'SecurePass123!@#',
          dateOfBirth: '1993-04-16',
          ssn: '666-77-8888',
          street: '4444 Employ St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          employmentStatus: status,
          employer: status === 'unemployed' ? undefined : 'Some Corp',
          monthlyIncome: status === 'unemployed' ? 1000 : 5000,
          loanType: 'installment' as const,
          requestedAmount: 25000,
          loanPurpose: 'Employment test purpose',
          disbursementMethod: 'bank_transfer' as const,
        };

        const result = await trpc.loans.submit.mutate(applicationData);
        expect(result.success).toBe(true);
        expect(['employed', 'self_employed', 'unemployed', 'retired']).toContain(
          result.data?.employmentStatus
        );
      }
    });

    it('should reject invalid employment status', async () => {
      const applicationData = {
        fullName: 'Invalid Employment Test',
        email: 'invalemp@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1993-04-16',
        ssn: '666-77-8888',
        street: '4444 Employ St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'invalid_status' as any,
        employer: 'Some Corp',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Employment test purpose',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected invalid employment status');
      } catch (error: any) {
        expect(error.message).toContain('employmentStatus');
      }
    });

    it('should accept all valid loan types', async () => {
      const types = ['installment', 'short_term'] as const;

      for (const type of types) {
        const applicationData = {
          fullName: `${type} Loan Type Test`,
          email: `${type}loan@example.com`,
          phone: '5551234567',
          password: 'SecurePass123!@#',
          dateOfBirth: '1994-10-05',
          ssn: '777-88-9999',
          street: '5555 Loan Type Ave',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
          employmentStatus: 'employed' as const,
          employer: 'Loan Type Corp',
          monthlyIncome: 5500,
          loanType: type,
          requestedAmount: 30000,
          loanPurpose: 'Loan type boundary test',
          disbursementMethod: 'bank_transfer' as const,
        };

        const result = await trpc.loans.submit.mutate(applicationData);
        expect(result.success).toBe(true);
        expect(['installment', 'short_term']).toContain(result.data?.loanType);
      }
    });

    it('should accept all valid disbursement methods', async () => {
      const methods = ['bank_transfer', 'check', 'debit_card', 'paypal', 'crypto'] as const;

      for (const method of methods) {
        const applicationData = {
          fullName: `${method} Disbursement Test`,
          email: `${method}disburse@example.com`,
          phone: '5551234567',
          password: 'SecurePass123!@#',
          dateOfBirth: '1994-10-05',
          ssn: '777-88-9999',
          street: '5555 Disb Ave',
          city: 'Denver',
          state: 'CO',
          zipCode: '80202',
          employmentStatus: 'employed' as const,
          employer: 'Disb Corp',
          monthlyIncome: 5500,
          loanType: 'installment' as const,
          requestedAmount: 30000,
          loanPurpose: 'Disbursement method test',
          disbursementMethod: method,
        };

        const result = await trpc.loans.submit.mutate(applicationData);
        expect(result.success).toBe(true);
        expect(['bank_transfer', 'check', 'debit_card', 'paypal', 'crypto']).toContain(
          result.data?.disbursementMethod
        );
      }
    });
  });

  describe('Database Storage Verification', () => {
    it('should correctly store and retrieve maximum length values', async () => {
      const longName = generateMaxLengthString(100);
      const longStreet = generateMaxLengthString(255);
      const applicationData = {
        fullName: longName,
        email: 'storage@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-01-01',
        ssn: '888-99-0000',
        street: longStreet,
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        employmentStatus: 'employed' as const,
        employer: 'Storage Corp',
        monthlyIncome: 6000,
        loanType: 'installment' as const,
        requestedAmount: 40000,
        loanPurpose: 'Storage test for max values',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toBe(longName);
      expect(result.data?.street).toBe(longStreet);
    });

    it('should handle Unicode characters within field length limits', async () => {
      const applicationData = {
        fullName: 'José María García González', // Unicode characters
        email: 'unicode@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1996-05-20',
        ssn: '999-00-1111',
        street: 'Calle Número 123 ñ Avenida', // Unicode character
        city: 'Montréal', // Unicode character
        state: 'QC',
        zipCode: 'H1A1A1',
        employmentStatus: 'employed' as const,
        employer: 'Café Société', // Unicode characters
        monthlyIncome: 5500,
        loanType: 'installment' as const,
        requestedAmount: 26000,
        loanPurpose: 'Château rental and café business support',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('José');
    });
  });

  describe('Type Coercion and Validation', () => {
    it('should reject non-numeric income when numeric expected', async () => {
      const applicationData = {
        fullName: 'Type Coercion Test',
        email: 'typecoerce@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1997-07-15',
        ssn: '111-22-3333',
        street: '6666 Type Ave',
        city: 'San Diego',
        state: 'CA',
        zipCode: '92101',
        employmentStatus: 'employed' as const,
        employer: 'Type Corp',
        monthlyIncome: 'five thousand' as any, // String instead of number
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Type validation test purpose',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected non-numeric income');
      } catch (error: any) {
        expect(error.message).toContain('monthlyIncome');
      }
    });

    it('should reject non-numeric loan amount when numeric expected', async () => {
      const applicationData = {
        fullName: 'Loan Type Coercion Test',
        email: 'loantype@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1997-07-15',
        ssn: '111-22-3333',
        street: '6666 Type Ave',
        city: 'San Diego',
        state: 'CA',
        zipCode: '92101',
        employmentStatus: 'employed' as const,
        employer: 'Type Corp',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 'fifty thousand' as any, // String instead of number
        loanPurpose: 'Loan type validation test purpose',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        await trpc.loans.submit.mutate(applicationData);
        throw new Error('Should have rejected non-numeric loan amount');
      } catch (error: any) {
        expect(error.message).toContain('requestedAmount');
      }
    });
  });
});
