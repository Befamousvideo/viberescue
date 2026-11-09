import site from "../../content/site.json";
export const dynamic = "force-static";
export function GET() {
  const t = `# ${site.name}\n\n> ${site.description}\n\n## Key pages\n` + site.pages.map(p => `- [${p.title}](https://${site.domain}${p.path}): ${p.summary}`).join("\n") + `\n\n## Services\n- [Get it fixed by StorenTech](https://${site.domain}/fix-it): Describe a problem in your AI-built app; a StorenTech engineer reviews it and replies with a fixed quote. Any work is quoted and agreed separately under StorenTech AI's standard terms. VibeRescue does not sell scans, audits or security certifications.` + `\n\n## About\n` + site.static.map(p => `- [${p.title}](https://${site.domain}${p.path})`).join("\n") + "\n";
  return new Response(t, { headers: { "content-type": "text/plain; charset=utf-8" } });
}
