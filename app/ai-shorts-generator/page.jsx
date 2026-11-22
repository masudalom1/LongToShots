import LandingPage, { landingMetadata } from "../_landing/LandingPage";

const PAGE = {
  path: "/ai-shorts-generator",
  title: "AI Shorts Generator – Free, Private and No Watermark | LongToShorts",
  description:
    "Free AI Shorts generator that finds highlights and writes captions with open-source Whisper, all in your browser. No paid API, no upload, no watermark.",
  crumb: "AI Shorts Generator",
  h1: <>The free <span className="text-violet-600">AI Shorts Generator</span> that runs on your device</>,
  intro:
    "Most AI clipping tools upload your video to their servers and charge per minute. LongToShorts runs its AI in your browser instead: it analyses the audio to find highlights and uses the open-source Whisper speech model to write captions. Your footage never leaves your device, and there is nothing to pay for.",
  cta: "Try the AI Shorts generator",
  cards: {
    heading: "What the AI does for you",
    items: [
      { title: "Highlight detection", text: "Every moment is scored by loudness, speech activity and energy. The best non-overlapping moments become your clips." },
      { title: "Speech-to-text captions", text: "Whisper turns speech into timed captions in English, Hindi and many other languages. Pick the Multilingual model for non-English videos." },
      { title: "Automatic clip titles", text: "Each clip gets a working title taken from what is said in it, so you can find the right clip quickly." },
      { title: "You stay in control", text: "The AI suggests, you decide. Trim any clip, move the framing, rewrite captions or delete clips you do not want." },
    ],
  },
  steps: {
    heading: "How the AI Shorts generator works",
    items: [
      ["Audio analysis", "The Web Audio API reads the soundtrack and measures volume, speech and energy across the whole video."],
      ["Moment scoring", "Peaks in speech and energy are ranked and the top moments are chosen without overlapping each other."],
      ["Captioning", "Whisper runs through transformers.js in your browser. The model is downloaded once from Hugging Face, then cached."],
      ["Rendering", "Canvas crops and captions each frame, and MediaRecorder encodes the final MP4 or WebM file."],
    ],
  },
  sections: [
    {
      heading: "Why on-device AI?",
      list: [
        "Privacy: unreleased videos, client work and personal footage are never uploaded.",
        "No cost: there is no paid AI API behind the tool, so there is nothing to charge you for.",
        "No limits: you are not waiting in a server queue or using up monthly minutes.",
        "Works on long files: the only limit is your device's memory and storage.",
      ],
    },
  ],
  faqs: [
    {
      question: "Which AI model does LongToShorts use?",
      answer: "Captions use OpenAI's open-source Whisper speech model, run locally through transformers.js. Highlight detection uses audio analysis in your browser. No paid AI service is called.",
    },
    {
      question: "Does it need a powerful computer?",
      answer: "A recent laptop or desktop with Chrome, Edge or Safari works best. Phones can work for short videos, but long videos and the larger Whisper models need more memory.",
    },
    {
      question: "How accurate are the AI captions?",
      answer: "Whisper is accurate on clear speech, but names and slang can be wrong. Every caption line can be edited before you export.",
    },
  ],
};

export const metadata = landingMetadata(PAGE);

export default function AiShortsGeneratorPage() {
  return <LandingPage {...PAGE} />;
}
