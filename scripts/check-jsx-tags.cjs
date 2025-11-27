const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  // Better tokenization: scan for tags while ignoring '>' inside {...} or quotes
  const tokens = [];
  const s = src;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '<') {
      // start of a tag
      let j = i;
      let inSingle = false;
      let inDouble = false;
      let braceDepth = 0;
      j++;
      while (j < s.length) {
        const ch = s[j];
        if (!inSingle && ch === '"') {
          inDouble = !inDouble;
          j++;
          continue;
        }
        if (!inDouble && ch === "'") {
          inSingle = !inSingle;
          j++;
          continue;
        }
        if (!inSingle && !inDouble) {
          if (ch === '{') {
            braceDepth++;
            j++;
            continue;
          }
          if (ch === '}') {
            if (braceDepth > 0) braceDepth--;
            j++;
            continue;
          }
          if (ch === '>' && braceDepth === 0) {
            // end of tag
            const token = s.slice(i, j + 1);
            tokens.push({ token, index: i });
            i = j; // advance outer loop
            break;
          }
        }
        j++;
      }
    }
  }

  const stack = [];

  function tagName(token) {
    if (/^<\s*>$/.test(token) || /^<>/.test(token)) return 'REACT_FRAGMENT_OPEN';
    if (/^<\s*\/\s*>$/.test(token) || /^<\s*\/\s*>/.test(token)) return 'REACT_FRAGMENT_CLOSE';

    const close = token.match(/^<\s*\/\s*([A-Za-z0-9_:\-\.]+)/);
    if (close) return close[1];
    const open = token.match(/^<\s*([A-Za-z0-9_:\-\.]+)/);
    if (open) return open[1];
    return null;
  }

  function isSelfClosing(token) {
    const t = token.trim();
    if (t.endsWith('/>')) return true;
    if (/^<\s*br\b/i.test(t) || /^<\s*img\b/i.test(t)) return true;
    return false;
  }

  for (const t of tokens) {
    const tok = t.token;
    const line = getLine(src, t.index);
    if (line >= 480 && line <= 520) {
      console.log('DEBUG token at line', line, ':', JSON.stringify(tok.replace(/\n/g, '\\n')));
    }
    if (/^<\s*!--/.test(tok)) continue;
    if (/^<\s*\?/.test(tok)) continue;

    if (/^<\s*\/\s*>/.test(tok)) {
      const top = stack.pop();
      if (!top || top.name !== 'REACT_FRAGMENT_OPEN') {
        console.log(`Mismatch at ${filePath}:${getLine(src, t.index)} — unexpected fragment close`);
        return false;
      }
      continue;
    }

    if (/^<>$/.test(tok) || /^<\s*>/.test(tok)) {
      stack.push({ name: 'REACT_FRAGMENT_OPEN', index: t.index });
      continue;
    }

    if (/^<\s*\//.test(tok)) {
      const name = tagName(tok);
      if (line >= 480 && line <= 520) console.log('DEBUG closing tag', name, 'at line', line);
      const top = stack.pop();
      if (!top) {
        console.log(`Mismatch at ${filePath}:${getLine(src, t.index)} — closing </${name}> with empty stack`);
        console.log('STACK (top->bottom):', stack.map(s => s.name).reverse());
        return false;
      }
      if (top.name !== name) {
        console.log('STACK (top->bottom):', stack.map(s => s.name).reverse());
        console.log(`Mismatch at ${filePath}:${getLine(src, t.index)} — expected closing </${top.name}> but found </${name}>`);
        return false;
      }
      continue;
    }

    if (/^<\s*[A-Za-z0-9_:\-\.]/.test(tok)) {
      const name = tagName(tok);
      const self = isSelfClosing(tok);
      if (line >= 480 && line <= 520) console.log('DEBUG opening tag', name, 'selfClosing=', self, 'lastChars=', JSON.stringify(tok.slice(-10).replace(/\n/g,'\\n')), 'raw=', JSON.stringify(tok.replace(/\n/g,'\\n')));
      if (!self) {
        stack.push({ name, index: t.index });
      }
      continue;
    }
  }

  if (stack.length > 0) {
    const last = stack[stack.length - 1];
    console.log(`Unclosed tag in ${filePath}:${getLine(src, last.index)} — <${last.name}>`);
    return false;
  }

  console.log(`No mismatched tags found in ${filePath}`);
  return true;
}

function getLine(src, idx) {
  return src.slice(0, idx).split('\n').length;
}

if (process.argv.length < 3) {
  console.error('Usage: node check-jsx-tags.cjs <file>');
  process.exit(2);
}

const target = process.argv[2];
const full = path.resolve(process.cwd(), target);
if (!fs.existsSync(full)) {
  console.error('File not found:', full);
  process.exit(2);
}

checkFile(full);
