#!/usr/bin/env -S node --experimental-strip-types
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'data', 'articles.json');
const requiredRoots = ['articles', 'newsletters', 'zayvora', 'blog'];
const fallbackRoots = ['.'];
const allowedExt = new Set(['.md', '.mdx', '.html']);
const ignoredPaths = new Set([
  'index.html',
  'research/index.html',
  'profile/dharam-daxini/index.html',
  'about/dharam-daxini/index.html',
  'zayvora/index.html'
]);
const stopwords = new Set(['the','and','for','that','with','this','from','into','your','you','are','was','were','been','have','has','had','about','then','than','they','their','but','not','all','any','can','our','out','how']);

function walk(dir, collector) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['.git', 'data', 'scripts', 'tests', 'node_modules'].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, collector);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!allowedExt.has(ext)) continue;
    const relativePath = path.relative(repoRoot, fullPath).replaceAll(path.sep, '/');
    if (!ignoredPaths.has(relativePath)) collector.add(relativePath);
  }
}

function parseFrontmatter(raw) {
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith('---')) return {};
  const end = trimmed.indexOf('\n---', 3);
  if (end === -1) return {};
  const block = trimmed.slice(3, end).trim();
  const meta = {};
  for (const line of block.split('\n')) {
    const m = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    let value = m[2].trim();
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((x) => x.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
    } else {
      value = value.replace(/^['"]|['"]$/g, '');
    }
    meta[key] = value;
  }
  return meta;
}

function parseHtmlMeta(raw) {
  const meta = {};
  const title = raw.match(/<title>([^<]+)<\/title>/i);
  if (title) meta.title = title[1].trim();
  const description = raw.match(/<meta\s+(?:name|property)=['"](?:description|og:description)['"]\s+content=['"]([^'"]+)['"]/i)
    || raw.match(/<meta\s+content=['"]([^'"]+)['"]\s+(?:name|property)=['"](?:description|og:description)['"]/i);
  if (description) meta.description = description[1].trim();
  return meta;
}

function stripContent(raw, ext) {
  if (ext === '.html') {
    return raw
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return raw
    .replace(/^---[\s\S]*?---/m, ' ')
    .replace(/`{3}[\s\S]*?`{3}/g, ' ')
    .replace(/[#>*_\[\]\(\)-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferTitle(rel) {
  const base = path.basename(rel, path.extname(rel));
  return base.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function slugify(input) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function inferDate(rel) {
  try {
    const out = execSync(`git log --diff-filter=A --format=%cs -- "${rel}" | tail -n 1`, {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8'
    }).trim();
    return out || new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function keywordConcepts(text) {
  const words = text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || [];
  const counts = new Map();
  for (const word of words) {
    if (stopwords.has(word)) continue;
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}

function normalizeTags(tagsValue, title, rel, content) {
  const raw = Array.isArray(tagsValue) ? tagsValue : typeof tagsValue === 'string' ? tagsValue.split(',') : [];
  const tags = new Set(raw.map((t) => String(t).trim()).filter(Boolean));
  const haystack = `${title} ${rel} ${content}`.toLowerCase();
  if (haystack.includes('zayvora')) tags.add('zayvora');
  if (haystack.includes('viadecide') || haystack.includes('via decide')) tags.add('ViaDecide');
  if (haystack.includes('ai') || haystack.includes('model') || haystack.includes('llm')) tags.add('AI');
  if (haystack.includes('commerce') || haystack.includes('bharat')) tags.add('Commerce');
  if (haystack.includes('knowledge') || haystack.includes('graph') || haystack.includes('research')) tags.add('Knowledge systems');
  if (haystack.includes('daxini')) tags.add('The Daxini Stack');
  return [...tags];
}

function discover() {
  const files = new Set();
  for (const root of requiredRoots) walk(path.join(repoRoot, root), files);
  if (!files.size) {
    for (const root of fallbackRoots) walk(path.join(repoRoot, root), files);
  }

  const rows = [];
  for (const rel of [...files].sort()) {
    const full = path.join(repoRoot, rel);
    const ext = path.extname(rel).toLowerCase();
    const raw = fs.readFileSync(full, 'utf8');
    const frontmatter = parseFrontmatter(raw);
    const htmlMeta = ext === '.html' ? parseHtmlMeta(raw) : {};
    const content = stripContent(raw, ext);
    const firstParagraph = content.split(/\.\s+/).slice(0, 2).join('. ').trim();

    const title = frontmatter.title || htmlMeta.title || inferTitle(rel);
    const tags = normalizeTags(frontmatter.tags, title, rel, content);

    rows.push({
      title,
      slug: slugify(frontmatter.slug || title),
      date: frontmatter.date || inferDate(rel),
      author: frontmatter.author || 'Dharam Daxini',
      tags,
      description: frontmatter.description || htmlMeta.description || firstParagraph.slice(0, 220),
      summary: firstParagraph.slice(0, 320),
      concepts: keywordConcepts(`${title} ${content}`),
      content,
      path: `/${rel}`
    });
  }

  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2) + '\n');
  console.log(`Discovered ${rows.length} articles.`);
}

discover();
