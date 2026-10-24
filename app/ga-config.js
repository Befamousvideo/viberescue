/** Public GA4 measurement ID (safe in client bundles). */
export const GA_MEASUREMENT_ID =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_GA_ID?.trim()) ||
  "G-09T6KB9BX9";
