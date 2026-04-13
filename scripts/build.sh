#!/usr/bin/env bash
set -euo pipefail
npm run build
npm run test
node scripts/generate_articles_index.js
node tests/verify-articles-index.js
