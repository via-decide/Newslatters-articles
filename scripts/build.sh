#!/usr/bin/env bash
set -euo pipefail
node scripts/generate_articles_index.js
node tests/verify-articles-index.js
