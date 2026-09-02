#!/usr/bin/env node

import { GUESTS } from "../api/_data/guests.js";
import { describeHousehold, fullName } from "../api/_lib/names.js";

const DEFAULT_DB = "https://ben-emily-wedding-default-rtdb.firebaseio.com";

function usage() {
  return `Usage:
  npm run rsvp:status
  npm run rsvp:summary
  npm run rsvp:pending
  npm run rsvp:rsvped
  npm run rsvp:rd
  npm run rsvp:status -- --summary
  npm run rsvp:status -- --pending
  npm run rsvp:status -- --rsvped
  npm run rsvp:status -- --rd
  npm run rsvp:status -- --pending --rd
  npm run rsvp:status -- --csv
  npm run rsvp:status -- --json

Options:
  --summary        Print only the summary counts.
  --pending        Print summary plus households that have not RSVP'd.
  --rsvped         Print summary plus households that have RSVP'd.
  --rd             Show only rehearsal dinner invited households.
  --csv            Print household rows as CSV.
  --json           Print the full report as JSON.
  --db <url>       Override the Firebase Realtime Database URL.
  -h, --help       Show this help text.

Environment:
  RSVP_DATABASE_URL can also override the Firebase database URL.`;
}

function parseArgs(argv) {
  const options = {
    db: process.env.RSVP_DATABASE_URL || DEFAULT_DB,
    format: "text",
    mode: "all",
    rehearsalDinnerOnly: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else if (arg === "--summary") {
      options.mode = "summary";
    } else if (arg === "--pending") {
      options.mode = "pending";
    } else if (arg === "--rsvped" || arg === "--submitted") {
      options.mode = "rsvped";
    } else if (arg === "--rd" || arg === "--rehearsal-dinner") {
      options.rehearsalDinnerOnly = true;
    } else if (arg === "--csv") {
      options.format = "csv";
    } else if (arg === "--json") {
      options.format = "json";
    } else if (arg === "--db") {
      const next = argv[i + 1];
      if (!next) throw new Error("--db requires a URL.");
      options.db = next;
      i += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function normalizeDbUrl(value) {
  return value.replace(/\/+$/, "");
}

async function readRsvpMeta(db) {
  let res;
  try {
    res = await fetch(`${normalizeDbUrl(db)}/rsvpMeta.json`);
  } catch (err) {
    const detail = err.cause?.message || err.message || String(err);
    throw new Error(`Could not reach Firebase rsvpMeta at ${normalizeDbUrl(db)}: ${detail}`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Could not read Firebase rsvpMeta: HTTP ${res.status}${body ? ` - ${body}` : ""}`);
  }

  const data = await res.json();
  return data && typeof data === "object" ? data : {};
}

function formatDate(timestamp) {
  if (!Number.isFinite(timestamp)) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(timestamp));
}

function plural(value, singular, pluralForm = `${singular}s`) {
  return `${value} ${value === 1 ? singular : pluralForm}`;
}

function memberIsInvitedToEvent(household, member, eventKey) {
  if (!household.events.includes(eventKey)) return false;
  return !member.eventExclusions?.includes(eventKey);
}

function eventMembers(household, eventKey) {
  return household.members.filter((member) => memberIsInvitedToEvent(household, member, eventKey));
}

function eventSeatCount(eventKey) {
  return GUESTS.reduce((total, household) => total + eventMembers(household, eventKey).length, 0);
}

function normalizeMetaEntry(value) {
  return value && typeof value === "object" ? value : {};
}

function buildReport(meta, db) {
  const knownIds = new Set(GUESTS.map((household) => household.id));
  const rows = GUESTS.map((household) => {
    const metaEntry = normalizeMetaEntry(meta[household.id]);
    const submittedAt = Number(metaEntry.submittedAt);
    const guestCount = Number(metaEntry.guestCount);
    const submitted = Number.isFinite(submittedAt);
    const rehearsalDinnerMembers = eventMembers(household, "rehearsal");

    return {
      id: household.id,
      label: describeHousehold(household),
      seats: household.members.length,
      rehearsalDinnerInvited: rehearsalDinnerMembers.length > 0,
      rehearsalDinnerSeats: rehearsalDinnerMembers.length,
      rehearsalDinnerGuestNames: rehearsalDinnerMembers.map(fullName),
      status: submitted ? "rsvped" : "pending",
      submittedAt: submitted ? submittedAt : null,
      submittedAtText: submitted ? formatDate(submittedAt) : "",
      acceptedWeddingHeadcount: submitted && Number.isFinite(guestCount) ? guestCount : null
    };
  });

  const submitted = rows
    .filter((row) => row.status === "rsvped")
    .sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
  const pending = rows
    .filter((row) => row.status === "pending")
    .sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
  const unknownMeta = Object.entries(meta)
    .filter(([id]) => !knownIds.has(id))
    .map(([id, value]) => {
      const metaEntry = normalizeMetaEntry(value);
      const submittedAt = Number(metaEntry.submittedAt);
      const guestCount = Number(metaEntry.guestCount);
      return {
        id,
        submittedAt: Number.isFinite(submittedAt) ? submittedAt : null,
        submittedAtText: Number.isFinite(submittedAt) ? formatDate(submittedAt) : "",
        acceptedWeddingHeadcount: Number.isFinite(guestCount) ? guestCount : null
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  const sortRows = (items) => [...items].sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
  const submittedSeats = submitted.reduce((total, row) => total + row.seats, 0);
  const pendingSeats = pending.reduce((total, row) => total + row.seats, 0);
  const acceptedWeddingHeadcount = submitted.reduce((total, row) => total + (row.acceptedWeddingHeadcount || 0), 0);
  const missingGuestCountHouseholds = submitted.filter((row) => row.acceptedWeddingHeadcount === null).length;
  const latestSubmittedAt = submitted.reduce((latest, row) => Math.max(latest, row.submittedAt || 0), 0);
  const latestSubmitted = [...submitted]
    .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0) || a.label.localeCompare(b.label))
    .slice(0, 5);
  const rehearsalDinnerRows = sortRows(rows.filter((row) => row.rehearsalDinnerInvited));
  const rehearsalDinnerSubmitted = sortRows(rehearsalDinnerRows.filter((row) => row.status === "rsvped"));
  const rehearsalDinnerPending = sortRows(rehearsalDinnerRows.filter((row) => row.status === "pending"));

  return {
    checkedAt: Date.now(),
    checkedAtText: formatDate(Date.now()),
    database: normalizeDbUrl(db),
    summary: {
      totalHouseholds: rows.length,
      totalSeats: rows.reduce((total, row) => total + row.seats, 0),
      rehearsalDinnerInvitedHouseholds: rehearsalDinnerRows.length,
      rehearsalDinnerInvitedSeats: eventSeatCount("rehearsal"),
      rehearsalDinnerRsvpedHouseholds: rehearsalDinnerSubmitted.length,
      rehearsalDinnerPendingHouseholds: rehearsalDinnerPending.length,
      rehearsalDinnerRsvpedSeats: rehearsalDinnerSubmitted.reduce((total, row) => total + row.rehearsalDinnerSeats, 0),
      rehearsalDinnerPendingSeats: rehearsalDinnerPending.reduce((total, row) => total + row.rehearsalDinnerSeats, 0),
      welcomePartyInvitedSeats: eventSeatCount("welcome"),
      rsvpedHouseholds: submitted.length,
      pendingHouseholds: pending.length,
      rsvpedSeats: submittedSeats,
      pendingSeats,
      acceptedWeddingHeadcount,
      declinedWeddingHeadcountFromSubmittedHouseholds: missingGuestCountHouseholds === 0
        ? submittedSeats - acceptedWeddingHeadcount
        : null,
      maxWeddingHeadcountIfAllPendingAttend: acceptedWeddingHeadcount + pendingSeats,
      missingGuestCountHouseholds,
      latestSubmittedAt: latestSubmittedAt || null,
      latestSubmittedAtText: latestSubmittedAt ? formatDate(latestSubmittedAt) : "",
      unknownMetaHouseholds: unknownMeta.length
    },
    latestSubmitted,
    rehearsalDinner: {
      rows: rehearsalDinnerRows,
      submitted: rehearsalDinnerSubmitted,
      pending: rehearsalDinnerPending
    },
    submitted,
    pending,
    unknownMeta
  };
}

function printSummary(report) {
  const { summary } = report;
  console.log("RSVP Status");
  console.log(`Checked: ${report.checkedAtText}`);
  console.log(`Database: ${report.database}`);
  console.log("Source: Firebase rsvpMeta. Full answers still live in Firebase rsvps and the RSVP sheet.");
  console.log("");
  console.log("Summary");
  console.log(`  Total households: ${summary.totalHouseholds}`);
  console.log(`  Total people/seats on guest list: ${summary.totalSeats}`);
  console.log(`  Rehearsal dinner invited households: ${summary.rehearsalDinnerInvitedHouseholds}`);
  console.log(`  Rehearsal dinner invited seats: ${summary.rehearsalDinnerInvitedSeats}`);
  console.log(`  Rehearsal dinner RSVP'd households: ${summary.rehearsalDinnerRsvpedHouseholds}`);
  console.log(`  Rehearsal dinner RSVP'd seats: ${summary.rehearsalDinnerRsvpedSeats}`);
  console.log(`  Rehearsal dinner not yet RSVP'd households: ${summary.rehearsalDinnerPendingHouseholds}`);
  console.log(`  Rehearsal dinner not yet RSVP'd seats: ${summary.rehearsalDinnerPendingSeats}`);
  console.log(`  Welcome party invited seats: ${summary.welcomePartyInvitedSeats}`);
  console.log(`  RSVP'd households: ${summary.rsvpedHouseholds}`);
  console.log(`  Not yet RSVP'd households: ${summary.pendingHouseholds}`);
  console.log(`  RSVP'd household seats: ${summary.rsvpedSeats}`);
  console.log(`  Not yet RSVP'd seats: ${summary.pendingSeats}`);
  console.log(`  Wedding accepts so far: ${summary.acceptedWeddingHeadcount}`);
  if (summary.declinedWeddingHeadcountFromSubmittedHouseholds === null) {
    console.log(`  Wedding declines from submitted households: unavailable (${summary.missingGuestCountHouseholds} missing guestCount)`);
  } else {
    console.log(`  Wedding declines from submitted households: ${summary.declinedWeddingHeadcountFromSubmittedHouseholds}`);
  }
  console.log(`  Max wedding headcount if all pending attend: ${summary.maxWeddingHeadcountIfAllPendingAttend}`);
  console.log(`  Latest RSVP: ${summary.latestSubmittedAtText || "none yet"}`);
  if (summary.unknownMetaHouseholds > 0) {
    console.log(`  Unknown rsvpMeta records: ${summary.unknownMetaHouseholds}`);
  }
}

function printLatestSubmitted(report) {
  console.log("");
  console.log("Latest 5 RSVPs");
  if (report.latestSubmitted.length === 0) {
    console.log("  none yet");
    return;
  }

  for (const row of report.latestSubmitted) {
    console.log(
      `  ${row.submittedAtText} - ${row.label} [${row.id}] - ${row.acceptedWeddingHeadcount ?? "?"} wedding accept${row.acceptedWeddingHeadcount === 1 ? "" : "s"}`
    );
  }
}

function printHouseholds(title, rows, { submittedList = false, rehearsalDinner = false, showStatus = false } = {}) {
  console.log("");
  console.log(`${title} (${rows.length})`);
  if (rows.length === 0) {
    console.log("  none");
    return;
  }

  for (const row of rows) {
    const seatText = rehearsalDinner
      ? `${plural(row.rehearsalDinnerSeats, "RD seat")} of ${plural(row.seats, "household seat")}`
      : plural(row.seats, "seat");
    const rehearsalDinnerText = rehearsalDinner ? ` - ${row.rehearsalDinnerGuestNames.join(", ")}` : "";
    const statusText = showStatus ? ` - ${row.status === "rsvped" ? "RSVP'd" : "pending"}` : "";
    const submittedText = submittedList
      ? ` - ${row.submittedAtText || "submitted"} - ${row.acceptedWeddingHeadcount ?? "?"} wedding accept${row.acceptedWeddingHeadcount === 1 ? "" : "s"}`
      : "";
    console.log(`  ${row.label} [${row.id}] - ${seatText}${rehearsalDinnerText}${statusText}${submittedText}`);
  }
}

function selectedRows(report, mode, rehearsalDinnerOnly = false) {
  const submitted = rehearsalDinnerOnly ? report.rehearsalDinner.submitted : report.submitted;
  const pending = rehearsalDinnerOnly ? report.rehearsalDinner.pending : report.pending;
  const all = rehearsalDinnerOnly ? report.rehearsalDinner.rows : null;
  if (mode === "pending") return pending;
  if (mode === "rsvped") return submitted;
  if (mode === "summary") return [];
  return rehearsalDinnerOnly
    ? all
    : [...submitted, ...pending].sort((a, b) => a.label.localeCompare(b.label) || a.id.localeCompare(b.id));
}

function csvEscape(value) {
  const text = value == null ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function printCsv(report, mode, rehearsalDinnerOnly) {
  if (mode === "summary") {
    console.log("metric,value");
    for (const [key, value] of Object.entries(report.summary)) {
      console.log(`${csvEscape(key)},${csvEscape(value)}`);
    }
    return;
  }

  const header = ["status", "household_id", "household", "seats"];
  if (rehearsalDinnerOnly) header.push("rehearsal_dinner_seats", "rehearsal_dinner_guests");
  header.push("submitted_at", "accepted_wedding_headcount");
  console.log(header.join(","));

  for (const row of selectedRows(report, mode, rehearsalDinnerOnly)) {
    const values = [
      row.status,
      row.id,
      row.label,
      row.seats
    ];
    if (rehearsalDinnerOnly) values.push(row.rehearsalDinnerSeats, row.rehearsalDinnerGuestNames.join("; "));
    values.push(
      row.submittedAtText,
      row.acceptedWeddingHeadcount
    );
    console.log(values.map(csvEscape).join(","));
  }
}

function printText(report, mode, rehearsalDinnerOnly) {
  printSummary(report);
  printLatestSubmitted(report);
  if (mode === "summary") return;

  if (rehearsalDinnerOnly) {
    if (mode === "rsvped") {
      printHouseholds("Rehearsal dinner households that have RSVP'd", report.rehearsalDinner.submitted, { submittedList: true, rehearsalDinner: true });
    } else if (mode === "pending") {
      printHouseholds("Rehearsal dinner households not yet RSVP'd", report.rehearsalDinner.pending, { rehearsalDinner: true });
    } else {
      printHouseholds("Rehearsal dinner invited households", report.rehearsalDinner.rows, { rehearsalDinner: true, showStatus: true });
    }
    return;
  }

  if (mode === "all" || mode === "rsvped") {
    printHouseholds("RSVP'd households", report.submitted, { submittedList: true });
  }
  if (mode === "all" || mode === "pending") {
    printHouseholds("Not yet RSVP'd households", report.pending);
  }
  if (report.unknownMeta.length > 0) {
    console.log("");
    console.log(`Unknown rsvpMeta records not in local guest list (${report.unknownMeta.length})`);
    for (const row of report.unknownMeta) {
      const submittedText = row.submittedAtText ? ` - ${row.submittedAtText}` : "";
      const countText = row.acceptedWeddingHeadcount == null ? "" : ` - ${row.acceptedWeddingHeadcount} wedding accepts`;
      console.log(`  ${row.id}${submittedText}${countText}`);
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const meta = await readRsvpMeta(options.db);
  const report = buildReport(meta, options.db);

  if (options.format === "json") {
    console.log(JSON.stringify(report, null, 2));
  } else if (options.format === "csv") {
    printCsv(report, options.mode, options.rehearsalDinnerOnly);
  } else {
    printText(report, options.mode, options.rehearsalDinnerOnly);
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
