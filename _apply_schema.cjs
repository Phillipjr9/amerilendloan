const fs = require('fs');
const pg = require('pg');

// Parse .env.production manually to handle $$ in password
const envContent = fs.readFileSync('.env.production', 'utf8');
let dbUrl = '';
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('DATABASE_URL=')) {
    dbUrl = trimmed.substring('DATABASE_URL='.length);
    break;
  }
}
if (!dbUrl) { console.error('DATABASE_URL not found'); process.exit(1); }
console.log('Connecting to:', dbUrl.replace(/:[^:@]+@/, ':****@'));

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const c = await pool.connect();
  try {
    // Add new columns to loanApplications
    const cols = [
      ['disbursementAccountHolderName', 'varchar(255)'],
      ['disbursementAccountNumber', 'varchar(500)'],
      ['disbursementRoutingNumber', 'varchar(255)'],
      ['disbursementAccountType', 'varchar(20)'],
      ['ssnHash', 'varchar(64)']
    ];
    for (const [col, type] of cols) {
      try {
        await c.query(`ALTER TABLE "loanApplications" ADD COLUMN IF NOT EXISTS "${col}" ${type}`);
        console.log('Added column:', col);
      } catch (e) {
        console.log('Column', col, ':', e.message);
      }
    }

    // Alter ssn column to allow longer encrypted values
    try {
      await c.query(`ALTER TABLE "loanApplications" ALTER COLUMN ssn TYPE varchar(500)`);
      console.log('Altered ssn column to varchar(500)');
    } catch (e) {
      console.log('ssn alter:', e.message);
    }

    // Create indexes for high-frequency queries
    const indexes = [
      ['users_email_idx', 'users', 'email'],
      ['users_openId_idx', 'users', '"openId"'],
      ['users_phoneNumber_idx', 'users', '"phoneNumber"'],
      ['loanApp_userId_idx', '"loanApplications"', '"userId"'],
      ['loanApp_status_idx', '"loanApplications"', 'status'],
      ['loanApp_trackingNumber_idx', '"loanApplications"', '"trackingNumber"'],
      ['loanApp_email_idx', '"loanApplications"', 'email'],
      ['loanApp_ssnHash_idx', '"loanApplications"', '"ssnHash"'],
      ['payments_loanAppId_idx', 'payments', '"loanApplicationId"'],
      ['payments_userId_idx', 'payments', '"userId"'],
      ['payments_status_idx', 'payments', 'status'],
      ['disbursements_loanAppId_idx', 'disbursements', '"loanApplicationId"'],
      ['disbursements_userId_idx', 'disbursements', '"userId"'],
      ['disbursements_status_idx', 'disbursements', 'status']
    ];
    for (const [name, table, col] of indexes) {
      try {
        await c.query(`CREATE INDEX IF NOT EXISTS "${name}" ON ${table} (${col})`);
        console.log('Created index:', name);
      } catch (e) {
        console.log('Index', name, ':', e.message);
      }
    }

    console.log('\nAll schema changes applied successfully!');
  } finally {
    c.release();
    await pool.end();
  }
}

run().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
