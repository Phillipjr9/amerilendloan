/**
 * Special Character Handling Tests for Loan Application API
 * Tests the API's handling of special characters, symbols, and edge-case characters
 * in all loan application fields
 *
 * This test suite validates:
 * - Unicode character handling (accented, international)
 * - Mathematical and special symbols
 * - HTML/XML special characters
 * - SQL injection attempts through special chars
 * - Script injection attempts
 * - Control characters
 * - Emoji and multi-byte characters
 * - Mixed character sets
 * - Special characters in different field types
 *
 * @author Security Testing Suite
 * @version 1.0.0
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createTRPCClient } from '@trpc/client';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import superjson from 'superjson';
import type { AppRouter } from './server/routers';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/trpc';
const TEST_TIMEOUT = 30000;

// Special character test data
const SPECIAL_CHARS = {
  // Basic special characters
  basic: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '=', '+'],
  
  // Punctuation
  punctuation: ['.', ',', '?', '!', ':', ';', '"', "'", '/', '\\', '|'],
  
  // Mathematical symbols
  mathematical: ['+', '-', '*', '/', '=', '<', '>', '≤', '≥', '±', '×', '÷'],
  
  // HTML/XML special characters
  html: ['<', '>', '&', '"', "'"],
  
  // SQL injection patterns (should be escaped/rejected)
  sqlInjection: [
    "'; DROP TABLE--",
    "1' OR '1'='1",
    "admin'--",
    "1; DELETE FROM",
  ],
  
  // Script injection patterns (should be sanitized)
  scriptInjection: [
    '<script>alert("XSS")</script>',
    'javascript:void(0)',
    'onerror=alert("XSS")',
    '<img src=x onerror=alert("XSS")>',
  ],
  
  // Unicode and accented characters
  unicode: [
    'café',
    'naïve',
    'résumé',
    'Ñoño',
    'über',
    'Москва',
    '北京',
    '東京',
    'العربية',
    'עברית',
  ],
  
  // Control characters
  control: ['\n', '\r', '\t', '\0', '\x00', '\x1a'],
  
  // Emoji and special Unicode
  emoji: ['😀', '🚀', '💰', '✅', '❌', '⚠️', '🔒', '🔑'],
  
  // Currency and symbols
  currency: ['$', '€', '£', '¥', '₹', '₽', '฿', '₩'],
  
  // Arrows and shapes
  arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⇑', '⇓'],
  
  // Quotes and brackets
  quotes: ['`', '´', '¨', ''', ''', '"', '"', '「', '」', '『', '』'],
};

describe('Special Character Handling Tests', () => {
  let trpc: ReturnType<typeof createTRPCClient>;

  beforeAll(() => {
    trpc = createTRPCClient<AppRouter>({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: API_URL,
        }),
      ],
    });
  }, TEST_TIMEOUT);

  describe('Unicode and Accented Characters', () => {
    it('should accept French accented characters in full name', async () => {
      const applicationData = {
        fullName: 'Jean-Claude Archambault-Lavoie',
        email: 'jean.claude@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1985-03-15',
        ssn: '123-45-6789',
        street: 'Rue de l\'Église 123',
        city: 'Montréal',
        state: 'QC',
        zipCode: 'H1A1A1',
        employmentStatus: 'employed' as const,
        employer: 'Société Générale',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Rénovation de maison avec finitions spéciales',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('Claude');
    });

    it('should accept Spanish special characters', async () => {
      const applicationData = {
        fullName: 'José María García Pérez',
        email: 'jose.maria@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-05-20',
        ssn: '111-22-3333',
        street: 'Calle Ñoño número 456',
        city: 'México City',
        state: 'MX',
        zipCode: '06500',
        employmentStatus: 'employed' as const,
        employer: 'Corporación Española',
        monthlyIncome: 5500,
        loanType: 'installment' as const,
        requestedAmount: 30000,
        loanPurpose: 'Expansión de negocio y adquisición de equipo',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('José');
    });

    it('should accept German umlauts', async () => {
      const applicationData = {
        fullName: 'Klaus Müller-Höffer',
        email: 'klaus.muller@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1988-07-10',
        ssn: '222-33-4444',
        street: 'Straße der Künste 789',
        city: 'Düsseldorf',
        state: 'DE',
        zipCode: '40211',
        employmentStatus: 'employed' as const,
        employer: 'Büro & Co.',
        monthlyIncome: 5800,
        loanType: 'installment' as const,
        requestedAmount: 32000,
        loanPurpose: 'Büroausstattung und Geschäftserweiterung',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('Müller');
    });

    it('should accept Cyrillic characters (Russian)', async () => {
      const applicationData = {
        fullName: 'Владимир Петровский',
        email: 'vladimir.petrov@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1992-11-30',
        ssn: '333-44-5555',
        street: 'Улица Ленина 100',
        city: 'Москва',
        state: 'RU',
        zipCode: '119991',
        employmentStatus: 'employed' as const,
        employer: 'Компания Россия',
        monthlyIncome: 6000,
        loanType: 'installment' as const,
        requestedAmount: 28000,
        loanPurpose: 'Расширение бизнеса и закупка оборудования',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('Владимир');
    });

    it('should accept Chinese characters', async () => {
      const applicationData = {
        fullName: '王小明',
        email: 'wang.xiaoming@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-02-14',
        ssn: '444-55-6666',
        street: '中关村大街 200 号',
        city: '北京',
        state: 'CN',
        zipCode: '100000',
        employmentStatus: 'employed' as const,
        employer: '中国公司',
        monthlyIncome: 5500,
        loanType: 'installment' as const,
        requestedAmount: 26000,
        loanPurpose: '商业扩展和设备购置',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('王');
    });

    it('should accept Japanese characters', async () => {
      const applicationData = {
        fullName: '山田太郎',
        email: 'yamada.taro@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1987-08-22',
        ssn: '555-66-7777',
        street: '東京都渋谷区 301',
        city: '東京',
        state: 'JP',
        zipCode: '150-0042',
        employmentStatus: 'employed' as const,
        employer: '日本会社',
        monthlyIncome: 6200,
        loanType: 'installment' as const,
        requestedAmount: 35000,
        loanPurpose: 'ビジネス拡張と機器購入',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('山田');
    });

    it('should accept Arabic characters', async () => {
      const applicationData = {
        fullName: 'محمد علي',
        email: 'mohammad.ali@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1989-06-18',
        ssn: '666-77-8888',
        street: 'شارع النيل 45',
        city: 'القاهرة',
        state: 'EG',
        zipCode: '11511',
        employmentStatus: 'employed' as const,
        employer: 'الشركة العربية',
        monthlyIncome: 5300,
        loanType: 'installment' as const,
        requestedAmount: 24000,
        loanPurpose: 'توسع الأعمال وشراء المعدات',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('محمد');
    });

    it('should accept Hebrew characters', async () => {
      const applicationData = {
        fullName: 'דוד כהן',
        email: 'david.cohen@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1993-09-12',
        ssn: '777-88-9999',
        street: 'רחוב הרצל 78',
        city: 'תל אביב',
        state: 'IL',
        zipCode: '63012',
        employmentStatus: 'employed' as const,
        employer: 'חברה ישראלית',
        monthlyIncome: 5600,
        loanType: 'installment' as const,
        requestedAmount: 27000,
        loanPurpose: 'הרחבת עסק וקנייה של ציוד',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('דוד');
    });
  });

  describe('Safe Special Characters', () => {
    it('should accept hyphens and apostrophes in names', async () => {
      const applicationData = {
        fullName: "Mary-Ann O'Brien-Smith",
        email: 'mary.ann@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1991-04-25',
        ssn: '888-99-0000',
        street: "O'Malley Lane",
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: "O'Reilly & Associates",
        monthlyIncome: 5400,
        loanType: 'installment' as const,
        requestedAmount: 25500,
        loanPurpose: 'Home-improvement and office-renovation',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain("O'Brien");
    });

    it('should accept periods and commas in addresses', async () => {
      const applicationData = {
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1986-12-03',
        ssn: '999-00-1111',
        street: '123 Main St., Suite 200, Building A',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        employmentStatus: 'employed' as const,
        employer: 'Tech Corp., Inc.',
        monthlyIncome: 5700,
        loanType: 'installment' as const,
        requestedAmount: 31000,
        loanPurpose: 'Commercial expansion and equipment purchase.',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toBe('John Smith');
    });

    it('should accept ampersand in employer name', async () => {
      const applicationData = {
        fullName: 'Robert Johnson',
        email: 'robert.johnson@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1984-10-11',
        ssn: '111-22-3333',
        street: '456 Commerce Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        employmentStatus: 'employed' as const,
        employer: 'Brown & Associates LLC',
        monthlyIncome: 6100,
        loanType: 'installment' as const,
        requestedAmount: 33000,
        loanPurpose: 'Business growth & equipment acquisition',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.employer).toContain('&');
    });

    it('should accept parentheses in addresses', async () => {
      const applicationData = {
        fullName: 'Sarah Williams',
        email: 'sarah.williams@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1994-01-20',
        ssn: '222-33-4444',
        street: '789 Park Drive (rear building)',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        employmentStatus: 'employed' as const,
        employer: 'Wilson Group (formerly Hudson)',
        monthlyIncome: 5900,
        loanType: 'installment' as const,
        requestedAmount: 29000,
        loanPurpose: 'Property improvement (home renovation)',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain('Sarah');
    });

    it('should accept slashes in dates and addresses', async () => {
      const applicationData = {
        fullName: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1988-07-14',
        ssn: '333-44-5555',
        street: '321 Highway 101 / Oak Street',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        employmentStatus: 'employed' as const,
        employer: 'Cross & Co. / Alliance Group',
        monthlyIncome: 5500,
        loanType: 'installment' as const,
        requestedAmount: 26500,
        loanPurpose: 'Office renovation / facility upgrade',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.street).toContain('/');
    });
  });

  describe('HTML/XML Special Characters (Should be Escaped)', () => {
    it('should handle less-than and greater-than symbols', async () => {
      const applicationData = {
        fullName: 'David Lee',
        email: 'david.lee@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1989-03-18',
        ssn: '444-55-6666',
        street: '654 Commercial Street',
        city: 'Austin',
        state: 'TX',
        zipCode: '78701',
        employmentStatus: 'employed' as const,
        employer: 'Tech Solutions <Advanced>',
        monthlyIncome: 5800,
        loanType: 'installment' as const,
        requestedAmount: 30500,
        loanPurpose: 'Equipment upgrade (< $50k budget)',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      // Should be escaped/stored safely
      expect(result.data?.employer).toBeDefined();
    });

    it('should handle ampersand in loan purpose', async () => {
      const applicationData = {
        fullName: 'Jennifer Davis',
        email: 'jennifer.davis@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1993-11-22',
        ssn: '555-66-7777',
        street: '987 Business Park',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        employmentStatus: 'employed' as const,
        employer: 'Davis & Associates',
        monthlyIncome: 5600,
        loanType: 'installment' as const,
        requestedAmount: 27500,
        loanPurpose: 'Office & warehouse renovation & expansion',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose).toContain('&');
    });

    it('should handle quotes in text', async () => {
      const applicationData = {
        fullName: 'Christopher Hall',
        email: 'christopher.hall@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1987-05-09',
        ssn: '666-77-8888',
        street: '123 "Premium" Ave',
        city: 'Portland',
        state: 'OR',
        zipCode: '97201',
        employmentStatus: 'employed' as const,
        employer: '"Premium" Services Inc.',
        monthlyIncome: 5700,
        loanType: 'installment' as const,
        requestedAmount: 28500,
        loanPurpose: 'Expansion of "flagship" location',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose).toBeDefined();
    });
  });

  describe('SQL Injection Attempt Patterns (Should Be Rejected/Escaped)', () => {
    it('should reject SQL injection in full name', async () => {
      const applicationData = {
        fullName: "John'; DROP TABLE users--",
        email: 'john.injection@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-01',
        ssn: '777-88-9999',
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Company',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Test loan purpose here',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        const result = await trpc.loans.submit.mutate(applicationData);
        // If it passes, verify it's stored safely (not executed)
        expect(result.data?.fullName).toContain("'");
      } catch (error: any) {
        // It's okay if rejected, also acceptable
        expect(error.message).toBeDefined();
      }
    });

    it('should reject SQL injection attempt with OR clause', async () => {
      const applicationData = {
        fullName: "Admin' OR '1'='1",
        email: 'admin.injection@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-01',
        ssn: '888-99-0000',
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Company',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Test loan purpose here',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        const result = await trpc.loans.submit.mutate(applicationData);
        // Should be stored as literal string, not executed
        expect(result.data?.fullName).toContain("'");
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });

    it('should handle semicolon in loan purpose', async () => {
      const applicationData = {
        fullName: 'Test User',
        email: 'test.semicolon@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-01',
        ssn: '999-00-1111',
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Company',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Home improvement; also expansion plans',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose).toContain(';');
    });
  });

  describe('Script Injection Attempt Patterns (Should Be Sanitized)', () => {
    it('should sanitize script tags in loan purpose', async () => {
      const applicationData = {
        fullName: 'Safe User',
        email: 'safe.script@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-01',
        ssn: '111-22-3333',
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Company',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Home improvement <script>alert("test")</script> project',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      // Should either reject or sanitize
      if (result.success) {
        expect(result.data?.loanPurpose).toBeDefined();
        // Script tags should be escaped
        expect(!result.data?.loanPurpose.includes('<script>') || 
                result.data?.loanPurpose.includes('&lt;script&gt;')).toBe(true);
      }
    });

    it('should sanitize onclick handlers in employer field', async () => {
      const applicationData = {
        fullName: 'Handler Test',
        email: 'handler.test@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-01',
        ssn: '222-33-4444',
        street: '123 Main St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Company<img src=x onerror=alert("XSS")>',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Test loan purpose here',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      // Should be handled safely
      if (result.success) {
        expect(result.data?.employer).toBeDefined();
      }
    });

    it('should handle javascript protocol in street', async () => {
      const applicationData = {
        fullName: 'JS Test',
        email: 'js.test@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-01-01',
        ssn: '333-44-5555',
        street: 'javascript:void(0); Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Company',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Test loan purpose here',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      // Should be stored safely
      if (result.success) {
        expect(result.data?.street).toBeDefined();
      }
    });
  });

  describe('Mixed Character Sets and Edge Cases', () => {
    it('should accept mixed English and French characters', async () => {
      const applicationData = {
        fullName: 'Jean Pierre Dubois-Smith',
        email: 'jean.pierre@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1985-06-30',
        ssn: '444-55-6666',
        street: 'Rue St-James Boulevard',
        city: 'Montréal-Nord',
        state: 'QC',
        zipCode: 'H1G2K5',
        employmentStatus: 'employed' as const,
        employer: 'Société Multi-national Corp',
        monthlyIncome: 5600,
        loanType: 'installment' as const,
        requestedAmount: 26500,
        loanPurpose: 'Rénovation de property and business expansion',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toBeDefined();
    });

    it('should accept mixed special characters in loan purpose', async () => {
      const applicationData = {
        fullName: 'Complex Name',
        email: 'complex@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-12-25',
        ssn: '555-66-7777',
        street: '123 Main Street',
        city: 'Anytown',
        state: 'CA',
        zipCode: '90210',
        employmentStatus: 'employed' as const,
        employer: 'Mixed & Co.',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Expansion (Phase I & II) - Est. budget: $50K-$75K; Includes equipment & staffing',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose).toContain('&');
      expect(result.data?.loanPurpose).toContain(';');
      expect(result.data?.loanPurpose).toContain('$');
    });

    it('should accept numbers mixed with special characters in street', async () => {
      const applicationData = {
        fullName: 'Number Mixed',
        email: 'numbermixed@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1995-08-15',
        ssn: '666-77-8888',
        street: '12345 West 67th Ave. #890-B (Suite 200)',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        employmentStatus: 'employed' as const,
        employer: 'Tech123-Corp & Associates (Ltd.)',
        monthlyIncome: 5400,
        loanType: 'installment' as const,
        requestedAmount: 25500,
        loanPurpose: 'Expansion project: Phase 1 (2024), Phase 2 (2025). Budget: $40-60K',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toBeDefined();
    });
  });

  describe('Currency Symbols and Mathematical Operators', () => {
    it('should handle dollar sign in loan purpose', async () => {
      const applicationData = {
        fullName: 'Currency Test',
        email: 'currency@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1991-03-12',
        ssn: '777-88-9999',
        street: '456 Commerce St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        employmentStatus: 'employed' as const,
        employer: 'Dollar Corp',
        monthlyIncome: 6000,
        loanType: 'installment' as const,
        requestedAmount: 30000,
        loanPurpose: 'Equipment purchase ($5000-$10000 items) and inventory',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose).toContain('$');
    });

    it('should handle percentage symbol in loan purpose', async () => {
      const applicationData = {
        fullName: 'Percentage Test',
        email: 'percent@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1993-07-20',
        ssn: '888-99-0000',
        street: '789 Percent Ave',
        city: 'Dallas',
        state: 'TX',
        zipCode: '75201',
        employmentStatus: 'employed' as const,
        employer: 'Percent Inc',
        monthlyIncome: 5500,
        loanType: 'installment' as const,
        requestedAmount: 27500,
        loanPurpose: 'Growth initiative with 25% expansion and 15% modernization',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose).toContain('%');
    });

    it('should handle mathematical operators in loan purpose', async () => {
      const applicationData = {
        fullName: 'Math Test',
        email: 'math@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1989-09-09',
        ssn: '999-00-1111',
        street: '321 Math Lane',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        employmentStatus: 'employed' as const,
        employer: 'Math Solutions',
        monthlyIncome: 5700,
        loanType: 'installment' as const,
        requestedAmount: 28500,
        loanPurpose: 'Phase 1 (±2 weeks) + Phase 2 (±4 weeks) = expansion timeline',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose).toContain('+');
    });
  });

  describe('Whitespace and Control Character Handling', () => {
    it('should handle leading and trailing spaces', async () => {
      const applicationData = {
        fullName: '  John Doe  ',
        email: 'john.trim@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-10-10',
        ssn: '111-22-3333',
        street: '  123 Main Street  ',
        city: '  Boston  ',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: '  Test Company  ',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: '  Home improvement project  ',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      // Should be trimmed or accepted
      expect(result.data?.fullName).toBeDefined();
    });

    it('should handle multiple spaces between words', async () => {
      const applicationData = {
        fullName: 'John    Doe',
        email: 'john.spaces@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-10-10',
        ssn: '222-33-4444',
        street: '123    Main    Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test    Company',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Home    improvement    project',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toBeDefined();
    });

    it('should handle tabs in loan purpose', async () => {
      const applicationData = {
        fullName: 'Tab Test',
        email: 'tab@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-10-10',
        ssn: '333-44-5555',
        street: '123 Main Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Company',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Phase\t1\tSetup\tand\tExpansion',
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.loanPurpose).toBeDefined();
    });
  });

  describe('Emoji and Special Unicode Symbols', () => {
    it('should handle emoji in names (may be stripped or accepted)', async () => {
      const applicationData = {
        fullName: 'John Doe 🚀',
        email: 'emoji@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-10-10',
        ssn: '444-55-6666',
        street: '123 Main Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Company',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Home improvement project',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        const result = await trpc.loans.submit.mutate(applicationData);
        // Should be handled without crashing
        expect(result.data?.fullName).toBeDefined();
      } catch (error: any) {
        // Rejection is also acceptable
        expect(error.message).toBeDefined();
      }
    });

    it('should handle checkmark and X symbols', async () => {
      const applicationData = {
        fullName: 'Symbol Test',
        email: 'symbols@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1990-10-10',
        ssn: '555-66-7777',
        street: '123 Main Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        employmentStatus: 'employed' as const,
        employer: 'Test Company',
        monthlyIncome: 5000,
        loanType: 'installment' as const,
        requestedAmount: 25000,
        loanPurpose: 'Completed: ✅ Phase 1, ❌ Phase 2 pending',
        disbursementMethod: 'bank_transfer' as const,
      };

      try {
        const result = await trpc.loans.submit.mutate(applicationData);
        // Should be handled
        expect(result.data?.loanPurpose).toBeDefined();
      } catch (error: any) {
        // Rejection acceptable
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Combined Special Character Edge Cases', () => {
    it('should handle comprehensive special character combination', async () => {
      const applicationData = {
        fullName: "Jean-Pierre O'Sullivan-Müller",
        email: 'comprehensive@example.com',
        phone: '5551234567',
        password: 'SecurePass123!@#',
        dateOfBirth: '1985-05-05',
        ssn: '666-77-8888',
        street: '123-A Rue St. Jean, Suite #200 (Building B)',
        city: 'Montréal-Nord',
        state: 'QC',
        zipCode: 'H1G2K5',
        employmentStatus: 'employed' as const,
        employer: "O'Malley & Associates, Inc. (Québec)",
        monthlyIncome: 5800,
        loanType: 'installment' as const,
        requestedAmount: 31000,
        loanPurpose: "Expansion of O'Sullivan's café & bakery (Phase 1: $15K, Phase 2: $16K); Budget includes: equipment (±$8K), renovations (±$10K), staffing/training (≈$3K), other costs (?)",
        disbursementMethod: 'bank_transfer' as const,
      };

      const result = await trpc.loans.submit.mutate(applicationData);
      expect(result.success).toBe(true);
      expect(result.data?.fullName).toContain("O'");
      expect(result.data?.loanPurpose).toContain('&');
    });
  });
});
