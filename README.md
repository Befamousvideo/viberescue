# VibeRescue

Next.js App Router site for viberescue.app. Content lives in content/site.json. Part of Agentic Business (StorenTech).

Live forms: newsletter (/api/subscribe) and "Get it fixed by StorenTech" (/fix-it → /api/fix-request → Blob fix-requests/ + Resend email). The paid-scan product was retired Oct 18, 2026; /scan redirects to /fix-it. Stripe/Turnstile keys not set yet.

## Analytics

`NEXT_PUBLIC_GA_ID` is the GA4 measurement ID (`G-` plus letters and numbers, for example `G-ABC123XYZ`). The Google tag is added only when this variable is set to a valid ID. Leave it unset and the tag does not load, events are not sent, and CTA markup is unchanged, so the site is safe to ship before the ID exists. Next.js inlines `NEXT_PUBLIC_` values at build time, so change the variable and rebuild before it takes effect.

Events never include names, email addresses, phone numbers, or message text. Page views send the path without the query string.

| Event | When it fires | Parameters |
| --- | --- | --- |
| `generate_lead` | Newsletter, fix-request, or ad-order form submits successfully | `form_name`: `newsletter`, `fix_request`, or `ad_order` |
| `cta_click` | A primary CTA is clicked | `cta_label`, `cta_location` (`nav`, `hero`, `hero-secondary`, `cta`, `sponsor`, `ad-policy`) |
