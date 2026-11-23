
import HomeClient from "./HomeClient";
import { SITE } from "./site";
import { FAQS } from "./content";

/* Server component: renders structured data (JSON-LD) into the initial HTML for crawlers. */

const sameAs = Object.values(SITE.social).filter(Boolean);

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      logo: { "@type": "ImageObject", url: `${SITE.url}/icon-512.png` },
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: SITE.language,
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE.url}/#app`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      applicationCategory: "MultimediaApplication",
      applicationSubCategory: "Video editor",
      operatingSystem: "Any (web browser)",
      browserRequirements:
        "Requires a modern browser with JavaScript, Canvas and MediaRecorder support",
      inLanguage: SITE.language,
      isAccessibleForFree: true,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
      },
      featureList: [
        "Convert long videos into Shorts and Reels",
        "AI highlight detection",
        "Automatic captions with Whisper",
        "Smart 9:16 vertical cropping",
        "No watermark",
        "Unlimited clips",
        "Private in-browser processing",
        "Free voice changer with subtle voice modification",
        "Custom voice pitch and tone adjustment",
        "Original voice preservation",
        "Real-time voice preview",
        "Local audio processing without paid APIs",
      ],
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE.url}/#faq`,
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: f.answer,
        },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <HomeClient />
    </>
  );
}
