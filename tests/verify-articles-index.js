#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'data', 'articles.json');
const allowedExt = new Set(['.md', '.mdx', '.html']);
const ignored = new Set([
  'index.html',
  'zayvora/index.html',
  'about/dharam-daxini/index.html'
]);

function walk(dir, files) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'data', 'scripts', 'tests'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!allowedExt.has(ext)) continue;
    const rel = path.relative(repoRoot, fullPath).replaceAll(path.sep, '/');
    if (!ignored.has(rel)) files.add('/' + rel);
  }
}

if (!fs.existsSync(indexPath)) {
  console.error('Missing data/articles.json. Run node scripts/generate_articles_index.js first.');
  process.exit(1);
}

const indexed = new Set(JSON.parse(fs.readFileSync(indexPath, 'utf8')).map((x) => x.path));
const discovered = new Set();
walk(repoRoot, discovered);

const missing = [...discovered].filter((item) => !indexed.has(item));
if (missing.length) {
  console.error('Missing indexed articles:\n' + missing.join('\n'));
  process.exit(1);
}

console.log(`All discoverable article files are indexed (${discovered.size} files).`);
