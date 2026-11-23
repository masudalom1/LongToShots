import Link from "next/link";
import { SITE } from "../site";
import { LANDING_PAGES } from "./pages";

/* Shared layout for SEO landing pages. Markup and classes mirror app/about/page.jsx so the design stays identical. */

export function landingMetadata({ path, title, description }) {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: `${SITE.url}${path}`,
      siteName: SITE.name,
      title,
      description,
      locale: SITE.locale,
      images: ["/opengraph-image"], // page-level openGraph drops the inherited root image
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}

const H2 = "text-2xl font-black text-[#11112f] md:text-3xl";
const CTA = "rounded-full bg-gradient-to-r from-[#4b0cff] to-[#9b18f8] text-white shadow-lg shadow-violet-300/50 transition hover:scale-105";

export default function LandingPage({ path, title, description, crumb, h1, intro, cards, steps, sections = [], faqs, cta }) {
  const url = `${SITE.url}${path}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: SITE.language,
        isPartOf: { "@id": `${SITE.url}/#website` },
        about: { "@id": `${SITE.url}/#app` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: crumb, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };
  const related = LANDING_PAGES.filter((p) => p.path !== path);

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
          <Link href="/#upload" className={`px-6 py-2.5 text-sm font-bold ${CTA}`}>
            Start
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-5 py-14 md:px-10 md:py-20">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
          <ol className="flex gap-2">
            <li><Link href="/" className="hover:text-violet-700">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-slate-700">{crumb}</li>
          </ol>
        </nav>

        <article>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-[#11112f] md:text-5xl">{h1}</h1>
          <p className="mt-6 text-lg leading-8 text-slate-700">{intro}</p>
          <Link href="/#upload" className={`mt-8 inline-flex items-center gap-2 px-8 py-3.5 text-sm font-extrabold ${CTA}`}>
            {cta}
          </Link>

          <section aria-labelledby="features" className="mt-14">
            <h2 id="features" className={H2}>{cards.heading}</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {cards.items.map((p) => (
                <div key={p.title} className="rounded-3xl border border-violet-100 bg-white p-6">
                  <h3 className="text-lg font-extrabold text-[#171535]">{p.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{p.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="how" className="mt-14">
            <h2 id="how" className={H2}>{steps.heading}</h2>
            <ol className="mt-6 space-y-4">
              {steps.items.map(([t, d], i) => (
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

          {sections.map((s, i) => (
            <section key={s.heading} aria-labelledby={`s${i}`} className="mt-14">
              <h2 id={`s${i}`} className={H2}>{s.heading}</h2>
              {s.text && <p className="mt-4 leading-8 text-slate-700">{s.text}</p>}
              {s.list && (
                <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
                  {s.list.map((li) => <li key={li}>{li}</li>)}
                </ul>
              )}
            </section>
          ))}

          <section aria-labelledby="faq" className="mt-14">
            <h2 id="faq" className={H2}>Frequently asked questions</h2>
            <div className="mt-6 space-y-4">
              {faqs.map((f) => (
                <div key={f.question} className="rounded-2xl border border-violet-100 bg-white p-5">
                  <h3 className="font-extrabold text-[#171535]">{f.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{f.answer}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="related" className="mt-14">
            <h2 id="related" className={H2}>More free tools</h2>
            <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-slate-700">
              <li><Link href="/" className="font-semibold text-violet-700 underline">AI Long Video to Shorts Converter</Link></li>
              {related.map((p) => (
                <li key={p.path}><Link href={p.path} className="font-semibold text-violet-700 underline">{p.label}</Link></li>
              ))}
            </ul>
          </section>

          <div className="mt-16 rounded-[28px] bg-gradient-to-br from-[#100747] via-[#211078] to-[#4400b9] p-8 text-center text-white md:p-12">
            <h2 className="text-2xl font-black md:text-3xl">{cta}</h2>
            <p className="mx-auto mt-3 max-w-xl text-violet-100">Free, unlimited and no watermark. No signup needed.</p>
            <Link
              href="/#upload"
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
        <Link href="/terms" className="font-semibold text-violet-700 hover:underline">Terms</Link> ·{" "}
        <Link href="/contact" className="font-semibold text-violet-700 hover:underline">Contact</Link>
      </footer>
    </div>
  );
}
