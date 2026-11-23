/* Shared, serializable content. Used by the visible UI AND by JSON-LD (they must match for rich results). */

export const FAQS = [
  {
    question: "What is an AI long video to Shorts converter?",
    answer:
      "It is a tool that turns one long video into multiple YouTube Shorts automatically. LongToShorts is a free AI Shorts generator and video to Shorts converter: it identifies the highlights, adds captions and resizes each clip to 9:16, so creating Shorts from a long video takes minutes instead of hours of manual editing.",
  },
  {
    question: "Can I publish or schedule the Shorts directly to YouTube?",
    answer:
      "LongToShorts exports ready-to-post MP4 files. Upload them in YouTube Studio, where you can publish right away or set a schedule. This keeps your account private: we never ask for your YouTube login, and your YouTube Shorts automation stays under your control.",
  },
  {
    question: "How do I convert a long video into Shorts or Reels for free?",
    answer:
      "Upload your video to LongToShorts, choose a clip length (15–90 seconds) and press Generate clips. The AI scans the audio for the most energetic, speech-dense moments, crops them to 9:16, adds captions and lets you export clean MP4 files. It is completely free with no signup.",
  },
  {
    question: "Is LongToShorts really free? Is there a watermark?",
    answer:
      "Yes, it is 100% free and exports never carry a watermark or LongToShorts branding. Everything runs inside your browser using open-source technology (Web Audio, Canvas, MediaRecorder and the open-source Whisper speech model via transformers.js). There is no server, no subscription and no paid AI API.",
  },
  {
    question: "Can I create unlimited clips from unlimited videos?",
    answer:
      "Yes. There are no upload, clip or processing quotas. Choose \"All possible\" and LongToShorts creates as many clips as your video allows. The only limits are your device's memory, storage and time.",
  },
  {
    question: "Are my videos uploaded to a server?",
    answer:
      "No. Videos are processed on your device and saved in your browser's private storage (IndexedDB) so you can reopen projects later. The only download is the free Whisper model, fetched once from Hugging Face and then cached.",
  },
  {
    question: "Which video formats and platforms are supported?",
    answer:
      "Any format your browser can play — MP4 (H.264), MOV, WebM and many MKV files. Export 9:16 for YouTube Shorts, Instagram Reels and Facebook Reels, 4:5 for feed posts, 1:1 square or 16:9. Exports are MP4 in Chrome, Edge and Safari, and WebM in Firefox.",
  },
  {
    question: "Does it add automatic captions in Hindi and other languages?",
    answer:
      "Yes. Auto captions use open-source Whisper running locally. Multilingual models support Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Urdu, Punjabi, Kannada, Malayalam, English and more. Every caption line is editable and can be styled before export.",
  },
  {
    question: "Why does exporting take as long as the clip?",
    answer:
      "Clips are rendered in real time through your browser's video encoder, so a 30-second short takes about 30 seconds. Keep the tab visible while exporting — browsers slow down background tabs.",
  },
  {
    question: "Can I use LongToShorts for podcasts, lectures and YouTube videos?",
    answer:
      "Yes. It works well for podcasts, interviews, webinars, lectures, gaming streams and vlogs. Download your own YouTube video first and upload the file — page links from YouTube or Instagram cannot be imported directly.",
  },
];

export const USE_CASES = [
  { title: "YouTube Shorts", text: "Turn a long YouTube video into 9:16 Shorts under 60 seconds, with captions burned in." },
  { title: "Instagram Reels", text: "Create Reels from podcasts, vlogs and interviews with smart vertical cropping." },
  { title: "Facebook & WhatsApp Status", text: "Export clean vertical clips that fit Facebook Reels and WhatsApp Status." },
  { title: "Podcast & Interview Clips", text: "Find the loudest, most engaging moments and share them as short teasers." },
  { title: "Lectures & Webinars", text: "Cut long classes and webinars into bite-sized, captioned revision clips." },
  { title: "Gaming & Live Streams", text: "Pull the highest-energy moments out of hours of stream footage." },
];