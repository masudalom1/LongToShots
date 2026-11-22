import { SITE } from "./site";

export default function manifest() {
  return {
    name: `${SITE.name} – ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaff",
    theme_color: SITE.themeColor,
    categories: ["multimedia", "productivity", "utilities"],
    lang: SITE.language,
  };
}