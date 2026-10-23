# Fab Run

One lot, one run. A Slay the Spire–style roguelite card game where wafer yield is your health bar.

Take 25 bare wafers through a cleanroom of process rooms (litho, etch, deposition, plating, CMP). In each room, play practice cards against a time budget. Watch tools drift, spend your margin where it matters, and ship at the customer's yield. Diagnose what went wrong to fill your engineering notebook and unlock new practices for the next run.

**Status:** starter kit. The design, content draft and art tokens are here; the game is being built milestone by milestone (`ROADMAP.md`).

Live (once GitHub Pages is on): https://chirality89.github.io/fab-run/

## Run it locally

The game uses plain JavaScript modules, which need a small web server:

```
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Test

```
npm test
```

Uses Node's built-in test runner. No packages to install.

## What's where

| Path | What |
|---|---|
| `DESIGN.md` | The game |
| `CLAUDE.md` | Rules for working on it with Claude Code |
| `ROADMAP.md` | Milestones, one checkbox per session |
| `docs/decisions.md` | Settled and open decisions |
| `docs/process-primer.md` | The simplified process model |
| `docs/art-direction.md` | Palette, room colors, drawing rules |
| `docs/market-research.md` | What else exists |
| `src/content/content.js` | Cards, equipment, materials, consumables, failure modes (data) |
| `src/theme/tokens.css` | Colors and type |

All process content is textbook-level and fictionalized. No real company, vendor or process data.
