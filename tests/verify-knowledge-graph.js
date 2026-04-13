#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const articles = JSON.parse(fs.readFileSync(path.join(root, 'data', 'articles.json'), 'utf8'));
const graph = JSON.parse(fs.readFileSync(path.join(root, 'data', 'knowledge_graph.json'), 'utf8'));

const slugs = new Set(articles.map((a) => a.slug));
const nodes = new Set(graph.map((g) => g.node));

for (const slug of slugs) {
  if (!nodes.has(slug)) {
    console.error(`Missing graph node: ${slug}`);
    process.exit(1);
  }
}

for (const node of graph) {
  for (const rel of node.related || []) {
    if (!slugs.has(rel)) {
      console.error(`Invalid related slug '${rel}' in node '${node.node}'`);
      process.exit(1);
    }
  }
}

console.log(`Knowledge graph verified (${graph.length} nodes).`);
