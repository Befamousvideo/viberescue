import site from "../content/site.json";
import { allPages, isoDate, pageDateIso } from "./nav";
import { buildSitemap } from "../lib/seo.mjs";
export const dynamic = "force-static";
export default function sitemap() {
  return buildSitemap(site.domain, [
    { path: "/" },
    ...allPages().map(p => ({ path: p.path, lastModified: pageDateIso(p) })),
    { path: "/advertise", lastModified: isoDate(site.updated) },
    { path: "/advertise/policy", lastModified: isoDate(site.updated) },
  ]);
}
