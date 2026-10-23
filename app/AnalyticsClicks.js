"use client";
import { useEffect } from "react";
import { trackCtaClick } from "../lib/analytics.mjs";

export default function AnalyticsClicks() {
  useEffect(() => {
    /** @param {MouseEvent} event */
    function onClick(event) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("[data-cta]");
      if (!(el instanceof Element)) return;
      trackCtaClick(el.getAttribute("data-cta-label") || "", el.getAttribute("data-cta-location") || "");
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
