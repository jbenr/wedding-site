#!/usr/bin/env node

// Rebuilds the guest tracker's "RSVPs" and "Pending" tabs from Firebase, the source of
// truth. The live mirror (api/rsvp-sheet-sync.js) is best-effort and can
// miss submissions; this rewrites the whole tab so it matches Firebase
// exactly. Safe to rerun any time — new RSVPs keep arriving via the live
// mirror in between.
//
// Needs:
//   - .env: RSVP_SHEET_WEBHOOK_URL, RSVP_SHEET_WEBHOOK_SECRET (same as the site)
//   - the Firebase CLI logged in as an owner of the project
//     (`npx firebase-tools login`), since rsvps/ is unreadable otherwise.

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { GUESTS } from "../api/_data/guests.js";
import { describeHousehold, fullName } from "../api/_lib/names.js";

const PROJECT = "ben-emily-wedding";
const WEBHOOK_TIMEOUT_MS = 60000;

try {
  process.loadEnvFile();
} catch {
  // No .env — fall back to whatever is already in the environment.
}

const dryRun = process.argv.includes("--dry-run");

async function readRsvps() {
  let stdout;
  try {
    ({ stdout } = await promisify(execFile)(
      "npx",
      ["--yes", "firebase-tools", "database:get", "/rsvps", "--project", PROJECT],
      { maxBuffer: 50 * 1024 * 1024 }
    ));
  } catch (err) {
    throw new Error(`Could not read Firebase rsvps via the Firebase CLI (try \`npx firebase-tools login\`): ${err.stderr || err.message}`);
  }
  return JSON.parse(stdout || "null") || {};
}

async function main() {
  const webhookUrl = process.env.RSVP_SHEET_WEBHOOK_URL;
  const secret = process.env.RSVP_SHEET_WEBHOOK_SECRET;
  if (!dryRun && (!webhookUrl || !secret)) {
    throw new Error("RSVP_SHEET_WEBHOOK_URL and RSVP_SHEET_WEBHOOK_SECRET must be set (see .env).");
  }

  const rsvps = await readRsvps();

  // Oldest first, so the tab reads in the order RSVPs came in — the same
  // order the live mirror appends them.
  const households = Object.entries(rsvps)
    .map(([householdId, value]) => ({
      householdId,
      submittedAt: value?.submittedAt,
      // Firebase can hand back an array as an index-keyed object.
      guests: Object.values(value?.guests || {})
    }))
    .filter((h) => h.guests.length > 0)
    .sort((a, b) => (a.submittedAt || 0) - (b.submittedAt || 0));

  // Everyone on the guest list without a response, alphabetical so it reads
  // like a call list.
  const pending = GUESTS
    .filter((household) => !rsvps[household.id])
    .map((household) => ({
      householdId: household.id,
      label: describeHousehold(household),
      seats: household.members.length,
      guests: household.members.map(fullName).join(", "),
      rehearsalSeats: household.events.includes("rehearsal")
        ? household.members.filter((m) => !m.eventExclusions?.includes("rehearsal")).length
        : 0
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const guests = households.flatMap((h) => h.guests);
  const accepts = guests.filter((g) => g.wedding === "accept").length;
  console.log(`Firebase: ${households.length} households, ${guests.length} guests (${accepts} wedding accepts, ${guests.length - accepts} declines)`);
  console.log(`Pending: ${pending.length} households, ${pending.reduce((n, p) => n + p.seats, 0)} seats`);

  if (dryRun) {
    console.log("Dry run — sheet not touched.");
    return;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, replaceAll: true, households, pending }),
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS)
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok || !result.ok) {
    throw new Error(
      `Sheet rebuild failed: ${result.error || `HTTP ${res.status}`}` +
      (result.error === "Missing householdId or guests"
        ? " — the deployed Apps Script is out of date; redeploy scripts/apps-script-rsvp-sync.gs."
        : "")
    );
  }
  if (result.pending === undefined) {
    console.log(`RSVPs tab rebuilt: ${result.rows} rows. Pending tab NOT written — the deployed Apps Script predates it; redeploy scripts/apps-script-rsvp-sync.gs.`);
    return;
  }
  console.log(`Sheet rebuilt: ${result.rows} RSVP rows, ${result.pending} pending households.`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
