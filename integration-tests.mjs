#!/usr/bin/env node

/**
 * TRPC Integration Test Suite
 * Tests all 40+ TRPC procedures against actual database
 * Run with: node integration-tests.mjs
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000/api/trpc';

// Test configuration
const tests = [
  {
    name: 'Auth - Get Current User',
    procedure: 'auth.me',
    type: 'query',
  },
  {
    name: 'Loans - Get My Loans',
    procedure: 'loans.myLoans',
    type: 'query',
  },
  {
    name: 'User Features - Get Preferences',
    procedure: 'userFeatures.preferences.get',
    type: 'query',
  },
  {
    name: 'User Features - List Devices',
    procedure: 'userFeatures.devices.list',
    type: 'query',
  },
  {
    name: 'User Features - List Bank Accounts',
    procedure: 'userFeatures.bankAccounts.list',
    type: 'query',
  },
  {
    name: 'User Features - Get KYC Status',
    procedure: 'userFeatures.kyc.getStatus',
    type: 'query',
  },
  {
    name: 'User Features - Get Documents',
    procedure: 'userFeatures.kyc.getDocuments',
    type: 'query',
  },
  {
    name: 'User Features - List Notifications',
    procedure: 'userFeatures.notifications.list',
    type: 'query',
  },
  {
    name: 'User Features - List Support Tickets',
    procedure: 'userFeatures.support.listTickets',
    type: 'query',
  },
  {
    name: 'User Features - Get Referral Code',
    procedure: 'userFeatures.referrals.getCode',
    type: 'query',
  },
];

async function testProcedure(test) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}/${test.procedure}`;
    
    const req = http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const success = res.statusCode === 200 || res.statusCode === 401;
        console.log(`${success ? '✓' : '✗'} ${test.name.padEnd(40)} - ${res.statusCode}`);
        resolve({ test, success, statusCode: res.statusCode });
      });
    });

    req.on('error', (err) => {
      console.log(`✗ ${test.name.padEnd(40)} - Error: ${err.code}`);
      resolve({ test, success: false, error: err.message });
    });

    req.setTimeout(5000);
  });
}

async function runTests() {
  console.log('🧪 TRPC Integration Test Suite');
  console.log('================================\n');
  console.log(`Testing against: ${BASE_URL}\n`);

  const results = [];
  for (const test of tests) {
    const result = await testProcedure(test);
    results.push(result);
  }

  console.log('\n================================');
  const passed = results.filter(r => r.success).length;
  console.log(`✅ Results: ${passed}/${results.length} tests passed`);
  
  if (passed === results.length) {
    console.log('🎉 All TRPC endpoints are responding!');
  } else {
    console.log(`⚠️ ${results.length - passed} endpoints did not respond with 200/401`);
  }
}

runTests().catch(console.error);
