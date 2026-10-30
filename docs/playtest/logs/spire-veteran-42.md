# Spire veteran — seed 42 (Inlaid Cu line again)

Plan from run 1: cycle time and cash don't count toward winning, so take a side stop every corridor. PM the flagged tools. Test: skip the gas-flow trim this time, compare etch. Play the DI rinse in room 5 this time.

### Step 1 — Floor plan / start
Screenshot: docs/playtest/shots/spire-veteran/42-00-s42-01-start.png
I see: Same 9 rooms in the same order. Different side stops in the gaps. SPC flags now on wet clean 1, deposition 2, etch 4, wet clean 5, deposition 6.
I think: Same route, every seed. So the map is a fixed corridor and the "routing" is which one stop per gap. Five red flags this time, I can only PM in some gaps. That's at least a small puzzle: which flags to fix with which PM.
I try: Enter step 1.
Mood: curious

### Step 2 — Room 1: Wet clean
Screenshot: docs/playtest/shots/spire-veteran/42-01-s42-02-room1.png
I see: Exactly the same one-card hand as seed 123456. SPC says "Excursion: one lot past the control limit... re-measure... the next lots come back inside."
I think: Same opening hand on a different seed. No draw, no deck shuffle. It's a fixed script per room.
I try: Rinse + run. 100 -> 99.5.
Mood: bored

### Step 3 — PM stop, then Room 2
Screenshot: none
I see: DOE options now are over-etch and DI rinse (different from run 1). PM list shows deposition and etch "Shift". After PM on deposition, the pump-purge card now says "About 0.1 points MORE lost in this room."
I think: Nice, the card value updates with tool state. But the room forecast stayed 0.7 before and after the PM, so the PM bought me roughly zero. Drift costs 0.1-0.3 per room. PM is a near-useless heal.
I try: PM deposition, skip the card, run. 99.5 -> 98.8.
Mood: curious

### Step 4 — Procurement
Screenshot: docs/playtest/shots/spire-veteran/42-10-s42-03-shop.png
I see: Gas-flow trim 200, Inline metrology 500, and new: Thick resist for deep etch 90 (underlayer attack x0.5 deep etch only, cd error x1.3, uses 10 min room time).
I think: Thick resist is for "deep etch (TSVs)". My route says trench. So it's a pure downside here — trap item. Metrology is still at step 9. Skipping the trim on purpose to measure it.
I try: Buy nothing.
Mood: curious

### Step 5 — Litho, PM etch, Etch
Screenshot: docs/playtest/shots/spire-veteran/42-17-s42-04-etch.png
I see: Litho: identical hand, dead Strip-and-re-expose card again. 98.8 -> 96.8. PM'd etch. Etch forecast 9.4, "3.9 of these from depth variation" (run 1 with the trim: 2.9). Over-etch now says "0.1 points MORE lost" (run 1, unPM'd tool: 0.5 less).
I think: So the trim was worth about 1 point of depth variation, and PM flipped over-etch from good to bad. That is a real interaction: PM the tool OR play the card, not both. That's the first thing that feels like a game. But etch still costs 9.1 no matter what I do. The big hit is fixed.
I try: Skip over-etch, run. 96.8 -> 87.7 (9.1 again).
Mood: curious

### Step 6 — Event: Quality audit (again)
Screenshot: docs/playtest/shots/spire-veteran/42-20-s42-05-event.png
I see: The exact same audit event as seed 123456. Two options plus a "Continue" button.
I think: Test time. I tapped Continue without choosing. Cash stayed the same, nothing happened. So events can be skipped for free — the "tradeoff" is optional, and the only event cost is 10 min of a clock that doesn't matter.
I try: Continue without choosing.
Mood: annoyed

### Step 7 — Room 5 with the rinse
Screenshot: none
I see: Same card, 0.2 less. Played it. 87.7 -> 87.2.
I think: Now we see if the x1.1 oxide hurts in room 6.
I try: Continue.
Mood: curious

### Step 8 — Q-time corridor: PM
Screenshot: docs/playtest/shots/spire-veteran/42-25-s42-06-pm-qt.png
I see: PM +0.040 oxide risk. Inside: Deposition already PM'd (same tool as room 2, I fixed it 4 rooms ago). Plating and CMP in control. DOE: only the useless pump-purge.
I think: I took the PM in the Q-time window because the map still showed the SPC flag on room 6. But the flag was from the start of the run; it's the same tool I already PM'd. The map didn't update the flag. Paid the Q-time for nothing. Since I'm here, PM plating (the keyhole void room last run).
I try: PM plating.
Mood: annoyed

### Step 9 — Room 6: Deposition (barrier + seed)
Screenshot: docs/playtest/shots/spire-veteran/42-27-s42-07-room6.png
I see: Forecast 6.6 (run 1, straight through without rinse: 3.2). Wafer map turns orange-dotted, 83-92. Lost 7.6.
I think: There it is. The 40 min wait plus the rinse more than doubled this room. "+0.040 oxide risk" was actually ~3-4 points of yield and the corridor never said so. That is a fair punishment in principle (QT was flagged on the map from minute one) but the number was in a unit I couldn't read. I'd call this loss half fair.
I try: Run.
Mood: annoyed

### Step 10 — Event: Hot lot
Screenshot: docs/playtest/shots/spire-veteran/42-30-s42-08-event2.png
I see: Run it hot: -30 min cycle time, +150 cash, "+0.02 risk (about 2.0 points of yield)". Or keep its place: nothing.
I think: THIS event translates risk to yield points. So 0.04 oxide risk was ~4 points. Why does only the event tell me? Also: trading 2 yield for cash and cycle time, both of which don't count to win = never. Free pick.
I try: Keep its place.
Mood: annoyed

### Step 11 — Plating (auto), shop, CMP (auto)
Screenshot: docs/playtest/shots/spire-veteran/42-34-s42-09-shop2.png ; docs/playtest/shots/spire-veteran/42-35-s42-10-cmp.png
I see: Plating with my PM: still 4.6 lost, "nothing could be played". Shop: only metrology again; the trim and thick resist I didn't buy are gone. CMP: 75.0 -> 69.1, nothing to play.
I think: I watched myself fall under the spec line in a room where I have no cards and no item to buy. I knew at 79.6 I was dead (plating ~4.5 + CMP ~6 every time). Two rooms of watching. PM plating did nothing visible.
I try: Straight to metrology.
Mood: about to quit

### Step 12 — Ship report: Rejected
Screenshot: docs/playtest/shots/spire-veteran/42-38-s42-11-ship.png ; docs/playtest/shots/spire-veteran/42-39-s42-12-diagnose.png
I see: Rejected, 69.1% vs 70%. Diagnose options: Chamber flaking, Handling particles, Removal-rate drift, Dose offset. I picked chamber flaking (deposition was my big loss). Answer: Handling particles, 4.6 points spread ~0.5 per room.
I think: Lost by 0.9 because of one PM stop. That part I own. But the quiz: my biggest avoidable loss was Q-time oxide in room 6 and it's not even among the four answers. The "right" answer is a background tax of 0.5 per room that I never had a lever against. The diagnose game is reading tea leaves, not reading my run.
Run 2 verdict: the only real decisions were "PM or play the card" at etch and "don't wait in the Q-time window". Everything else is fixed: same rooms, same hands, same big hits (etch ~9, CMP ~6, plating ~4.5).
I try: Run 3, other lot type.
Mood: about to quit
