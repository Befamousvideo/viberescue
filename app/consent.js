/** Cookie / analytics consent helpers (client-only). */

export const CONSENT_STORAGE_KEY = "vr_consent";
export const CONSENT_COOKIE_NAME = "vr_consent";
const CONSENT_MAX_AGE_DAYS = 365;

export const CONSENT_ACCEPTED = "accepted";
export const CONSENT_REJECTED = "rejected";

/** @returns {'accepted' | 'rejected' | null} */
export function normalizeConsentValue(value) {
  if (value === CONSENT_ACCEPTED || value === CONSENT_REJECTED) return value;
  return null;
}

/** Parse document.cookie for our consent name (testable logic). */
export function readConsentFromCookieString(cookieHeader, cookieName = CONSENT_COOKIE_NAME) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === cookieName) {
      return normalizeConsentValue(decodeURIComponent(rest.join("=")));
    }
  }
  return null;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function writeCookie(value) {
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

/** @returns {'accepted' | 'rejected' | null} */
export function getStoredConsent() {
  if (!isBrowser()) return null;
  try {
    const fromStorage = normalizeConsentValue(window.localStorage.getItem(CONSENT_STORAGE_KEY));
    if (fromStorage) return fromStorage;
  } catch {
    /* private mode / blocked storage */
  }
  return readConsentFromCookieString(document.cookie);
}

/** Persist choice in localStorage and a first-party cookie. */
export function setStoredConsent(choice) {
  const value = normalizeConsentValue(choice);
  if (!value || !isBrowser()) return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    /* still set cookie */
  }
  writeCookie(value);
  applyGoogleConsentMode(value);
  window.dispatchEvent(new CustomEvent("vr-consent-change", { detail: { consent: value } }));
}

export function hasAnalyticsConsent() {
  return getStoredConsent() === CONSENT_ACCEPTED;
}

/** Google Consent Mode v2 — call after Accept or on load when already accepted. */
export function applyGoogleConsentMode(choice) {
  if (!isBrowser() || typeof window.gtag !== "function") return;
  if (choice === CONSENT_ACCEPTED) {
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  } else if (choice === CONSENT_REJECTED) {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

/** Run a callback only when analytics consent is granted (e.g. before loading GA4). */
export function runWithAnalyticsConsent(fn) {
  if (!hasAnalyticsConsent()) return false;
  fn();
  return true;
}

/** Subscribe to consent changes (returns unsubscribe). */
export function onConsentChange(listener) {
  if (!isBrowser()) return () => {};
  const handler = (e) => listener(e.detail?.consent ?? getStoredConsent());
  window.addEventListener("vr-consent-change", handler);
  return () => window.removeEventListener("vr-consent-change", handler);
}

/** Re-apply stored consent to gtag on first client load. */
export function syncConsentToGoogleTag() {
  const stored = getStoredConsent();
  if (stored) applyGoogleConsentMode(stored);
}
