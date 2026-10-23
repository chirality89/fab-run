# Decisions

Settled decisions first, then open ones. Each open decision has a proposed answer. Claude Code asks David to confirm an open decision in the planning step of the milestone that needs it, then moves it to Settled with the date.

## Settled (brainstorming, Oct 2026)

| # | Decision | Answer |
|---|---|---|
| S1 | Genre | Slay the Spire–style roguelite card game |
| S2 | Lots per run | One lot, a clean run |
| S3 | Health bar | Wafer yield. Only goes down; losses multiply |
| S4 | Map | Each process area is a room or node |
| S5 | Cards vs menus | Cards where there is a real tradeoff; menus for routine settings |
| S6 | Lot types | Unlocked pool, random draw from it, modifiers on top; first run fixed |
| S7 | Balance principle | Laws fixed, situations random |
| S8 | Repo | `chirality89/fab-run`, public, GitHub Pages |
| S9 | Look | Highly stylized and bright, cleanroom palette: white, blue, yellow litho, a color per room |

## Open

**D7 — Tech stack** (blocks M1)
- A: One `index.html` like FabSim2. B: A few plain ES-module files, no bundler. C: React and Vite like FabForge.
- **Proposed: B.** The engine runs in Node with no browser, so tests and a bot can replay runs. GitHub Pages hosting is unchanged. No dependencies.

**O1 — What earns an unlock** (blocks M4)
- A: Finishing a run with a lot type. B: Diagnosing a failure mode.
- **Proposed: B.** Meta-progression becomes knowledge, and each unlock is the remedy for a problem you just understood.

**O2 — The energy resource** (blocks M1)
- A: Time budget per room. B: Cash per card. C: Both.
- **Proposed: A, with cash only for procurement.** Time is what real process choices cost, and it keeps Q-time meaningful.

**O3 — Map form** (blocks M3)
- A: Abstract node graph like Slay the Spire. B: Cleanroom floor plan where bays are rooms and corridors are paths.
- **Proposed: B, behaving like A.** Fixed process rooms in route order, with a pick of 1 side stop from 2–3 between them.

**O4 — How a run ends** (blocks M1)
- **Proposed:** the lot ships (score it), is rejected (shipped below spec) or is scrapped (yield below the scrap line, or the player scraps it). Cash below zero blocks purchases but does not end the run.

**O5 — First lot type** (blocks M1)
- A: Inlaid Cu line. B: NMOS transistor.
- **Proposed: A.** The content draft already covers its route, and it has the clearest failures (voids, dishing, underlayer attack). NMOS is the second lot type.

**O6 — How cards reach your hand** (blocks M1)
- A: Draw a hand of 5 from the room-legal cards in your deck. B: All room-legal cards visible, like a menu.
- **Proposed: A.** A limited hand is where the chaos and the build identity come from.

**O8 — Name** (M0)
- "Fab Run" is a working title.
