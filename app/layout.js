import "./globals.css";
import Script from "next/script";
import site from "../content/site.json";
import { ctaAttrs, gaMeasurementId } from "../lib/analytics.mjs";
import { jsonLdHtml, organizationWebsiteGraph, shareImage } from "../lib/seo.mjs";
import AnalyticsClicks from "./AnalyticsClicks";
const homeTitle = `${site.name} — ${site.tagline}`;
const image = shareImage(homeTitle);
export const metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: { default: homeTitle, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { canonical: "/", types: { "application/rss+xml": "/rss.xml", "text/plain": "/llms.txt" } },
  openGraph: { siteName: site.name, type: "website", locale: "en_US", url: "/", title: homeTitle, description: site.description, images: [image] },
  twitter: { card: "summary_large_image", title: homeTitle, description: site.description, images: [image] },
};
export default function RootLayout({ children }) {
  const gaId = gaMeasurementId();
  const graph = organizationWebsiteGraph(site);
  return (
    <html lang="en" style={{ "--accent": site.color }}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(graph) }} />
        {gaId ? <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            window.gtag = window.gtag || function gtag(){window.dataLayer.push(arguments);};
            window.gtag('js', new Date());
            window.gtag('config', '${gaId}', { page_location: window.location.origin + window.location.pathname });
          `}</Script>
          <AnalyticsClicks />
        </> : null}
        <header className="hdr"><div className="wrap row">
          <a href="/" className="logo">{site.name}</a>
          <nav>{site.nav.map(n => <a key={n.href} href={n.href} {...(n.href === site.mainCta.href ? ctaAttrs(n.label, "nav") : {})}>{n.label}</a>)}</nav>
        </div></header>
        <main className="wrap">{children}</main>
        <footer className="ftr"><div className="wrap">
          <p>{site.footer}</p>
          <p><a href="/about">About</a> · <a href="/methodology">Methodology</a> · <a href="/advertise">Advertise</a> · <a href="/newsletter">Newsletter</a> · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a> · <a href="/rss.xml">RSS</a></p>
          <p className="muted">© 2026 {site.name}, a StorenTech company. Preview build — content under review.</p>
        </div></footer>
      </body>
    </html>
  );
}
