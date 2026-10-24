"use client";

import { useEffect } from "react";
import { CONSENT_ACCEPTED, onConsentChange, syncConsentToGoogleTag } from "./consent";
import { loadGoogleAnalytics } from "./load-ga4";

/** Loads GA4 only after the user has accepted analytics cookies. */
export default function GoogleAnalytics() {
  useEffect(() => {
    syncConsentToGoogleTag();
    loadGoogleAnalytics();
    return onConsentChange((choice) => {
      if (choice === CONSENT_ACCEPTED) loadGoogleAnalytics();
    });
  }, []);

  return null;
}
