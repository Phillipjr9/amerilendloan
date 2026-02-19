/**
 * Seed script: create test admin + regular user accounts
 * Run: node _seed_test_accounts.cjs
 */
require('dotenv').config();
const postgres = require('postgres');
const bcrypt = require('bcryptjs');

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

const ACCOUNTS = [
  {
    openId: 'test_admin_' + Date.now().toString(36),
    email: 'admin@amerilendloan.com',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    password: 'Admin@1234',
    loginMethod: 'email_password',
  },
  {
    openId: 'test_user_' + Date.now().toString(36),
    email: 'testuser@amerilendloan.com',
    name: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    password: 'User@1234',
    loginMethod: 'email_password',
  },
];

async function seed() {
  for (const acct of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(acct.password, 10);

    // Check if user already exists
    const existing = await sql`SELECT id, email, role FROM users WHERE email = ${acct.email}`;

    if (existing.length > 0) {
      // Update existing user: set password hash and role
      await sql`
        UPDATE users 
        SET "passwordHash" = ${passwordHash},
            role = ${acct.role},
            "loginMethod" = ${acct.loginMethod},
            "firstName" = ${acct.firstName},
            "lastName" = ${acct.lastName},
            name = ${acct.name},
            "updatedAt" = NOW()
        WHERE email = ${acct.email}
      `;
      console.log(`✅ Updated existing ${acct.role}: ${acct.email} (password reset to ${acct.password})`);
    } else {
      // Insert new user
      await sql`
        INSERT INTO users ("openId", email, name, "firstName", "lastName", role, "passwordHash", "loginMethod", "accountStatus", "createdAt", "updatedAt", "lastSignedIn")
        VALUES (${acct.openId}, ${acct.email}, ${acct.name}, ${acct.firstName}, ${acct.lastName}, ${acct.role}, ${passwordHash}, ${acct.loginMethod}, 'active', NOW(), NOW(), NOW())
      `;
      console.log(`✅ Created ${acct.role}: ${acct.email} / ${acct.password}`);
    }
  }

  console.log('\n══════════════════════════════════════');
  console.log('  TEST ACCOUNTS READY');
  console.log('══════════════════════════════════════');
  console.log('  Admin:  admin@amerilendloan.com / Admin@1234');
  console.log('  User:   testuser@amerilendloan.com / User@1234');
  console.log('══════════════════════════════════════\n');

  await sql.end();
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  sql.end().then(() => process.exit(1));
});
