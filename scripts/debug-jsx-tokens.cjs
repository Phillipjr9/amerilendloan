const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node debug-jsx-tokens.cjs <file>');
  process.exit(2);
}

const src = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');
const tagRegex = /(<\/?\s*(?:[A-Za-z0-9_:\-\.]+|>)\b[^>]*>)/g;
const tokens = [];
let m;
while ((m = tagRegex.exec(src)) !== null) {
  const idx = m.index;
  const line = src.slice(0, idx).split('\n').length;
  tokens.push({ token: m[1], index: idx, line });
}

console.log('Total tokens found:', tokens.length);
for (let i = 0; i < tokens.length; i++) {
  const t = tokens[i];
  if (t.line >= 480 && t.line <= 520) {
    console.log(i, `line ${t.line}:`, t.token.replace(/\n/g, '\\n'));
  }
}

// print neighborhood around first token index ~508
const targetLine = 508;
const neighborhood = tokens.filter(t => t.line >= targetLine-5 && t.line <= targetLine+5);
console.log('\nNeighborhood tokens around line', targetLine);
neighborhood.forEach((t, idx) => console.log(`${t.line}: ${t.token.replace(/\n/g,'\\n')}`));
