import Link from "next/link";
import { SITE } from "../site";
import ContactForm from "./ContactForm";

const PATH = "/contact";
const URL = `${SITE.url}${PATH}`;
const TITLE = "Contact LongToShorts – Support, Feedback & Business Enquiries";
const DESC =
  "Get in touch with the LongToShorts team for help with the free long video to Shorts converter, feature requests, bug reports or partnership enquiries.";

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
      "@type": "ContactPage",
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
        { "@type": "ListItem", position: 2, name: "Contact", item: URL },
      ],
    },
  ],
};

const TOPICS = [
  { title: "Help & troubleshooting", text: "A video won't open, an export fails or captions look wrong? Tell us your browser, device and video format." },
  { title: "Feature requests", text: "Missing a caption style, language, aspect ratio or music option? We love ideas from creators." },
  { title: "Bug reports", text: "Include the steps to reproduce the problem, plus your browser and version, so we can fix it faster." },
  { title: "Business & partnerships", text: "Collaborations, press and other enquiries are welcome." },
];

const QUICK = [
  ["Is it really free?", "Yes. No subscription, no watermark and no clip limits."],
  ["Are my videos uploaded?", "No. Processing happens on your device."],
  ["Exports are slow?", "Clips render in real time, so keep the tab open and visible."],
];

export default function ContactPage() {
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
            <li aria-current="page" className="font-semibold text-slate-700">Contact</li>
          </ol>
        </nav>

        <article>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-[#11112f] md:text-5xl">
            Contact <span className="text-violet-600">{SITE.name}</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">
            Have a question, a bug to report or an idea to make {SITE.name} better? Send us a message and we will get back to you as soon as we can.
          </p>

          <section aria-labelledby="topics" className="mt-12">
            <h2 id="topics" className="text-2xl font-black text-[#11112f]">How can we help?</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {TOPICS.map((t) => (
                <div key={t.title} className="rounded-3xl border border-violet-100 bg-white p-6">
                  <h3 className="text-lg font-extrabold text-[#171535]">{t.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{t.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="form" className="mt-14">
            <h2 id="form" className="text-2xl font-black text-[#11112f]">Send us a message</h2>
            <div className="mt-6 rounded-3xl border border-violet-100 bg-white p-6 md:p-8">
              <ContactForm email={SITE.email} />
            </div>
            {SITE.email && (
              <p className="mt-4 text-sm text-slate-600">
                Prefer email? Write to{" "}
                <a className="font-semibold text-violet-700 underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.
              </p>
            )}
          </section>

          <section aria-labelledby="quick" className="mt-14">
            <h2 id="quick" className="text-2xl font-black text-[#11112f]">Quick answers</h2>
            <dl className="mt-6 space-y-3">
              {QUICK.map(([q, a]) => (
                <div key={q} className="rounded-2xl border border-violet-100 bg-white p-5">
                  <dt className="font-extrabold text-[#171535]">{q}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-600">{a}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm text-slate-600">
              More answers are in our <Link href="/#faq" className="font-semibold text-violet-700 underline">FAQ</Link>.
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
        <Link href="/about" className="font-semibold text-violet-700 hover:underline">About</Link> ·{" "}
        <Link href="/privacy" className="font-semibold text-violet-700 hover:underline">Privacy</Link> ·{" "}
        <Link href="/terms" className="font-semibold text-violet-700 hover:underline">Terms</Link>
      </footer>
    </div>
  );
}