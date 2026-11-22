# Graph Report - LongToShots  (2026-11-22)

## Corpus Check
- 22 files · ~23,046 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: (none) 1, .ico 1, .css 1)

## Summary
- 163 nodes · 293 edges · 14 communities (9 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `587cce73`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- site.js
- HomeClient.js
- package.json
- engine.js
- contact/page.jsx
- renderClip
- VoiceEditor.jsx
- page.js
- README.md
- compilerOptions
- next.config.mjs
- AGENTS.md
- buildCaptions

## God Nodes (most connected - your core abstractions)
1. `HomeClient()` - 41 edges
2. `SITE` - 12 edges
3. `renderClip()` - 10 edges
4. `next` - 8 edges
5. `clamp()` - 7 edges
6. `drawFrame()` - 7 edges
7. `seekTo()` - 6 edges
8. `captureThumb()` - 6 edges
9. `tx()` - 6 edges
10. `fmtTime()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Page()` --calls--> `HomeClient()`  [EXTRACTED]
  app/page.js → app/HomeClient.js
- `HomeClient()` --calls--> `buildCaptions()`  [EXTRACTED]
  app/HomeClient.js → app/engine.js
- `HomeClient()` --calls--> `captionAt()`  [EXTRACTED]
  app/HomeClient.js → app/engine.js
- `HomeClient()` --calls--> `captureThumb()`  [EXTRACTED]
  app/HomeClient.js → app/engine.js
- `HomeClient()` --calls--> `dbAll()`  [EXTRACTED]
  app/HomeClient.js → app/engine.js

## Import Cycles
- None detected.

## Communities (14 total, 5 thin omitted)

### Community 0 - "site.js"
Cohesion: 0.07
Nodes (19): HOW, jsonLd, metadata, PRINCIPLES, geistMono, geistSans, metadata, viewport (+11 more)

### Community 1 - "HomeClient.js"
Cohesion: 0.11
Nodes (32): ASPECTS, CAPTION_STYLES, clamp(), computeEnergy(), decodeMonoAudio(), DEFAULT_SETTINGS, downloadBlob(), downsampleEnergy() (+24 more)

### Community 2 - "package.json"
Cohesion: 0.09
Nodes (21): dependencies, lucide-react, next, react, react-dom, devDependencies, next-sitemap, tailwindcss (+13 more)

### Community 3 - "engine.js"
Cohesion: 0.15
Nodes (20): DB_NAME, dbAll(), dbDelete(), dbGet(), dbPut(), drawCaption(), drawCover(), drawFrame() (+12 more)

### Community 4 - "contact/page.jsx"
Cohesion: 0.24
Nodes (8): ContactForm(), TOPICS, ContactPage(), jsonLd, metadata, QUICK, TOPICS, react

### Community 5 - "renderClip"
Cohesion: 0.28
Nodes (8): captionAt(), captureThumb(), getDims(), once(), pickMime(), probeVideo(), renderClip(), seekTo()

### Community 6 - "VoiceEditor.jsx"
Cohesion: 0.32
Nodes (7): VoiceEditor, audioBufferToWav(), CONTROLS, DEFAULT_SETTINGS, formatTime(), PRESETS, VoiceEditor()

### Community 7 - "page.js"
Cohesion: 0.33
Nodes (5): FAQS, USE_CASES, jsonLd, Page(), sameAs

### Community 8 - "README.md"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **4 isolated node(s):** `react-dom`, `@tailwindcss/turbopack`, `next-sitemap`, `tailwindcss`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 74 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `site.js` to `HomeClient.js`, `package.json`, `contact/page.jsx`?**
  _High betweenness centrality (0.187) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `HomeClient()` (e.g. with `Github()` and `Instagram()`) actually correct?**
  _`HomeClient()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `react-dom`, `@tailwindcss/turbopack`, `next-sitemap` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `site.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07207207207207207 - nodes in this community are weakly interconnected._
- **Why does `SITE` connect `site.js` to `HomeClient.js`, `contact/page.jsx`, `page.js`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Should `HomeClient.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10795454545454546 - nodes in this community are weakly interconnected._
- **Why does `react` connect `contact/page.jsx` to `HomeClient.js`, `package.json`, `VoiceEditor.jsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._