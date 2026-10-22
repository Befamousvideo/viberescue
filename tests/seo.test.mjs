import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { metaDesc, organizationWebsiteGraph, faqPage, buildSitemap, buildRobots, pageMeta, jsonLdHtml } from "../lib/seo.mjs";
import { buildLlmsText } from "../lib/llms.mjs";

const site = JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8"));

test("meta descriptions stay within 160 characters without rewriting short copy", () => {
  assert.equal(metaDesc("Short summary."), "Short summary.");
  const long = site.pages.find(p => p.summary.length > 160).summary;
  const clipped = metaDesc(long);
  assert.ok(clipped.length <= 160);
  assert.ok(clipped.endsWith("\u2026"));
  assert.ok(long.startsWith(clipped.slice(0, 40)));
});

test("json-ld is organization and website, with FAQ only for a real FAQ", () => {
  const graph = organizationWebsiteGraph(site);
  const types = graph["@graph"].map(n => n["@type"]);
  assert.deepEqual(types, ["Organization", "WebSite"]);
  assert.equal(graph["@graph"][0].name, site.name);
  assert.equal(graph["@graph"][0].parentOrganization.name, "StorenTech");
  assert.equal(faqPage(undefined), null);
  assert.equal(faqPage([]), null);
  const faq = faqPage(site.home.faq);
  assert.equal(faq["@type"], "FAQPage");
  assert.equal(faq.mainEntity.length, site.home.faq.length);
  assert.equal(faq.mainEntity[0].name, site.home.faq[0].q);
  assert.doesNotMatch(jsonLdHtml({ x: "<script>" }), /<script>/);
});

test("sitemap and robots use the production domain", () => {
  const entries = buildSitemap(site.domain, [
    { path: "/" },
    { path: "/checklist", lastModified: "2026-10-14" },
    { path: "/advertise" },
    { path: "/advertise/policy" },
    { path: "/advertise/thanks" },
    { path: "/api/subscribe" },
    { path: "/checklist", lastModified: "2026-10-14" },
  ]);
  assert.deepEqual(entries.map(e => e.url), [
    `https://${site.domain}/`,
    `https://${site.domain}/checklist`,
    `https://${site.domain}/advertise`,
    `https://${site.domain}/advertise/policy`,
  ]);
  const robots = buildRobots(site.domain);
  assert.equal(robots.sitemap, `https://${site.domain}/sitemap.xml`);
  assert.ok(robots.rules[0].disallow.includes("/api/"));
});

test("page metadata includes canonical, open graph, and twitter", () => {
  const meta = pageMeta({ title: "Advertise", description: "Advertise on VibeRescue.", path: "/advertise", siteName: site.name });
  assert.equal(meta.title, "Advertise");
  assert.equal(meta.alternates.canonical, "/advertise");
  assert.equal(meta.openGraph.title, `Advertise | ${site.name}`);
  assert.equal(meta.openGraph.url, "/advertise");
  assert.equal(meta.openGraph.description, "Advertise on VibeRescue.");
  assert.equal(meta.twitter.card, "summary");
  assert.equal(meta.twitter.title, meta.openGraph.title);
  assert.equal(meta.twitter.description, meta.description);
  const hidden = pageMeta({ title: "Thanks", description: "Thanks.", path: "/advertise/thanks", siteName: site.name, index: false });
  assert.deepEqual(hidden.robots, { index: false });
});

test("llms.txt summarizes existing copy and adds no contact details or new metrics", () => {
  const text = buildLlmsText(site);
  assert.match(text, new RegExp(`# ${site.name}`));
  assert.match(text, new RegExp(site.description.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(text, new RegExp(site.home.lead.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(text, /https:\/\/viberescue\.app\/fix-it/);
  assert.match(text, new RegExp(site.home.faq[0].q));
  assert.match(text, /does not sell scans, audits or security certifications/);
  assert.doesNotMatch(text, /@/);
  assert.doesNotMatch(text, /\d+(\.\d+)?%/);
  assert.doesNotMatch(text, /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/);
});
