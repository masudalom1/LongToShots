import LandingPage, { landingMetadata } from "../_landing/LandingPage";

const PAGE = {
  path: "/bulk-shorts-generator",
  title: "Bulk Shorts Generator – Make Many Shorts from One Video | LongToShorts",
  description:
    "Generate Shorts in bulk: turn one long video into as many clips as it allows and export them all at once. Free, unlimited, no watermark, runs in your browser.",
  crumb: "Bulk Shorts Generator",
  h1: <>Bulk Shorts Generator: <span className="text-violet-600">many clips</span> from one long video</>,
  intro:
    "Need a week or a month of Shorts from a single recording? Choose \"All possible\" and LongToShorts cuts your long video into every clip it can find, then exports them all in one go. There are no quotas, credits or per-clip fees.",
  cta: "Generate Shorts in bulk",
  cards: {
    heading: "Built for volume",
    items: [
      { title: "\"All possible\" clips", text: "No clip limit. Set the clip length and the tool fills the whole video with non-overlapping clips." },
      { title: "Export all at once", text: "One click queues every clip for export. Your browser may ask once to allow multiple downloads." },
      { title: "Same settings for every clip", text: "Format, layout, caption style and music apply to all clips, so the whole batch looks consistent." },
      { title: "Unlimited, free", text: "No credits or monthly minutes. Process as many videos as you like, one after another." },
    ],
  },
  steps: {
    heading: "How to make Shorts in bulk",
    items: [
      ["Upload one long video", "A lecture, course, stream or podcast gives you the most clips."],
      ["Choose \"All possible\"", "Set the clip length, format and caption style once for the whole batch."],
      ["Quick review", "Delete weak clips and adjust framing on any clip that needs it."],
      ["Export all", "Clips render one after another. Keep the tab open and visible while they export."],
    ],
  },
  sections: [
    {
      heading: "Good to know",
      list: [
        "Videos are processed one at a time. Finish one video, then open the next.",
        "Export runs in real time, so a 30-second clip takes about 30 seconds. Twenty clips of 30 seconds take about 10 minutes.",
        "Browsers slow down background tabs, so keep the LongToShorts tab visible during a bulk export.",
      ],
    },
  ],
  faqs: [
    {
      question: "How many Shorts can I make from one video?",
      answer: "As many as the video allows. A 60-minute video with 30-second clips can give up to about 120 non-overlapping clips. There is no cap set by the tool.",
    },
    {
      question: "Can I upload several videos at once?",
      answer: "Not at the same time. Process one video, export its clips, then open the next. Every project is saved in your browser so you can return to it.",
    },
    {
      question: "Does bulk export add a watermark?",
      answer: "No. Every clip is exported clean, with no watermark or branding.",
    },
  ],
};

export const metadata = landingMetadata(PAGE);

export default function BulkShortsGeneratorPage() {
  return <LandingPage {...PAGE} />;
}
