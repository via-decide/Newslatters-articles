#!/usr/bin/env -S node --experimental-strip-types
const { execSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');

function run(cmd) {
  execSync(cmd, { cwd: root, stdio: 'inherit' });
}

run('node --experimental-strip-types scripts/discover_articles.ts');
run('node --experimental-strip-types scripts/build_graph.ts');
run('node tests/verify-articles-index.js');
run('node tests/verify-knowledge-graph.js');
console.log('Build index pipeline completed.');
