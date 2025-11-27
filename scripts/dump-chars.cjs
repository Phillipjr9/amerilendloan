const fs = require('fs');
const path = require('path');
const file = process.argv[2];
const fromLine = parseInt(process.argv[3] || '1', 10);
const toLine = parseInt(process.argv[4] || String(fromLine + 10), 10);
if (!file) { console.error('Usage: node dump-chars.cjs <file> <fromLine> <toLine>'); process.exit(2); }
const src = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
const lines = src.split('\n');
for (let i = fromLine-1; i < Math.min(lines.length, toLine); i++) {
  const line = lines[i];
  const codes = Array.from(line).map(c => c.charCodeAt(0));
  console.log(`${i+1}: ${line}`);
  console.log('   codes:', codes.join(' '));
}
