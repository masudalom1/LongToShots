import Link from "next/link";
import { SITE } from "../site";

const PATH = "/about";
const URL = `${SITE.url}${PATH}`;
const TITLE = "About LongToShorts – Free, Private AI Shorts & Reels Maker";
const DESC =
  "LongToShorts is a free long video to Shorts and Reels converter that runs in your browser. Learn how our AI highlight detection, auto captions and private on-device processing work.";

export const metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: PATH },
  openGraph: {
    type: "website",
    url: URL,
    siteName: SITE.name,
    title: TITLE,
    description: DESC,
    locale: SITE.locale,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${URL}#webpage`,
      url: URL,
      name: TITLE,
      description: DESC,
      inLanguage: SITE.language,
      isPartOf: { "@id": `${SITE.url}/#website` },
      about: { "@id": `${SITE.url}/#organization` },
      breadcrumb: { "@id": `${URL}#breadcrumb` },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "About", item: URL },
      ],
    },
  ],
};

const PRINCIPLES = [
  { title: "Free, with no catch", text: "No subscription, no watermark and no clip limits. Exports are clean files that belong to you." },
  { title: "Private by design", text: "Your video is processed on your own device. It is not uploaded to our servers, so there is nothing for us to store, sell or leak." },
  { title: "Open-source AI", text: "Captions use the open-source Whisper speech model, run locally in your browser. There is no paid AI API behind the tool." },
  { title: "Made for creators", text: "Built for YouTube Shorts, Instagram Reels, Facebook Reels and WhatsApp Status, with Indian languages like Hindi, Bengali, Tamil and Telugu supported." },
];

const HOW = [
  ["Upload", "Add a long video such as a podcast, lecture, vlog or interview. It stays on your device."],
  ["Detect highlights", "The app analyses loudness, speech activity and energy to pick the strongest, non-overlapping moments."],
  ["Refine", "Trim the start and end, reframe to 9:16, style the captions and add copyright-free background music."],
  ["Export", "Download watermark-free MP4 clips one by one or all at once."],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fbfaff] text-[#10102d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <header className="border-b border-violet-100 bg-white">
        <div className="mx-auto flex h-[68px] max-w-[900px] items-center justify-between px-5 md:px-10">
          <Link href="/" className="text-2xl font-black tracking-tight text-[#11112d]" aria-label={`${SITE.name} home`}>
            LongTo<span className="text-violet-600">Shorts</span>
          </Link>
          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-[#4b0cff] to-[#9b18f8] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-300/50 transition hover:scale-105"
          >
            Start
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-5 py-14 md:px-10 md:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <ol className="flex gap-2">
            <li><Link href="/" className="hover:text-violet-700">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-slate-700">About</li>
          </ol>
        </nav>

        <article>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-[#11112f] md:text-5xl">
            About <span className="text-violet-600">{SITE.name}</span>: the free, private way to turn long videos into Shorts
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            <strong>{SITE.name}</strong> ({SITE.domain}) is a free tool that converts long videos into YouTube Shorts, Instagram Reels and other short clips. It finds the most engaging moments with AI, reframes them to vertical video, adds automatic captions and exports clean MP4 files with no watermark.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4b0cff] to-[#9b18f8] px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-violet-300/50 transition hover:scale-105"
          >
            Start
          </Link>

          <section aria-labelledby="mission" className="mt-14">
            <h2 id="mission" className="text-2xl font-black text-[#11112f] md:text-3xl">Our mission</h2>
            <p className="mt-4 leading-8 text-slate-700">
              Short-form video is now one of the best ways to reach an audience, but most clipping tools charge monthly fees, add watermarks or require you to upload private footage to someone else&apos;s servers. We built {SITE.name} so that any creator, student, teacher or small business can repurpose a long video into many Shorts without paying and without giving up control of their content.
            </p>
          </section>

          <section aria-labelledby="principles" className="mt-14">
            <h2 id="principles" className="text-2xl font-black text-[#11112f] md:text-3xl">What we stand for</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="rounded-3xl border border-violet-100 bg-white p-6">
                  <h3 className="text-lg font-extrabold text-[#171535]">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{p.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="how" className="mt-14">
            <h2 id="how" className="text-2xl font-black text-[#11112f] md:text-3xl">How {SITE.name} works</h2>
            <ol className="mt-6 space-y-4">
              {HOW.map(([t, d], i) => (
                <li key={t} className="flex gap-4 rounded-2xl border border-violet-100 bg-white p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-[#171535]">{t}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="tech" className="mt-14">
            <h2 id="tech" className="text-2xl font-black text-[#11112f] md:text-3xl">The technology behind it</h2>
            <p className="mt-4 leading-8 text-slate-700">
              Everything runs inside your browser using open web technology: the Web Audio API to analyse sound, Canvas to crop and caption frames, MediaRecorder to export video, and IndexedDB to save your projects locally. Captions are produced by the open-source Whisper model through transformers.js; the model is downloaded once from Hugging Face and then cached. The built-in background music is generated by the app itself, so it carries no copyright claims.
            </p>
          </section>

          <section aria-labelledby="privacy" className="mt-14">
            <h2 id="privacy" className="text-2xl font-black text-[#11112f] md:text-3xl">Your videos stay yours</h2>
            <p className="mt-4 leading-8 text-slate-700">
              Videos are processed on your device and saved only in your browser&apos;s private storage so you can reopen projects later. You can delete any project from your device at any time. If you upload your own music, please only use tracks you own or have a licence to use. Read our{" "}
              <Link href="/privacy" className="font-semibold text-violet-700 underline">Privacy Policy</Link> for details.
            </p>
          </section>

          <section aria-labelledby="who" className="mt-14">
            <h2 id="who" className="text-2xl font-black text-[#11112f] md:text-3xl">Who uses {SITE.name}?</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
              <li>YouTubers repurposing long videos into Shorts</li>
              <li>Podcasters and interviewers sharing teaser clips</li>
              <li>Teachers and coaches cutting lectures into revision clips</li>
              <li>Streamers and gamers saving their best moments</li>
              <li>Small businesses and agencies creating Reels on a budget</li>
            </ul>
          </section>

          <section aria-labelledby="contact" className="mt-14">
            <h2 id="contact" className="text-2xl font-black text-[#11112f] md:text-3xl">Contact</h2>
            <p className="mt-4 text-slate-700">
              Questions or feedback? Visit our{" "}
              <Link href="/contact" className="font-semibold text-violet-700 underline">Contact page</Link>
              {SITE.email ? (
                <>
                  {" "}or email{" "}
                  <a className="font-semibold text-violet-700 underline" href={`mailto:${SITE.email}`}>
                    {SITE.email}
                  </a>
                </>
              ) : null}
              .
            </p>
          </section>

          <div className="mt-16 rounded-[28px] bg-gradient-to-br from-[#100747] via-[#211078] to-[#4400b9] p-8 text-center text-white md:p-12">
            <h2 className="text-2xl font-black md:text-3xl">Turn your first long video into Shorts</h2>
            <p className="mx-auto mt-3 max-w-xl text-violet-100">Free, unlimited and no watermark. No signup needed.</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-3.5 text-sm font-extrabold text-white shadow-xl transition hover:scale-105"
            >
              Start
            </Link>
          </div>
        </article>
      </main>

      <footer className="border-t border-violet-100 bg-white py-8 text-center text-sm text-slate-500">
        © {SITE.year} {SITE.name} · {SITE.domain} ·{" "}
        <Link href="/" className="font-semibold text-violet-700 hover:underline">Home</Link> ·{" "}
        <Link href="/privacy" className="font-semibold text-violet-700 hover:underline">Privacy</Link> ·{" "}
        <Link href="/terms" className="font-semibold text-violet-700 hover:underline">Terms</Link> ·{" "}
        <Link href="/contact" className="font-semibold text-violet-700 hover:underline">Contact</Link>
      </footer>
    </div>
  );
}