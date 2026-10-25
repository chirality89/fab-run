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
| D7 | Tech stack (23 Oct 2026) | Plain JavaScript ES modules, no bundler, no framework, no build step. Engine runs in Node. Matches CLAUDE.md §4 |
| O2 | Energy resource (23 Oct 2026) | Time budget per room; cards cost time. Cash is spent only at procurement. Equipment may still carry a running cash cost (e.g. the pad conditioner's `cashCost`) |
| O4 | How a run ends (23 Oct 2026) | Shipped (meets spec, scored), rejected (shipped below spec) or scrapped (yield below the scrap line, or the player scraps it). Cash below zero blocks purchases but does not end the run |
| O5 | First lot type (23 Oct 2026) | Inlaid Cu line. NMOS is the second lot type |
| O6 | Cards to hand (23 Oct 2026) | Draw a hand of 5 (size in `balance.js`) from the room-legal cards in the deck, using the seeded generator |
| O8 | Name (23 Oct 2026) | "Fab Run" |
| O3 | Map form (25 Oct 2026) | Cleanroom floor plan (bays are rooms, corridors are paths) that plays like Slay the Spire: the route's process rooms are fixed and in order; between them you pick 1 side stop from 2–3 offered (metrology, PM/DOE, procurement, event). Each side stop costs cycle time |

## Open

**O1 — What earns an unlock** (blocks M4)
- A: Finishing a run with a lot type. B: Diagnosing a failure mode.
- **Proposed: B.** Meta-progression becomes knowledge, and each unlock is the remedy for a problem you just understood.
