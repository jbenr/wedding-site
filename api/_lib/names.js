// Server-side only (the leading underscore keeps Vercel from routing these
// as functions). Shared by rsvp-lookup and rsvp-suggest so that the name a
// guest sees offered in autocomplete is guaranteed to be a name the lookup
// can actually match.

// Guests type their names the way they write them, not the way the invite
// spreadsheet spelled them: "O'Brien" vs "OBrien", "Bienen-Esayian" vs
// "Bienen Esayian", "Renée" vs "Renee". Folding both sides down to bare
// lowercase words makes all of those compare equal.
export function fold(value) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’`.]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokenize(value) {
  return fold(value).split(" ").filter(Boolean);
}

const TITLES = new Set(["mr", "mrs", "ms", "miss", "mx", "dr", "drs", "future"]);
const SUFFIXES = new Set(["jr", "sr", "ii", "iii", "iv"]);

// Strips honorifics and generational suffixes so "Mr. James McNeese Jr"
// compares as ["james", "mcneese"].
export function nameTokens(value) {
  return tokenize(value).filter((t) => !TITLES.has(t) && !SUFFIXES.has(t));
}

export function fullName(member) {
  return `${member.firstName} ${member.lastName}`;
}

export function isPlaceholder(member) {
  return Boolean(member.placeholder);
}

// Does `typed` identify `member`?
//
//   "exact"   — the whole name matches once folded.
//   "relaxed" — first and last word both match, ignoring anything between.
//               This is what lets someone stored as "James C. McNeese" find
//               themselves by typing "James McNeese", or "Mary Jo Collins"
//               by typing "Mary Collins".
//
// Callers prefer exact matches and only fall back to relaxed ones, so a
// relaxed near-miss can never shadow somebody's real invitation.
export function matchStrength(typed, member) {
  const typedTokens = nameTokens(typed);
  const memberTokens = nameTokens(fullName(member));
  if (typedTokens.length < 2 || memberTokens.length < 2) return null;

  if (typedTokens.join(" ") === memberTokens.join(" ")) return "exact";

  const sameFirst = typedTokens[0] === memberTokens[0];
  const sameLast = typedTokens[typedTokens.length - 1] === memberTokens[memberTokens.length - 1];
  return sameFirst && sameLast ? "relaxed" : null;
}

// A short, human-readable description of who is on an invitation, used to
// disambiguate when two households share a guest's name. Unnamed seats are
// summarized as a count rather than shown as "Guest 2".
export function describeHousehold(household) {
  const named = household.members.filter((m) => !isPlaceholder(m));
  const unnamed = household.members.length - named.length;
  const parts = named.map((m) => fullName(m));
  let label = parts.join(" & ");
  if (unnamed > 0) {
    const suffix = `${unnamed} guest${unnamed === 1 ? "" : "s"}`;
    label = label ? `${label} + ${suffix}` : `${household.members[0].lastName} household (${suffix})`;
  }
  return label;
}
