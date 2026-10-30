# Min-maxer — seed 123456 (Inlaid Cu line, first run, newcomer)

### Step 1 — Floor plan (start)
Screenshot: docs/playtest/shots/minmaxer/123456-00-s123-01-floor.png
I see: 9-room floor plan (Wet clean, Deposition, Litho, Etch, Wet clean, Deposition, Plating, CMP, Metrology). Cash 1500, cycle time 0 min, yield 100%. Corridors have PM/BUY/EVT/QT tags. Litho and Etch already carry red "SPC" flags. A button lets me swap the lot to "NMOS transistor".
I think: 1500 cash, no price list yet. Litho and Etch have tripped SPC before I even start — those are where the PM money goes. The lot-type swap is a free reroll of the whole run before step 1; noting that. Words page says Metrology "for now only costs its minutes" — so metrology stops are pure waste. Good, one less thing.
I try: Words, Notebook (empty, "20 failure modes still to find"), then Enter step 1.
Mood: curious

### Step 2 — Room 1: Wet clean
Screenshot: docs/playtest/shots/minmaxer/123456-05-s123-02-room1.png
I see: Line yield 100%, scrap 40%, spec 70%. "This room will cost about 0.8 points if nothing changes." 10 min budget. Hand: ONE card, Extra DI-water rinse (3 min, 10 cash, particles x0.75, qtime oxide x1.1, "about 0.2 points less lost"). SPC: particle adders, in control, last 22.2.
I think: A hand of one card is not a choice, it's a yes/no. 10 cash for 0.2 points. Spec is 70%, I'm at 100: I have 30 points of slack. Downside is a qtime oxide x1.1 that matters "after the strip clean" — that's room 5, not this one. So here it's nearly free. Buy it.
I try: play the rinse, then run.
Mood: curious

### Step 3 — Reload test inside room 1
Screenshot: none
I see: After playing the rinse (cash 1500 -> 1490, budget 10 -> 7 min, forecast 0.8 -> 0.6), I reloaded. Page says "Resumed seed 123456", card still spent, cash still 1490.
I think: It saves every action. No cheap undo by reload. Fine, honest.
I try: Run wet clean.
Mood: curious

### Step 4 — Room 1 result
Screenshot: docs/playtest/shots/minmaxer/123456-07-s123-03-after1.png
I see: 100.0% -> 99.5%, "cost 0.5 points", 0.1 from tool drift. Buttons: Continue, Replay this seed, New seed.
I think: Forecast said 0.6, actual 0.5. Forecast is close enough to trust. 10 cash bought ~0.2 points. Cheap.
I try: Continue to the corridor.
Mood: curious

### Step 5 — Corridor 1
Screenshot: docs/playtest/shots/minmaxer/123456-08-s123-04-corridor1.png
I see: Cycle time 10 min (room had 10 min budget, I used 3 — counted as 10 anyway). Options: PM/DOE +40 min, Event +10 min, go straight, Scrap.
I think: Unused room minutes are not refunded to cycle time, so time in a room is use-it-or-lose-it; cards cost no real time unless they overflow the budget. And what does cycle time actually cost me? Nothing on screen says. If it costs nothing, every side stop is free.
I try: PM / DOE.
Mood: curious

### Step 6 — PM / DOE stop
Screenshot: docs/playtest/shots/minmaxer/123456-09-s123-05-pm1.png
I see: DOE costs 100 cash: Timed over-etch 2 -> 1.85 underlayer attack, Strip and re-expose particles 1.2 -> 1.1, Trim dose cd 0.8 -> 0.75 but +3 min. Or PM one tool, 0 cash, 40 min. Litho and Etch charts are "Shift". Others in control.
I think: PM is free in cash. DOE is 100 cash for a ~5% tweak on one card — terrible rate next to a free PM on a shifted tool. The Trim-dose DOE even makes the card slower. PM Litho now (it's next), Etch at the next PM stop.
I try: PM the Litho bay tool. Only one action allowed; then "Continue".
Mood: curious

### Step 7 — Room 2: Deposition (oxide)
Screenshot: docs/playtest/shots/minmaxer/123456-11-s123-06-room2.png
I see: 99.5%, forecast 0.8. One card: Pump-purge 5 min 20 cash, flakes x0.75 particles x1.1, "with a healthy chamber it buys almost nothing". No "points less lost" line on it.
I think: Card itself says it's useless on a healthy chamber, and the chart is in control. Skip. Again a hand of 1 playable card.
I try: Run deposition. Result 99.5 -> 98.8 (0.7).
Mood: bored

### Step 8 — Corridor 2 and Procurement
Screenshot: docs/playtest/shots/minmaxer/123456-14-s123-07-shop.png
I see: Cycle time 65 (10 + 40 PM + 15 room). Shop: Radial gas-flow trim 200 (etch, depth var x0.75, edge ring x1.25), Inline metrology 500 (metrology, "shows drift earlier on SPC", next used at step 9 = the LAST step), Thick resist 90 (deep etch only, cd x1.3, eats 10 min).
I think: Inline metrology at 500 is a pure trap on this route: it acts at step 9, nothing comes after it. Thick resist is for TSV-depth etches; this is a trench — trap, it makes CD worse. Gas trim has no "points" estimate, so I can't price it. Reloaded in the shop: same stock, no reroll. You can buy several things in one visit.
I try: Buy Radial gas-flow trim (1490 -> 1290) as an experiment.
Mood: curious

### Step 9 — Room 3: Litho (trench)
Screenshot: docs/playtest/shots/minmaxer/123456-16-s123-08-litho.png
I see: Forecast 2.8 points. Hand: Strip and re-expose — greyed, "Can't play: needs a litho step just before this one. No step on this route does that." Trim dose 5 min 30 cash, "about 0.4 points less".
I think: Wait. The PM stop offered me a 100-cash DOE on Strip and re-expose, a card that can NEVER be played on this route. That's a trap the game sold me with a straight face. Trim dose: 30 cash for 0.4 points. Yes.
I try: Trim dose (cash 1290 -> 1260, forecast 2.8 -> 2.4), run. Result 98.8 -> 96.4 ("2.3 points").
Mood: annoyed

### Step 10 — Corridor 3, PM Etch
Screenshot: none
I see: Yield 96.4, cash 1260, cycle 110. PM/DOE, Procurement, Event.
I think: Etch chart is shifted. Free PM. Take it.
I try: PM the Etch tool.
Mood: curious

### Step 11 — Room 4: Etch (trench)
Screenshot: docs/playtest/shots/minmaxer/123456-22-s123-09-etch.png
I see: Forecast 8.8 points even right after the PM, "about 2.9 from depth variation ... the film stack set how big this is before the lot got here: without an etch stop". The gas-flow trim I bought sits in the slot. One card: Timed over-etch, "about 0.1 points more lost". Budget 8 min.
I think: 8.8 points in one room, and the only card makes it worse. So this room is a toll booth, not a decision. I paid 200 for the gas trim and I can't tell if it's in that 8.8 or not — no line says "trim saved you X". The game told me 'film stack set this before the lot got here' — so the decision was somewhere earlier, and I never saw it.
I try: Run etch without the card. 96.4 -> 87.5 (8.9 points).
Mood: annoyed

### Step 12 — Corridor 4, Procurement again
Screenshot: docs/playtest/shots/minmaxer/123456-25-s123-11-shop2.png
I see: Shop now only holds Inline metrology 500. The trim is gone (I bought it) and the thick resist is gone (its litho step has passed).
I think: Stock is one fixed list for the whole run that only shrinks. Visiting a second shop is 10 wasted minutes. Cash 1260 and nothing worth buying. Cash piles up.
I try: Continue to step 5.
Mood: bored

### Step 13 — Room 5: Resist strip + wet clean
Screenshot: docs/playtest/shots/minmaxer/123456-26-s123-12-room5.png
I see: Forecast 0.8. Same rinse card, "0.2 less", qtime oxide x1.1, and the card text says the oxide part matters after THIS clean.
I think: 0.2 points now vs. an oxide multiplier with no number on it. The game won't price the later cost for me. I take the rinse as an experiment.
I try: Rinse (cash 1260 -> 1250), run: 87.5 -> 86.9.
Mood: curious

### Step 14 — Q-time corridor 5
Screenshot: docs/playtest/shots/minmaxer/123456-29-s123-13-qtcorridor.png
I see: "Q-time window." PM/DOE "+0.040 oxide risk", Procurement "+0.010", Event "+0.010".
I think: Units? 0.040 of what? I don't know yet. (The event screen then tells me 0.02 risk = about 2.0 points. So a PM here costs ~4 points of yield — a huge hidden price on the same button that was free before.)
I try: Event, to learn the exchange rate.
Mood: confused

### Step 15 — Event: Hot lot request
Screenshot: docs/playtest/shots/minmaxer/123456-30-s123-14-event.png
I see: Run it hot: -30 min cycle time, +150 cash, +0.02 risk (about 2.0 points of yield). Or keep place: nothing.
I think: Finally a priced trade: 2 points for 150 cash and -30 min. But I still don't know what cash or cycle time is worth at the end. I'm at 86.9 with spec 70; 2 points feels affordable. Taking it as an experiment.
I try: Run it hot. Cash 1250 -> 1400.
Mood: curious

### Step 16 — Room 6: Deposition (barrier + seed)
Screenshot: docs/playtest/shots/minmaxer/123456-32-s123-15-room6.png
I see: Forecast 5.9 points. Pump-purge now "0.2 points MORE lost".
I think: 5.9 versus 0.8 for the same tool at step 2. That's the oxide (rinse + 10 min wait) and the hot lot particles stacked, but the forecast won't split it. The only card is negative again.
I try: Run. 86.9 -> 80.5 (6.4, more than the 5.9 forecast).
Mood: annoyed

### Step 17 — Corridor 6, Procurement third time
Screenshot: docs/playtest/shots/minmaxer/123456-35-s123-16-shop3.png
I see: Only Inline metrology 500 again.
I think: Confirmed: stock never refreshes. 10 min thrown away.
I try: Continue to Plating.
Mood: bored

### Step 18 — Room 7: Plating (auto-ran)
Screenshot: docs/playtest/shots/minmaxer/123456-36-s123-17-plating.png
I see: Already resolved when I arrived: "Nothing could be played here, so the lot went straight through." 80.5 -> 76.3 (4.2, 0.4 drift).
I think: I never even saw the forecast. No cards for plating at all. Zero agency in the room that later turned out to be "the" failure.
I try: Continue.
Mood: annoyed

### Step 19 — Corridor 7, Event: Supplier change
Screenshot: docs/playtest/shots/minmaxer/123456-38-s123-18-event2.png
I see: Switch slurry +150 cash, CMP steps off target. Or keep.
I think: At 76.3 with CMP still to go, no. Cash has no visible use anyway. I should have PM'd CMP here instead of an event — realized too late.
I try: Keep the qualified slurry.
Mood: curious

### Step 20 — Room 8: CMP (auto-ran)
Screenshot: docs/playtest/shots/minmaxer/123456-40-s123-19-cmp.png
I see: Auto-ran again. 76.3 -> 69.5 (6.7, 0.8 from drift). Bar turns orange, under the 70% spec mark.
I think: 0.5 points short. The hot lot cost me ~2 points and the rinse probably some oxide. Two "small" choices made the run fail. That stings, and it's fair-ish — but the 6.7 CMP hit was never forecast to me because the room auto-ran.
I try: Continue; straight to Metrology (0.0 points, nothing playable). "Lot rejected."
Mood: annoyed

### Step 21 — Ship report
Screenshot: docs/playtest/shots/minmaxer/123456-43-s123-21-report.png
I see: Rejected 69.5% vs 70%. Cost per good die 4.83 = "Lot cost 2100 / 434.6 good die. Not paid: the lot was rejected.. For reference only." Cycle time 233 min. Yield by step table. Diagnose: 4 options, one guess.
I think: Lot cost 2100 — I started with 1500 and ended with 1400, so where does 2100 come from? No breakdown. Cycle time is shown but nothing says it's scored. "For reference only: shipping at spec is what wins" — so cash and time are NOT the score. Then hot lot cash and cheap slurry are pure yield loss for nothing. Typo "rejected.." with two dots. Etch lost 8.9 points, so I guessed Etch residue.
I try: Etch residue.
Mood: annoyed

### Step 22 — Diagnosis result
Screenshot: docs/playtest/shots/minmaxer/123456-44-s123-22-diagnosed.png
I see: "Not this one. What did hurt this lot: Keyhole void ... It cost 3.5 yield points: Plating, step 7."
I think: The 'one that hurt' is a 3.5-point loss when Etch cost me 8.9 and Deposition 6.4. So the question isn't "biggest loss", it's "which named mode fired". And now the answer for seed 123456 is printed. If replay keeps it, the notebook is a lookup table.
I try: Replay this seed, do nothing at all (no cards, no stops), see if the answer and numbers repeat.
Mood: hooked

### Step 23 — Replay 123456, "do nothing" line
Screenshot: docs/playtest/shots/minmaxer/123456-69-s123-23-donothing-ship.png
I see: Same lot, cash 1500, same map. I played no cards, took no side stops, just Run / Go straight. Rooms: 0.7, 0.7, 2.9, 10.3, 0.7, 3.3, 4.3, 6.8, 0.0. SHIPPED 70.3%. Lot cost 2000, cost per die 4.55, cycle 133 min.
I think: Doing nothing beat my careful run (69.5% rejected). Compare by room: Etch 10.3 unPM'd vs 8.9 PM'd — the two free PMs bought ~1.6 points total. Barrier dep 3.3 vs 6.4 — my rinse + hot lot + 10 min Q-time wait cost 3.1 points to earn 150 cash and 0.2 points. That's the whole loss. Also: lot cost = 2000 + net spend, so the 2100 before was 2000 + (250 spent - 150 hot lot fee).
Every effortful thing I did was worth less than one bad event choice. "Do nothing" ships this seed.
I try: Diagnose Keyhole void — the answer the last run printed.
Mood: hooked

### Step 24 — Leaked diagnosis
Screenshot: docs/playtest/shots/minmaxer/123456-70-s123-24-leaked-diag.png
I see: "Diagnosed: Keyhole void. Written in your notebook. Unlocks for later runs: Low-current start step, Three-additive copper bath, Bath analysis and dose."
I think: That's the break. One guess per run, but "Replay this seed" is free and the wrong answer prints the right one. Two runs per notebook entry, no reading required. And a do-nothing run takes 30 seconds.
I try: Replay again with the best line I can see: PM Litho, PM Etch, no card unless it has a positive number, no stops in the Q-time corridor, no events, PM CMP before CMP.
Mood: hooked

### Step 25 — Best-line replay, rooms 1-6
Screenshot: none
I see: Rinse at step 1 (0.5 lost). PM Litho at corridor 1, PM Etch at corridor 2, trim dose in litho (96.4 after litho, identical to run 1 — fully deterministic). PM Plating at corridor 3. Etch forecast 9.3 now, "3.8 from depth variation" (run 1 with the 200-cash gas trim: 8.8, 2.9 from depth). Etch actual 9.5 vs 8.9 in run 1. PM Deposition at corridor 4. Went straight through the Q-time corridor. Barrier dep forecast 3.0, actual 3.2 (run 1 with hot lot and Q-time wait: 6.4).
I think: Price list so far, in yield points: free PM on a shifted tool ~0.7; gas-flow trim (200 cash) ~0.6; trim dose (30 cash) 0.4; rinse (10 cash) 0.2; hot lot -2 for +150 cash; waiting 10 min in Q-time ~-1. Cash has no use at the end, so any yield bought with cash is free yield. The real currency is side-stop slots, and PM is the only one worth taking.
I try: Plating.
Mood: hooked

### Step 26 — Plating with the unlocked card
Screenshot: docs/playtest/shots/minmaxer/123456-100-s123-25-unlock-card.png
I see: Forecast 4.2. New card: Low-current start step, 8 min, no cash, void x0.5, "about 1.8 points less lost".
I think: The notebook unlock is the single biggest card in the game so far, and I got it by reading the answer off a failed run. Free, no tradeoff I can see at this budget.
I try: Play it, run. 82.9 -> 80.5 (2.4 vs 4.3 without).
Mood: hooked

### Step 27 — Best-line ship report
Screenshot: docs/playtest/shots/minmaxer/123456-109-s123-26-bestline-ship.png
I see: Shipped 74.1%. Lot cost 2040, 4.40 per good die, cycle 333 min. PM'd CMP: 6.4 lost vs 6.8 unPM'd. Diagnosis options changed: now Handling particles / Dose offset / Underlayer / Etch residue. I guessed wrong (Underlayer); answer: Handling particles, 5.2 points spread 0.5-0.8 over every room.
I think: Best line: 74.1. Do nothing: 70.3. Careful newcomer: 69.5 (rejected). So the whole skill ceiling here is ~4 points and 1.8 of it is one unlock. 333 min cycle time vs 133 — nobody cares, it's not scored. The diagnosis answer depends on what I did, but the same moves give the same answer, so again: guess wrong, replay, guess right.
I try: Seed 42.
Mood: curious
