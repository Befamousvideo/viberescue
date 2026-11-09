import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { resolveMx } from "dns/promises";
import { parsePhoneNumberFromString } from "libphonenumber-js";
export const runtime = "nodejs";
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const NOTIFY = "vincent@storentech.com";
const FROM = "VibeRescue <requests@viberescue.app>";
const STACKS = ["Lovable", "Bolt", "Cursor", "Replit", "v0", "Other"];
const DISPOSABLE = new Set(["mailinator.com","guerrillamail.com","guerrillamail.net","sharklasers.com","10minutemail.com","10minutemail.net","tempmail.com","temp-mail.org","temp-mail.io","yopmail.com","yopmail.net","trashmail.com","getnada.com","nada.email","dispostable.com","maildrop.cc","throwawaymail.com","fakeinbox.com","mailnesia.com","mintemail.com","emailondeck.com","mohmal.com","tempail.com","tempr.email","discard.email","spamgourmet.com","getairmail.com","moakt.com","burnermail.io","mailpoof.com","inboxkitten.com","1secmail.com","tempmailo.com","minuteinbox.com","mail.tm","emailfake.com","grr.la","guerrillamailblock.com","spam4.me","mytemp.email"]);
const MIN_FILL_MS = 3000;
async function domainReceivesMail(domain) {
  try { const mx = await Promise.race([resolveMx(domain), new Promise((_, r) => setTimeout(() => r(new Error("timeout")), 4000))]); return Array.isArray(mx) && mx.some(m => m.exchange && m.exchange !== "."); }
  catch (e) { return e && e.message === "timeout" ? true : false; } // fail open on slow DNS
}
async function turnstileOk(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: String(token) }); if (ip) body.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const j = await r.json(); return j.success === true;
  } catch { return false; }
}
const clean = (v, n) => String(v || "").replace(/[\r\n\t]+/g, " ").trim().slice(0, n);
const cleanText = (v, n) => String(v || "").replace(/\r\n?/g, "\n").replace(/\t/g, " ").trim().slice(0, n);
const esc = (s) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function normUrl(v) {
  let s = clean(v, 300); if (!s) return "";
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  try { const u = new URL(s); if (!["http:", "https:"].includes(u.protocol) || !u.hostname.includes(".")) return ""; return u.toString(); } catch { return ""; }
}
async function send(to, subject, html, replyTo) {
  const r = await fetch("https://api.resend.com/emails", { method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }) });
  if (!r.ok) console.error("resend email failed", r.status, await r.text().catch(() => ""));
  return r.ok;
}
export async function POST(req) {
  let b;
  try { b = await req.json(); } catch { return Response.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  if (!b || typeof b !== "object") return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  if (b.website) return Response.json({ ok: true }); // honeypot
  const elapsed = Number(b.elapsed);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return Response.json({ ok: false, error: "That was fast! Please take a moment to check your details and submit again." }, { status: 400 });
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim();
  if (!(await turnstileOk(b.turnstile, ip))) return Response.json({ ok: false, error: "Please complete the verification check and try again." }, { status: 400 });
  const rec = { name: clean(b.name, 120), email: clean(b.email, 254).toLowerCase(), phone: "", appUrl: normUrl(b.appUrl),
    stack: clean(b.stack, 20), problem: cleanText(b.problem, 3000), consent: b.consent === true };
  if (!rec.name) return Response.json({ ok: false, error: "Please enter your name." }, { status: 400 });
  if (!EMAIL.test(rec.email)) return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
  const dom = rec.email.split("@")[1];
  if (DISPOSABLE.has(dom)) return Response.json({ ok: false, error: "Please use a permanent email address, not a temporary one." }, { status: 400 });
  if (!(await domainReceivesMail(dom))) return Response.json({ ok: false, error: "That email domain doesn't seem to accept mail. Please check the address." }, { status: 400 });
  const ph = parsePhoneNumberFromString(clean(b.phone, 40), "US");
  if (!ph || !ph.isValid()) return Response.json({ ok: false, error: "Please enter a valid phone number." }, { status: 400 });
  rec.phone = ph.number;
  if (!rec.appUrl) return Response.json({ ok: false, error: "Please enter your app's URL (for example https://your-app.example.com)." }, { status: 400 });
  if (!STACKS.includes(rec.stack)) return Response.json({ ok: false, error: "Please choose what your app is built with." }, { status: 400 });
  if (rec.problem.length < 10) return Response.json({ ok: false, error: "Please describe the problem in a sentence or two." }, { status: 400 });
  if (!rec.consent) return Response.json({ ok: false, error: "Please check the box to confirm you can request work on this app and agree to be contacted." }, { status: 400 });
  const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`;
  const record = { id, ...rec, source: clean(b.source, 200), createdAt: new Date().toISOString(), ua: clean(req.headers.get("user-agent"), 200) };
  let stored = false;
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      await put(`fix-requests/${id}.json`, JSON.stringify(record), { access: "private", contentType: "application/json", addRandomSuffix: false });
      stored = true;
    }
  } catch (e) { console.error("fix request store error", e && e.message); }
  let notified = false;
  if (process.env.RESEND_API_KEY) {
    const rows = [["Name", rec.name], ["Email", rec.email], ["Phone", rec.phone], ["App URL", rec.appUrl], ["Built with", rec.stack], ["Problem", rec.problem], ["ID", id]]
      .map(([k, v]) => `<tr><td valign="top"><b>${k}</b></td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join("");
    try {
      notified = await send(NOTIFY, `New fix request: ${rec.appUrl} (${rec.stack})`, `<p>New "Get it fixed by StorenTech" request on viberescue.app:</p><table cellpadding="4">${rows}</table><p>Reminder: quote and agree any work separately under StorenTech's standard terms. VibeRescue makes no security guarantees.</p>`, rec.email);
      if (stored || notified) await send(rec.email, "We got your fix request", `<p>Hi ${esc(rec.name)},</p><p>Thanks for your request about ${esc(rec.appUrl)}. A StorenTech engineer will review what you sent and reply with a fixed quote. Nothing is done to your app until you've seen and agreed to that quote.</p><p>Please don't email passwords or API keys. If we need access, we'll explain how to grant it safely.</p><p>— VibeRescue, from StorenTech AI</p>`);
    } catch (e) { console.error("resend error", e && e.message); }
  }
  if (!stored && !notified) return Response.json({ ok: false, error: "Requests are temporarily unavailable. Please try again later." }, { status: 503 });
  return Response.json({ ok: true });
}
