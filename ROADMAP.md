# ROADMAP.md — Fab Run

Work top to bottom, one checkbox per session. Plan in `tasks/todo.md` first (see `PROJECT.md`). Tick the box here when done. Before starting a milestone, settle the `docs/decisions.md` items it depends on.

Current milestone: **M4.5 — Winnable and readable** (David, 26 Oct 2026: do this before M5; scope in `tasks/next-stages.md`)

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
- [x] Procurement stop: buy equipment and materials with cash
- [x] Tool drift and wear: each room's tool drifts, shown on its SPC chart before it bites yield
- [x] PM stop: restore one tool on the route ahead
- [x] DOE stop: upgrade one practice for the run (upgrades as data)
- [x] Three events with a tradeoff each
- [x] Ship screen: yield against spec, cost per good die, cycle time; scrap and reject end states
- [x] Save and resume a run (`SAVE_KEY`, storage-blocked safe)

## M4 — Notebook and unlocks (needs O1)
- [x] Diagnose screen: name a failure mode from the evidence; right answer writes the notebook
- [x] Notebook saved in its own localStorage key; survives a run-state version bump
- [x] Notebook page: list your diagnosed failure modes, with their signatures and the seed each was found on
- [x] Starter pool vs unlocked pool; unlocked remedies appear in drafts and procurement

## M4.5 — Winnable and readable (from Lane F's playtest reports)
Items are Lane F issue numbers (`docs/playtest/summary.md`) and physics-review claims. Each item is planned in `tasks/todo.md` first. Exit test is in `tasks/next-stages.md`.
- [ ] Bring Lane F's reports and Lane D's native-oxide commit onto `main`
- [x] Remove the fixed etch and litho yield tax, so tool health and choices drive the loss (issue 1, claim 8)
- [x] Etch-stop logic (claim 11; David: the stop is a choice, route label "Deposition (oxide)"; needs a small engine rule, plan and ask first)
- [ ] SPC flags that predict, and a flagged tool that costs more (issue 4)
- [x] Show card and shop item effects before you commit (issue 6); placeholder stops stop charging for nothing (issue 5)
- [ ] Diagnosis explains itself and offers only failure modes that could have been there (issue 2)
- [ ] A real decision in every room (issue 3; David: starter practices in most rooms (Lane C) and skip the hand screen when there is nothing to play (Lane A))
- [ ] Phone layout and run-ending buttons (issues 8, 17); small fixes (issues 9, 10, 13, 14, 15, 16)
- [ ] Words page: about 15 game and fab terms in plain sentences, data in `src/content/glossary.js` (`content-drafter`, `physics-reviewer`, then David), opened like the Notebook (issue 16; David, 26 Oct 2026: its own item)
- [ ] Physics-review fixes (David's calls, 26 Oct 2026): SPC trend rule and verdicts by rule; Q-time as moisture uptake; T-top only with a CAR resist; slurry, audit and gauge rewording; etch forecast says what is carried in from the stack
- [ ] Round 21-site wafer map (Lane D draws, Lane A engine; last, since every yield test moves)
- [ ] Lane F reruns the five personas on seeds 123456, 42, 777 and the exit test passes

## M5 — Randomness and a second lot
- [ ] Lot modifiers, announced at run start; random lot type from the unlocked pool; fixed first run
- [ ] Second lot type: NMOS (see `docs/process-primer.md`)
- [x] Content to about 40 items via `content-drafter`, reviewed by David and `physics-reviewer`

## M6 — Look and feel
- [ ] Room styling from `docs/art-direction.md`; film-growth and wafer-map hit animations; reduced-motion respected
- [x] Card art setup (`docs/card-art-plan.md`): per-room tint and shade tokens in `tokens.css` (contrast checked); settle the `art` field in content entries (the `art` field is deferred: art is found by the practice id for now)
- [x] Shared card frame: room band, cost chip, art window, kind and rarity, name, effect, tradeoff; kind shown by window style, rarity by 1–3 diamonds
- [x] Practice art: microscope cross-sections drawn from the `--mat-*` tokens for every practice; `physics-reviewer` pass
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
