// Vercel serverless function: resolves a guest to their invitation.
//
//   POST { name }         -> that one household, or a short list to choose
//                            from when the name is on more than one invite.
//   POST { householdId }  -> that household directly, for the follow-up
//                            request after the guest picks from that list.
//
// The full guest list in ./_data/guests.js never reaches the browser — only
// the one matched household is returned.

import { EVENT_DEFINITIONS, MEAL_OPTIONS, TOAST_OPTIONS, WEDDING_EVENT, GUESTS } from "./_data/guests.js";
import { matchStrength, describeHousehold, isPlaceholder, nameTokens } from "./_lib/names.js";

// Order the Friday events are presented in, regardless of the order they
// happen to appear in a household's `events` array.
const EVENT_ORDER = ["rehearsal", "welcome"];

const NOT_FOUND =
  "We couldn't find that name on the guest list. Double-check the spelling, " +
  "or let Ben or Emily know.";

function serializeHousehold(household) {
  const events = EVENT_ORDER.filter((key) => household.events.includes(key) && EVENT_DEFINITIONS[key]).map(
    (key) => ({ key, ...EVENT_DEFINITIONS[key] })
  );

  return {
    householdId: household.id,
    members: household.members.map((m) => ({
      firstName: m.firstName,
      lastName: m.lastName,
      // Unnamed seats ("and Guest", "The X Family") come through flagged so
      // the form can ask whoever is responding to fill in the real name.
      ...(isPlaceholder(m) ? { placeholder: true, placeholderKind: m.placeholderKind || "guest" } : {}),
      ...(Array.isArray(m.eventExclusions) && m.eventExclusions.length > 0
        ? { eventExclusions: m.eventExclusions }
        : {})
    })),
    wedding: WEDDING_EVENT,
    events,
    mealOptions: MEAL_OPTIONS,
    toastOptions: TOAST_OPTIONS
  };
}

// Placeholder seats are literally named "Guest 2", so they must never be
// matchable — otherwise typing "Guest Barnes" would open someone's invite.
function findHouseholdsByName(name) {
  const exact = [];
  const relaxed = [];

  for (const household of GUESTS) {
    let best = null;
    for (const member of household.members) {
      if (isPlaceholder(member)) continue;
      const strength = matchStrength(name, member);
      if (strength === "exact") {
        best = "exact";
        break;
      }
      if (strength === "relaxed") best = best || "relaxed";
    }
    if (best === "exact") exact.push(household);
    else if (best === "relaxed") relaxed.push(household);
  }

  // A relaxed near-miss must never shadow a real, exact invitation.
  return exact.length > 0 ? exact : relaxed;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, householdId } = req.body || {};

  if (householdId) {
    const household = GUESTS.find((h) => h.id === householdId);
    if (!household) return res.status(404).json({ error: NOT_FOUND });
    return res.status(200).json({ household: serializeHousehold(household) });
  }

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Enter your first and last name." });
  }

  if (nameTokens(name).length < 2) {
    return res.status(400).json({
      error: "Enter your first and last name."
    });
  }

  const matches = findHouseholdsByName(name);

  if (matches.length === 0) {
    return res.status(404).json({ error: NOT_FOUND });
  }

  // A handful of guests appear on two invitations (their own and a partner's,
  // or two relatives who share a name). Rather than dead-ending them, offer
  // the invitations to choose between, described by who else is on each.
  if (matches.length > 1) {
    // If the tracker sheet holds a genuinely duplicated invite line, two
    // choices would render with identical text and the guest could not tell
    // them apart. Collapse those to the first one — whichever household id
    // wins, it is the same people and the same events.
    const seenLabels = new Set();
    const choices = [];
    for (const h of matches) {
      const label = describeHousehold(h);
      if (seenLabels.has(label)) continue;
      seenLabels.add(label);
      choices.push({ householdId: h.id, label });
    }

    if (choices.length === 1) {
      const only = matches.find((h) => h.id === choices[0].householdId);
      return res.status(200).json({ household: serializeHousehold(only) });
    }

    return res.status(200).json({ choices });
  }

  return res.status(200).json({ household: serializeHousehold(matches[0]) });
}
