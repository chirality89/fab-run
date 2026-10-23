# Process primer

The simplified process model the game is built on. Textbook level only (see CLAUDE.md §9).

## The layer loop

Every layer in a fab is the same loop: **make a film → coat resist → expose the mask → develop → etch or implant → strip → clean → inspect.** A device is that loop run a few times on one wafer. Reusing the same litho and etch tools for every layer is what makes fab flow reentrant.

## The verbs

| Verb | What it does | Rule it teaches |
|---|---|---|
| Deposit | CVD, PVD or spin-on adds a film | Conformal vs directional coverage; overhang at narrow openings |
| Grow | Thermal oxidation; consumes silicon | Deal-Grove: thickness vs time and temperature |
| Pattern | Resist, expose, develop | Resolution vs dose vs process window |
| Etch | Isotropic or anisotropic removal | Selectivity decides what survives |
| Strip and clean | Remove resist and residue | Clean starts a Q-time clock |
| Implant | Adds dopants; resist, gate or field oxide block them | Self-alignment |
| Anneal | Repairs implant damage, activates dopants | Thermal budget: activation vs diffusion |
| Plate | Electroplated Cu | Needs a barrier and a conductive seed; fill shape decides voids |
| CMP | Planarizes and stops on another film | Stop layers; dishing on wide features (Preston's equation) |

## Lot type 1: inlaid Cu line (single damascene)

1. Clean.
2. Deposit a SiN etch stop, then the SiO₂ dielectric.
3. Pattern the trench.
4. Etch the trench, stopping on SiN.
5. Strip and clean.
6. Deposit a Ta/TaN barrier and a Cu seed (PVD).
7. Plate Cu to fill the trench.
8. CMP back to the dielectric.
9. Measure and test: line resistance, opens and shorts.

## Lot type 2: NMOS transistor (four masks: active, gate, contact, metal 1)

1. Clean a p-type wafer.
2. Isolation: grow pad oxide, deposit SiN, pattern the active area, etch the trench, fill with oxide, CMP stopping on SiN, strip SiN.
3. Grow a thin gate oxide.
4. Deposit poly-Si, pattern the gate, etch stopping on gate oxide.
5. Implant n+ source and drain. The gate blocks the implant, so it self-aligns. Anneal to activate.
6. Deposit the dielectric and planarize.
7. Pattern and etch contacts to silicon; Ti/TiN liner, W fill, CMP.
8. Metal 1: Al deposit and etch, or the Cu damascene above.
9. Test: threshold voltage, drive current, leakage.

## One rule per step (level and card ideas)

- CMP stop layers (isolation, damascene).
- Selectivity: a gate etch that punches the thin oxide kills the device.
- Self-alignment and thermal budget (implant, anneal).
- Overetch: a contact punched through the junction leaks.
- Barrier, seed and void-free fill (Cu).
- Spacers, later: a conformal film plus a directional etch leaves a sidewall.
