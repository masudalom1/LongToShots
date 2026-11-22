import { SITE } from "./site";
import { LANDING_PAGES } from "./_landing/pages";

export default function sitemap() {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/#features`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/#how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/#faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...LANDING_PAGES.map((p) => ({ url: `${SITE.url}${p.path}`, lastModified: now, changeFrequency: "monthly", priority: 0.8 })),
    ...["/about", "/contact", "/privacy", "/terms"].map((p) => ({ url: `${SITE.url}${p}`, lastModified: now, changeFrequency: "yearly", priority: 0.3 })),
  ];
}