// Vercel serverless function: POST { query } -> up to 8 matching
// { firstName, lastName } pairs from the guest list, for autocomplete as
// someone types their full name.
//
// Only real named guests are offered — the generated "Guest"/"Guest 1"
// placeholders for unnamed plus-ones are excluded — so nobody can enumerate
// the full guest list through this, just get suggestions close to what they
// have already typed.
//
// Matching is folded through the same helpers as rsvp-lookup, so anything
// this offers is guaranteed to resolve when the guest picks it.

import { GUESTS } from "./_data/guests.js";
import { fold, tokenize, nameTokens, fullName, isPlaceholder } from "./_lib/names.js";

const MAX_SUGGESTIONS = 8;

// Precomputed once per cold start rather than per request.
const NAMED_MEMBERS = [];
const seenNames = new Set();
for (const household of GUESTS) {
  for (const member of household.members) {
    if (isPlaceholder(member)) continue;
    const key = fold(fullName(member));
    // The same person can sit on two invitations; offer them once and let
    // the lookup step sort out which invitation they meant.
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    NAMED_MEMBERS.push({
      firstName: member.firstName,
      lastName: member.lastName,
      tokens: nameTokens(fullName(member)),
      folded: key
    });
  }
}

// Every word typed must prefix-match some word of the name, so "Jack Kil"
// matches "Jack Kilgallon", and "Kilgallon" alone matches too, regardless of
// the order the words were typed in.
function matchesQuery(entry, queryTokens) {
  return queryTokens.every((qt) => entry.tokens.some((nt) => nt.startsWith(qt)));
}

// Lower sorts first: a name the guest has essentially finished typing beats
// one that merely shares a surname.
function rank(entry, queryTokens, foldedQuery) {
  if (entry.folded === foldedQuery) return 0;
  if (entry.tokens[0]?.startsWith(queryTokens[0])) return 1;
  return 2;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query } = req.body || {};
  const foldedQuery = fold(query);
  const queryTokens = tokenize(query);

  if (foldedQuery.length < 2 || queryTokens.length === 0) {
    return res.status(200).json({ suggestions: [] });
  }

  const matches = NAMED_MEMBERS.filter((entry) => matchesQuery(entry, queryTokens));

  matches.sort(
    (a, b) =>
      rank(a, queryTokens, foldedQuery) - rank(b, queryTokens, foldedQuery) ||
      // A middle name folded into firstName ("Mary Jo") still sorts sensibly
      // as part of that same string.
      a.firstName.localeCompare(b.firstName) ||
      a.lastName.localeCompare(b.lastName)
  );

  return res.status(200).json({
    suggestions: matches.slice(0, MAX_SUGGESTIONS).map(({ firstName, lastName }) => ({ firstName, lastName }))
  });
}
