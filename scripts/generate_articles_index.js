#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'data', 'articles.json');
const requiredRoots = ['articles', 'newsletters', 'zayvora', 'blog'];
const allowedExt = new Set(['.md', '.mdx', '.html']);
const ignoredPaths = new Set([
  'index.html',
  'zayvora/index.html',
  'about/dharam-daxini/index.html'
]);

function walk(dir, collector) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'data' || entry.name === 'scripts' || entry.name === 'tests') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, collector);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (allowedExt.has(ext)) {
      const relativePath = path.relative(repoRoot, fullPath).replaceAll(path.sep, '/');
      if (!ignoredPaths.has(relativePath)) collector.add(relativePath);
    }
  }
}

function toSlug(input) {
  return input
    .toLowerCase()
    .replace(/\.html?$|\.mdx?$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleFromFilename(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

function parseFrontmatter(raw) {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith('---')) return {};
  const end = trimmed.indexOf('\n---', 3);
  if (end === -1) return {};
  const body = trimmed.slice(3, end).trim();
  const meta = {};
  for (const line of body.split('\n')) {
    const match = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2].trim().replace(/^['"]|['"]$/g, '');
    if (!value) continue;
    meta[key] = value;
  }
  return meta;
}

function parseHtmlMetadata(raw) {
  const meta = {};
  const titleMatch = raw.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();

  const descMatch = raw.match(/<meta\s+(?:name|property)=['"](?:description|og:description)['"]\s+content=['"]([^'"]+)['"]/i)
    || raw.match(/<meta\s+content=['"]([^'"]+)['"]\s+(?:name|property)=['"](?:description|og:description)['"]/i);
  if (descMatch) meta.description = descMatch[1].trim();

  const authorMatch = raw.match(/<meta\s+name=['"]author['"]\s+content=['"]([^'"]+)['"]/i)
    || raw.match(/<meta\s+content=['"]([^'"]+)['"]\s+name=['"]author['"]/i);
  if (authorMatch) meta.author = authorMatch[1].trim();

  const tagsMatch = raw.match(/<meta\s+name=['"]keywords['"]\s+content=['"]([^'"]+)['"]/i)
    || raw.match(/<meta\s+content=['"]([^'"]+)['"]\s+name=['"]keywords['"]/i);
  if (tagsMatch) meta.tags = tagsMatch[1].trim();

  return meta;
}

function inferTags(relativePath, title, description) {
  const haystack = `${relativePath} ${title} ${description}`.toLowerCase();
  const tagMap = [
    ['zayvora', ['zayvora', 'local research', 'local-research']],
    ['ViaDecide', ['viadecide', 'via decide', 'decide']],
    ['AI', ['ai', 'model', 'llm', 'artificial intelligence']],
    ['Research', ['research', 'knowledge', 'brain', 'vector']],
    ['local-research', ['local research', 'local-research']],
    ['knowledge-systems', ['knowledge systems', 'knowledge graph', 'vector store']],
    ['The Daxini Stack', ['daxini stack', 'daxini']]
  ];
  const tags = [];
  for (const [tag, patterns] of tagMap) {
    if (patterns.some((p) => haystack.includes(p))) tags.push(tag);
  }
  return tags;
}

function normalizeTags(tagsValue, inferred) {
  const raw = Array.isArray(tagsValue)
    ? tagsValue
    : typeof tagsValue === 'string'
      ? tagsValue.split(',')
      : [];

  const all = [...raw, ...inferred]
    .map((t) => String(t).trim())
    .filter(Boolean);

  return [...new Set(all)];
}

function getGitDate(relativePath) {
  try {
    const out = execSync(`git log --diff-filter=A --format=%cs -- "${relativePath}" | tail -n 1`, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8'
    }).trim();
    return out || new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function buildIndex() {
  const files = new Set();
  for (const root of requiredRoots) {
    walk(path.join(repoRoot, root), files);
  }
  walk(repoRoot, files);

  const records = [];
  for (const relativePath of [...files].sort()) {
    const fullPath = path.join(repoRoot, relativePath);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const frontmatter = parseFrontmatter(raw);
    const htmlMeta = path.extname(relativePath).toLowerCase() === '.html' ? parseHtmlMetadata(raw) : {};

    const title = frontmatter.title || htmlMeta.title || titleFromFilename(relativePath);
    const description = frontmatter.description || htmlMeta.description || '';
    const inferredTags = inferTags(relativePath, title, description);
    const tags = normalizeTags(frontmatter.tags || htmlMeta.tags, inferredTags);
    const author = frontmatter.author || htmlMeta.author || 'Dharam Daxini';
    const date = frontmatter.date || getGitDate(relativePath);
    const slug = toSlug(frontmatter.slug || title || relativePath);

    records.push({
      title,
      slug,
      date,
      author,
      tags,
      description,
      path: `/${relativePath}`
    });
  }

  records.sort((a, b) => (a.date < b.date ? 1 : -1));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(records, null, 2)}\n`);
  console.log(`Generated ${records.length} articles -> ${path.relative(repoRoot, outputPath)}`);
}

buildIndex();
