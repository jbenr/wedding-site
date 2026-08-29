// Vercel serverless function: POST { firstName, lastName } -> that household's
// invitation only. The full guest list in ./_data/guests.js never reaches the
// browser — only the one matched household is returned.

import { EVENT_DEFINITIONS, MEAL_OPTIONS, GUESTS } from "./_data/guests.js";

function normalize(value) {
  return (value || "").trim().toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName, lastName } = req.body || {};
  const first = normalize(firstName);
  const last = normalize(lastName);

  if (!first || !last) {
    return res.status(400).json({ error: "Please enter both a first and last name." });
  }

  const matches = GUESTS.filter((household) =>
    household.members.some((m) => normalize(m.firstName) === first && normalize(m.lastName) === last)
  );

  if (matches.length === 0) {
    return res.status(404).json({
      error:
        "We couldn't find an invitation under that name. Please double-check the spelling, or reach out to Ben & Emily directly."
    });
  }

  if (matches.length > 1) {
    return res.status(409).json({
      error:
        "We found more than one invitation under that name. Please reach out to Ben & Emily directly so we can sort it out."
    });
  }

  const household = matches[0];
  const events = household.events
    .filter((key) => EVENT_DEFINITIONS[key])
    .map((key) => ({ key, label: EVENT_DEFINITIONS[key].label }));

  return res.status(200).json({
    householdId: household.id,
    members: household.members,
    events,
    mealOptions: MEAL_OPTIONS
  });
}
