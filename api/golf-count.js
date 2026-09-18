// Vercel serverless function: proxies the live golf sign-up count from a
// Google Apps Script Web App bound to the "Wedding Golf" spreadsheet. Only
// { filled, total } ever comes back — never golfers' names, phone numbers,
// or handicaps, unlike the sheet itself.
//
// Requires GOLF_COUNT_WEBHOOK_URL (see scripts/apps-script-golf-count.gs for
// the script this talks to, and its header for setup steps). Falls back to
// a static count if that's unset or unreachable, so the schedule tab never
// breaks over this.

const FALLBACK = { filled: 17, total: 32 };

export default async function handler(req, res) {
  const webhookUrl = process.env.GOLF_COUNT_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(200).json({ ...FALLBACK, live: false });
  }

  try {
    const resp = await fetch(webhookUrl);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (typeof data.filled !== "number" || typeof data.total !== "number") {
      throw new Error("Unexpected response shape");
    }
    return res.status(200).json({ filled: data.filled, total: data.total, live: true });
  } catch {
    return res.status(200).json({ ...FALLBACK, live: false });
  }
}
