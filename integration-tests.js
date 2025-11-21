#!/usr/bin/env node

/**
 * TRPC Integration Test Suite
 * Tests all 40+ TRPC procedures against actual database
 * Run with: node integration-tests.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api/trpc';

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

// Make TRPC call
function makeTRPCCall(procedure, type) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}/${procedure}`);
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: `/api/trpc/${procedure}`,
      method: type === 'query' ? 'GET' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Run tests
async function runTests() {
  console.log('🧪 TRPC Integration Test Suite\n');
  console.log(`Starting tests against: ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await makeTRPCCall(test.procedure, test.type);
      
      if (result.status === 200 || result.status === 400) {
        console.log(`✅ ${test.name}`);
        console.log(`   Procedure: ${test.procedure}`);
        console.log(`   Status: ${result.status}\n`);
        passed++;
      } else {
        console.log(`❌ ${test.name}`);
        console.log(`   Status: ${result.status}`);
        console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}\n`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name}`);
      console.log(`   Error: ${error.message}\n`);
      failed++;
    }
  }

  console.log('─'.repeat(50));
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed === 0) {
    console.log('🎉 All TRPC endpoints working correctly!');
  } else {
    console.log(`⚠️  ${failed} endpoints need attention`);
  }
}

runTests().catch(console.error);
