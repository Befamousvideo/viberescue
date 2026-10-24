import { GA_MEASUREMENT_ID } from "./ga-config";
import { CONSENT_ACCEPTED, applyGoogleConsentMode, hasAnalyticsConsent } from "./consent";

let loadStarted = false;
let loadFinished = false;

/** Inject gtag.js and configure GA4 — only when analytics consent is granted. */
export function loadGoogleAnalytics() {
  if (!hasAnalyticsConsent()) return;
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (loadFinished || loadStarted) return;

  const measurementId = GA_MEASUREMENT_ID;
  if (!measurementId) return;

  loadStarted = true;

  const existing = document.querySelector('script[data-vr-ga4="true"]');
  if (existing) {
    loadFinished = true;
    loadStarted = false;
    return;
  }

  applyGoogleConsentMode(CONSENT_ACCEPTED);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.vrGa4 = "true";
  script.onload = () => {
    if (typeof window.gtag !== "function") return;
    applyGoogleConsentMode(CONSENT_ACCEPTED);
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
    loadFinished = true;
    loadStarted = false;
  };
  script.onerror = () => {
    loadStarted = false;
  };
  document.head.appendChild(script);
}
