# Alchemist integration for daxini.space

## Overview
This integration adds a lazy-loaded Alchemist panel to daxini.space pages, enabling page analysis, insight generation, tool/game concept generation, and export/publish actions.

## Architecture
- `alchemist/alchemist-panel.js`: panel rendering, action wiring, state management.
- `alchemist/alchemist-swipe-ui.js`: swipe gesture detection for up/down/left/right.
- `alchemist/alchemist-actions.js`: action handlers for tool generation and publish flow.
- `alchemist/zayvora-bridge.js`: page-content-to-insight bridge returning summary, concepts, and idea lists.
- `alchemist/export-epub.js`: EPUB-style export download interface.
- `alchemist/export-pdf.js`: PDF-style export download interface.
- `alchemist/alchemist-overlay.css`: panel and launcher styles.

## Swipe UX mapping
- Swipe up: open panel.
- Swipe down: close panel.
- Swipe left: next insight.
- Swipe right: previous insight.

Works through `touch*` and `pointer*` handlers for mobile, tablet, and desktop trackpads.

## Lazy loading and performance
The home page now loads Alchemist scripts only when users tap **⚗ Open Alchemist** (or swipe up on touch devices). This defers Zayvora bridge loading until panel activation and avoids baseline render overhead.

## Export flows
- **Export EPUB**: serializes current insight into a downloadable `.epub` payload.
- **Export PDF**: serializes current insight into a downloadable `.pdf` payload.

## Generation pipeline
1. `Understand this` / `Extract ideas` reads current page text.
2. `zayvora-bridge.js` generates summary, concepts, tool ideas, and game ideas.
3. `Generate tool` routes insight to `alchemist-actions.js` Logichub workflow placeholder.
4. `Publish insight` creates `/insights` payload with fields:
   - `title`
   - `summary`
   - `creator`
   - `generated_by`
