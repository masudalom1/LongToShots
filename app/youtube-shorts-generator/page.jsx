import LandingPage, { landingMetadata } from "../_landing/LandingPage";

const PAGE = {
  path: "/youtube-shorts-generator",
  title: "Free YouTube Shorts Generator – Make Shorts from Any Video | LongToShorts",
  description:
    "Free YouTube Shorts generator. Turn long YouTube videos into vertical 9:16 Shorts with AI highlights and auto captions. No watermark, runs in your browser.",
  crumb: "YouTube Shorts Generator",
  h1: <>Free <span className="text-violet-600">YouTube Shorts Generator</span> for your long videos</>,
  intro:
    "Already have long YouTube videos? Turn each one into a set of vertical Shorts that bring new viewers back to your channel. LongToShorts picks the strongest moments, reframes them to 9:16, adds captions viewers can read with the sound off, and exports clean MP4 files you can upload in YouTube Studio.",
  cta: "Make YouTube Shorts now",
  cards: {
    heading: "Built for the YouTube Shorts format",
    items: [
      { title: "Vertical 9:16 at 1080p", text: "Exports match the Shorts player. Reframe landscape footage with a framing slider, or fit the whole frame over a blurred background." },
      { title: "Clip lengths that suit Shorts", text: "Pick 15, 30, 45, 60 or 90 seconds, or type your own length. YouTube accepts Shorts up to 3 minutes long." },
      { title: "Captions burned in", text: "Most Shorts are watched without sound. Automatic Whisper captions are styled and burned into the video, and every line is editable." },
      { title: "No watermark on your channel", text: "Exports carry no LongToShorts logo or branding, so your Shorts look like your own work." },
    ],
  },
  steps: {
    heading: "How to make YouTube Shorts from a long video",
    items: [
      ["Download your own video", "In YouTube Studio, open the video, choose the three-dot menu and click Download. Or use your original export file."],
      ["Upload it to LongToShorts", "Drop the file into the upload box. It is processed on your device and never sent to a server."],
      ["Choose 9:16 and a clip length", "The AI scores loudness, speech and energy and suggests the best non-overlapping moments."],
      ["Edit and export", "Trim, reframe and fix captions, then download MP4 files and upload them as Shorts in YouTube Studio."],
    ],
  },
  sections: [
    {
      heading: "Why repurpose long videos into Shorts?",
      text: "Shorts appear in a separate feed that reaches people who have never seen your channel. A good moment from a 20-minute video can find a new audience as a 40-second Short and link viewers back to the full video. You have already filmed the content, so making Shorts from it costs minutes, not a new shoot.",
    },
  ],
  faqs: [
    {
      question: "Is this YouTube Shorts generator really free?",
      answer: "Yes. There is no subscription, no clip limit and no watermark. The tool runs in your browser using open-source technology, so there is no paid server or AI API to pay for.",
    },
    {
      question: "Can I paste a YouTube link instead of uploading a file?",
      answer: "No. Page links from YouTube cannot be imported. Download your own video from YouTube Studio first, then upload the file.",
    },
    {
      question: "Does it upload the Shorts to my channel?",
      answer: "No. LongToShorts exports MP4 files. Upload them in YouTube Studio, where you can publish right away or schedule them. We never ask for your YouTube login.",
    },
  ],
};

export const metadata = landingMetadata(PAGE);

export default function YouTubeShortsGeneratorPage() {
  return <LandingPage {...PAGE} />;
}
