# Start here

## One-time setup

1. Turn on GitHub Pages: repo **Settings → Pages → Deploy from a branch → `main` / `/ (root)`**. After a minute the placeholder is live at https://chirality89.github.io/fab-run/ (lower case).
2. Clone the repo and open Claude Code in the folder.

## First prompt for Claude Code

> Read CLAUDE.md, PROJECT.md, DESIGN.md and ROADMAP.md. Use plan mode. We're on M0. Run `npm test`, serve the folder and confirm the placeholder page loads with no console errors. Then walk me through the open decisions in docs/decisions.md that block M1 (D7, O2, O4, O5, O6), one at a time, and record my answers. Don't write game code yet.

## Second prompt (after M0)

> Plan M1 item 1 (the seeded generator) in tasks/todo.md. Port mulberry32 from FabSim2's RNG section. Wait for my OK.

## How this kit came together

Brainstormed in Claude in October 2026, after reviewing FabSim2 and FabForge:

- FabForge's node map was right, but its choices were dice rolls.
- FabSim2's physics and drift telegraphs were right, but its loop was clicking without a hook.
- The fix: a one-lot Slay the Spire run where every card is a real practice with a real tradeoff, and yield is the health bar.

FabSim2 and FabForge stay as they are. Pieces worth reusing later: FabSim2's seeded generator and physics functions, FabForge's wafer map.
