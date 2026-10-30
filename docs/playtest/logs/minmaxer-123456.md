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
