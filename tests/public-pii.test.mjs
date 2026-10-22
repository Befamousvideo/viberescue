import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const REAL = /vincent@storentech\.com|ads@agentsformainstreet\.com|requests@viberescue\.app|sk_live_[A-Za-z0-9]|pk_live_[A-Za-z0-9]/;
const PUBLIC = [
  "content/site.json",
  "app/page.js",
  "app/layout.js",
  "app/components.js",
  "app/nav.js",
  "app/network.js",
  "app/HouseAd.js",
  "app/FixRequestForm.js",
  "app/NewsletterForm.js",
  "app/AdOrderForm.js",
  "app/AnalyticsClicks.js",
  "app/[...slug]/page.js",
  "app/advertise/page.js",
  "app/advertise/policy/page.js",
  "app/advertise/thanks/page.js",
  "app/advertise/thanks/Confirm.js",
  "app/globals.css",
  "lib/llms.mjs",
  "lib/seo.mjs",
  "lib/analytics.mjs",
];

test("public pages and client code do not contain real contact or payment secrets", () => {
  for (const file of PUBLIC) {
    const src = readFileSync(new URL("../" + file, import.meta.url), "utf8");
    assert.doesNotMatch(src, REAL, file);
  }
});

test("form fields use example placeholders only", () => {
  const src = ["app/FixRequestForm.js", "app/NewsletterForm.js", "app/AdOrderForm.js"]
    .map(f => readFileSync(new URL("../" + f, import.meta.url), "utf8")).join("\n");
  const emails = src.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  assert.deepEqual([...new Set(emails)], ["you@example.com"]);
  assert.match(src, /\(949\) 555-1234/);
});
