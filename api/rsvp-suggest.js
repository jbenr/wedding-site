// Vercel serverless function: POST { field: "first"|"last", value } -> up to
// 8 matching { firstName, lastName } pairs from the guest list, for
// autocomplete as someone types their name. Only real named guests are
// offered (generated "Guest"/"Guest 1" placeholders for unnamed plus-ones
// are excluded) — nobody can enumerate the full guest list through this,
// just get suggestions for names close to what they've already typed.

import { GUESTS } from "./_data/guests.js";

function normalize(value) {
  return (value || "").trim().toLowerCase();
}

const NAMED_MEMBERS = GUESTS.flatMap((household) => household.members).filter(
  (m) => !/^guest(\s|$)/i.test(m.firstName)
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { field, value } = req.body || {};
  const query = normalize(value);

  if ((field !== "first" && field !== "last") || query.length < 2) {
    return res.status(200).json({ suggestions: [] });
  }

  const seen = new Set();
  const matches = [];
  for (const member of NAMED_MEMBERS) {
    const target = field === "first" ? member.firstName : member.lastName;
    if (!normalize(target).startsWith(query)) continue;
    const key = `${member.firstName}|${member.lastName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    matches.push(member);
  }

  matches.sort((a, b) => a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName));

  return res.status(200).json({ suggestions: matches.slice(0, 8) });
}
