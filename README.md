# Ben & Emily — wedding site

React + Vite single-page site, deployed on Vercel. Saturday, October 24, 2026,
Charlottesville, Virginia.

```bash
npm install
npm run dev      # http://localhost:5173 — includes the /api routes (see below)
npm run build
npm run lint
```

## The RSVP flow

A guest types their name, gets their own invitation back, answers for
everyone on it, and submits.

```
guest types a name
  → POST /api/rsvp-suggest   autocomplete over real guest names
  → POST /api/rsvp-lookup    resolves the name to ONE household
      ├─ several matches? the guest picks which invitation is theirs
      └─ household → the form: one card per seat, every event, entrée choice
  → set(rsvps/<householdId>) in Firebase   ← source of truth
      ├─ set(rsvpMeta/<householdId>)       best-effort receipt
      └─ POST /api/rsvp-sheet-sync         best-effort spreadsheet mirror
```

**The guest list never reaches the browser.** `api/_data/guests.js` is
imported only by the serverless functions, never from `src/`, so a household
is only ever revealed to someone who can already name a person on it.
`npm run build` should never put a guest's name in `dist/` — worth
spot-checking if you touch the API layer.

**Unnamed seats.** Most invitations ("and Guest", "The X Family", "Mr. and
Mrs. X") don't name everyone, so those seats come through flagged as
placeholders and the form asks whoever is responding to fill in the real
name. Names supplied this way are marked `namedByGuest` and land in the
spreadsheet's "Name Source" column as *Guest* rather than *Invite*.

### Where responses land

| Where | What | Notes |
| --- | --- | --- |
| Firebase `rsvps/<householdId>` | Full answers | Source of truth. Write-only from the browser — read it in the Firebase console. |
| Firebase `rsvpMeta/<householdId>` | Timestamp + headcount | Readable, deliberately holds no answers. Lets a returning guest be told "we already have your response". |
| Guest tracker sheet, "RSVPs" tab | Mirror of every submission | Best-effort. A failure here never blocks a guest's RSVP. |

Resubmitting replaces a household's previous answers in all three.

### Checking RSVP status

Use the command-line status report for quick totals and household follow-up
lists:

```bash
npm run rsvp:status           # summary, RSVP'd households, pending households
npm run rsvp:summary          # counts and latest 5 RSVPs
npm run rsvp:pending          # who has not RSVP'd
npm run rsvp:rsvped           # who has RSVP'd
npm run rsvp:rd               # rehearsal dinner invite list + RSVP status
npm run rsvp:pending -- --rd  # rehearsal dinner households not yet RSVP'd
npm run rsvp:rsvped -- --rd   # rehearsal dinner households who have RSVP'd
npm run rsvp:status -- --csv  # spreadsheet-friendly household rows
npm run rsvp:status -- --json # full machine-readable report
```

This reads Firebase `rsvpMeta`, so it can safely show who has submitted,
household/seat totals, pending households, rehearsal dinner invite status,
wedding accepts so far, and the latest five RSVP timestamps. Full answers,
meal choices, dietary notes, and Friday-event answers remain in Firebase
`rsvps/<householdId>` and the mirrored `RSVPs` sheet.

## Updating the guest list

`api/_data/guests.js` is generated — don't hand-edit it.

1. Edit `RAW_ROWS` in `scripts/build-guest-data.mjs` to match the tracker sheet.
2. `node scripts/build-guest-data.mjs`

It reports every household whose invite line it couldn't fully parse, plus
any invite line that appears twice (a duplicated sheet row becomes two
households and two seat counts). Event dates, venues and the entrée options
also live at the top of that script, and are written into the generated file.

## Deploying the database rules

`firebase.database.rules.json` is **not** applied until you deploy it:

```bash
firebase deploy --only database
node scripts/check-rsvp-rules.mjs   # verifies what is actually live
```

The check script writes a throwaway household, confirms the rules accept
valid RSVPs and reject malformed ones, confirms nobody can read the
responses back, and cleans up after itself. Run it after any rules change —
a mistake is invisible in the app until a real guest hits it, in either
direction (too strict and RSVPs silently fail; too loose and everyone's
answers are public).

Read access in Realtime Database cascades and **cannot be revoked by a
deeper rule**, so the root stays closed and each public node opts in
individually.

## Environment variables

The spreadsheet mirror needs these set in Vercel (and in a local `.env`,
which is gitignored):

```
RSVP_SHEET_WEBHOOK_URL      # Apps Script /exec URL
RSVP_SHEET_WEBHOOK_SECRET   # shared secret the script checks
```

If they're unset, `/api/rsvp-sheet-sync` quietly no-ops and Firebase still
records everything. Setup steps for the Apps Script side are in the header of
`scripts/apps-script-rsvp-sync.gs`.

## Local /api routes

Vercel runs the `/api` functions in production. Locally, a small dev-only
plugin in `vite.config.js` runs the same handler modules in-process, so the
RSVP flow works under `npm run dev` without the Vercel CLI. It's `apply:
'serve'` and has no effect on the production build.

## Toggling the form

`RSVP_ENABLED` in `src/App.jsx` swaps the form for a "Coming soon" message.
The response deadline shown to guests is `RSVP_DEADLINE` in the same file.
