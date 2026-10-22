import site from "../content/site.json";
import { Newsletter, Cta, Sponsor } from "./components";
import { ctaAttrs } from "../lib/analytics.mjs";
import { faqPage, jsonLdHtml } from "../lib/seo.mjs";
export default function Home() {
  const h = site.home;
  const sections = h.sections.map(s => ({ ...s, items: site.pages.filter(p => p.group === s.group) }));
  const faq = faqPage(h.faq);
  return (<>
    {faq ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(faq) }} /> : null}
    <section className="hero"><h1>{h.h1}</h1><p className="lead">{h.lead}</p>
      <div className="row gap">{h.buttons.map(b => <a key={b.href} className={b.secondary ? "btn ghost" : "btn"} href={b.href} {...ctaAttrs(b.label, b.secondary ? "hero-secondary" : "hero")}>{b.label}</a>)}</div></section>
    {sections.map(s => (<section key={s.group}><h2>{s.title}</h2>
      <div className="grid">{s.items.map(p => (<a key={p.path} className="card tile" href={p.path}>
        {p.label && <span className="tag">{p.label}</span>}<h3>{p.title}</h3><p>{p.summary}</p></a>))}</div></section>))}
    <Sponsor />
    <Newsletter />
    <section><h2>FAQ</h2>{h.faq.map(f => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</section>
    <Cta cta={site.mainCta} />
  </>);
}
