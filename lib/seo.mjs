// @ts-check

/** Same truncation the pattern pages already use for meta descriptions. @param {string | null | undefined} s */
export function metaDesc(s) {
  if (!s || s.length <= 160) return s;
  const c = s.slice(0, 157);
  return c.slice(0, c.lastIndexOf(" ")).replace(/[,;:\u2014\u2013-]+$/, "") + "\u2026";
}

/**
 * @param {unknown} data
 */
export function jsonLdHtml(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/**
 * @param {{ name: string, domain: string, description: string }} site
 */
export function organizationWebsiteGraph(site) {
  const url = `https://${site.domain}/`;
  const orgId = `${url}#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: site.name,
        url,
        description: site.description,
        parentOrganization: { "@type": "Organization", name: "StorenTech", url: "https://www.storentechai.com/" },
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        name: site.name,
        url,
        description: site.description,
        inLanguage: "en",
        publisher: { "@id": orgId },
      },
    ],
  };
}

/**
 * FAQPage only when the page actually has questions and answers.
 * @param {Array<{ q?: string, a?: string }> | null | undefined} faq
 */
export function faqPage(faq) {
  if (!Array.isArray(faq)) return null;
  const mainEntity = faq.filter(f => f && f.q && f.a).map(f => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  }));
  if (!mainEntity.length) return null;
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity };
}

/**
 * @param {string} domain
 * @param {Array<{ path: string, lastModified?: string }>} entries
 */
export function buildSitemap(domain, entries) {
  const seen = new Set();
  /** @type {Array<{ url: string, lastModified?: string }>} */
  const out = [];
  for (const entry of entries) {
    if (!entry?.path?.startsWith("/")) continue;
    if (entry.path.startsWith("/api/") || entry.path === "/advertise/thanks") continue;
    const url = entry.path === "/" ? `https://${domain}/` : `https://${domain}${entry.path.split("?")[0]}`;
    if (seen.has(url)) continue;
    seen.add(url);
    /** @type {{ url: string, lastModified?: string }} */
    const item = { url };
    if (entry.lastModified) item.lastModified = entry.lastModified;
    out.push(item);
  }
  return out;
}

/** @param {string} domain */
export function buildRobots(domain) {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/advertise/thanks"] }],
    sitemap: `https://${domain}/sitemap.xml`,
  };
}

/** Default 1200×630 share image. Alt describes the words drawn on the image. @param {string} alt */
export function shareImage(alt) {
  return { url: "/og.png", width: 1200, height: 630, alt };
}

/**
 * Canonical, title, description, Open Graph, and Twitter for one page.
 * `title` is the short title; the `| Site` suffix matches the root title template.
 * @param {{ title: string, description: string, path: string, siteName: string, imageAlt: string, type?: string, index?: boolean }} opts
 */
export function pageMeta({ title, description, path, siteName, imageAlt, type = "website", index = true }) {
  const social = title.endsWith(` | ${siteName}`) ? title : `${title} | ${siteName}`;
  const image = shareImage(imageAlt);
  /** @type {Record<string, unknown>} */
  const meta = {
    title,
    description,
    alternates: { canonical: path, types: { "application/rss+xml": "/rss.xml", "text/plain": "/llms.txt" } },
    openGraph: { title: social, description, url: path, type, siteName, locale: "en_US", images: [image] },
    twitter: { card: "summary_large_image", title: social, description, images: [image] },
  };
  if (!index) meta.robots = { index: false };
  return meta;
}
