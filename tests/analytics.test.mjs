import test from "node:test";
import assert from "node:assert/strict";
import { gaMeasurementId, safeParams, trackEvent, trackGenerateLead, trackCtaClick, ctaAttrs } from "../lib/analytics.mjs";

const prev = process.env.NEXT_PUBLIC_GA_ID;

test.afterEach(() => {
  if (prev === undefined) delete process.env.NEXT_PUBLIC_GA_ID;
  else process.env.NEXT_PUBLIC_GA_ID = prev;
  delete globalThis.window;
});

test("measurement id is empty unless it is a GA4 id", () => {
  assert.equal(gaMeasurementId(undefined), "");
  assert.equal(gaMeasurementId(""), "");
  assert.equal(gaMeasurementId(" UA-123 "), "");
  assert.equal(gaMeasurementId("G-abc"), "");
  assert.equal(gaMeasurementId("G-ABC123"), "G-ABC123");
  assert.equal(gaMeasurementId(" G-ABC123 "), "G-ABC123");
});

test("safe params drop contact fields and contact-shaped values", () => {
  const out = safeParams({
    cta_label: "Get it fixed by StorenTech",
    cta_location: "hero",
    email: "a@b.com",
    name: "Ada",
    phone: "9495551212",
    problem: "users can see each other",
    form_name: "person@example.com",
  });
  assert.deepEqual(out, { cta_label: "Get it fixed by StorenTech", cta_location: "hero" });
});

test("events no-op without a measurement id and never forward raw contact fields", () => {
  process.env.NEXT_PUBLIC_GA_ID = "";
  /** @type {unknown[]} */
  const pushed = [];
  globalThis.window = { dataLayer: [], gtag: (...args) => pushed.push(args) };
  trackGenerateLead("fix_request");
  trackCtaClick("Get it fixed", "cta");
  assert.equal(pushed.length, 0);
  assert.deepEqual(ctaAttrs("Get it fixed", "cta"), {});
});

test("successful lead and cta events send only allow-listed params", () => {
  process.env.NEXT_PUBLIC_GA_ID = "G-TEST1234";
  /** @type {unknown[]} */
  const pushed = [];
  globalThis.window = { dataLayer: [], gtag: (...args) => pushed.push(args) };
  trackGenerateLead("newsletter");
  trackEvent("generate_lead", { form_name: "fix_request", email: "a@b.com", problem: "secret text" });
  trackCtaClick("Free 12-point checklist", "hero");
  trackCtaClick("email me a@b.com", "hero");
  assert.deepEqual(pushed, [
    ["event", "generate_lead", { form_name: "newsletter" }],
    ["event", "generate_lead", { form_name: "fix_request" }],
    ["event", "cta_click", { cta_label: "Free 12-point checklist", cta_location: "hero" }],
  ]);
  assert.deepEqual(ctaAttrs("Join", "cta"), { "data-cta": "true", "data-cta-label": "Join", "data-cta-location": "cta" });
});
