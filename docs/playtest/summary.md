# Playtest summary, round 2 (30 Oct 2026)

Five simulated players played three seeds each (123456, 42, 777). They played the build on branch `ccr-84447480-23nk9m`: the Words page, NMOS playable, NMOS risks at 52%, and the etch quarter cut. Each persona played its third run (seed 777) as an **NMOS** lot, picked at the door. Reports: `fab-engineer.md`, `spire-veteran.md`, `phone-5min.md`, `student.md`, `minmaxer.md`. Logs are in `logs/`, screenshots in `shots/<persona>/`. Round 1 (Lane F, 27 Oct) is in git history.

**Headline: lots ship now, but players don't feel their choices.**
- In round 1, no lot shipped in any run. In round 2, most runs shipped, and most of those just over the 70% spec (70.2–74.9%).
- Clarity went up from 2 to 3 for everyone.
- Real decisions stayed at 1–2.
- Four of five personas would quit on the NMOS lot, at a room that ran by itself.

| Persona | Round 1 (clarity / decisions / another run) | Round 2 | Runs shipped (round 2) |
|---|---|---|---|
| Fab engineer | 2 / 2 / 1 | 3 / 2 / 2 | 3 of 3 |
| Spire veteran | 3 / 1 / 1 | 3 / 1 / 2 | 1 of 3 |
| Phone, 5 minutes | 2 / 2 / 1 | 3 / 1 / 2 | 2 of 3 |
| Student | 2 / 2 / 2 | 3 / 2 / 3 | 3 of 3 |
| Min-maxer | 2 / 1 / 1 | 3 / 2 / 2 | best lines ship; newcomer try rejected at 69.5% |

## Ranked issues

### Hit by all 5

1. **Rooms that run by themselves decide the run.**
   - On the Cu line: plating, CMP and metrology.
   - On NMOS: CMP, gate oxidation, implant, anneal and electrical test, five of 13 rooms.
   - These rooms open already finished, with no forecast and no breakdown, and often take 3–6 points. The NMOS anneal (4.5–4.8 points) pushed two lots under spec.
   - Diffusion and implant have no SPC chart either.
   - Evidence: seed 777 step 11–13 in `phone-5min.md`, `spire-veteran.md`, `fab-engineer.md` and `student.md`.
   - Plan link: the diffusion and implant starter cards and tool monitors are waiting for David. A forecast line on a room that runs by itself costs no engine work.

### Hit by 4

2. **A chart that says "In control" still costs drift points.**
   - Seed 777: a green deposition chart cost 2.7–2.9 points to drift, and that drift was the diagnosis answer.
   - Most rooms blame 0.1–0.6 points on drift under a green chart.
   - Players read this as the game lying.
   - Evidence: `fab-engineer.md`, `student.md`, `minmaxer.md`, `spire-veteran.md`.
   - Cause: drift costs yield from any health below 100, but the SPC rules only trip at about 2 sigma. Either the chart shows a small shift before it trips (a "watch" state), or the room's drift line says the chart can't see it yet.
3. **The choices barely move the result.**
   - The min-maxer: doing nothing shipped 70.3% on seed 123456; the best line got 74.1%.
   - The student played run 2 very differently and finished 0.1 points from run 1.
   - The spire veteran: "longer, not deeper".
   - The bots measure 15–20 points between idle and good play over 100 seeds. In a single run, the persona sees about 4.
   - Evidence: `minmaxer.md`, `student.md`, `spire-veteran.md`, `phone-5min.md`.
4. **The diagnosis needs evidence the game never shows.**
   - Answers point to vias, line resistance, C-V data and cross-sections.
   - "Handling particles" spread over every step is never shown.
   - The edge-ring diagnosis worked: it reads straight off the map.
   - Evidence: `fab-engineer.md`, `student.md`, `phone-5min.md`, `spire-veteran.md`.
   - Plan link: item 4. The e-test module (M5) is the real fix.

### Hit by 3

5. **Cash and cycle time don't count.** Lots end with more than 1,200 cash unspent, so PMs and shopping are free. Every event that trades yield for cash is a trap, and side stops cost nothing that matters. (`spire-veteran.md`, `minmaxer.md`, `phone-5min.md`.) This is a design question for David.
6. **Dead card and trap upgrades.** "Strip and re-expose" can never be played on either route, yet sits in every litho hand, and the PM stop sells a 100-cash DOE for it. The shop shows the same three items on every seed and both lot types. (`minmaxer.md`, `spire-veteran.md`, `fab-engineer.md`.)
7. **The same events come back.** The hot lot came up five times in three runs. (`fab-engineer.md`, `phone-5min.md`, `spire-veteran.md`.)

### Hit by 2

8. **The card's number contradicts its text.** "Trim dose from the SPC trend" says it fixes only a steady shift, but promises yield on a centred or just-PM'd tool. "Timed over-etch" says it costs about what it saves, but saves 1.4 points. (`fab-engineer.md`, `student.md`.) This is the drift-only `defectMult` in NEEDS NEW LOGIC.
9. **Wrong words for NMOS.**
   - The rinse card talks about "the barrier going on next" on NMOS.
   - (fab engineer) "Native oxide" on the Cu trench bottom, which is oxide, not silicon.
   - (fab engineer) One "Deposition" chart covers oxide, barrier and seed, nitride and poly.
   - (fab engineer) "Seam rate on fill monitor" isn't a real term.
   - (`fab-engineer.md`, `student.md`.)
10. **Costs with no yield value.** "+0.040 oxide risk" and "starts a Q-time clock" can't be compared with points. (`spire-veteran.md`, `phone-5min.md`, `minmaxer.md`.)

### Hit by 1, but serious

11. **The notebook can be farmed** (min-maxer). A wrong guess prints the right answer, and Replay with the same moves gives the same lot, so the next guess is free. It works on a rejected lot too. Three entries were farmed this way.
12. **A PM / DOE stop with no tool left to PM** (phone): on NMOS near the end, the stop cost 40 minutes and said "No tool on the route ahead can be PM'd here". The map should not offer PM there, or should say it is DOE only.
13. **Phone layout** (phone): about two screens of scrolling to reach the cards, and the PM / DOE page is about four screens tall. Replay, New seed and Scrap sit right under Continue. Plan link: item 6.
14. **Words leaves out the room names** (student): litho, etch, deposition, plating, diffusion, implant and NMOS aren't there, and words in card text can't be tapped.
15. **A different ?seed= throws away the run in progress without a warning** (min-maxer).

## Fixed since round 1 (confirmed by the personas)
- Lots ship. Etch no longer ends every run.
- A reload resumes the run (round 1 lost it).
- The Notebook opens, and its unlocks count.
- Every room shows a forecast and greys out a card with its reason (Cu rooms with cards).
- The SPC rule calls the fab engineer checked by eye were all correct.
