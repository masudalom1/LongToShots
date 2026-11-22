import Link from "next/link";

/* =====================================================================
 * Self-contained page: the only import is next/link (part of Next.js).
 * Everything else (brand values, metadata, schema) lives in this file.
 * ===================================================================== */

const BRAND = {
  name: "LongToShorts",
  domain: "longtoshorts.in",
  url: "https://longtoshorts.in",
  locale: "en_IN",
  language: "en-IN",
  year: 2026,
  lastModified: "2026-11-22",
  twitterHandle: "", // e.g. "@longtoshorts"
  ogImage: "/og-image.png", // put a 1200x630 image in /public (optional)
};

const PATH = "/youtube-video-to-shorts";
const PAGE_URL = `${BRAND.url}${PATH}`;
const START_HREF = "/#upload"; // home route + scrolls to the upload box. Use "/" if you prefer.

const TITLE = "YouTube Video to Shorts Converter – Free, No Watermark";
const DESCRIPTION =
  "Cut any YouTube video into vertical Shorts for free. Auto-detect highlights, add captions and export 9:16 clips without a watermark.";

/* ---------- SEO: title, description, canonical, Open Graph, Twitter ---------- */
export const metadata = {
  metadataBase: new URL(BRAND.url),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    siteName: BRAND.name,
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    locale: BRAND.locale,
    images: [{ url: BRAND.ogImage, width: 1200, height: 630, alt: `${BRAND.name} – YouTube video to Shorts` }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [BRAND.ogImage],
    ...(BRAND.twitterHandle ? { site: BRAND.twitterHandle } : {}),
  },
  robots: { index: true, follow: true },
};

/* ---------- Content (one source for visible text + schema) ---------- */
const STEPS = [
  {
    name: "Get your video file",
    text: "Use the original file you recorded. If it is only on YouTube, download your own video from YouTube Studio (Content, then the three-dot menu, then Download). Only use videos you own or have permission to edit.",
  },
  {
    name: "Upload it to LongToShorts",
    text: "Click Start Free, then drag and drop your MP4, MOV, WebM or MKV file. It opens in your browser and is not uploaded to any server.",
  },
  {
    name: "Choose clip length and format",
    text: "Pick 15, 30, 45, 60 or 90 seconds, or enter a custom length. Select 9:16 for Shorts and choose Smart crop or Fit with blur.",
  },
  {
    name: "Generate highlights and captions",
    text: "Press Generate clips. The AI scores your audio for energy and speech activity, picks the best moments and creates captions with open-source Whisper. Set the language to Hindi for Hindi videos.",
  },
  {
    name: "Fine-tune and export",
    text: "Trim the start and end, move the framing to keep the speaker in view, edit any caption, then export clean clips with no watermark and upload them to YouTube Shorts.",
  },
];

const FAQS = [
  {
    question: "Can I paste a YouTube link and get Shorts?",
    answer:
      "Not directly. LongToShorts works on video files, so first download your own video (for example from YouTube Studio) or use your original recording, then upload that file. Everything is processed in your browser, so the video never leaves your device.",
  },
  {
    question: "Is it free to convert YouTube videos to Shorts?",
    answer:
      "Yes. LongToShorts is free, adds no watermark and has no clip limit. You can make as many Shorts as your device can process.",
  },
  {
    question: "What size and ratio should a YouTube Short be?",
    answer:
      "Use vertical 9:16, for example 1080 by 1920 pixels. Square 1:1 also works. YouTube Shorts can now be up to 3 minutes long, but most creators keep clips between 15 and 60 seconds for better retention.",
  },
  {
    question: "Can I add Hindi captions to my Shorts?",
    answer:
      "Yes. Select Hindi as the language and choose the Whisper Small model for the best accuracy. You can edit every caption line before exporting.",
  },
  {
    question: "Will the AI pick the best part of my video?",
    answer:
      "It scores every moment by loudness, speech activity and energy, then picks the strongest non-overlapping clips. It is a strong starting point, and you can trim or add clips manually if you want a different moment.",
  },
  {
    question: "Does it work on my phone?",
    answer:
      "It runs in modern browsers such as Chrome, Edge and Safari. Phones can process short clips, but a laptop or desktop is faster for long videos because all the processing happens on your own device.",
  },
  {
    question: "Can I use videos from other creators?",
    answer:
      "Only if you have the owner's permission. Re-uploading someone else's content can lead to copyright claims or strikes, so use your own footage or licensed material.",
  },
];

const FEATURES = [
  ["AI highlight detection", "Finds the most energetic, speech-dense moments instead of random cuts."],
  ["Auto captions in Hindi & English", "Open-source Whisper runs locally, with 99 languages and fully editable lines."],
  ["Smart 9:16 crop", "Slide the framing to keep the speaker centred, or fit the video on a blurred background."],
  ["No watermark, no limits", "Unlimited videos and unlimited clips, always clean exports."],
  ["Private by design", "Your footage stays on your device. Nothing is uploaded to a server."],
  ["Bulk export", "Export every clip in one click, as MP4 where your browser supports it."],
];

const COMPARE = [
  ["Cost", "Free", "Often paid or limited"],
  ["Watermark", "None", "Common on free plans"],
  ["Upload to a server", "No, runs in your browser", "Usually yes"],
  ["Clip limit", "None", "Monthly caps"],
  ["Hindi captions", "Yes, editable", "Often English only"],
];

/* Only link to pages that really exist. Add more here as you build them. */
const RELATED = [
  { href: "/long-video-to-reels", label: "Turn Long Videos into Instagram Reels" },
];

/* ---------- Structured data (WebPage + Breadcrumb + HowTo + FAQ) ---------- */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: BRAND.language,
      dateModified: BRAND.lastModified,
      isPartOf: { "@type": "WebSite", name: BRAND.name, url: BRAND.url },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: BRAND.url },
        { "@type": "ListItem", position: 2, name: "YouTube Video to Shorts", item: PAGE_URL },
      ],
    },
    {
      "@type": "HowTo",
      name: "How to convert a YouTube video to Shorts for free",
      totalTime: "PT5M",
      estimatedCost: { "@type": "MonetaryAmount", currency: "INR", value: "0" },
      step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ],
};

/* ---------- Reusable Start button ---------- */
function StartButton({ label = "Start Free", className = "" }) {
  return (
    <Link
      href={START_HREF}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4b0cff] to-[#9b18f8] px-8 py-4 text-base font-extrabold text-white shadow-lg shadow-violet-300/60 transition hover:scale-105 ${className}`}
    >
      {label} <span aria-hidden="true">→</span>
    </Link>
  );
}

export default function YoutubeVideoToShortsPage() {
  return (
    <div className="min-h-screen bg-[#fbfaff] text-[#10102d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="border-b border-violet-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5">
          <Link href="/" className="text-2xl font-black tracking-tight text-[#11112d]" aria-label={`${BRAND.name} home`}>
            LongTo<span className="text-violet-600">Shorts</span>
          </Link>
          <StartButton label="Start Free" className="!px-5 !py-2.5 !text-sm" />
        </div>
      </header>

      <main>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-5 pt-6 text-sm text-slate-500">
          <ol className="flex items-center gap-2">
            <li><Link href="/" className="hover:text-violet-700">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-slate-700">YouTube Video to Shorts</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="mx-auto max-w-4xl px-5 py-12 text-center" aria-labelledby="page-title">
          <p className="mb-4 inline-block rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700">
            Free · No Watermark · Hindi &amp; English Captions
          </p>
          <h1 id="page-title" className="text-4xl font-black leading-tight tracking-tight sm:text-5xl">
            Convert YouTube Videos to <span className="bg-gradient-to-r from-[#6410ed] to-[#a315f5] bg-clip-text text-transparent">Shorts</span> for Free
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#28264b]">
            Turn your long YouTube videos into vertical YouTube Shorts in minutes. {BRAND.name} finds the best moments with AI,
            adds auto captions, crops to 9:16 and exports clean clips with no watermark. It all runs in your browser, so your
            video stays private.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <StartButton label="Start Free – Upload Your Video" />
            <p className="text-sm text-slate-500">No signup · No watermark · Unlimited clips</p>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-4xl px-5 py-10" aria-labelledby="how-title">
          <h2 id="how-title" className="text-3xl font-black">How to Convert a YouTube Video to Shorts</h2>
          <p className="mt-3 text-slate-600">
            Follow these five steps. The whole process usually takes about five minutes for a one-hour video.
          </p>
          <ol className="mt-8 space-y-5">
            {STEPS.map((s, i) => (
              <li key={s.name} className="flex gap-4 rounded-2xl border border-violet-100 bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white">{i + 1}</span>
                <div>
                  <h3 className="font-extrabold">{s.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center"><StartButton label="Start Now" /></div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-5xl px-5 py-12" aria-labelledby="features-title">
          <h2 id="features-title" className="text-center text-3xl font-black">Why Use {BRAND.name} for YouTube Shorts?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([t, d]) => (
              <article key={t} className="rounded-2xl border border-violet-100 bg-white p-6">
                <h3 className="font-extrabold">{t}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Tips */}
        <section className="mx-auto max-w-4xl px-5 py-10" aria-labelledby="tips-title">
          <h2 id="tips-title" className="text-3xl font-black">Tips to Get More Views on Your YouTube Shorts</h2>
          <div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-700">
            <p>
              <strong>Hook viewers in the first two seconds.</strong> Start your clip on the most interesting sentence, not on
              a slow intro. The highlight detector favours energetic moments, but trim the start so the first word grabs attention.
            </p>
            <p>
              <strong>Always add captions.</strong> Many people watch Shorts without sound. Short caption lines of three to four
              words, in a bold style, are easy to read on a phone. For Hindi videos, set the language to Hindi instead of
              Auto-detect.
            </p>
            <p>
              <strong>Keep the speaker in frame.</strong> When you convert a 16:9 video to 9:16, use the framing slider so the
              face stays centred, or switch to Fit with blur for screen recordings and slides.
            </p>
            <p>
              <strong>Pick the right length.</strong> Clips of 15 to 45 seconds often hold attention best. Podcasts and
              interviews can work at 60 seconds if every sentence is strong.
            </p>
            <p>
              <strong>Write a clear title and link to the full video.</strong> Use the main topic in the title, add a relevant
              hashtag or two, and point viewers to your long video to grow watch time on your channel.
            </p>
          </div>
        </section>

        {/* Comparison */}
        <section className="mx-auto max-w-4xl px-5 py-10" aria-labelledby="compare-title">
          <h2 id="compare-title" className="text-3xl font-black">{BRAND.name} vs Typical Shorts Makers</h2>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-violet-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-violet-50 text-violet-800">
                <tr>
                  <th scope="col" className="px-4 py-3">Feature</th>
                  <th scope="col" className="px-4 py-3">{BRAND.name}</th>
                  <th scope="col" className="px-4 py-3">Typical online tools</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(([f, a, b]) => (
                  <tr key={f} className="border-t border-violet-50">
                    <th scope="row" className="px-4 py-3 font-semibold">{f}</th>
                    <td className="px-4 py-3 font-semibold text-violet-700">{a}</td>
                    <td className="px-4 py-3 text-slate-600">{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ: native <details> keeps answers in the HTML for crawlers */}
        <section className="mx-auto max-w-3xl px-5 py-12" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-center text-3xl font-black">YouTube to Shorts: Frequently Asked Questions</h2>
          <div className="mt-8 space-y-3">
            {FAQS.map((f, i) => (
              <details key={f.question} open={i === 0} className="rounded-2xl border border-violet-100 bg-white px-6 py-4">
                <summary className="cursor-pointer list-none font-bold marker:hidden">{f.question}</summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{f.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-4xl px-5 pb-12" aria-labelledby="cta-title">
          <div className="rounded-[28px] bg-gradient-to-br from-[#100747] via-[#211078] to-[#4400b9] px-6 py-12 text-center text-white">
            <h2 id="cta-title" className="text-3xl font-black">Ready to Turn Your YouTube Video into Shorts?</h2>
            <p className="mx-auto mt-3 max-w-xl text-violet-100">
              Upload your video, let the AI pick the highlights and export Shorts in minutes. Free forever, no watermark.
            </p>
            <div className="mt-7"><StartButton label="Start Free" className="!bg-white !bg-none !text-violet-700" /></div>
          </div>
        </section>

        {/* Internal links */}
        {RELATED.length > 0 && (
          <nav aria-label="Related tools" className="mx-auto max-w-4xl px-5 pb-16">
            <h2 className="text-xl font-black">More Free Video Tools</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {RELATED.map((p) => (
                <li key={p.href}>
                  <Link href={p.href} className="block rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm font-semibold text-violet-700 hover:border-violet-300">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>

      <footer className="bg-[#100b35] py-8 text-center text-xs text-violet-300">
        <p>© {BRAND.year} {BRAND.name} · {BRAND.domain}. All rights reserved.</p>
        <p className="mt-2 space-x-4">
          <Link href="/about" className="hover:text-white">About</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/contact" className="hover:text-white">Contact</Link>
        </p>
      </footer>
    </div>
  );
}