require('dotenv').config();
process.env.DATABASE_URL = process.env.DATABASE_URL;
const { execSync } = require('child_process');
try {
  const out = execSync('npx drizzle-kit push', { encoding: 'utf8', env: { ...process.env }, timeout: 45000, input: 'y\n' });
  console.log(out);
} catch(e) {
  console.log('STDOUT:', e.stdout || '');
  console.log('STDERR:', e.stderr || '');
}
