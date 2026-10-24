"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CONSENT_ACCEPTED,
  CONSENT_REJECTED,
  getStoredConsent,
  setStoredConsent,
  syncConsentToGoogleTag,
} from "./consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    syncConsentToGoogleTag();
    setVisible(getStoredConsent() === null);
  }, []);

  const choose = useCallback((choice) => {
    setStoredConsent(choice);
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="cookie-banner"
      role="region"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="cookie-banner__inner wrap">
        <p className="cookie-banner__text">
          We use optional analytics cookies to understand how the site is used. You can accept or
          reject analytics cookies.{" "}
          <a href="/privacy">Privacy policy</a>
        </p>
        <div className="cookie-banner__actions">
          <button
            type="button"
            className="cookie-banner__btn"
            onClick={() => choose(CONSENT_REJECTED)}
          >
            Reject
          </button>
          <button
            type="button"
            className="cookie-banner__btn"
            onClick={() => choose(CONSENT_ACCEPTED)}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
