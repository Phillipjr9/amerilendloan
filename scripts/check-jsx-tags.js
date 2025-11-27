const fs = require('fs');
const path = require('path');

function checkFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const tagRegex = /(<\/?\s*(?:[A-Za-z0-9_:\-\.]+|>)\b[^>]*>)/g;
  // This regex captures raw tag tokens (opening, closing, self-closing, fragments)

  const tokens = [];
  let m;
  while ((m = tagRegex.exec(src)) !== null) {
    tokens.push({ token: m[1], index: m.index });
  }

  const stack = [];

  function tagName(token) {
    // handle fragment open '<>' and fragment close '</>'
    if (/^<\s*>$/.test(token) || /^<>/.test(token)) return 'REACT_FRAGMENT_OPEN';
    if (/^<\s*\/\s*>$/.test(token) || /^<\s*\/\s*>/.test(token)) return 'REACT_FRAGMENT_CLOSE';

    const close = token.match(/^<\s*\/\s*([A-Za-z0-9_:\-\.]+)/);
    if (close) return close[1];
    const open = token.match(/^<\s*([A-Za-z0-9_:\-\.]+)/);
    if (open) return open[1];
    return null;
  }

  function isSelfClosing(token) {
    return /<[^>]+\/>$/.test(token) || /^<\s*br\b/i.test(token) || /^<\s*img\b/i.test(token);
  }

  for (const t of tokens) {
    const tok = t.token;
    if (/^<\s*!--/.test(tok)) continue; // skip comments
    if (/^<\s*\?/ .test(tok)) continue;

    // fragment close
    if (/^<\s*\/\s*>/.test(tok)) {
      const top = stack.pop();
      if (!top || top.name !== 'REACT_FRAGMENT_OPEN') {
        console.log(`Mismatch at ${filePath}:${getLine(src, t.index)} — unexpected fragment close`);
        return false;
      }
      continue;
    }

    // fragment open
    if (/^<>$/.test(tok) || /^<\s*>/.test(tok)) {
      stack.push({ name: 'REACT_FRAGMENT_OPEN', index: t.index });
      continue;
    }

    // closing tag like </Tag>
    if (/^<\s*\//.test(tok)) {
      const name = tagName(tok);
      const top = stack.pop();
      if (!top) {
        console.log(`Mismatch at ${filePath}:${getLine(src, t.index)} — closing </${name}> with empty stack`);
        return false;
      }
      if (top.name !== name) {
        console.log(`Mismatch at ${filePath}:${getLine(src, t.index)} — expected closing </${top.name}> but found </${name}>`);
        return false;
      }
      continue;
    }

    // opening tag
    if (/^<\s*[A-Za-z0-9_:\-\.]/.test(tok)) {
      if (!isSelfClosing(tok)) {
        const name = tagName(tok);
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
  console.error('Usage: node check-jsx-tags.js <file>');
  process.exit(2);
}

const target = process.argv[2];
const full = path.resolve(process.cwd(), target);
if (!fs.existsSync(full)) {
  console.error('File not found:', full);
  process.exit(2);
}

checkFile(full);
