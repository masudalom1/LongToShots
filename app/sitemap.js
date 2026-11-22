import { SITE } from "./site";

export default function sitemap() {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/#features`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/#how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/#faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}