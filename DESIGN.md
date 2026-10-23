# DESIGN.md — Fab Run

Working title. A Slay the Spire–style roguelite card game about getting one lot of wafers through a fab.

## 1. Pitch

You are the engineer responsible for one lot. It starts as 25 bare wafers and must ship at the customer's yield. Every room on the cleanroom map is a process step; every card is a real practice with a real tradeoff. Yield is your health bar, and it only goes down. A good run is one where you saw the drift coming, spent your margin where it mattered, and shipped.

## 2. Where this came from

| Earlier attempt | What it taught |
|---|---|
| **FabForge** (React map of process nodes) | The node-map structure works. But choices were Safe/Risk/Caution recipes resolved by a dice roll, so decisions felt like luck. |
| **FabSim2** (single-file real-time fab) | Real physics and drift telegraphs are worth keeping. But the core loop was tap a lot, tap a tool, wait: a lot of clicking without a hook. |
| **Cross Section** (puzzle concept, not built) | Deterministic process puzzles teach well. It is kept as a later room type (§10). |
| **Market check** (`docs/market-research.md`) | Fab-themed factory games treat process steps as flavor; chip puzzle games work at the logic-gate level. Nobody makes process integration the game. |

## 3. Pillars: fun, education, chaos

The balance rule: **laws are fixed, situations are random.**

- **Education lives in the laws.** What a card does, how a defect pattern forms, why an etch stop helps: always the same, always physically honest.
- **Chaos lives in the situation.** Which lot type, which modifiers, which cards you draw, how much wafer-to-wafer scatter, when a tool starts drifting.
- **Fun is applying the laws to the situation** under a time budget, with a visible number (yield) at stake.

Reference games and what we take from each: Slay the Spire (shown intents, branching map, deck as build), Balatro (multiplicative scoring: yield already multiplies), Papers, Please (rules accumulate, consequences arrive late), Zachtronics (failures you can read and fix).

## 4. The run

A run is one lot. It follows the lot type's **route**: an ordered list of process rooms. You cannot skip a process room.

Between process rooms the corridor branches. You pick **one side stop** from 2–3 offered, Slay the Spire–style:

| Side stop | What it does |
|---|---|
| **Metrology** | Measure: reveals hidden values (all 25 sites, tool drift) |
| **PM / DOE** | Restore a tool's health, or upgrade one practice for the run |
| **Procurement** | Spend cash on equipment, materials, consumables |
| **Event** | A text choice with a tradeoff (hot lot request, audit, supplier change) |

Every side stop costs cycle time, so Q-time clocks keep running. The map is drawn as a **cleanroom floor plan**: rooms are bays, corridors are the paths between them (proposed; `docs/decisions.md` O3).

**Litho is the recurring room.** Reentrant flow means a lot visits litho once per layer, each visit harder (tighter overlay, finer CD). In later lot types it plays the role of an elite.

**End of run.** The lot ships to the customer, who checks it against the spec. Below the **scrap line** the lot is scrapped mid-run. Shipping below spec is a rejected lot. Either ends the run.

## 5. Yield is the health bar

- The lot starts at 100%.
- Each defect pattern (`src/content/content.js` → `PATTERNS`) carries a risk value. When a room resolves, risks become yield loss.
- **Losses multiply.** Each room takes its share of what is left.
- **No healing.** Specific rework practices can undo specific damage (re-exposing litho before etch). Nothing else restores yield.
- **Late scrap is expensive.** A die that died early still costs every later step. Scrapping the lot early is a real decision.
- The **wafer map** (25 sites) is the detailed view of the bar: edge rings, center spots and random kills look different, which is how failures are diagnosed.

## 6. A room

Entering a process room:

1. The room shows its **tool health** and any **SPC telegraph** (drift showing before it bites).
2. You get a **time budget** (the energy resource) and **draw a hand** of practices legal in this room (proposed; O6).
3. The room's **slots** hold equipment and materials (litho: scanner, resist, mask; plating: bath). They change how cards resolve.
4. You play practices, spending minutes. Unspent time does not carry over.
5. The room resolves: defect risks update, yield drops, the wafer map updates, tool health wears.

## 7. Content types

| Slay the Spire | Fab Run | Examples (in `content.js`) |
|---|---|---|
| Card | **Practice** | Timed over-etch, SiN etch stop, dummy fill, low-current start |
| Energy | **Time budget** per room | |
| Gold | **Cash** | |
| Relic | **Equipment** | Optical endpoint detector, inline metrology, edge-tuned chuck |
| (slot item) | **Material** with a shelf life | i-line resist, chemically amplified resist, three-additive Cu bath |
| Potion | **Consumable** | Qual wafer, spare part, fresh resist lot |
| Campfire | **PM / DOE** side stop | |
| Card removal | Retire a practice | |
| Elite / boss | Critical litho layer, customer audit, qual lot | |
| Rarity | Standard / advanced / emerging | |

**Card synergies are real process integration.** A timed over-etch hurts unless the lot already has an etch stop; a thick resist protects only deep etches; an additive bath fills narrow vias but ages every lot.

## 8. Lot types, unlocks and randomness

- **Unlocks decide what can appear; randomness decides what does.**
- Each **lot type** is a device with its own route and one new concept: inlaid Cu line (barrier, seed, CMP stop), contact (selectivity), NMOS (self-alignment, thermal budget), via fill (voids), TSV (deep etch, fill). Later: hybrid bonding, cryogenic interconnect.
- A run draws a lot type from the **unlocked pool**, then **modifiers**: tight spec, hot lot, extra incoming variation, a tool overdue for PM, a mid-run spec change. Modifiers are announced at the start.
- **The first run is always the same lot type and seed**, so everyone learns the same basics.

## 9. Meta-progression: the notebook

- Diagnosing a failure mode from on-screen evidence writes it into the **engineering notebook**, which persists between runs.
- Each notebook entry **unlocks its remedies**: diagnose a keyhole void and you unlock low-current start, the additive bath and bath analysis. Progression teaches cause and remedy together (proposed; O1).
- Higher difficulty (Balatro "stakes") tightens specs and strengthens modifiers. It never adds new rules.

## 10. Later (not in the first playable)

- **Cross Section rooms:** a deterministic cross-section puzzle as an R&D side stop that designs a new practice.
- **Disposition desk:** a Papers, Please–style event: ship, rework, scrap or hold a lot from its paperwork.
- **Several lots in flight:** the Factorio-style logistics layer. Deliberately out of scope for now.
- Daily seed and shareable result card.

## 11. The first playable lot: inlaid Cu line

The route for M1–M3 (proposed; O5). The content draft already covers it.

| # | Room | What can go wrong | Cards and items that matter |
|---|---|---|---|
| 1 | Wet clean | Particles, Q-time starts | N2-purged storage |
| 2 | Deposition | No etch stop means etch depth follows etch rate | Pre-clean, SiN etch stop |
| 3 | Litho | CD error, resist expiry | Resist choice, dummy fill, strip and re-expose |
| 4 | Etch | Residue vs underlayer attack, edge ring | Timed over-etch, stop on endpoint, endpoint detector, edge-tuned chuck |
| 5 | Wet clean | Q-time oxide before barrier | N2-purged storage |
| 6 | Deposition (PVD) | Overhang at narrow openings | (seed coverage; future cards) |
| 7 | Plating | Keyhole voids | Low-current start, three-additive bath, bath analysis |
| 8 | CMP | Dishing, polish-rate drift | Dummy fill (earlier), pad conditioner |
| 9 | Metrology and ship | Sampling risk | Measure all 25 sites |

## 12. Scoring

At ship: **shipped yield** against the customer spec (pass or reject), plus **cost per good die** and **cycle time**. Show each against your previous runs. No combined number.

## 13. Look

Highly stylized, bright and flat, in a cleanroom palette: white and cool blue, with each room in its own color (yellow litho bay, blue etch, orange furnaces, cyan wet clean, copper plating). The cross-section and wafer views use the material colors from the Cross Section art direction. Details: `docs/art-direction.md`.
