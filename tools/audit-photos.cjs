// Dump photo provenance sidecars for audit.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'assets');
for (const biz of fs.readdirSync(root)) {
  const raw = path.join(root, biz, 'raw');
  if (!fs.existsSync(raw)) continue;
  console.log('=== ' + biz);
  for (const f of fs.readdirSync(raw).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
    if (!f.endsWith('.url.txt')) continue;
    console.log('  ' + f + ': ' + fs.readFileSync(path.join(raw, f), 'utf8').trim());
  }
}
