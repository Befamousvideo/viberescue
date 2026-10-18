"use client";
import { useState, useEffect, useRef } from "react";
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const STACKS = ["Lovable", "Bolt", "Cursor", "Replit", "v0", "Other"];
export default function FixRequestForm() {
  const [state, setState] = useState("idle");
  const [msg, setMsg] = useState("");
  const started = useRef(Date.now());
  const tsRef = useRef(null);
  const tsId = useRef(null);
  useEffect(() => {
    if (!SITE_KEY) return;
    const render = () => { if (window.turnstile && tsRef.current && tsId.current == null) tsId.current = window.turnstile.render(tsRef.current, { sitekey: SITE_KEY }); };
    if (window.turnstile) render();
    else if (!document.getElementById("cf-turnstile-js")) {
      const sc = document.createElement("script"); sc.id = "cf-turnstile-js"; sc.async = true; sc.defer = true;
      sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"; sc.onload = render; document.head.appendChild(sc);
    } else { const t = setInterval(() => { if (window.turnstile) { clearInterval(t); render(); } }, 200); return () => clearInterval(t); }
  }, []);
  async function onSubmit(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("loading"); setMsg("");
    try {
      const r = await fetch("/api/fix-request", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.get("name"), email: f.get("email"), phone: f.get("phone"), appUrl: f.get("appUrl"), stack: f.get("stack"),
          problem: f.get("problem"), elapsed: Date.now() - started.current,
          turnstile: SITE_KEY && window.turnstile && tsId.current != null ? window.turnstile.getResponse(tsId.current) : undefined,
          consent: f.get("consent") === "on", website: f.get("website"), source: window.location.pathname }) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) setState("done"); else { setState("error"); setMsg(j.error || "Something went wrong. Please try again."); if (SITE_KEY && window.turnstile && tsId.current != null) window.turnstile.reset(tsId.current); }
    } catch { setState("error"); setMsg("Network error. Please try again."); }
  }
  if (state === "done") return (<p className="nl-success" role="status"><strong>Thanks, your request is in.</strong> We've emailed you a confirmation. A StorenTech engineer will review what you sent and reply with a fixed quote.</p>);
  const busy = state === "loading";
  return (<form className="brf" onSubmit={onSubmit}>
    <label>Name<input name="name" required maxLength={120} autoComplete="name" disabled={busy} /></label>
    <label>Email<input type="email" name="email" required maxLength={254} autoComplete="email" placeholder="you@example.com" disabled={busy} /></label>
    <label>Phone<input type="tel" name="phone" required maxLength={40} autoComplete="tel" placeholder="(949) 555-1234" disabled={busy} /></label>
    <label>App URL<input type="url" name="appUrl" required maxLength={300} placeholder="https://your-app.example.com" disabled={busy} /></label>
    <label>Built with<select name="stack" required defaultValue="" disabled={busy}><option value="" disabled>Choose one</option>{STACKS.map(x => <option key={x}>{x}</option>)}</select></label>
    <label>What's going wrong?<textarea name="problem" required rows={5} minLength={10} maxLength={3000} placeholder="What's broken or worrying you? e.g. users can see each other's data, a key may be exposed, payments aren't confirming." disabled={busy} /></label>
    <p className="muted small">Please don't paste passwords, API keys or other secrets here. We'll ask for access safely if we need it.</p>
    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
    {SITE_KEY && <div ref={tsRef} style={{ margin: "12px 0" }} />}
    <label className="small brf-check"><input type="checkbox" name="consent" required disabled={busy} /><span>I own this app or am authorized to request work on it, and I agree to be contacted by StorenTech AI about this request.</span></label>
    <button className="btn" type="submit" disabled={busy}>{busy ? "Sending…" : "Get my fixed quote"}</button>
    {state === "error" && <p className="small" role="alert" style={{ color: "#b42318" }}>{msg}</p>}
  </form>);
}
