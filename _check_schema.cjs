require('dotenv').config();
const sql = require('postgres')(process.env.DATABASE_URL, { ssl: 'require' });

async function check() {
  const cols = await sql`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name='users' 
    AND column_name IN ('accountStatus','forcePasswordReset','loginCount','lastLoginIp')
    ORDER BY column_name
  `;
  console.log('Users columns:', JSON.stringify(cols, null, 2));

  // Check if account_status enum exists
  const enums = await sql`
    SELECT typname FROM pg_type WHERE typname = 'account_status'
  `;
  console.log('Enum exists:', enums.length > 0);

  // Check user_notification_settings columns
  const nsCols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='user_notification_settings'
    ORDER BY ordinal_position
  `;
  console.log('Notification settings columns:', JSON.stringify(nsCols, null, 2));

  await sql.end();
  process.exit(0);
}
check();
