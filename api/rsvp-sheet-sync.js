// Vercel serverless function: forwards a finished RSVP submission to a
// Google Apps Script Web App bound to the wedding guest-tracker spreadsheet,
// which appends/replaces rows on its "RSVPs" tab. Keeping this server-side
// means the Apps Script URL and shared secret never reach the browser.
//
// Requires two Vercel environment variables (see scripts/apps-script-rsvp-sync.gs
// for the script this talks to, and the setup steps in that file's header):
//   RSVP_SHEET_WEBHOOK_URL    - the Apps Script /exec URL
//   RSVP_SHEET_WEBHOOK_SECRET - shared secret checked by the script
//
// This is best-effort: Firebase (written directly from the client) remains
// the source of truth, so a webhook failure here should never block a
// guest's RSVP from succeeding. If the env vars aren't set yet, this quietly
// no-ops instead of erroring.

const MAX_GUESTS = 12;
const WEBHOOK_TIMEOUT_MS = 8000;

const text = (value, max) => (typeof value === "string" ? value.slice(0, max) : "");

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhookUrl = process.env.RSVP_SHEET_WEBHOOK_URL;
  const secret = process.env.RSVP_SHEET_WEBHOOK_SECRET;

  if (!webhookUrl || !secret) {
    return res.status(200).json({ ok: false, skipped: true });
  }

  const { householdId, submittedAt, guests } = req.body || {};
  if (typeof householdId !== "string" || !householdId || !Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: "Missing householdId or guests." });
  }

  // This endpoint is reachable by anyone, and whatever it forwards lands in
  // the couple's spreadsheet — so only the fields the sheet actually has
  // columns for get passed through, each truncated to a sane length. The
  // largest real household is 5 people.
  if (guests.length > MAX_GUESTS) {
    return res.status(400).json({ error: "Too many guests in one submission." });
  }

  const payload = {
    secret,
    householdId: householdId.slice(0, 80),
    submittedAt: typeof submittedAt === "number" ? submittedAt : Date.now(),
    guests: guests.map((g) => ({
      firstName: text(g?.firstName, 60),
      lastName: text(g?.lastName, 60),
      namedByGuest: Boolean(g?.namedByGuest),
      wedding: text(g?.wedding, 10),
      weddingMeal: text(g?.weddingMeal, 80),
      weddingToast: text(g?.weddingToast, 80),
      dietary: text(g?.dietary, 200),
      rehearsal: text(g?.rehearsal, 10),
      welcome: text(g?.welcome, 10)
    }))
  };

  // Apps Script can be slow to wake up; bail out ourselves rather than
  // letting the whole serverless invocation hit the platform timeout.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    return res.status(resp.ok ? 200 : 502).json({ ok: resp.ok });
  } catch {
    return res.status(502).json({ ok: false, error: "Failed to reach sheet sync." });
  } finally {
    clearTimeout(timeout);
  }
}
