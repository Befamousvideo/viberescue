import site from "../../../content/site.json";
import Confirm from "./Confirm";
import { pageMeta } from "../../../lib/seo.mjs";
export const metadata = pageMeta({
  title: "Thanks for your order",
  description: "Thanks for your order. You'll get an email as soon as your ad is scheduled.",
  path: "/advertise/thanks",
  siteName: site.name,
  imageAlt: `${site.name} — ${site.tagline}`,
  index: false,
});
export default function Thanks() { return (<article><h1>Thank you!</h1><Confirm /></article>); }
