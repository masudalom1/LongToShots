/*
 * LongToShorts client-side engine (longtoshorts.in).
 * Everything here runs in the browser: no backend, no paid APIs.
 * - Highlight detection: Web Audio decode + loudness/speech-activity scoring
 * - Captions: open-source Whisper via transformers.js, running locally in a Web Worker
 * - Rendering: Canvas (crop / blur-fit / burned-in captions) + MediaRecorder (MP4 where supported)
 * - Storage: IndexedDB (projects + source videos stay on this device)
 *
 * HINDI / INDIC FIXES in this version:
 *  1. Devanagari font is now actually loaded (Google Fonts) and awaited before preview/export.
 *  2. titleFromText() no longer strips Devanagari vowel signs (matras) -> titles were garbled.
 *  3. Caption line-height is taller for Indic scripts so matras don't clip / overlap.
 *  4. Worker: explicit language + task, repetition guard, and a safer fallback chain.
 *  5. Whisper Small is recommended / auto-selected for Hindi (Base/Tiny are very inaccurate for Hindi).
 */

export const SR = 16000; // Whisper expects 16 kHz mono
export const HOP = 0.25; // seconds per loudness frame
export const TRANSFORMERS_URL =
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1";
export const DB_NAME = "longtoshorts";

export const ASPECTS = {
  "9:16": { label: "9:16", sub: "Reels · Shorts", w: 9, h: 16 },
  "4:5": { label: "4:5", sub: "Feed post", w: 4, h: 5 },
  "1:1": { label: "1:1", sub: "Square", w: 1, h: 1 },
  "16:9": { label: "16:9", sub: "YouTube", w: 16, h: 9 },
};

const FONT_HEAVY =
  '"Arial Black", "Noto Sans Devanagari", "Nirmala UI", "Mangal", "Kohinoor Devanagari", Arial, sans-serif';
const FONT_NORMAL =
  'Arial, "Noto Sans Devanagari", "Nirmala UI", "Mangal", "Kohinoor Devanagari", Helvetica, sans-serif';

export const CAPTION_STYLES = {
  bold: {
    label: "Bold",
    fill: "#ffffff",
    stroke: "#000000",
    upper: true,
    weight: 900,
    font: FONT_HEAVY,
  },
  yellow: {
    label: "Yellow Pop",
    fill: "#ffe14d",
    stroke: "#000000",
    upper: true,
    weight: 900,
    font: FONT_HEAVY,
  },
  boxed: {
    label: "Boxed",
    fill: "#ffffff",
    box: "rgba(0,0,0,0.72)",
    upper: false,
    weight: 700,
    font: FONT_NORMAL,
  },
  violet: {
    label: "Violet",
    fill: "#ffffff",
    box: "#7c3aed",
    upper: true,
    weight: 900,
    font: FONT_HEAVY,
  },
};

export const MODELS = [
  { id: "Xenova/whisper-base", label: "Whisper Base · Multilingual · balanced (weak for Hindi)", multilingual: true },
  { id: "Xenova/whisper-tiny", label: "Whisper Tiny · Multilingual · fast (weak for Hindi)", multilingual: true },
  { id: "Xenova/whisper-small", label: "Whisper Small · Multilingual · BEST for Hindi (large download)", multilingual: true },
  { id: "Xenova/whisper-tiny.en", label: "Whisper Tiny · English only · fastest", multilingual: false },
  { id: "Xenova/whisper-base.en", label: "Whisper Base · English only · accurate", multilingual: false },
];

export const HINDI_MODEL = "Xenova/whisper-small";

export const LANGUAGES = [
  ["auto", "Auto-detect"],
  ["hindi", "Hindi"],
  ["english", "English"],
  ["bengali", "Bengali"],
  ["urdu", "Urdu"],
  ["tamil", "Tamil"],
  ["telugu", "Telugu"],
  ["marathi", "Marathi"],
  ["gujarati", "Gujarati"],
  ["punjabi", "Punjabi"],
  ["kannada", "Kannada"],
  ["malayalam", "Malayalam"],
  ["spanish", "Spanish"],
  ["french", "French"],
  ["german", "German"],
  ["portuguese", "Portuguese"],
  ["arabic", "Arabic"],
  ["indonesian", "Indonesian"],
  ["japanese", "Japanese"],
];

/** Languages where Whisper Tiny/Base are unreliable and Small is strongly recommended. */
export const INDIC_LANGUAGES = [
  "hindi",
  "bengali",
  "urdu",
  "tamil",
  "telugu",
  "marathi",
  "gujarati",
  "punjabi",
  "kannada",
  "malayalam",
];

export const DEFAULT_SETTINGS = {
  clipLength: 30,
  clipCount: 5,
  allClips: false,
  aspect: "9:16",
  layout: "crop", // crop | blur
  quality: "720",
  captions: true,
  captionStyle: "bold",
  captionPos: 0.72,
  captionSize: 1,
  wordsPerLine: 4,
  model: "Xenova/whisper-base",
  language: "auto",
};

/* ----------------------------- small utils ----------------------------- */

export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad = (n) => String(n).padStart(2, "0");

export function fmtTime(s) {
  if (!Number.isFinite(s) || s < 0) s = 0;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return h ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

export function fmtTimePrecise(s) {
  if (!Number.isFinite(s) || s < 0) s = 0;
  return `${fmtTime(s)}.${Math.floor((s % 1) * 10)}`;
}

export function fmtBytes(b) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(u.length - 1, Math.floor(Math.log(b) / Math.log(1024)));
  return `${(b / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
}

export const slugify = (s = "") =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u0DFF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

export function downloadBlob(url, name) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export const isVideoFile = (blob, name = "") =>
  (blob.type && blob.type.startsWith("video/")) ||
  /\.(mp4|m4v|mov|webm|mkv|ogv|avi|3gp)$/i.test(name);

export function once(target, event, timeout = 20000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Timed out waiting for "${event}"`));
    }, timeout);
    const ok = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error("The browser could not decode this video"));
    };
    function cleanup() {
      clearTimeout(timer);
      target.removeEventListener(event, ok);
      target.removeEventListener("error", fail);
    }
    target.addEventListener(event, ok);
    target.addEventListener("error", fail);
  });
}

export async function seekTo(video, t) {
  if (video.readyState < 1) await once(video, "loadedmetadata");
  if (Math.abs(video.currentTime - t) < 0.02 && video.readyState >= 2) return;
  const p = once(video, "seeked", 15000);
  video.currentTime = t;
  await p;
}

export async function probeVideo(url) {
  const v = document.createElement("video");
  v.preload = "metadata";
  v.muted = true;
  v.src = url;
  try {
    await once(v, "loadedmetadata", 30000);
    let d = v.duration;
    // MediaRecorder WebM files report Infinity until you seek to the end
    if (!Number.isFinite(d)) {
      const p = once(v, "seeked", 10000).catch(() => {});
      v.currentTime = 1e7;
      await p;
      d = v.duration;
    }
    if (!v.videoWidth || !Number.isFinite(d) || d <= 0)
      throw new Error("No playable video track");
    return { duration: d, width: v.videoWidth, height: v.videoHeight };
  } finally {
    v.removeAttribute("src");
    v.load();
  }
}

export function getDims(aspect, short) {
  const a = ASPECTS[aspect] || ASPECTS["9:16"];
  const even = (n) => Math.round(n / 2) * 2;
  const s = Number(short);
  if (a.w <= a.h) return { W: even(s), H: even((s * a.h) / a.w) };
  return { W: even((s * a.w) / a.h), H: even(s) };
}

export function pickMime() {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = [
    "video/mp4;codecs=avc1.640028,mp4a.40.2",
    "video/mp4;codecs=avc1.4d0028,mp4a.40.2",
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4;codecs=avc1,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) || null;
}

/* ------------------------------- fonts ------------------------------- */

let fontsPromise = null;

/**
 * Canvas can't trigger lazy web-font loading, so Devanagari text would silently
 * render with whatever fallback the device has (or as empty boxes). We load
 * Noto Sans Devanagari explicitly and wait for it before drawing / exporting.
 */
export function ensureCaptionFonts() {
  if (typeof document === "undefined") return Promise.resolve();
  if (fontsPromise) return fontsPromise;
  fontsPromise = new Promise((resolve) => {
    const sample = "हिन्दी कैप्शन";
    const loadFaces = () =>
      Promise.all(
        ["400", "700", "900"].map((w) =>
          document.fonts.load(`${w} 40px "Noto Sans Devanagari"`, sample)
        )
      ).then(
        () => resolve(),
        () => resolve()
      );
    const existing = document.getElementById("lts-indic-fonts");
    if (existing) {
      loadFaces();
    } else {
      const l = document.createElement("link");
      l.id = "lts-indic-fonts";
      l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;700;900&display=swap";
      l.onload = loadFaces;
      l.onerror = () => resolve(); // offline: fall back to system fonts
      document.head.appendChild(l);
    }
    setTimeout(resolve, 7000); // never block rendering forever
  });
  return fontsPromise;
}

const INDIC_RE = /[\u0900-\u0DFF\u0600-\u06FF]/;

/* ------------------------------- drawing ------------------------------- */

function drawCover(ctx, video, W, H, fx = 0.5, fy = 0.5) {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  const ta = W / H;
  const sa = vw / vh;
  let sx = 0,
    sy = 0,
    sw = vw,
    sh = vh;
  if (sa > ta) {
    sw = vh * ta;
    sx = (vw - sw) * fx;
  } else {
    sh = vw / ta;
    sy = (vh - sh) * fy;
  }
  ctx.drawImage(video, sx, sy, sw, sh, 0, 0, W, H);
}

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function wrapText(ctx, text, maxW) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export function drawCaption(ctx, text, W, H, o = {}) {
  const st = CAPTION_STYLES[o.captionStyle] || CAPTION_STYLES.bold;
  const indic = INDIC_RE.test(text);
  const fs = Math.round(Math.min(W, H) * 0.072 * (o.captionSize || 1));
  const t = st.upper && !indic ? text.toUpperCase() : text;
  ctx.save();
  ctx.font = `${st.weight} ${fs}px ${st.font}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  const lines = wrapText(ctx, t, W * 0.84);
  // Devanagari has tall matras above and below the line: needs more leading
  const lh = fs * (indic ? 1.5 : 1.22);
  const top = H * (o.captionPos ?? 0.72) - ((lines.length - 1) * lh) / 2;
  lines.forEach((ln, i) => {
    const y = top + i * lh;
    if (st.box) {
      const w = ctx.measureText(ln).width + fs * 0.8;
      roundRectPath(ctx, W / 2 - w / 2, y - lh / 2, w, lh, fs * 0.25);
      ctx.fillStyle = st.box;
      ctx.fill();
    }
    if (st.stroke) {
      ctx.lineWidth = fs * (indic ? 0.14 : 0.2); // thinner stroke keeps small matras readable
      ctx.strokeStyle = st.stroke;
      ctx.strokeText(ln, W / 2, y);
    }
    ctx.fillStyle = st.fill;
    ctx.fillText(ln, W / 2, y);
  });
  ctx.restore();
}

/** Draws one output frame. Shared by live preview, thumbnails and export → WYSIWYG. */
export function drawFrame(ctx, video, W, H, o = {}) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw && vh && video.readyState >= 2) {
    if (o.layout === "blur") {
      // Cheap blur: draw into a tiny canvas, then upscale with smoothing
      const bg = o.bgCanvas || document.createElement("canvas");
      const bw = Math.max(16, Math.round(W / 14));
      const bh = Math.max(16, Math.round(H / 14));
      if (bg.width !== bw || bg.height !== bh) {
        bg.width = bw;
        bg.height = bh;
      }
      const bctx = bg.getContext("2d");
      drawCover(bctx, video, bw, bh, 0.5, 0.5);
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bg, 0, 0, W, H);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      const s = Math.min(W / vw, H / vh);
      const dw = vw * s;
      const dh = vh * s;
      ctx.drawImage(video, (W - dw) / 2, (H - dh) / 2, dw, dh);
    } else {
      drawCover(ctx, video, W, H, o.focusX ?? 0.5, 0.5);
    }
  }
  if (o.caption) drawCaption(ctx, o.caption, W, H, o);
}

export const captionAt = (captions, t) => {
  if (!captions) return null;
  for (const c of captions) if (t >= c.start && t < c.end) return c.text;
  return null;
};

/* ------------------------- audio + highlights ------------------------- */

export async function decodeMonoAudio(blob) {
  const buf = await blob.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  let ac;
  try {
    ac = new AC({ sampleRate: SR }); // decode straight to 16 kHz (saves memory)
  } catch {
    ac = new AC();
  }
  let decoded;
  try {
    decoded = await ac.decodeAudioData(buf);
  } catch {
    throw new Error("No decodable audio track in this video");
  } finally {
    ac.close?.();
  }
  if (decoded.sampleRate === SR && decoded.numberOfChannels === 1) {
    return decoded.getChannelData(0).slice();
  }
  const length = Math.max(1, Math.ceil(decoded.duration * SR));
  const off = new OfflineAudioContext(1, length, SR);
  const src = off.createBufferSource();
  src.buffer = decoded;
  src.connect(off.destination);
  src.start(0);
  const rendered = await off.startRendering();
  return rendered.getChannelData(0);
}

export function computeEnergy(samples) {
  const hopN = Math.round(SR * HOP);
  const n = Math.floor(samples.length / hopN);
  const e = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    const o = i * hopN;
    for (let j = 0; j < hopN; j++) {
      const v = samples[o + j];
      s += v * v;
    }
    e[i] = Math.sqrt(s / hopN);
  }
  return e;
}

export function downsampleEnergy(energy, buckets = 320) {
  if (!energy.length) return [];
  const out = [];
  const size = energy.length / buckets;
  for (let b = 0; b < buckets; b++) {
    let m = 0;
    const a = Math.floor(b * size);
    const z = Math.max(a + 1, Math.floor((b + 1) * size));
    for (let i = a; i < z && i < energy.length; i++) m = Math.max(m, energy[i]);
    out.push(m);
  }
  const max = Math.max(...out, 1e-6);
  return out.map((v) => +(v / max).toFixed(3));
}

/**
 * Scores every window of `clipLen` seconds by loudness, speech activity and
 * dynamics, then greedily picks the best non-overlapping windows.
 * maxCount = Infinity → as many clips as the video allows.
 */
export function findHighlights(energy, duration, clipLen, maxCount) {
  if (duration <= clipLen + 0.5) return [{ start: 0, end: +duration.toFixed(2), score: 1 }];
  const n = energy.length;
  const W = Math.max(1, Math.round(clipLen / HOP));
  if (n <= W) return [{ start: 0, end: +Math.min(duration, clipLen).toFixed(2), score: 1 }];

  const db = Array.from(energy, (v) => 20 * Math.log10(v + 1e-5));
  const sorted = [...db].sort((a, b) => a - b);
  const lo = sorted[Math.floor(n * 0.1)];
  const hi = sorted[Math.min(n - 1, Math.floor(n * 0.98))];
  const range = Math.max(1e-3, hi - lo);
  const norm = db.map((v) => clamp((v - lo) / range, 0, 1));

  const P1 = new Float64Array(n + 1);
  const P2 = new Float64Array(n + 1);
  const PA = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) {
    P1[i + 1] = P1[i] + norm[i];
    P2[i + 1] = P2[i] + norm[i] * norm[i];
    PA[i + 1] = PA[i] + (norm[i] > 0.35 ? 1 : 0);
  }

  const step = Math.max(1, Math.round(1 / HOP));
  const cands = [];
  const scoreAt = (i) => {
    const mean = (P1[i + W] - P1[i]) / W;
    const varr = Math.max(0, (P2[i + W] - P2[i]) / W - mean * mean);
    const act = (PA[i + W] - PA[i]) / W;
    return 0.5 * mean + 0.35 * act + 0.15 * Math.min(1, Math.sqrt(varr) * 3);
  };
  for (let i = 0; i + W <= n; i += step) cands.push({ i, score: scoreAt(i) });
  if ((n - W) % step) cands.push({ i: n - W, score: scoreAt(n - W) });
  cands.sort((a, b) => b.score - a.score);

  const limit = Number.isFinite(maxCount) ? Math.max(1, maxCount) : Number.MAX_SAFE_INTEGER;
  const picked = [];
  for (const c of cands) {
    if (picked.length >= limit) break;
    if (picked.every((p) => c.i + W <= p.i || c.i >= p.i + W)) picked.push(c);
  }

  // Snap each start to the quietest nearby frame (a natural pause)
  const snapR = Math.round(1.5 / HOP);
  let res = picked.map((p) => {
    let best = p.i;
    let bv = Infinity;
    for (let j = Math.max(0, p.i - snapR); j <= Math.min(n - W, p.i + snapR); j++) {
      if (norm[j] < bv) {
        bv = norm[j];
        best = j;
      }
    }
    const start = best * HOP;
    return { start, end: Math.min(duration, start + clipLen), score: p.score };
  });

  // Resolve tiny overlaps introduced by snapping
  res.sort((a, b) => a.start - b.start);
  for (let k = 1; k < res.length; k++) {
    if (res[k].start < res[k - 1].end) {
      res[k].start = res[k - 1].end;
      res[k].end = Math.min(duration, res[k].start + clipLen);
    }
  }
  res = res.filter((r) => r.end - r.start >= Math.min(3, clipLen * 0.5));
  return res
    .map((r) => ({ start: +r.start.toFixed(2), end: +r.end.toFixed(2), score: r.score }))
    .sort((a, b) => b.score - a.score);
}

export function evenlySpaced(duration, clipLen, count) {
  const maxK = Math.max(1, Math.floor(duration / clipLen));
  const k = Number.isFinite(count) ? clamp(count, 1, maxK) : maxK;
  const len = Math.min(clipLen, duration);
  const gap = Math.max(0, (duration - k * len) / (k + 1));
  return Array.from({ length: k }, (_, i) => {
    const start = gap + i * (len + gap);
    return { start: +start.toFixed(2), end: +Math.min(duration, start + len).toFixed(2), score: 0.5 };
  });
}

/* --------------------------- captions (Whisper) --------------------------- */

const WORKER_CODE = `
import { pipeline, env } from "${TRANSFORMERS_URL}";
env.allowLocalModels = false;
let asr = null, loadedModel = null, loading = null, currentId = 0;

function load(model) {
  if (asr && loadedModel === model) return Promise.resolve(asr);
  if (loading && loading.model === model) return loading.promise;
  asr = null;
  const promise = pipeline("automatic-speech-recognition", model, {
    progress_callback: (p) => self.postMessage({ id: currentId, type: "progress", data: p }),
  })
    .then((p) => {
      asr = p; loadedModel = model; loading = null;
      self.postMessage({ id: currentId, type: "progress", data: { status: "ready" } });
      return p;
    })
    .catch((err) => { loading = null; throw err; }); // allow retry after a failure
  loading = { model, promise };
  return promise;
}

function run(p, audio, model, language, words) {
  const opts = {
    return_timestamps: words ? "word" : true,
    chunk_length_s: 30,
    stride_length_s: 5,
    // Small multilingual models (esp. on Hindi) love to loop the same phrase forever
    no_repeat_ngram_size: 4,
    repetition_penalty: 1.1,
  };
  if (!model.endsWith(".en")) {
    opts.task = "transcribe"; // keep the original language (never translate to English)
    if (language) opts.language = language;
  }
  return p(audio, opts);
}

// A transcript is "usable" if it has text and not just a handful of repeated tokens
function usable(out) {
  const text = ((out && out.text) || "").trim();
  if (!text) return false;
  const toks = text.split(/\\s+/);
  if (toks.length >= 8 && new Set(toks).size / toks.length < 0.15) return false;
  return true;
}

self.onmessage = async (e) => {
  const { id, audio, model, language } = e.data;
  currentId = id;
  try {
    const p = await load(model);
    let out = null;
    try {
      out = await run(p, audio, model, language, true);
      if (!out.chunks || !out.chunks.length) throw new Error("no word timestamps");
    } catch (err) {
      out = null;
    }
    if (!out || !usable(out)) {
      // fallback: segment-level timestamps (more robust for Indic scripts)
      try {
        const seg = await run(p, audio, model, language, false);
        if (!out || usable(seg)) out = seg;
      } catch (err) {
        if (!out) throw err;
      }
    }
    self.postMessage({ id, type: "result", data: { text: out.text || "", chunks: out.chunks || [] } });
  } catch (err) {
    self.postMessage({ id, type: "error", data: String((err && err.message) || err) });
  }
};
`;

let asrWorker = null;
let reqId = 0;
const pending = new Map();

function getAsrWorker() {
  if (asrWorker) return asrWorker;
  const url = URL.createObjectURL(new Blob([WORKER_CODE], { type: "text/javascript" }));
  asrWorker = new Worker(url, { type: "module" });
  asrWorker.onmessage = (e) => {
    const { id, type, data } = e.data;
    const p = pending.get(id);
    if (!p) return;
    if (type === "progress") p.onProgress?.(data);
    else if (type === "result") {
      pending.delete(id);
      p.resolve(data);
    } else if (type === "error") {
      pending.delete(id);
      p.reject(new Error(data));
    }
  };
  asrWorker.onerror = (e) => {
    for (const p of pending.values())
      p.reject(new Error(e.message || "Could not load the speech model (are you online for the first download?)"));
    pending.clear();
    asrWorker?.terminate();
    asrWorker = null;
  };
  return asrWorker;
}

export function transcribe(audio, { model, language }, onProgress) {
  return new Promise((resolve, reject) => {
    const id = ++reqId;
    pending.set(id, { resolve, reject, onProgress });
    getAsrWorker().postMessage({ id, audio, model, language }, [audio.buffer]);
  });
}

const NOISE = /^\s*[[(].*[\])]\s*$/;

/** Builds short, punchy caption lines (absolute times). Uses word timestamps when available. */
export function buildCaptions(chunks, offset, clipDur, maxWords = 4) {
  const items = (chunks || []).filter(
    (c) => c.timestamp && c.timestamp[0] != null && (c.text || "").trim() && !NOISE.test(c.text)
  );
  if (!items.length) return [];
  const single = items.filter((c) => c.text.trim().split(/\s+/).length === 1).length;
  const wordLevel = single / items.length > 0.9;
  const out = [];

  if (wordLevel) {
    // Real word timings → tight, accurate captions
    let g = [];
    const flush = () => {
      if (!g.length) return;
      out.push({
        id: uid(),
        start: +(offset + g[0].a).toFixed(2),
        end: +(offset + Math.max(g[g.length - 1].b, g[0].a + 0.3)).toFixed(2),
        text: g.map((w) => w.t).join(" "),
      });
      g = [];
    };
    for (const c of items) {
      const a = c.timestamp[0];
      let b = c.timestamp[1];
      if (b == null || b <= a) b = Math.min(clipDur, a + 0.4);
      const t = c.text.trim();
      if (g.length && a - g[g.length - 1].b > 0.8) flush();
      g.push({ a, b, t });
      if (g.length >= maxWords || /[.!?,;।॥]$/.test(t)) flush();
    }
    flush();
    // close tiny gaps so captions don't flicker
    for (let i = 0; i < out.length - 1; i++) {
      const gap = out[i + 1].start - out[i].end;
      if (gap > 0 && gap < 0.35) out[i].end = out[i + 1].start;
    }
    return out;
  }

  // Segment-level fallback
  for (const c of items) {
    const a = c.timestamp[0];
    let b = c.timestamp[1];
    if (b == null || b <= a) b = Math.min(clipDur, a + 4);
    const words = c.text.trim().split(/\s+/).filter(Boolean);
    const groups = [];
    for (let i = 0; i < words.length; i += maxWords) groups.push(words.slice(i, i + maxWords).join(" "));
    const total = groups.reduce((s, g) => s + g.length, 0) || 1;
    let t = a;
    for (const g of groups) {
      const d = ((b - a) * g.length) / total;
      out.push({ id: uid(), start: +(offset + t).toFixed(2), end: +(offset + t + d).toFixed(2), text: g });
      t += d;
    }
  }
  return out;
}

/**
 * FIX: \p{M} (combining marks) is required, otherwise Devanagari vowel signs
 * (matras like ा ि ी ु ू े ै ो ौ ं ः ्) are replaced by spaces and Hindi words get shredded.
 */
export function titleFromText(text, fallback) {
  const words = (text || "")
    .replace(/[^\p{L}\p{M}\p{N}\s']/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 6);
  if (words.length < 2) return fallback;
  const s = words.join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ------------------------------- export ------------------------------- */

/**
 * Renders a clip in real time through a canvas and records it with MediaRecorder.
 * Output: MP4 (H.264/AAC) in Chrome, Edge & Safari; WebM in Firefox. No watermark.
 */
export async function renderClip({ src, clip, settings, onProgress, signal }) {
  const mime = pickMime();
  if (!mime) throw new Error("This browser cannot record video (MediaRecorder unsupported)");
  await ensureCaptionFonts(); // make sure Hindi glyphs are ready before the first frame
  const { W, H } = getDims(settings.aspect, settings.quality);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { alpha: false });
  const bgCanvas = document.createElement("canvas");

  const video = document.createElement("video");
  video.preload = "auto";
  video.playsInline = true;
  video.src = src;
  video.style.cssText =
    "position:fixed;left:0;top:0;width:2px;height:2px;opacity:0.01;pointer-events:none;z-index:-1";
  document.body.appendChild(video);

  const AC = window.AudioContext || window.webkitAudioContext;
  const ac = new AC();
  let stream;
  try {
    await once(video, "loadedmetadata");
    await ac.resume();
    const srcNode = ac.createMediaElementSource(video);
    const dest = ac.createMediaStreamDestination();
    srcNode.connect(dest); // not connected to speakers → silent render

    stream = canvas.captureStream(30);
    dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));

    const rec = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: settings.quality === "1080" ? 10_000_000 : 6_000_000,
      audioBitsPerSecond: 192_000,
    });
    const parts = [];
    rec.ondataavailable = (e) => e.data.size && parts.push(e.data);
    const stopped = new Promise((r) => (rec.onstop = r));

    await seekTo(video, clip.start);
    const opts = {
      layout: settings.layout,
      focusX: clip.focusX ?? 0.5,
      bgCanvas,
      captionStyle: settings.captionStyle,
      captionPos: settings.captionPos,
      captionSize: settings.captionSize,
    };
    const draw = () =>
      drawFrame(ctx, video, W, H, {
        ...opts,
        caption: settings.captions ? captionAt(clip.captions, video.currentTime) : null,
      });
    draw();
    rec.start(500);
    try {
      await video.play();
    } catch {
      rec.stop();
      throw new Error("Playback was blocked by the browser. Click Export again.");
    }

    const len = Math.max(0.1, clip.end - clip.start);
    await new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearInterval(iv);
        video.pause();
        resolve();
      };
      const tick = () => {
        if (done) return;
        draw();
        onProgress?.(clamp((video.currentTime - clip.start) / len, 0, 1));
        if (video.currentTime >= clip.end || video.ended) finish();
        else schedule();
      };
      const schedule = () =>
        video.requestVideoFrameCallback
          ? video.requestVideoFrameCallback(tick)
          : requestAnimationFrame(tick);
      const iv = setInterval(() => {
        if (video.currentTime >= clip.end || video.ended) {
          draw();
          finish();
        }
      }, 120);
      video.addEventListener("ended", finish);
      signal?.addEventListener("abort", finish);
      schedule();
    });

    rec.stop();
    await stopped;
    if (signal?.aborted) throw new Error("cancelled");
    const type = mime.split(";")[0];
    return { blob: new Blob(parts, { type }), ext: type === "video/mp4" ? "mp4" : "webm" };
  } finally {
    stream?.getTracks().forEach((t) => t.stop());
    ac.close?.();
    video.pause();
    video.removeAttribute("src");
    video.load();
    video.remove();
  }
}

export async function captureThumb(video, clip, settings) {
  const t = Math.min(clip.end - 0.05, clip.start + Math.min(1.5, (clip.end - clip.start) / 2));
  await seekTo(video, Math.max(0, t));
  const { W, H } = getDims(settings.aspect, 200);
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  drawFrame(c.getContext("2d"), video, W, H, { layout: settings.layout, focusX: clip.focusX ?? 0.5 });
  return c.toDataURL("image/jpeg", 0.75);
}

/* ------------------------------ IndexedDB ------------------------------ */

let dbPromise = null;
function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains("projects")) db.createObjectStore("projects", { keyPath: "id" });
      if (!db.objectStoreNames.contains("files")) db.createObjectStore("files", { keyPath: "id" });
    };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => {
      dbPromise = null;
      reject(r.error);
    };
  });
  return dbPromise;
}

async function tx(store, mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error("Storage transaction aborted"));
  });
}

export const dbPut = (store, value) => tx(store, "readwrite", (s) => s.put(value));
export const dbGet = (store, id) => tx(store, "readonly", (s) => s.get(id));
export const dbDelete = (store, id) => tx(store, "readwrite", (s) => s.delete(id));
export const dbAll = (store) => tx(store, "readonly", (s) => s.getAll());