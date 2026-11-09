import site from "../content/site.json";
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// CAN-SPAM footer for VibeRescue newsletter emails. No email address. Unsubscribe is a link in the message.
export function newsletterFooterHtml() {
  return `<p>${(site.newsletter.emailFooter || []).map(esc).join("<br/>")}</p>`;
}
