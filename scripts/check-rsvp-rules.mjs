// Verifies the deployed Realtime Database rules actually behave the way
// firebase.database.rules.json says they should.
//
// Rules only take effect once deployed (`firebase deploy --only database`),
// and a mistake in them is silent-but-catastrophic in both directions: too
// strict and every guest's RSVP fails, too loose and everyone's answers are
// public. Neither shows up in the app until a real guest hits it.
//
// Usage:  node scripts/check-rsvp-rules.mjs
//
// Writes one throwaway household, checks what the rules accept and reject,
// then deletes it. Safe to run against production — it never touches a real
// household id.

const DB = process.env.RSVP_DATABASE_URL || "https://ben-emily-wedding-default-rtdb.firebaseio.com";
const TEST_ID = `zz-rules-check-${Date.now()}`;

const valid = {
  submittedAt: Date.now(),
  guests: [
    {
      firstName: "Rules",
      lastName: "Check",
      wedding: "accept",
      weddingMeal: "Beef Tenderloin",
      weddingToast: "Bourbon",
      dietary: "None",
      rehearsal: "decline",
      welcome: "accept",
      namedByGuest: true
    }
  ]
};

const minimal = {
  submittedAt: Date.now(),
  guests: [{ firstName: "Rules", lastName: "Check", wedding: "decline" }]
};

async function put(path, body) {
  const res = await fetch(`${DB}/${path}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.status;
}

async function read(path) {
  const res = await fetch(`${DB}/${path}.json?shallow=true`);
  return res.status;
}

let failures = 0;

function check(label, actual, expected) {
  const ok = expected === "allowed" ? actual === 200 : actual !== 200;
  if (!ok) failures += 1;
  console.log(`${ok ? "✓" : "✗"} ${label.padEnd(52)} ${expected}, got HTTP ${actual}`);
}

console.log(`Checking rules on ${DB}\n`);

// --- Writes that must be accepted -------------------------------------------
check("full RSVP payload", await put(`rsvps/${TEST_ID}`, valid), "allowed");
check("minimal RSVP payload", await put(`rsvps/${TEST_ID}`, minimal), "allowed");
check("resubmitting replaces the same household", await put(`rsvps/${TEST_ID}`, valid), "allowed");
check("rsvpMeta receipt", await put(`rsvpMeta/${TEST_ID}`, { submittedAt: Date.now(), guestCount: 2 }), "allowed");
check(
  "toast choice (added after the first deploy)",
  await put(`rsvps/${TEST_ID}`, {
    submittedAt: Date.now(),
    guests: [{ firstName: "A", lastName: "B", wedding: "accept", weddingMeal: "Beef Tenderloin", weddingToast: "Bourbon" }]
  }),
  "allowed"
);

// --- Writes that must be rejected -------------------------------------------
check(
  "guest missing a wedding answer",
  await put(`rsvps/${TEST_ID}`, { submittedAt: Date.now(), guests: [{ firstName: "A", lastName: "B" }] }),
  "rejected"
);
check(
  "wedding answer that isn't accept/decline",
  await put(`rsvps/${TEST_ID}`, { submittedAt: Date.now(), guests: [{ firstName: "A", lastName: "B", wedding: "maybe" }] }),
  "rejected"
);
check(
  "unknown extra field on a guest",
  await put(`rsvps/${TEST_ID}`, {
    submittedAt: Date.now(),
    guests: [{ firstName: "A", lastName: "B", wedding: "accept", injected: "nope" }]
  }),
  "rejected"
);
check(
  "oversized dietary note",
  await put(`rsvps/${TEST_ID}`, {
    submittedAt: Date.now(),
    guests: [{ firstName: "A", lastName: "B", wedding: "accept", dietary: "x".repeat(201) }]
  }),
  "rejected"
);
check("RSVP without a submittedAt", await put(`rsvps/${TEST_ID}`, { guests: minimal.guests }), "rejected");
const strayWrite = await put(`somewhereElse/${TEST_ID}`, { a: 1 });
check("answers stored outside /rsvps", strayWrite, "rejected");

// --- Reads -------------------------------------------------------------------
check("reading anyone's RSVP answers", await read("rsvps"), "rejected");
check("reading one household's answers", await read(`rsvps/${TEST_ID}`), "rejected");
check("reading rsvpMeta receipts", await read("rsvpMeta"), "allowed");
check("reading the public click counter", await read("clickCount"), "allowed");

// --- Cleanup -----------------------------------------------------------------
// Only clean up what actually got written. The `somewhereElse` probe leaves
// a node behind only when the rules are still wide open — which is exactly
// the case this script exists to catch — so it is conditional.
const toClean = [`rsvps/${TEST_ID}`, `rsvpMeta/${TEST_ID}`];
if (strayWrite === 200) toClean.push(`somewhereElse/${TEST_ID}`, "somewhereElse");

for (const path of toClean) {
  const res = await fetch(`${DB}/${path}.json`, { method: "DELETE" });
  if (!res.ok) console.log(`  ! could not clean up ${path} (HTTP ${res.status}) — remove it in the console`);
}

console.log(
  failures === 0
    ? "\nAll checks passed — the deployed rules match firebase.database.rules.json."
    : `\n${failures} check(s) failed. If they all failed, the rules probably aren't deployed yet:\n  firebase deploy --only database`
);
process.exit(failures === 0 ? 0 : 1);
