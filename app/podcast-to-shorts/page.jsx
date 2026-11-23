import LandingPage, { landingMetadata } from "../_landing/LandingPage";

const PAGE = {
  path: "/podcast-to-shorts",
  title: "Podcast to Shorts – Turn Podcast Episodes into Clips Free | LongToShorts",
  description:
    "Turn video podcast episodes into YouTube Shorts and Reels for free. AI finds the best moments and adds captions. No watermark, private, in your browser.",
  crumb: "Podcast to Shorts",
  h1: <>Turn your <span className="text-violet-600">podcast into Shorts</span> and Reels</>,
  intro:
    "A one-hour episode has a dozen moments worth sharing, but finding them by hand takes hours. LongToShorts listens to the whole conversation, ranks the most lively parts, and turns them into captioned vertical clips you can post to promote each episode.",
  cta: "Clip your podcast now",
  cards: {
    heading: "Made for long conversations",
    items: [
      { title: "Finds the lively moments", text: "Speech-dense, high-energy parts of the conversation, like a strong opinion, a laugh or a story, score highest." },
      { title: "Fit two speakers in frame", text: "Use Fit + blur to keep a wide two-person shot in a vertical clip, or crop in on one speaker with the framing slider." },
      { title: "Captions for silent scrolling", text: "Podcasts are all talk, so captions matter. Whisper captions are added automatically and can be edited." },
      { title: "Handles hour-long episodes", text: "Nothing is uploaded, so long files are fine. Your project is saved in the browser so you can come back later." },
    ],
  },
  steps: {
    heading: "How to turn a podcast episode into Shorts",
    items: [
      ["Upload the episode video", "Use the full recording as MP4, MOV, WebM or MKV."],
      ["Pick a length and number of clips", "Clips of 30 to 60 seconds work well for teasers. Choose \"All possible\" to see every candidate."],
      ["Review the suggested moments", "Preview each clip, trim the start so it opens on a strong line, and check the captions."],
      ["Export and post", "Download the clips and share them on YouTube Shorts, Instagram Reels and other platforms to promote the full episode."],
    ],
  },
  sections: [
    {
      heading: "Works for",
      list: [
        "Video podcasts and interview shows",
        "Panel discussions and live Q&A sessions",
        "Webinars and Twitter/X Spaces recordings with video",
        "Talk shows in Hindi, English and other languages",
      ],
    },
  ],
  faqs: [
    {
      question: "Can I use an audio-only podcast?",
      answer: "LongToShorts works with video files. For an audio-only episode, first export it as a video with a still image or waveform in any editor, then upload it.",
    },
    {
      question: "How long can the podcast episode be?",
      answer: "There is no fixed limit. Long episodes work as long as your device has enough memory and storage. A laptop or desktop is best for multi-hour files.",
    },
    {
      question: "Will the clips include a watermark?",
      answer: "No. Exports are clean MP4 files (WebM in Firefox) with no watermark or branding.",
    },
  ],
};

export const metadata = landingMetadata(PAGE);

export default function PodcastToShortsPage() {
  return <LandingPage {...PAGE} />;
}
