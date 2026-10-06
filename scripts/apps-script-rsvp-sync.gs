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
// --- Updating an existing deployment ---
// Paste the new code, then Deploy -> Manage deployments -> (pencil) edit ->
// Version: "New version" -> Deploy. Editing the existing deployment keeps the
// same /exec URL, so nothing in Vercel needs to change.
//
// Suggested secret (generate your own instead of reusing this one if you
// ever share this file/repo publicly): FZpWQe6QrbthioBy6rt4JE-3Xs24oTWV

const SHEET_NAME = "RSVPs";
// Set explicitly on every write: a cell formatted as plain "Date" (by hand,
// or inherited from neighbouring rows) silently hides the time otherwise.
const TIMESTAMP_FORMAT = "m/d/yyyy h:mm am/pm";
const SHARED_SECRET = "REPLACE_WITH_YOUR_SECRET";

const HEADERS = [
  "Timestamp",
  "Household ID",
  "First Name",
  "Last Name",
  "Name Source",
  "Wedding RSVP",
  "Entrée Choice",
  "Toast Choice",
  "Dietary Restrictions",
  "Rehearsal Dinner RSVP",
  "Welcome Party RSVP"
];

// Households that haven't responded yet. Written in full by the rebuild;
// each live submission then removes its household from this tab.
const PENDING_SHEET_NAME = "Pending";
const PENDING_HEADERS = ["Household ID", "Household", "Seats", "Guests", "Rehearsal Dinner Seats"];

// Two modes:
//   { secret, householdId, submittedAt, guests }  - one live submission
//     (from api/rsvp-sheet-sync.js); replaces that household's rows.
//     Also drops the household from the Pending tab.
//   { secret, replaceAll: true, households: [{ householdId, submittedAt, guests }],
//     pending: [{ householdId, label, seats, guests, rehearsalSeats }] }
//     - full rebuild from Firebase (scripts/rsvp-sheet-rebuild.mjs); wipes
//     both tabs and rewrites every row.
function doPost(e) {
  // Submissions that arrive close together used to run concurrently, and
  // since rows are deleted by position, one run could delete another's
  // freshly-written rows. Serialize everything that touches the tab.
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
  } catch (err) {
    return jsonResponse({ error: "Busy, try again" });
  }

  try {
    const payload = JSON.parse(e.postData.contents);
    if (payload.secret !== SHARED_SECRET) {
      return jsonResponse({ error: "Unauthorized" });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    if (payload.replaceAll) {
      if (!Array.isArray(payload.households)) {
        return jsonResponse({ error: "Missing households" });
      }
      const rows = [];
      payload.households.forEach(function (h) {
        rowsFor(h).forEach(function (row) { rows.push(row); });
      });
      writeTab(sheet, HEADERS, rows);
      if (rows.length > 0) {
        sheet.getRange(2, 1, rows.length, 1).setNumberFormat(TIMESTAMP_FORMAT);
      }

      const pendingRows = (payload.pending || []).map(function (p) {
        return [p.householdId, p.label || "", p.seats || 0, p.guests || "", p.rehearsalSeats || 0];
      });
      const pendingSheet = ss.getSheetByName(PENDING_SHEET_NAME) || ss.insertSheet(PENDING_SHEET_NAME);
      writeTab(pendingSheet, PENDING_HEADERS, pendingRows);

      return jsonResponse({ ok: true, rows: rows.length, pending: pendingRows.length });
    }

    if (!payload.householdId || !Array.isArray(payload.guests)) {
      return jsonResponse({ error: "Missing householdId or guests" });
    }

    // Write the header row on a new sheet, and refresh it in place if the
    // columns have changed since the tab was first created — otherwise old
    // headers would silently mislabel the new columns.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    } else {
      const existing = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
      if (existing.join("|") !== HEADERS.join("|")) {
        sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
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

    const rows = rowsFor(payload);
    if (rows.length > 0) {
      // One ranged write instead of an appendRow per guest.
      const firstRow = sheet.getLastRow() + 1;
      sheet.getRange(firstRow, 1, rows.length, HEADERS.length).setValues(rows);
      sheet.getRange(firstRow, 1, rows.length, 1).setNumberFormat(TIMESTAMP_FORMAT);
    }

    const pendingSheet = ss.getSheetByName(PENDING_SHEET_NAME);
    if (pendingSheet) {
      const pendingData = pendingSheet.getDataRange().getValues();
      for (let i = pendingData.length - 1; i >= 1; i--) {
        if (pendingData[i][0] === payload.householdId) {
          pendingSheet.deleteRow(i + 1);
        }
      }
    }

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function writeTab(sheet, headers, rows) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function rowsFor(household) {
  const timestamp = new Date(household.submittedAt || Date.now());
  return (household.guests || []).map(function (g) {
    return [
      timestamp,
      household.householdId,
      g.firstName || "",
      g.lastName || "",
      // "Guest" means the name came from whoever filled in an unnamed seat
      // on the invitation ("and Guest", "The X Family") rather than from
      // the tracker sheet itself.
      g.namedByGuest ? "Guest" : "Invite",
      g.wedding || "",
      g.weddingMeal || "",
      g.weddingToast || "",
      g.dietary || "",
      g.rehearsal || "",
      g.welcome || ""
    ];
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
