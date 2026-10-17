#!/usr/bin/env python3
"""Make balanced 2-person golf teams from signups.tsv.

Usage: python3 pairs.py [--seed N]
"""
import csv
import random
import re
import sys
from pathlib import Path

DATA = Path(__file__).with_name("signups.tsv")

# Handicaps that can't be parsed (or that need a judgment call).
# Keyed by lowercase name, or by phone digits when two people share a name.
OVERRIDES = {
    "perri bodman": 30,      # "Does not have one"
    "fox reichert": 18,      # "Shoot low 90s high 80s"
    "joel gibbons v": 28,    # wrote "100" -- read as shooting ~100
}

# Pairs that must play together (lowercase names).
FIXED = [
    ("charles bodman", "perri bodman"),
    ("kelli calzaretta", "john calzaretta"),
    ("chuck reichert", "elise calzaretta"),
    ("ben reichert", "oliver herndon"),  # the groom's pick
    ("courtney lowe", "hunter reichert"),
]

# Old timers only get paired with each other (lowercase names).
OLD_TIMERS = {
    "tyler brown",
    "tm dickinson",
    "gage reichert",
    "jp williamson",
    "courtney lowe",
    "ross hamilton (senior)",
    "joel gibbons iv",
}


def load():
    rows = list(csv.DictReader(open(DATA, newline=""), delimiter="\t"))
    name_counts = {}
    for row in rows:
        k = row["Name"].strip().lower()
        name_counts[k] = name_counts.get(k, 0) + 1

    players = {}
    for row in rows:
        name = row["Name"].strip()
        key = name.lower()
        phone = re.sub(r"\D", "", row["Phone Number"])[-10:]
        if name_counts[key] > 1:  # same name, different people -> tell apart by phone
            name = f"{name} (…{phone[-4:]})"
            key = f"{key} {phone}"
        if key in OVERRIDES or phone in OVERRIDES:
            hcp = float(OVERRIDES.get(key, OVERRIDES.get(phone)))
        else:
            m = re.search(r"\d+(\.\d+)?", row["Handicap Index"])
            if not m:
                sys.exit(f"Can't parse handicap for {name!r}: add it to OVERRIDES")
            hcp = float(m.group())
        players[key] = (name, hcp)
    return players


def cost(groups, target):
    return sum((sum(h for _, h in g) / len(g) - target) ** 2 for g in groups)


def optimize(free, fixed_groups, target, iters=20000, restarts=50, rng=random):
    """Local search: swap players between free groups to pull every group avg toward target."""
    best, best_cost = None, float("inf")
    for _ in range(restarts):
        pool = free[:]
        rng.shuffle(pool)
        groups = [pool[i:i + 2] for i in range(0, len(pool) - len(pool) % 2, 2)]
        if len(pool) % 2:  # odd one out joins a group -> one threesome
            groups[-1].append(pool[-1])
        c = cost(groups, target)
        for _ in range(iters):
            a, b = rng.sample(range(len(groups)), 2)
            i, j = rng.randrange(len(groups[a])), rng.randrange(len(groups[b]))
            groups[a][i], groups[b][j] = groups[b][j], groups[a][i]
            nc = cost(groups, target)
            if nc <= c:
                c = nc
            else:
                groups[a][i], groups[b][j] = groups[b][j], groups[a][i]
        if c < best_cost:
            best, best_cost = [g[:] for g in groups], c
    return fixed_groups + best


def main():
    seed = int(sys.argv[sys.argv.index("--seed") + 1]) if "--seed" in sys.argv else 0
    rng = random.Random(seed)

    players = load()
    fixed_groups, used = [], set()
    for a, b in FIXED:
        fixed_groups.append([players[a], players[b]])
        used |= {a, b}
    old = [p for k, p in players.items() if k in OLD_TIMERS and k not in used]
    rest = [p for k, p in players.items() if k not in OLD_TIMERS and k not in used]

    everyone = list(players.values())
    target = sum(h for _, h in everyone) / len(everyone)
    if len(old) % 2 == 0:
        groups = optimize(rest, fixed_groups, target, rng=rng)
        old_groups = optimize(old, [], target, rng=rng)
    else:
        # Odd number of old timers: let whichever one balances best join the general pool.
        best = None
        for p in old:
            g = optimize(rest + [p], [], target, iters=5000, restarts=10, rng=rng)
            og = optimize([q for q in old if q != p], [], target, iters=5000, restarts=10, rng=rng)
            c = cost(g + og, target)
            if best is None or c < best[0]:
                best = (c, p)
        mover = best[1]
        print(f"(Odd number of old timers -- {mover[0]} plays with the general pool)\n")
        groups = optimize(rest + [mover], fixed_groups, target, rng=rng)
        old_groups = optimize([q for q in old if q != mover], [], target, rng=rng)
    groups += old_groups

    groups.sort(key=lambda g: sum(h for _, h in g) / len(g))
    print(f"{len(everyone)} golfers, overall avg handicap {target:.1f}\n")
    print(f"{'#':>2}  {'Avg Hcp':>7}  {'Player 1':<28} {'Player 2':<28} Note")
    print("-" * 82)
    for n, g in enumerate(groups, 1):
        avg = sum(h for _, h in g) / len(g)
        cells = [f"{name} ({h:g})" for name, h in g]
        tag = "fixed" if g in fixed_groups else "old timers" if g in old_groups else ""
        print(f"{n:2}  {avg:7.2f}  {cells[0]:<28} {' + '.join(cells[1:]):<28} {tag}")
    avgs = [sum(h for _, h in g) / len(g) for g in groups]
    print(f"\nSpread of team averages: {min(avgs):.2f} – {max(avgs):.2f}")


if __name__ == "__main__":
    main()
