// One-off / re-runnable importer: turns the "Ben and Emily Wedding Guest
// Tracker" Google Sheet export into api/_data/guests.js.
//
// Usage: node scripts/build-guest-data.mjs
//
// To refresh later: update RAW_ROWS below from the sheet (or wire this up to
// read a downloaded CSV export instead — see parseRawRows()), then re-run.
//
// Each row is [lastName, inviteLine, guestsOnInvite, rehearsalInvited, options].
// When a household is invited to an event but one member is not, add
// `eventExclusions: ["rehearsal"]` to that member.
// The sheet has no separate "Welcome Party" column, so every household is
// assumed invited to the Welcome Party (WELCOME_PARTY_FOR_ALL below) —
// only the Rehearsal Dinner is a real subset. Flip that constant if wrong.

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const WELCOME_PARTY_FOR_ALL = true;

const RAW_ROWS = [
  ["Atwell", "Ms. Bridget Atwell", 1, false],
  ["Barnes", "The Barnes Family", 4, true],
  ["Barry", "Mr. Christopher Barry", 1, false],
  ["Bermudez", "Mr. and Mrs. Esteban Bermudez", 2, false],
  ["Berry", "Mr. and Mrs. Mike Berry", 2, false],
  ["Berry", "Mr. and Mrs. Fritz Berry", 2, false],
  ["Bienen-Esayian", "Mr. Nicholas Bienen-Esayian", 1, false],
  ["Billings", "Mrs. Lisa Billings and Guest", 2, false],
  ["Billings", "Mr. Nicholas Billings and Guest", 2, false],
  ["Bladt", "Mr. and Mrs. William Bladt", 4, false],
  ["Bodman", "Future Mr. and Ms. Charlie Bodman", 2, true, {
    members: [
      { firstName: "Charlie", lastName: "Bodman" },
      { firstName: "Perri", lastName: "Bodman" }
    ]
  }],
  ["Boedecker", "Ms. Ingrid Boedecker", 1, false],
  ["Brebach", "Drs. Greg and Elissa Brebach and family", 4, true],
  ["Brebach", "Mr. and Mrs. Gresham Brebach", 2, true],
  ["Brebach", "Mr. Mark Brebach", 1, true],
  ["Brookshire", "Mr. and Mrs. Matt Brookshire", 2, false],
  ["Brookshire", "Ms. Madeline Brookshire", 2, true],
  ["Brown", "Mr. and Mrs. Tyler Brown", 2, false],
  ["Calzaretta", "Mr. and Mrs. John Calzaretta", 2, false],
  ["Carpenter", "Mr. Charles Carpenter and Ms. Elizabeth Berner", 2, false],
  ["Carpenter", "Mr. and Mrs. Edmund Mogford Carpenter Jr", 2, false],
  ["Collins", "Dr. Christine and Mr. Stephen Collins", 2, true],
  ["Collins", "Dr. Mary Jo and Mr. Andrew Collins", 3, true],
  ["Collins", "Mr. and Mrs. Patrick Collins", 2, false],
  ["Collins", "Mr. and Mrs. Stephen Collins", 5, true],
  ["Danzi", "Mr. and Mrs. Mark Danzi", 2, false],
  ["Davis", "Mr. Brad Davis", 1, false],
  ["Davis", "The Davis Family", 2, false],
  ["Dearman", "Dr. Ken and Mr. Anthony Dearman", 2, true],
  ["DeFilippo", "Ms. Camryn DeFilippo", 1, false],
  ["Devito", "Mr. Cooper Devito", 1, false],
  ["Devito", "Mr. Tate Devito", 1, false],
  ["Devito", "Mrs. Lesli Devito", 1, false],
  ["Dickinson", "Mr. and Mrs. Cole Dickinson", 2, true, {
    members: [
      { firstName: "Cole", lastName: "Dickinson" },
      { firstName: "Ellie", lastName: "Dickinson" }
    ]
  }],
  ["Dickinson", "Mr. and Mrs. T.M. Dickinson", 2, true],
  ["Dickinson", "Mr. Tee Dickinson", 1, false],
  ["Dillard", "Mr. Ian Dillard and Guest", 2, false],
  ["Dilliard", "Drs. Reggie and Jennifer Dilliard", 2, false],
  ["Dosey", "Future Mr. and Ms. Jordan Dosey", 2, true, {
    members: [
      { firstName: "Jordan", lastName: "Dosey" },
      { firstName: "Grace", lastName: "Dosey" }
    ]
  }],
  ["Drometer", "Mr and Mrs. Todd Drometer", 2, false],
  ["Eissler", "Mr. and Mrs. Mark Eissler", 2, false],
  ["Emerson", "Mr. Ezekiel Emerson", 1, false],
  ["Fecsko", "Mr. and Mrs. Joseph Fecsko", 2, false],
  ["Fife", "Mr. and Mrs. David Fife", 3, false, {
    members: [
      { firstName: "David", lastName: "Fife" },
      { firstName: "Marian", lastName: "Fife" },
      { firstName: "Jack", lastName: "Fife" }
    ]
  }],
  ["Franz", "Mr. and Mrs. Thomas Franz", 2, false],
  ["Freedman", "Ms. Wendy Freedman", 1, false],
  ["Garnett", "Future Mr. and Ms. Emerson Garnett", 1, false],
  ["Geismer", "Mr. and Mrs. Michael Geismer", 2, false],
  ["Geraghty", "Mr. George Geraghty", 1, false],
  ["Gibbons", "Mr. and Mrs. Joel Gibbons", 2, true, {
    members: [
      { firstName: "Joel", lastName: "Gibbons" },
      { firstName: "Bunny", lastName: "Gibbons" }
    ]
  }],
  ["Gibbons", "Mr. Woods Gibbons", 1, true],
  ["Goldstern", "Future Mr. and Mrs. Joshua A Goldstern", 2, false, {
    members: [
      { firstName: "Joshua A", lastName: "Goldstern" },
      { firstName: "Anna", lastName: "Goldstern" }
    ]
  }],
  ["Greene", "Mr. and Mrs. Landon Greene", 2, false],
  ["Greene", "Mr. Cameron Greene", 1, false],
  ["Greene", "Mr. Davis Greene", 1, false],
  ["Greene", "Ms. Sharon Greene and Ms. Mallory Greene", 2, false],
  ["Groome", "Mr. and Mrs. Peter Groome", 2, false],
  ["Hamilton", "Mr. and Mrs. Donald Ross Hamilton Jr", 2, false],
  ["Hamilton", "Mr. and Mrs. Marshall Hamilton and Family", 4, true],
  ["Hamilton", "Mr. David Ross Hamilton", 1, false],
  ["Hamilton", "Mr. William Kearns Hamilton", 1, false],
  ["Harris", "Mr. and Mrs. Stuart Horsley Harris III", 2, false],
  ["Heald", "Mr. Sam Heald", 2, false],
  ["Hegemier", "Mr. and Mrs. Matthew Hegemier", 2, false],
  ["Herndon", "Mr. Oliver Herndon and Ms. Coleman Lucas", 2, true],
  ["Herndon", "Mr. Sam Herndon", 1, false],
  ["Holmes", "Ms. Hobby Holmes and Guest", 2, false],
  ["Horak", "Mr. and Mrs. Thomas Horak", 2, false],
  ["Hurley", "Mr. and Mrs. Charles Hurley and Family", 4, false],
  ["Johan", "Mr. and Mrs. Christopher Johan", 2, false],
  ["Johan", "Mr. and Mrs. Paul Johan", 2, false],
  ["Johan", "Ms. Carter Johan and guest", 2, false],
  ["Johnston", "Mr. and Mrs. Richard Johnston", 2, false],
  ["Jones", "Mr. and Mrs. Thad Jones", 2, false],
  ["Kessinger", "Future Mr. and Mrs. Jonathan Kessinger", 2, false],
  ["Kilgallon", "Mr and Mrs. John Kilgallon", 2, false],
  ["Kilgallon", "Mr. Jack Kilgallon and guest", 2, false],
  ["Kochard", "Mr. and Mrs. Larry Kochard", 2, false],
  ["Krakower", "Mr. Adam Krakower", 1, false],
  ["Kreienbaum", "Mr. and Mrs. Tony Kreienbaum", 3, true, {
    members: [
      { firstName: "Tony", lastName: "Kreienbaum" },
      { firstName: "Katy", lastName: "Kreienbaum" },
      { firstName: "Anna", lastName: "Kreienbaum", eventExclusions: ["rehearsal"] }
    ]
  }],
  ["Kreienbaum", "Mr. Henry Kreienbaum and Ms. Greer Saunders", 2, true],
  ["Laing", "Mr. and Mrs. Chris Laing & family", 4, false],
  ["Lesemann", "Mr. and Mrs. Reenst Lesemann", 2, false],
  ["Louis", "Mr. and Ms. Fisher Louis", 2, false],
  ["Lowe", "Mr. and Mrs. Courtney Lowe", 2, false],
  ["Lowe", "Ms. Caitlyn Lowe and Mr. Sam Rodiger", 2, false],
  ["Mackey", "Mr. Brett Mackey and Ms. Megan McBride", 2, false],
  ["Maurer", "Mr. and Mrs. James Maurer", 2, false],
  ["McGee", "Ms. Abby McGee", 1, false],
  ["McNeese", "Mr. and Mrs. James C. McNeese", 2, true],
  ["Meadow", "Mr. and Mrs. Cary Meadow", 2, false],
  ["Miller", "Dr. and Mrs. Scott Miller", 2, false],
  ["Miller", "The Miller Family", 5, false],
  ["Montgomery", "Mr. and Mrs. Kelly Montgomery", 2, false],
  ["Myers", "Dr. and Mrs. Wallin Myers", 2, false],
  ["Nadler", "Mr. Matthew Nadler and Mr. Nicholas Bienen-Esayian", 2, false],
  ["Nicholson", "Mr. and Mrs. Steve Nicholson", 2, false],
  ["Northington", "Mr. and Mrs. Robert Northington", 2, false],
  ["Northington", "Mr. Banks Northington and Ms. Caroline Hartigan", 2, false],
  ["Oken", "Mr. and Mrs. Glenn Oken", 2, false],
  ["O'Leary", "Ms. Kerin O'Leary", 1, false],
  ["Page", "Mr. Hughes Page and Ms. Kade Schwabacher", 2, false],
  ["Parker", "Ms. Lilly Parker", 2, true],
  ["Plumb", "Mr. and Mrs. William Plumb", 2, false],
  ["Rardin", "Ms. Amy Rardin", 1, false],
  ["Reichert", "Mr. and Mrs. Gage Reichert", 2, false],
  ["Reichert", "Mr. and Mrs. Hunter Reichert", 2, true],
  ["Reichert", "Mr. and Mrs. Kyle Reichert", 2, true],
  ["Reichert", "Mr. Jonathan Charles Reichert and Ms. Elise Calzaretta", 2, true],
  ["Reichert", "Mr. Angus Reichert", 1, false],
  ["Reichert", "Mr. Griffin Reichert", 1, false],
  ["Reichert", "Mr. Fox Reichert", 1, false],
  ["Reichert", "Mr. Gresham Harrison Reichert and Ms. Olivia Rentz", 2, true],
  ["Reichert", "Mr. William Jackson Reichert", 1, true],
  ["Reichert", "Mr. Tyler Reichert", 1, false],
  ["Reichert", "Ms. Eve Reichert", 1, false],
  ["Reid", "Mr. John Barlow Reid and Ms. Sarah Smith", 2, false],
  ["Reiss", "Mr. Josh Reiss and Ms. Maggie Lavoie", 2, false],
  ["Reiter", "Mr. and Mrs. Garrett Reiter", 2, false],
  ["Rittinger", "Ms. Kristy Rittinger", 1, false],
  ["Romness", "Dr. and Mrs. Mark Romness", 2, false, {
    members: [
      { firstName: "Mark", lastName: "Romness" },
      { firstName: "Christine", lastName: "Romness" }
    ]
  }],
  ["Romness", "Mr. Brandon Watt and Ms. Anna Romness", 2, false],
  ["Romness", "Mr. William Romness and Guest", 2, false],
  ["Romness", "Ms. Jane Romness and Guest", 2, false],
  ["Rutledge", "Ms. Doesy Rutledge", 1, false],
  ["Schaeffer", "The Schaeffer Family", 6, false],
  ["Schotta", "Mr. John Schotta and Guest", 2, false],
  ["Schotta", "Mr. Rob Schotta", 1, false],
  ["Schotta", "Mr. Robert Schotta", 1, false],
  ["Schotta", "Ms. Carter Schotta", 1, false],
  ["Sezon", "Ms. Jeannine Sezon", 2, false],
  ["Shope", "Ms. Sami Shope", 1, false],
  ["Spadaccini", "Mr. Matt Baffuto and Mrs. Erin Spadaccini", 2, false],
  ["Stalfort", "Mr. and Mrs. Sean Stalfort", 2, false],
  ["Takes", "Mr. Craig Takes and Mrs. Heather Takes-Trees", 2, false],
  ["Tepper", "Mr. Andrew Tepper", 1, false],
  ["Thompson", "Mr. and Mrs. Bryan Thompson", 2, true],
  ["Turnbull", "Ms. Lauren Turnbull and Mr. Cole Martin", 2, true],
  ["Turnbull", "The Turnbull Family", 3, false],
  ["Venable", "Mr. and Mrs. Andrew Venable", 2, false],
  ["Walsh", "Mr. and Mrs. Andrew Walsh", 2, false],
  ["Warren", "Mr. and Mrs. Vaden Warren", 2, false],
  ["Williams", "Ms. Elizabeth Williams", 1, false],
  ["Williamson", "Mr. and Mrs. John Paul Williamson", 2, false],
  ["Wright", "Drs. Bryan and Katy Wright", 2, false],
  ["Wright", "Mr. and Mrs. Spencer Wright", 2, false],
  ["Xiang", "Future Mr. and Mrs. Justin Xiang", 2, false],
  ["Yarborough", "Mr. and Mrs. Matthew Yarborough", 2, true],
  ["Young", "Mr. and Mrs. Matthew Young", 2, false, { qualifier: "FL" }],
  ["Young", "Mr. and Mrs. Matthew Young", 2, false, { qualifier: "OH" }],
  ["Young", "Mr. and Mrs. Oliver Young", 2, false],
  ["Young", "Ms. Chloe Young", 1, false],
  ["Young", "Mr. and Mrs. Stephen Young", 2, false],
  ["McNeese", "Mr. James McNeese II, Luke and Lance McNeese", 3, true],
  ["Crawford", "Mr. and Mrs. Wilson Crawford", 2, false],
  ["Wood", "Mr. and Mrs. Hunter Wood", 2, false],
  ["Jones", "Ms. Donna Hall Jones", 1, false],
  ["Hanggi", "Mr. and Mrs. Bob Hanggi", 2, false],
  ["Breeden", "Dr. and Mrs. Richard Breeden", 2, false],
  ["Smith", "Mr. and Mrs. Mickey Smith", 2, false],
  ["Carroll", "Ms. Connie Craig Carroll", 1, false],
  ["Bays", "Mr. and Mrs. Stephen Bays", 2, false],
  ["Bond", "Mr. and Mrs. Cory Bond", 2, false],
  ["Costa", "Ms. Mary Costa", 1, false],
  ["Hunt", "Mr. and Mrs. Tommy Hunt", 2, false],
  ["Howard", "Mr. and Mrs. Michael Howard", 2, false],
  ["McNeese", "Mr. and Mrs. Larry McNeese", 2, false],
  ["Tonas", "Mr. Angelo Tonas and Ms. Paige", 2, false]
];

const TITLE_RE = /^(future\s+)?(drs?\.?|mrs?\.?|ms\.?)\s+/i;
const NAME_SUFFIXES = new Set(["jr", "jr.", "sr", "sr.", "ii", "iii", "iv", "v"]);

function stripTitle(token) {
  return token.replace(TITLE_RE, "").trim();
}

// Splits "Mr. Charles Carpenter" -> { firstName: "Charles", lastName: "Carpenter" }
// using everything but the last whitespace-separated word as the first name,
// so multi-word first/middle names (e.g. "James C." or "Jonathan Charles")
// stay attached to the right person. A trailing generational suffix ("Jr",
// "III", ...) is folded into the last name instead of being read as one.
function splitNamed(text, fallbackLast) {
  const cleaned = stripTitle(text.trim());
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: fallbackLast };
  }
  let lastName = parts[parts.length - 1];
  let firstParts = parts.slice(0, -1);
  if (NAME_SUFFIXES.has(lastName.toLowerCase()) && firstParts.length >= 2) {
    lastName = `${firstParts[firstParts.length - 1]} ${lastName}`;
    firstParts = firstParts.slice(0, -1);
  }
  return { firstName: firstParts.join(" "), lastName };
}

// `kind` describes what the unnamed seat actually is, so the RSVP form can
// label it ("Your guest" vs "Family member") when it asks whoever is filling
// the form in to supply the real name. It ships to the client; `note` is
// only for this script's console report.
function withCount(members, guestsOnInvite, lastName, placeholderLabel, kind = "guest") {
  const named = members.length;
  const missing = Math.max(0, guestsOnInvite - named);
  const out = [...members];
  for (let i = 0; i < missing; i++) {
    out.push({
      firstName: missing === 1 ? "Guest" : `Guest ${i + 1}`,
      lastName,
      placeholder: true,
      placeholderKind: kind,
      note: placeholderLabel
    });
  }
  return out;
}

// Returns { members, unparsed } for one invite line.
function parseInvite(lastName, invite, guestsOnInvite) {
  const text = invite.trim();

  if (/^the\s+.+\s+family$/i.test(text)) {
    return {
      members: withCount([], guestsOnInvite, lastName, "unnamed family — fill in real names", "family"),
      unparsed: true
    };
  }

  // "X, Y and Z LASTNAME" — 3 first names sharing (or explicit) last names.
  // e.g. "Mr. James McNeese II, Luke and Lance McNeese"
  const triple = text.match(/^(.+?),\s*(.+?)\s+and\s+(.+)$/i);
  if (triple && !/and guest/i.test(text)) {
    const [, a, b, c] = triple;
    const named3 = splitNamed(c, lastName);
    const named1 = splitNamed(a, named3.lastName);
    const named2 = { firstName: b.trim(), lastName: named3.lastName };
    return { members: [named1, named2, named3] };
  }

  // "... and Guest" / "and guest"
  const andGuest = text.match(/^(.+?)\s+and\s+guest$/i);
  if (andGuest) {
    const named = splitNamed(andGuest[1], lastName);
    return { members: withCount([named], guestsOnInvite, lastName, "unnamed +1", "plus-one") };
  }

  // Two fully named people: "TITLE FIRST [MIDDLE] LAST and TITLE FIRST2 [MIDDLE2] LAST2"
  const twoNamed = text.match(/^((?:future\s+)?(?:drs?\.?|mrs?\.?|ms\.?)\s+.+?)\s+and\s+((?:drs?\.?|mrs?\.?|ms\.?)\s+.+)$/i);
  if (twoNamed) {
    const left = twoNamed[1].trim();
    const right = twoNamed[2].trim();
    const rightNamed = splitNamed(right, lastName);
    // If the left side is a single bare first name (e.g. "Dr. Christine" from
    // "Dr. Christine and Mr. Stephen Collins"), it shares the right side's
    // last name. If it's multi-word, only treat it as a compound first name
    // sharing the right's surname when it does NOT already resolve to this
    // row's real last name on its own (that's how "Dr. Mary Jo and Mr.
    // Andrew Collins" differs from "Mr. Charles Carpenter and Ms. Elizabeth
    // Berner" — the latter's left side genuinely is "Charles" + "Carpenter").
    const leftBare = stripTitle(left);
    let leftNamed;
    if (!/\s/.test(leftBare)) {
      leftNamed = { firstName: leftBare, lastName: rightNamed.lastName };
    } else {
      const candidate = splitNamed(left, lastName);
      leftNamed = candidate.lastName.toLowerCase() === lastName.toLowerCase()
        ? candidate
        : { firstName: leftBare, lastName: rightNamed.lastName };
    }
    return { members: withCount([leftNamed, rightNamed], guestsOnInvite, rightNamed.lastName || lastName, "unnamed extra", "guest") };
  }

  // "TITLE FIRST1 and FIRST2 LASTNAME[, and family]" — one leading title
  // covering two first names that share a single last name, e.g.
  // "Drs. Greg and Elissa Brebach and family" or "Drs. Bryan and Katy Wright".
  const twoFirstNamesSharedLast = text.match(
    /^(?:future\s+)?(?:drs?\.?|mrs?\.?|ms\.?)\s+([A-Za-z.'-]+)\s+(?:and|&)\s+([A-Za-z.'-]+)\s+([A-Za-z.'-]+)(?:\s+(?:and|&)\s+family)?$/i
  );
  if (twoFirstNamesSharedLast) {
    const [, first1, first2, sharedLast] = twoFirstNamesSharedLast;
    const named = [
      { firstName: first1, lastName: sharedLast },
      { firstName: first2, lastName: sharedLast }
    ];
    return { members: withCount(named, guestsOnInvite, sharedLast, "unnamed family", "family") };
  }

  // "Mr./Dr. and Mrs./Ms. FIRST LAST[, and family/Family]"
  const mrAndMrs = text.match(/^(?:future\s+)?(?:mr\.?|drs?\.?)\s*(?:and|&)\s*(?:mrs?\.?|ms\.?)\s+(.+?)(\s+(?:and|&)\s+family)?$/i);
  if (mrAndMrs) {
    const named = splitNamed(mrAndMrs[1], lastName);
    return { members: withCount([named], guestsOnInvite, named.lastName || lastName, "unnamed spouse/family", "guest") };
  }

  // Single named person: "TITLE FIRST [MIDDLE] LAST"
  const single = text.match(/^(?:future\s+)?(?:drs?\.?|mrs?\.?|ms\.?)\s+.+$/i);
  if (single) {
    const named = splitNamed(text, lastName);
    return { members: withCount([named], guestsOnInvite, named.lastName || lastName, "unnamed extra", "guest") };
  }

  // Nothing matched — bail out with a flagged placeholder.
  return {
    members: withCount([], guestsOnInvite, lastName, `could not parse invite line: "${invite}"`, "guest"),
    unparsed: true
  };
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const usedIds = new Map();
const households = [];
const flagged = [];

for (const [lastName, invite, guestsOnInvite, rehearsal, options = {}] of RAW_ROWS) {
  const { members, unparsed } = options.members
    ? { members: withCount(options.members, guestsOnInvite, lastName, "unnamed extra", "guest") }
    : parseInvite(lastName, invite, guestsOnInvite);
  const baseId = slugify(`${lastName}-${members[0]?.firstName || "guest"}`);
  const count = usedIds.get(baseId) || 0;
  usedIds.set(baseId, count + 1);
  const id = count === 0 ? baseId : `${baseId}-${count + 1}`;

  const events = rehearsal ? ["rehearsal"] : [];
  if (WELCOME_PARTY_FOR_ALL) events.push("welcome");

  const household = {
    id,
    members: members.map(({ note, ...m }) => m),
    events
  };
  if (options.qualifier) household.qualifier = options.qualifier;

  households.push(household);

  if (unparsed || members.some((m) => m.placeholder)) {
    flagged.push({ id, invite, members, unparsed });
  }
}

const fileBody = `// Server-side only. Generated by scripts/build-guest-data.mjs from the
// "Ben and Emily Wedding Guest Tracker" sheet — do not hand-edit the bulk of
// this file, re-run the script instead. This file is read by the /api
// serverless functions and is NEVER imported from src/, so it does not get
// bundled into the public site's JS.
//
// Households flagged with a placeholder "Guest" member are ones where the
// sheet's invite line didn't spell out every attendee's real name (e.g.
// "Mr. and Mrs. X", "The X Family", "X and Guest"). See the importer's
// console output for the full list — fix names directly below as you learn
// them, or update the sheet and re-run the script.

// The wedding itself is not listed in any household's \`events\` — every
// invitation includes it — but it is defined here so the RSVP form can show
// the same date/time/venue detail for it as for the Friday events.
export const WEDDING_EVENT = {
  key: "wedding",
  label: "Wedding Ceremony & Reception",
  date: "Saturday, October 24, 2026",
  time: "4:30 PM",
  venue: "Christ Episcopal Church, then Rosemont Farm",
  attire: "Black Tie Optional"
};

export const EVENT_DEFINITIONS = {
  rehearsal: {
    label: "Rehearsal Dinner",
    date: "Friday, October 23, 2026",
    time: "5:30 PM",
    venue: "Farmington Country Club",
    attire: "Cocktail Attire"
  },
  welcome: {
    label: "Welcome Party",
    date: "Friday, October 23, 2026",
    time: "8:00 PM",
    venue: "Farmington Country Club",
    attire: "Cocktail Attire"
  }
};

// Entrée choices for the Saturday reception dinner at Rosemont Farm.
export const MEAL_OPTIONS = ["Steak", "Salmon", "Vegetarian"];

// What each guest wants poured for the toast at the reception.
export const TOAST_OPTIONS = ["Bourbon", "Champagne", "Non Alcoholic Apple Cider"];

export const GUESTS = ${JSON.stringify(households, null, 2)};
`;

writeFileSync(join(__dirname, "..", "api", "_data", "guests.js"), fileBody);

// A duplicated invite line in the sheet means one family gets counted twice
// in the headcount and (before the lookup collapses them) would be offered
// two identical invitations to choose between. Surface it rather than
// silently dropping a row — only the couple can say which is correct.
const rowKeys = new Map();
for (const [lastName, invite, guestsOnInvite, rehearsal, options = {}] of RAW_ROWS) {
  const key = `${lastName}|${invite}|${guestsOnInvite}|${rehearsal}|${options.qualifier || ""}`.toLowerCase();
  rowKeys.set(key, (rowKeys.get(key) || 0) + 1);
}
const duplicateRows = [...rowKeys.entries()].filter(([, n]) => n > 1);

console.log(`Wrote ${households.length} households (${households.reduce((n, h) => n + h.members.length, 0)} guests) to api/_data/guests.js`);
console.log(`\n${flagged.length} households have a placeholder "Guest" name or couldn't be parsed cleanly — review these:\n`);
for (const f of flagged) {
  const names = f.members.map((m) => `${m.firstName} ${m.lastName}`).join(", ");
  console.log(`  [${f.id}] "${f.invite}" -> ${names}${f.unparsed ? "  ⚠️ UNPARSED" : ""}`);
}

if (duplicateRows.length > 0) {
  console.log(`\n⚠️  ${duplicateRows.length} invite line(s) appear more than once in RAW_ROWS — likely duplicated rows in the sheet:\n`);
  for (const [key, n] of duplicateRows) {
    console.log(`  x${n}  ${key.split("|")[1]}`);
  }
  console.log("\n  Each copy becomes its own household and its own seat count. Remove the extra row(s) above if they are the same family.");
}
