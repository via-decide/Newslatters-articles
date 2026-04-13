#!/usr/bin/env node
const fs = require('fs');

function mustContain(file, fragment) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(fragment)) {
    console.error(`${file} missing fragment: ${fragment}`);
    process.exit(1);
  }
}

mustContain('index.html', "fetch('./data/articles.json'");
mustContain('research/index.html', "fetch('../data/articles.json'");
mustContain('research/index.html', "fetch('../data/knowledge_graph.json'");
mustContain('profile/dharam-daxini/index.html', "fetch('../../data/articles.json'");
mustContain('newsletter/zayvora/index.html', "fetch('../../data/articles.json'");
mustContain('newsletter/daxini/index.html', "fetch('../../data/articles.json'");
console.log('UI route checks passed.');
