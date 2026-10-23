// @ts-check
/** GA4 measurement IDs look like G-XXXXXXXX. Anything else is ignored. */
const GA_ID_RE = /^G-[A-Z0-9]+$/;
const LEAD_FORMS = ["newsletter", "fix_request", "ad_order"];
const BLOCKED_KEYS = /^(name|email|e-mail|phone|tel|message|problem|notes|address|card|payment|cvv|ssn)$/i;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/;

/**
 * @param {string | undefined} [value]
 * @returns {string} measurement id, or "" when analytics must no-op
 */
export function gaMeasurementId(value = process.env.NEXT_PUBLIC_GA_ID) {
  const id = String(value ?? "").trim();
  return GA_ID_RE.test(id) ? id : "";
}

/**
 * Drop names, emails, phones, message text, and anything that looks like them.
 * @param {Record<string, unknown> | null | undefined} params
 * @returns {Record<string, string | number | boolean>}
 */
export function safeParams(params) {
  /** @type {Record<string, string | number | boolean>} */
  const out = {};
  if (!params || typeof params !== "object") return out;
  for (const [key, value] of Object.entries(params)) {
    if (BLOCKED_KEYS.test(key)) continue;
    if (typeof value === "string") {
      const trimmed = value.trim().slice(0, 120);
      if (!trimmed || EMAIL_RE.test(trimmed) || PHONE_RE.test(trimmed)) continue;
      out[key] = trimmed;
    } else if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    else if (typeof value === "boolean") out[key] = value;
  }
  return out;
}

/** Queue a gtag call even if the Google script has not finished loading. */
export function installGtagStub() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
}

/**
 * @param {"generate_lead" | "cta_click"} name
 * @param {Record<string, unknown>} params
 */
export function trackEvent(name, params) {
  if (!gaMeasurementId()) return;
  const safe = safeParams(params);
  /** @type {Record<string, string | number | boolean>} */
  let payload;
  if (name === "generate_lead") {
    if (!LEAD_FORMS.includes(String(safe.form_name || ""))) return;
    payload = { form_name: String(safe.form_name) };
  } else if (name === "cta_click") {
    if (typeof safe.cta_label !== "string" || typeof safe.cta_location !== "string") return;
    payload = { cta_label: safe.cta_label, cta_location: safe.cta_location };
  } else return;
  if (typeof window === "undefined") return;
  installGtagStub();
  window.gtag("event", name, payload);
}

/** @param {"newsletter" | "fix_request" | "ad_order"} formName */
export function trackGenerateLead(formName) {
  trackEvent("generate_lead", { form_name: formName });
}

/** @param {string} ctaLabel @param {string} ctaLocation */
export function trackCtaClick(ctaLabel, ctaLocation) {
  trackEvent("cta_click", { cta_label: ctaLabel, cta_location: ctaLocation });
}

/**
 * Data attributes for a primary CTA. Omitted entirely when analytics is off,
 * so a build without NEXT_PUBLIC_GA_ID does not add tracking markup.
 * @param {string} label
 * @param {string} location
 */
export function ctaAttrs(label, location) {
  if (!gaMeasurementId()) return {};
  return { "data-cta": "true", "data-cta-label": label, "data-cta-location": location };
}
