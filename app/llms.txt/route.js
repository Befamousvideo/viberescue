import site from "../../content/site.json";
import { buildLlmsText } from "../../lib/llms.mjs";
export const dynamic = "force-static";
export function GET() {
  return new Response(buildLlmsText(site), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
