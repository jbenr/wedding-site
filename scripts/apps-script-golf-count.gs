// Google Apps Script — bound to the "Wedding Golf" sign-up spreadsheet
// (the one the Google Form responses land in). Returns ONLY a count as
// JSON, never golfers' names/phone numbers/handicaps — safe to expose
// publicly, unlike the sheet itself.
//
// --- One-time setup (same pattern as the RSVP sheet sync) ---
// 1. Open the "Wedding Golf" spreadsheet -> Extensions -> Apps Script.
// 2. Delete the boilerplate, paste this in, save.
// 3. Deploy -> New deployment -> type "Web app".
//      Execute as: Me
//      Who has access: Anyone
// 4. Authorize it (it's your own spreadsheet), copy the /exec URL.
// 5. In Vercel: Project Settings -> Environment Variables, add:
//      GOLF_COUNT_WEBHOOK_URL = <the /exec URL>
//    Redeploy for the site to pick it up.

const RESPONSES_SHEET_NAME = "Form Responses 1";
const NAME_COLUMN_HEADER = "Name";
const TOTAL_SPOTS = 32;

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(RESPONSES_SHEET_NAME);
    if (!sheet) return jsonResponse({ error: "Responses sheet not found" });

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return jsonResponse({ filled: 0, total: TOTAL_SPOTS });

    const headers = data[0];
    const nameCol = headers.indexOf(NAME_COLUMN_HEADER);
    if (nameCol === -1) return jsonResponse({ error: "Name column not found" });

    // Dedupe by exact (trimmed, case-insensitive) name — a straight resubmit
    // (someone fixing a typo'd GHIN number) collapses to one spot, but two
    // genuinely different people who share a name string do not.
    const seen = new Set();
    for (let i = 1; i < data.length; i++) {
      const name = String(data[i][nameCol] || "").trim().toLowerCase();
      if (name) seen.add(name);
    }

    return jsonResponse({ filled: seen.size, total: TOTAL_SPOTS });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
