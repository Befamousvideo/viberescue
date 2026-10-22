import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createElement as h } from "react";
import { ImageResponse } from "next/og.js";

const site = JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8"));

const card = new ImageResponse(
  h("div", {
    style: {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      background: "#fafaf7",
      padding: "80px 88px",
    },
  },
    h("div", { style: { display: "flex", width: 128, height: 14, background: site.color, borderRadius: 7 } }),
    h("div", { style: { display: "flex", marginTop: 40, fontSize: 92, fontWeight: 700, color: site.color, lineHeight: 1.05 } }, site.name),
    h("div", { style: { display: "flex", marginTop: 28, fontSize: 42, color: "#1a1a1a", lineHeight: 1.3 } }, site.tagline),
  ),
  { width: 1200, height: 630 },
);
const png = Buffer.from(await card.arrayBuffer());
mkdirSync(new URL("../public", import.meta.url), { recursive: true });
writeFileSync(new URL("../public/og.png", import.meta.url), png);
console.log("wrote public/og.png", png.length);
