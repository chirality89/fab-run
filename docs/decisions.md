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
| S10 | Card art (Oct 24, 2026) | Split by card kind: microscope cross-section on practices, bay window on equipment, materials and consumables, tool schematic for the inspect view and notebook, toy diorama for map rooms. Details: `docs/card-art-plan.md` |
| S11 | Tool color in art (Oct 24, 2026) | Tools are drawn in their room's color, litho tools included (yellow), as in the toy diorama style |
| S12 | Tech stack, was D7 (Oct 24, 2026) | Plain JavaScript ES modules, no bundler, no framework, no build step, no runtime dependencies. Engine runs in Node for tests and bot runs. Layout in `CLAUDE.md` §4 |
| S13 | Name, was O8 (Oct 24, 2026) | "Fab Run" |

## Open

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
