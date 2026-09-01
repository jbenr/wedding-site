// Google Apps Script — NOT part of the site's build. This file lives here
// for reference/version control only; the actual script must be pasted into
// the Apps Script editor bound to the "Ben and Emily Wedding Guest Tracker"
// spreadsheet and deployed as a Web App. Once deployed, its /exec URL and
// the secret below get set as Vercel environment variables so
// api/rsvp-sheet-sync.js can call it.
//
// --- One-time setup ---
// 1. Open the spreadsheet -> Extensions -> Apps Script.
// 2. Delete the boilerplate `myFunction` code, paste everything below.
// 3. Replace SHARED_SECRET with a real secret (a generated one is noted
//    below — keep it out of any public repo).
// 4. Deploy -> New deployment -> type "Web app".
//      Execute as: Me
//      Who has access: Anyone
//    (Anyone-with-the-link is required because Vercel calls this
//    unauthenticated from Google's perspective — the shared-secret check
//    below is what actually protects it.)
// 5. Authorize the requested permissions (it's your own spreadsheet).
// 6. Copy the Web app URL (ends in /exec).
// 7. In Vercel: Project Settings -> Environment Variables, add:
//      RSVP_SHEET_WEBHOOK_URL    = <the /exec URL from step 6>
//      RSVP_SHEET_WEBHOOK_SECRET = <the same secret from step 3>
//    Redeploy (or restart `vercel dev` locally with a matching .env.local)
//    for the site to pick them up.
//
// Suggested secret (generate your own instead of reusing this one if you
// ever share this file/repo publicly): FZpWQe6QrbthioBy6rt4JE-3Xs24oTWV

const SHEET_NAME = "RSVPs";
const SHARED_SECRET = "REPLACE_WITH_YOUR_SECRET";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.secret !== SHARED_SECRET) {
      return jsonResponse({ error: "Unauthorized" });
    }
    if (!payload.householdId || !Array.isArray(payload.guests)) {
      return jsonResponse({ error: "Missing householdId or guests" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    const headers = [
      "Timestamp",
      "Household ID",
      "First Name",
      "Last Name",
      "Name Source",
      "Wedding RSVP",
      "Entrée Choice",
      "Dietary Restrictions",
      "Rehearsal Dinner RSVP",
      "Welcome Party RSVP"
    ];
    // Write the header row on a new sheet, and refresh it in place if the
    // columns have changed since the tab was first created — otherwise old
    // headers would silently mislabel the new columns.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    } else {
      const existing = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
      if (existing.join("|") !== headers.join("|")) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }

    // Resubmitting (fixing a mistake) should replace this household's rows,
    // not duplicate them — delete any existing ones first.
    const data = sheet.getDataRange().getValues();
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][1] === payload.householdId) {
        sheet.deleteRow(i + 1);
      }
    }

    const timestamp = new Date(payload.submittedAt || Date.now());
    const rows = payload.guests.map(function (g) {
      return [
        timestamp,
        payload.householdId,
        g.firstName || "",
        g.lastName || "",
        // "Guest" means the name came from whoever filled in an unnamed seat
        // on the invitation ("and Guest", "The X Family") rather than from
        // the tracker sheet itself.
        g.namedByGuest ? "Guest" : "Invite",
        g.wedding || "",
        g.weddingMeal || "",
        g.dietary || "",
        g.rehearsal || "",
        g.welcome || ""
      ];
    });

    if (rows.length > 0) {
      // One ranged write instead of an appendRow per guest.
      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
