# Graph Report - LongToShots  (2026-11-22)

## Corpus Check
- 29 files · ~27,085 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .ico 1, .css 1)

## Summary
- 191 nodes · 348 edges · 14 communities (10 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7656025e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site.js
- HomeClient.js
- package.json
- engine.js
- contact/page.jsx
- LandingPage
- renderClip
- page.js
- README.md
- compilerOptions
- next.config.mjs
- AGENTS.md
- tx

## God Nodes (most connected - your core abstractions)
1. `HomeClient()` - 42 edges
2. `SITE` - 13 edges
3. `LandingPage()` - 11 edges
4. `renderClip()` - 11 edges
5. `next` - 9 edges
6. `clamp()` - 7 edges
7. `drawFrame()` - 7 edges
8. `landingMetadata()` - 6 edges
9. `seekTo()` - 6 edges
10. `captureThumb()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Page()` --calls--> `HomeClient()`  [EXTRACTED]
  app/page.js → app/HomeClient.js
- `HomeClient()` --calls--> `captionAt()`  [EXTRACTED]
  app/HomeClient.js → app/engine.js
- `HomeClient()` --calls--> `captureThumb()`  [EXTRACTED]
  app/HomeClient.js → app/engine.js
- `HomeClient()` --calls--> `dbAll()`  [EXTRACTED]
  app/HomeClient.js → app/engine.js
- `HomeClient()` --calls--> `dbDelete()`  [EXTRACTED]
  app/HomeClient.js → app/engine.js

## Import Cycles
- None detected.

## Communities (14 total, 4 thin omitted)

### Community 0 - "site.js"
Cohesion: 0.07
Nodes (20): HOW, jsonLd, metadata, PRINCIPLES, LANDING_PAGES, geistMono, geistSans, metadata (+12 more)

### Community 1 - "HomeClient.js"
Cohesion: 0.13
Nodes (29): buildCaptions(), CAPTION_STYLES, clamp(), computeEnergy(), downloadBlob(), downsampleEnergy(), evenlySpaced(), findHighlights() (+21 more)

### Community 2 - "package.json"
Cohesion: 0.10
Nodes (20): dependencies, lucide-react, next, react, react-dom, devDependencies, next-sitemap, tailwindcss (+12 more)

### Community 3 - "engine.js"
Cohesion: 0.12
Nodes (20): ASPECTS, DB_NAME, decodeMonoAudio(), DEFAULT_SETTINGS, drawCaption(), fmtTime(), fmtTimePrecise(), getAsrWorker() (+12 more)

### Community 4 - "contact/page.jsx"
Cohesion: 0.14
Nodes (15): ContactForm(), TOPICS, ContactPage(), jsonLd, metadata, QUICK, TOPICS, audioBufferToWav() (+7 more)

### Community 5 - "LandingPage"
Cohesion: 0.13
Nodes (17): AiShortsGeneratorPage(), metadata, PAGE, BulkShortsGeneratorPage(), metadata, PAGE, landingMetadata(), LandingPage() (+9 more)

### Community 6 - "renderClip"
Cohesion: 0.21
Nodes (11): captionAt(), captureThumb(), drawCover(), drawFrame(), ensureCaptionFonts(), getDims(), once(), pickMime() (+3 more)

### Community 7 - "page.js"
Cohesion: 0.33
Nodes (5): FAQS, USE_CASES, jsonLd, Page(), sameAs

### Community 8 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 12 - "tx"
Cohesion: 0.33
Nodes (6): dbAll(), dbDelete(), dbGet(), dbPut(), openDB(), tx()

## Knowledge Gaps
- **4 isolated node(s):** `react-dom`, `@tailwindcss/turbopack`, `next-sitemap`, `tailwindcss`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 84 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `site.js` to `HomeClient.js`, `package.json`, `contact/page.jsx`?**
  _High betweenness centrality (0.205) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `HomeClient()` (e.g. with `Github()` and `Instagram()`) actually correct?**
  _`HomeClient()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `react-dom`, `@tailwindcss/turbopack`, `next-sitemap` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `site.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07179487179487179 - nodes in this community are weakly interconnected._
- **Why does `SITE` connect `site.js` to `HomeClient.js`, `contact/page.jsx`, `page.js`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Should `HomeClient.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1310344827586207 - nodes in this community are weakly interconnected._
- **Why does `react` connect `contact/page.jsx` to `HomeClient.js`, `package.json`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._