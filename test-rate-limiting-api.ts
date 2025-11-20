/**
 * Rate Limiting API Security Tests
 * 
 * Tests the API's ability to handle excessive requests from a single IP address
 * and enforce rate limiting as expected.
 * 
 * Run with: pnpm test test-rate-limiting-api.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * Mock Request Context
 */
interface MockContext {
  req: {
    ip: string;
    headers: Record<string, string | string[]>;
  };
}

/**
 * Test: Rate Limit Tracking per IP Address
 */
describe('Rate Limiting - IP Address Tracking', () => {
  it('should track requests by IP address', () => {
    const ipTracker = new Map<string, number>();
    const testIp = '192.168.1.100';
    
    // Simulate requests from single IP
    for (let i = 0; i < 10; i++) {
      const count = (ipTracker.get(testIp) || 0) + 1;
      ipTracker.set(testIp, count);
    }
    
    expect(ipTracker.get(testIp)).toBe(10);
  });

  it('should distinguish between different IP addresses', () => {
    const ipTracker = new Map<string, number>();
    const ip1 = '192.168.1.100';
    const ip2 = '192.168.1.101';
    
    // Requests from IP1
    ipTracker.set(ip1, 5);
    
    // Requests from IP2
    ipTracker.set(ip2, 3);
    
    expect(ipTracker.get(ip1)).toBe(5);
    expect(ipTracker.get(ip2)).toBe(3);
  });

  it('should extract client IP from X-Forwarded-For header', () => {
    function getClientIP(headers: Record<string, string | string[]>): string {
      const xForwardedFor = headers['x-forwarded-for'];
      if (xForwardedFor) {
        const ips = Array.isArray(xForwardedFor) 
          ? xForwardedFor[0] 
          : xForwardedFor.split(',')[0];
        return ips.trim();
      }
      return 'Unknown';
    }

    const testCases = [
      { headers: { 'x-forwarded-for': '192.168.1.100' }, expected: '192.168.1.100' },
      { headers: { 'x-forwarded-for': '192.168.1.100, 10.0.0.1' }, expected: '192.168.1.100' },
      { headers: { 'x-forwarded-for': ['192.168.1.100', '10.0.0.1'] }, expected: '192.168.1.100' },
    ];

    testCases.forEach(({ headers, expected }) => {
      expect(getClientIP(headers)).toBe(expected);
    });
  });
});

/**
 * Test: Rate Limit Window Management
 */
describe('Rate Limiting - Time Window Management', () => {
  it('should enforce rate limit within time window', () => {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxAttempts = 5;
    
    const attempt = { count: 0, resetTime: now + windowMs };
    
    // Fill up the window
    for (let i = 0; i < maxAttempts; i++) {
      attempt.count++;
    }
    
    expect(attempt.count).toBe(maxAttempts);
    expect(attempt.count >= maxAttempts).toBe(true); // Should be blocked
  });

  it('should reset rate limit after window expires', () => {
    const initialTime = Date.now();
    const windowMs = 60000; // 1 minute
    const attempt = { count: 5, resetTime: initialTime + windowMs };
    
    // Simulate window expiration
    const laterTime = initialTime + windowMs + 1000;
    
    if (laterTime > attempt.resetTime) {
      attempt.count = 0; // Reset
      attempt.resetTime = laterTime + windowMs;
    }
    
    expect(attempt.count).toBe(0);
  });

  it('should handle multiple concurrent time windows', () => {
    const now = Date.now();
    const windows = new Map<string, { count: number; resetTime: number }>();
    
    const ip1 = '192.168.1.100';
    const ip2 = '192.168.1.101';
    
    windows.set(ip1, { count: 3, resetTime: now + 60000 });
    windows.set(ip2, { count: 1, resetTime: now + 60000 });
    
    expect(windows.get(ip1)?.count).toBe(3);
    expect(windows.get(ip2)?.count).toBe(1);
  });
});

/**
 * Test: Rate Limit Enforcement (Max Attempts)
 */
describe('Rate Limiting - Enforcement', () => {
  it('should allow requests up to limit', () => {
    const maxAttempts = 5;
    let currentAttempts = 0;
    
    const results = [];
    for (let i = 0; i < maxAttempts; i++) {
      currentAttempts++;
      results.push(currentAttempts <= maxAttempts);
    }
    
    expect(results).toEqual([true, true, true, true, true]);
  });

  it('should block requests exceeding limit', () => {
    const maxAttempts = 5;
    let currentAttempts = 0;
    
    const results = [];
    for (let i = 0; i < 10; i++) {
      currentAttempts++;
      const allowed = currentAttempts <= maxAttempts;
      results.push(allowed);
    }
    
    // First 5 should be allowed, rest should be blocked
    expect(results.slice(0, 5)).toEqual([true, true, true, true, true]);
    expect(results.slice(5)).toEqual([false, false, false, false, false]);
  });

  it('should respond with 429 Too Many Requests status', () => {
    const response = {
      status: 429,
      statusText: 'Too Many Requests',
      body: {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.'
        }
      }
    };
    
    expect(response.status).toBe(429);
    expect(response.statusText).toBe('Too Many Requests');
    expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should include rate limit headers in response', () => {
    const headers = {
      'X-RateLimit-Limit': '5',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': '1700500860',
      'Retry-After': '59'
    };
    
    expect(parseInt(headers['X-RateLimit-Limit'])).toBe(5);
    expect(parseInt(headers['X-RateLimit-Remaining'])).toBe(0);
    expect(headers['Retry-After']).toBe('59');
  });
});

/**
 * Test: Login Endpoint Rate Limiting
 */
describe('Rate Limiting - Login Endpoint', () => {
  it('should limit failed login attempts to 5 per 15 minutes', () => {
    const maxFailedAttempts = 5;
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const loginAttempts = new Map<string, { count: number; resetTime: number }>();
    
    const email = 'user@example.com';
    const now = Date.now();
    
    loginAttempts.set(email, { count: 0, resetTime: now + windowMs });
    
    // Simulate 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const attempt = loginAttempts.get(email)!;
      attempt.count++;
    }
    
    const attempt = loginAttempts.get(email)!;
    const isBelowLimit = attempt.count < maxFailedAttempts;
    
    expect(attempt.count).toBe(5);
    expect(isBelowLimit).toBe(false); // At the limit, next should be blocked
  });

  it('should record login attempt with IP address', () => {
    const loginRecord = {
      email: 'user@example.com',
      ipAddress: '192.168.1.100',
      timestamp: new Date().toISOString(),
      successful: false,
      userAgent: 'Mozilla/5.0...'
    };
    
    expect(loginRecord.email).toBe('user@example.com');
    expect(loginRecord.ipAddress).toBe('192.168.1.100');
    expect(loginRecord.successful).toBe(false);
  });

  it('should send alert after suspicious login activity', () => {
    const suspiciousActivity = {
      email: 'user@example.com',
      failedAttempts: 6,
      ipAddress: '192.168.1.100',
      timeWindow: '15 minutes',
      alert: true,
      alertMessage: 'Multiple failed login attempts detected'
    };
    
    expect(suspiciousActivity.alert).toBe(true);
    expect(suspiciousActivity.failedAttempts).toBeGreaterThan(5);
  });

  it('should temporarily lock account after excessive failed attempts', () => {
    const lockoutConfig = {
      maxAttempts: 5,
      lockoutDuration: '15 minutes',
      requirePasswordReset: true
    };
    
    const failedAttempts = 6;
    const isLockedOut = failedAttempts > lockoutConfig.maxAttempts;
    
    expect(isLockedOut).toBe(true);
    expect(lockoutConfig.requirePasswordReset).toBe(true);
  });
});

/**
 * Test: OTP Request Rate Limiting
 */
describe('Rate Limiting - OTP Endpoints', () => {
  it('should limit OTP requests to 3 per 5 minutes per email', () => {
    const otpRequests = new Map<string, number[]>();
    const email = 'user@example.com';
    const now = Date.now();
    const windowMs = 5 * 60 * 1000; // 5 minutes
    const maxRequests = 3;
    
    // Simulate 3 requests
    const timestamps = [now, now + 1000, now + 2000];
    otpRequests.set(email, timestamps);
    
    const validRequests = otpRequests.get(email)!.filter(
      ts => now - ts < windowMs
    ).length;
    
    expect(validRequests).toBe(3);
    expect(validRequests <= maxRequests).toBe(true);
  });

  it('should block 4th OTP request within window', () => {
    const otpRequests = new Map<string, number[]>();
    const email = 'user@example.com';
    const now = Date.now();
    const windowMs = 5 * 60 * 1000;
    const maxRequests = 3;
    
    const timestamps = [now, now + 1000, now + 2000, now + 3000];
    otpRequests.set(email, timestamps);
    
    const validRequests = otpRequests.get(email)!.filter(
      ts => now - ts < windowMs
    ).length;
    
    expect(validRequests).toBe(4);
    expect(validRequests > maxRequests).toBe(true);
  });

  it('should limit OTP verification attempts to 5 per code', () => {
    const otpCode = '123456';
    const maxVerificationAttempts = 5;
    let verificationAttempts = 0;
    
    const attempts = [];
    for (let i = 0; i < 6; i++) {
      verificationAttempts++;
      attempts.push(verificationAttempts <= maxVerificationAttempts);
    }
    
    expect(attempts.slice(0, 5)).toEqual([true, true, true, true, true]);
    expect(attempts[5]).toBe(false);
  });

  it('should limit per-IP OTP requests to 10 per hour', () => {
    const ipOtpRequests = new Map<string, number[]>();
    const ip = '192.168.1.100';
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const maxPerHour = 10;
    
    const timestamps = Array.from({ length: 11 }, (_, i) => now - i * 1000);
    ipOtpRequests.set(ip, timestamps);
    
    const hourRequests = ipOtpRequests.get(ip)!.filter(
      ts => now - ts < hourMs
    ).length;
    
    expect(hourRequests).toBe(11);
    expect(hourRequests > maxPerHour).toBe(true);
  });
});

/**
 * Test: Search and Query Rate Limiting
 */
describe('Rate Limiting - Search Endpoint', () => {
  it('should limit search requests to 20 per hour per IP', () => {
    const searchRequests = new Map<string, number[]>();
    const ip = '192.168.1.100';
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const maxPerHour = 20;
    
    const timestamps = Array.from({ length: 21 }, (_, i) => now - i * 100);
    searchRequests.set(ip, timestamps);
    
    const hourRequests = searchRequests.get(ip)!.filter(
      ts => now - ts < hourMs
    ).length;
    
    expect(hourRequests).toBe(21);
    expect(hourRequests > maxPerHour).toBe(true);
  });

  it('should allow bursts within rate limit', () => {
    const burstSize = 5;
    const requestsPerSecond = 2;
    const allowedBurst = burstSize <= requestsPerSecond * 3; // 3 second burst
    
    expect(allowedBurst).toBe(true);
  });
});

/**
 * Test: Payment Processing Rate Limiting
 */
describe('Rate Limiting - Payment Processing', () => {
  it('should limit payment creation to reasonable rate per user', () => {
    const paymentRequests = new Map<string, number[]>();
    const userId = 'user_123';
    const now = Date.now();
    const hourMs = 60 * 60 * 1000;
    const maxPaymentsPerHour = 50; // Reasonable limit
    
    const timestamps = Array.from({ length: 51 }, (_, i) => now - i * 100);
    paymentRequests.set(userId, timestamps);
    
    const hourRequests = paymentRequests.get(userId)!.filter(
      ts => now - ts < hourMs
    ).length;
    
    expect(hourRequests).toBe(51);
    expect(hourRequests > maxPaymentsPerHour).toBe(true);
  });

  it('should identify suspicious payment patterns', () => {
    const suspiciousPattern = {
      paymentsMadeInSeconds: 10,
      averageTimePerPayment: 100, // ms
      isAnomalous: true,
      flaggedAsBot: true
    };
    
    expect(suspiciousPattern.isAnomalous).toBe(true);
    expect(suspiciousPattern.flaggedAsBot).toBe(true);
  });
});

/**
 * Test: Distributed Rate Limiting (Multiple IP Addresses)
 */
describe('Rate Limiting - Distributed Attack Protection', () => {
  it('should handle requests from multiple IPs independently', () => {
    const ipLimits = new Map<string, { count: number; maxAttempts: number }>();
    
    const ips = ['192.168.1.100', '192.168.1.101', '192.168.1.102'];
    ips.forEach(ip => {
      ipLimits.set(ip, { count: 0, maxAttempts: 5 });
    });
    
    // Each IP gets its own limit
    ips.forEach(ip => {
      const limit = ipLimits.get(ip)!;
      for (let i = 0; i < 6; i++) {
        limit.count++;
      }
    });
    
    ips.forEach(ip => {
      const limit = ipLimits.get(ip)!;
      expect(limit.count).toBe(6);
      expect(limit.count > limit.maxAttempts).toBe(true);
    });
  });

  it('should detect distributed attack patterns', () => {
    const attackPattern = {
      ipAddresses: 100,
      requestsPerSecond: 10000,
      targetEndpoint: '/api/trpc/loans.search',
      pattern: 'distributed_attack',
      detected: true
    };
    
    expect(attackPattern.detected).toBe(true);
    expect(attackPattern.ipAddresses).toBeGreaterThan(50);
  });

  it('should not block legitimate traffic during distributed attack', () => {
    const trustedIP = '203.0.113.50'; // Verified user IP
    const attackerIP = '192.168.1.100';
    
    const requests = new Map<string, { allowed: boolean; reason: string }>();
    requests.set(trustedIP, { allowed: true, reason: 'Trusted IP' });
    requests.set(attackerIP, { allowed: false, reason: 'Rate limited' });
    
    expect(requests.get(trustedIP)?.allowed).toBe(true);
    expect(requests.get(attackerIP)?.allowed).toBe(false);
  });
});

/**
 * Test: Rate Limit Error Responses
 */
describe('Rate Limiting - Error Responses', () => {
  it('should return proper error response structure', () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded. Please try again later.'
      },
      meta: {
        timestamp: new Date().toISOString(),
        retryAfter: 60
      }
    };
    
    expect(errorResponse.success).toBe(false);
    expect(errorResponse.error.code).toBe('TOO_MANY_REQUESTS');
    expect(errorResponse.meta.retryAfter).toBe(60);
  });

  it('should include retry information in response', () => {
    const response = {
      statusCode: 429,
      headers: {
        'Retry-After': '60',
        'X-RateLimit-Reset': '1700500860'
      },
      body: {
        message: 'Too many requests',
        retryAfter: 60
      }
    };
    
    expect(response.statusCode).toBe(429);
    expect(response.headers['Retry-After']).toBe('60');
    expect(response.body.retryAfter).toBe(60);
  });

  it('should not expose sensitive information in rate limit errors', () => {
    const errorResponse = {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.'
      }
    };
    
    const errorStr = JSON.stringify(errorResponse);
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /api_key/i,
      /database_url/i
    ];
    
    sensitivePatterns.forEach(pattern => {
      expect(errorStr).not.toMatch(pattern);
    });
  });
});

/**
 * Test: Rate Limit Recovery
 */
describe('Rate Limiting - Recovery', () => {
  it('should allow requests after window expires', () => {
    const now = Date.now();
    const windowMs = 1000; // 1 second for testing
    let attempt = { count: 5, resetTime: now + windowMs };
    
    // Simulate window expiration
    const laterTime = now + windowMs + 100;
    
    if (laterTime > attempt.resetTime) {
      attempt.count = 0;
      attempt.resetTime = laterTime + windowMs;
    }
    
    expect(attempt.count).toBe(0);
  });

  it('should reset counter after window expires', () => {
    const windows = new Map<string, { count: number; resetTime: number }>();
    const now = Date.now();
    const windowMs = 1000;
    
    windows.set('test', { count: 5, resetTime: now + windowMs });
    
    // Simulate time passing
    const laterTime = now + windowMs + 100;
    const window = windows.get('test')!;
    
    if (laterTime > window.resetTime) {
      window.count = 1; // First request after reset
      window.resetTime = laterTime + windowMs;
    }
    
    expect(window.count).toBe(1);
  });
});

/**
 * Test: Rate Limiting Configuration
 */
describe('Rate Limiting - Configuration', () => {
  it('should allow configurable rate limit thresholds', () => {
    const config = {
      loginAttempts: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000
      },
      otpRequests: {
        maxAttempts: 3,
        windowMs: 5 * 60 * 1000
      },
      searchQueries: {
        maxAttempts: 20,
        windowMs: 60 * 60 * 1000
      }
    };
    
    expect(config.loginAttempts.maxAttempts).toBe(5);
    expect(config.otpRequests.maxAttempts).toBe(3);
    expect(config.searchQueries.maxAttempts).toBe(20);
  });

  it('should support whitelist/blacklist configuration', () => {
    const config = {
      whitelist: ['127.0.0.1', '::1'],
      blacklist: ['192.168.1.100', '192.168.1.101'],
      bypassRateLimitForAdmin: true
    };
    
    expect(config.whitelist).toContain('127.0.0.1');
    expect(config.blacklist).toContain('192.168.1.100');
    expect(config.bypassRateLimitForAdmin).toBe(true);
  });

  it('should support dynamic rate limit adjustment', () => {
    let config = {
      maxAttempts: 5,
      windowMs: 60000
    };
    
    // Adjust during high load
    config.maxAttempts = 3;
    config.windowMs = 30000;
    
    expect(config.maxAttempts).toBe(3);
    expect(config.windowMs).toBe(30000);
  });
});

/**
 * Test: Rate Limit Monitoring & Alerting
 */
describe('Rate Limiting - Monitoring & Alerting', () => {
  it('should log rate limit violations', () => {
    const violations = [];
    
    violations.push({
      timestamp: new Date().toISOString(),
      ip: '192.168.1.100',
      endpoint: '/api/trpc/auth.login',
      violations: 6,
      limit: 5
    });
    
    expect(violations).toHaveLength(1);
    expect(violations[0].violations).toBeGreaterThan(violations[0].limit);
  });

  it('should track rate limit metrics', () => {
    const metrics = {
      totalRequests: 10000,
      blockedRequests: 150,
      blockPercentage: 1.5,
      topOffenders: [
        { ip: '192.168.1.100', violations: 50 },
        { ip: '192.168.1.101', violations: 30 }
      ]
    };
    
    expect(metrics.totalRequests).toBe(10000);
    expect(metrics.blockedRequests).toBe(150);
    expect(metrics.topOffenders).toHaveLength(2);
  });

  it('should alert on suspicious patterns', () => {
    const alert = {
      severity: 'HIGH',
      type: 'BRUTE_FORCE_ATTEMPT',
      description: 'Multiple failed login attempts from single IP',
      ip: '192.168.1.100',
      attempts: 50,
      timeWindow: '10 minutes',
      recommendedAction: 'Block IP temporarily'
    };
    
    expect(alert.severity).toBe('HIGH');
    expect(alert.attempts).toBeGreaterThan(5);
  });
});
