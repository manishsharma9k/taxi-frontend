const fs = require('fs');
const path = require('path');
const root = path.resolve('./src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue;
      walk(full, files);
    } else if (/\.jsx?$/.test(entry.name)) {
      const txt = fs.readFileSync(full, 'utf8');
      if (txt.includes('http://localhost:5000')) files.push(full);
    }
  }
  return files;
}

const files = walk(root);
if (!files.length) {
  console.log('No files found');
  process.exit(0);
}

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  const relImport = path.relative(path.dirname(file), path.join(root, 'api.js')).replace(/\\/g, '/');
  const importStatement = `import { API_URL } from '${relImport.startsWith('.') ? relImport : './' + relImport}';`;
  const hasImport = /import\s+\{?\s*API_URL\s*\}?\s+from\s+['"][^'"]+['"];?/.test(text);

  text = text.replace(/(['"`])http:\/\/localhost:5000([^'"`]*?)\1/g, (match, quote, suffix) => {
    if (!suffix) return 'API_URL';
    return `\`${'${API_URL}'}${suffix}\``;
  });

  text = text.replace(/http:\/\/localhost:5000/g, 'API_URL');

  if (!hasImport && text !== original) {
    const lines = text.split(/\r?\n/);
    let insertAt = -1;
    for (let i = 0; i < lines.length; i++) {
      if (/^import\s.+from\s+['"].+['"]/.test(lines[i]) || /^import\s+['"].+['"]/.test(lines[i])) insertAt = i;
    }
    insertAt = insertAt === -1 ? 0 : insertAt + 1;
    lines.splice(insertAt, 0, importStatement);
    text = lines.join('\n');
  }

  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    console.log('Updated', path.relative(root, file));
  }
}
