// @ts-check

/**
 * Plain-text site summary for agents. Uses existing copy only.
 * @param {any} site
 */
export function buildLlmsText(site) {
  const origin = `https://${site.domain}`;
  /** @type {string[]} */
  const pages = [];
  for (const p of site.pages) pages.push(`- [${p.title}](${origin}${p.path}): ${p.summary}`);
  /** @type {string[]} */
  const about = [];
  for (const p of site.static) about.push(`- [${p.title}](${origin}${p.path}): ${p.summary}`);
  /** @type {string[]} */
  const faq = [];
  for (const f of site.home.faq) faq.push(`### ${f.q}`, f.a, "");
  const lines = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    site.home.h1,
    "",
    site.home.lead,
    "",
    site.footer,
    "",
    "## Key pages",
    ...pages,
    "",
    "## Services",
    `- [${site.mainCta.button}](${origin}/fix-it): Describe a problem in your AI-built app; a StorenTech engineer reviews it and replies with a fixed quote. Any work is quoted and agreed separately under StorenTech AI's standard terms. VibeRescue does not sell scans, audits or security certifications.`,
    "",
    "## Newsletter",
    `- [${site.newsletter.title}](${origin}/newsletter): ${site.newsletter.blurb}`,
    "",
    "## Advertise",
    `- [Advertise on ${site.name}](${origin}/advertise): ${site.sponsorSlot}`,
    "",
    "## About",
    ...about,
    "",
    "## FAQ",
    ...faq,
  ];
  return lines.join("\n").replace(/\n+$/, "\n");
}
