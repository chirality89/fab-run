# ROADMAP.md — Fab Run

Work top to bottom, one checkbox per session. Plan in `tasks/todo.md` first (see `PROJECT.md`). Tick the box here when done. Before starting a milestone, settle the `docs/decisions.md` items it depends on.

Current milestone: **M3 — The run**

## M0 — Move in
- [x] Turn on GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root); confirm the placeholder page loads at `https://chirality89.github.io/fab-run/` on desktop and phone
- [x] `npm test` passes (content cross-references)
- [x] Settle D7 (tech stack) and O8 (name) from `docs/decisions.md`; update CLAUDE.md §4 if anything changes

## M1 — Engine core, no screen (needs O2, O4, O6)
- [x] `src/engine/rng.js`: port mulberry32 from FabSim2; seed in state; tests that the same seed gives the same sequence
- [x] `src/engine/lot.js`: lot state, defect patterns, yield math (losses multiply, no healing); tests with hand-computed values from David
- [x] `src/engine/resolve.js`: the eight effect operations from `content.js`, including `when` conditions; one test per operation
- [x] `src/content/balance.js`: starting cash, time budgets, scrap line, spec, hand size
- [x] `src/content/lotTypes.js`: the inlaid Cu line route from DESIGN.md §11
- [x] Bot: plays the Cu line route headless with a fixed seed; reports final yield, cash, time; no `NaN`/`Infinity`

## M2 — One room you can play
- [x] `src/ui/`: a single process room (etch) on screen: hand, time budget, slots, tool health, yield bar, wafer map
- [x] Playing a card calls the engine and redraws; seed shown on screen
- [x] Playwright set up; screenshots at 1280×800 and 375×812; checked by eye

## M3 — The run (needs O3)
- [x] Map of the Cu line route with side-stop branches (metrology, PM/DOE, procurement, event)
- [ ] Procurement stop: buy equipment and materials with cash
- [ ] PM/DOE stop: restore a tool or upgrade one practice (needs tool wear first)
- [ ] Three events with a tradeoff each
- [ ] Ship screen: yield against spec, cost per good die, cycle time; scrap and reject end states
- [ ] Save and resume a run (`SAVE_KEY`, storage-blocked safe)

## M4 — Notebook and unlocks (needs O1)
- [ ] Diagnose screen: name a failure mode from the evidence; right answer writes the notebook
- [ ] Notebook saved in its own localStorage key; survives a run-state version bump
- [ ] Starter pool vs unlocked pool; unlocked remedies appear in drafts and procurement

## M5 — Randomness and a second lot
- [ ] Lot modifiers, announced at run start; random lot type from the unlocked pool; fixed first run
- [ ] Second lot type: NMOS (see `docs/process-primer.md`)
- [ ] Content to about 40 items via `content-drafter`, reviewed by David and `physics-reviewer`

## M6 — Look and feel
- [ ] Room styling from `docs/art-direction.md`; film-growth and wafer-map hit animations; reduced-motion respected
- [ ] Card art setup (`docs/card-art-plan.md`): per-room tint and shade tokens in `tokens.css` (contrast checked); settle the `art` field in content entries
- [ ] Shared card frame: room band, cost chip, art window, kind and rarity, name, effect, tradeoff; kind shown by window style, rarity by 1–3 diamonds
- [ ] Practice art: microscope cross-sections drawn from the `--mat-*` tokens for every practice; `physics-reviewer` pass
- [ ] Item art: bay-window kit (room backdrops, tool bodies in room color, bottles and baths) for equipment, materials and consumables; lamp tower turns amber when the room's tool drifts
- [ ] Inspect view in the tool-schematic style; map rooms in the toy-diorama style
- [ ] Card motion: one loop of 6 s or less, plays on lift, hover or focus only; reduced motion shows a chosen key frame
- [ ] Phone layout pass

## M7 — Balance and share
- [ ] 100-run bot balance report (yield distribution, win rate, run length)
- [ ] Playtest with 3 people; fix the top issues
- [ ] Share the link

## Later
- Cross Section puzzle as an R&D side stop
- Disposition desk event (Papers, Please style)
- Stakes (harder specs), daily seed, shareable result card
- More lot types: via fill, TSV, hybrid bonding, cryogenic interconnect
