#!/usr/bin/env -S node --experimental-strip-types
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const articlesPath = path.join(repoRoot, 'data', 'articles.json');
const graphPath = path.join(repoRoot, 'data', 'knowledge_graph.json');

function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

function buildGraph() {
  const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));
  const graph = articles.map((article) => {
    const scored = articles
      .filter((other) => other.slug !== article.slug)
      .map((other) => {
        const tagScore = jaccard(article.tags || [], other.tags || []);
        const conceptScore = jaccard(article.concepts || [], other.concepts || []);
        const semantic = jaccard((article.content || '').toLowerCase().split(/\W+/).filter(Boolean), (other.content || '').toLowerCase().split(/\W+/).filter(Boolean));
        return {
          slug: other.slug,
          score: (tagScore * 0.5) + (conceptScore * 0.3) + (semantic * 0.2)
        };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.slug);

    return {
      node: article.slug,
      related: scored
    };
  });

  fs.writeFileSync(graphPath, JSON.stringify(graph, null, 2) + '\n');
  console.log(`Built graph with ${graph.length} nodes.`);
}

buildGraph();
