# Spire veteran — seed 123456 (Inlaid Cu line)

### Step 1 — Floor plan / start
Screenshot: docs/playtest/shots/spire-veteran/123456-00-s123-01-start.png
I see: A 3x3 grid of numbered rooms 1-9 (wet clean, deposition, litho, etch, wet clean, deposition, plating, CMP, metrology), snaking. Little PM / BUY / EVT / QT tags in the gaps between rooms. Two rooms have a red SPC tag. Cash 1500, yield 100%. A button to enter step 1, and "Run NMOS transistor instead".
I think: So the "map" is a fixed line 1 to 9. The tags between rooms look like side stops, so maybe the routing is "which stop do I take between rooms". Red SPC on litho and etch = something is already wrong there, that's my telegraph. No idea what PM means without the legend; legend says PM / DOE. Still not sure what DOE is. Yield is HP, cash is gold, cycle time... a clock?
I try: Enter step 1.
Mood: curious

### Step 2 — Room 1: Wet clean
Screenshot: docs/playtest/shots/spire-veteran/123456-01-s123-02-room1.png
I see: Yield bar with Scrap 40% and Spec 70% marks. 5x5 wafer map of 100s. Time budget 10 min. "Slots: empty". An SPC chart for particles, in control. Hand: ONE card, Extra DI-water rinse, 3 min + 10 cash, particles x0.75, qtime oxide x1.1, "About 0.2 points less lost in this room." Room forecast: 0.8 points lost.
I think: One card in hand and 10 minutes of budget. That's not a hand, that's a yes/no prompt. 10 cash out of 1500 for 0.2 yield is obviously yes unless "qtime oxide x1.1" bites later — it says it only matters after "the strip clean", which I see is room 5. I can't price that, so it's a vague tax I'll ignore. The good part: the card tells me its exact payoff in yield points. That's Spire-level intent, I like it.
I try: Play the rinse, then Run wet clean.
Mood: curious

### Step 3 — Room 1 result
Screenshot: docs/playtest/shots/spire-veteran/123456-03-s123-03-after1.png
I see: 100.0% -> 99.5%. "0.1 points came from the tool's drift." Wafer map now 99s and 100s. Continue to the corridor / Replay this seed / New seed.
I think: Forecast said 0.6 after the card, I lost 0.5. Fine, predictable. Losing half a point per room x 9 rooms = I end ~95%, way above a 70% spec. If that's the pace, the spec is not a threat. Let's see if later rooms hit harder.
I try: Continue.
Mood: curious

### Step 4 — Corridor after room 1
Screenshot: docs/playtest/shots/spire-veteran/123456-04-s123-04-corridor.png
I see: "Take one side stop": PM / DOE (+40 min) or Event (+10 min), or go straight. Also a Scrap the lot button. Cycle time 10 min in the header.
I think: OK, so this is the map choice: one side stop per corridor, the costs are minutes of "cycle time". What does cycle time DO to me? Nothing on screen says. If it never hurts, side stops are free and I take one every time. That's the first thing I need to find out.
I try: Event, it's cheaper.
Mood: curious

### Step 5 — Event: Quality audit
Screenshot: docs/playtest/shots/spire-veteran/123456-05-s123-05-event.png
I see: Walk them through (+30 min cycle time, wet clean tool serviced) or come back later (-100 cash). Also a big "Continue to step 2" button under both options.
I think: The Continue button is there before I choose. Can I just skip the event for free? If yes, the "tradeoff" is optional. Servicing the wet clean tool sounds good since room 5 is wet clean too. 30 min vs 100 cash: I have no idea what either is worth. Cash 1490 and nothing to buy yet; minutes I can't price at all.
I try: Walk them through.
Mood: curious

### Step 6 — Room 2: Deposition
Screenshot: docs/playtest/shots/spire-veteran/123456-07-s123-06-room2.png
I see: One card again: Pump-purge cycles, 5 min, 20 cash, flakes x0.75, particles x1.1. "With a healthy chamber it buys almost nothing." No "about X points" line this time. Forecast 0.8.
I think: Two rooms, two hands of one card each. The card itself tells me not to play it. No payoff number, so I skip. Lost 0.7.
I try: Run deposition.
Mood: bored

### Step 7 — PM / DOE stop
Screenshot: docs/playtest/shots/spire-veteran/123456-10-s123-07-pm.png
I see: DOE = upgrade a practice for 100 cash (Strip and re-expose, or Pump-purge). Or PM one tool ahead, free in cash, 40 min. Every tool has its SPC chart; Litho and Etch say "Shift: costs yield in this room until PM'd".
I think: DOE is the smith, PM is... a campfire that heals a room before you enter it. The DOE upgrades are tiny: x1.2 -> x1.1 particles. The pump-purge "upgrade" is a sidegrade that the card itself said is useless on a healthy chamber. PM is free in cash and the screen tells me which two tools are broken. Easy pick: PM litho (next room). Then I'll PM etch next corridor. No real choice here, the SPC tags on the map already told me.
I try: PM the Litho bay tool.
Mood: curious

### Step 8 — Room 3: Litho bay
Screenshot: docs/playtest/shots/spire-veteran/123456-12-s123-08-litho.png
I see: Forecast 2.9 points. A material slot already filled (i-line positive resist). Hand: Strip and re-expose, greyed out: "Can't play: needs a litho step just before this one. No step on this route does that." Trim dose: 5 min, 30 cash, 0.4 points less.
I think: Wait. The DOE screen just offered to upgrade Strip and re-expose for 100 cash, and it's a card that can NEVER be played on this route. That's a trap upgrade. A Spire player would be furious if they had smithed it. Also: 35 min budget and my only playable card costs 5. The time budget is not a constraint at all so far. And the PM didn't visibly change the forecast; I can't tell what it bought me.
I try: Trim dose, then Run. 98.8 -> 96.3, 0.2 from drift.
Mood: annoyed

### Step 9 — Procurement (shop)
Screenshot: docs/playtest/shots/spire-veteran/123456-16-s123-10-shop.png
I see: Two items. Radial gas-flow trim, 200, equipment for Etch: depth variation x0.75, edge ring x1.25. Inline metrology, 500, "shows drift earlier on SPC", next used at step 9 (the LAST room).
I think: Two-item shop. Metrology at step 9 shows drift earlier... on the last step. What drift am I going to react to after the last step? That's a never-buy. The gas-flow trim has no "about X points" number, unlike cards. x0.75 on one thing, x1.25 on another, and I don't know the size of either. Coin flip. I buy it because cash has done nothing so far.
I try: Buy gas-flow trim.
Mood: confused

### Step 10 — Room 4: Etch
Screenshot: docs/playtest/shots/spire-veteran/123456-18-s123-11-etch.png
I see: Forecast 9.6 points (!). "About 2.9 come from depth variation... The film stack set how big this is before the lot got here: without an etch stop..." Budget 8 min. One card: Timed over-etch, 4 min, 0.5 points less.
I think: Here's the elite fight. 9.6 points in one room, and the explanation is that a decision made BEFORE I got here (film stack, etch stop) set it. I never saw a choice about an etch stop. So the spike was decided for me. My one card shaves 0.5. And the forecast with my new 200-cash equipment doesn't say what the equipment did. Did I just waste 200? I can't tell.
I try: Over-etch, Run. 96.3 -> 87.1 (-9.1, 0.3 from drift).
Mood: annoyed

### Step 11 — Shop again (after etch)
Screenshot: docs/playtest/shots/spire-veteran/123456-22-s123-14-shop2.png
I see: Only Inline metrology for 500. Same item as before, minus the one I bought.
I think: The shop doesn't restock. Second visit = 10 min for nothing. Lesson: one shop visit per run, max.
I try: Leave.
Mood: annoyed

### Step 12 — Room 5: Resist strip + wet clean
Screenshot: docs/playtest/shots/spire-veteran/123456-23-s123-15-room5.png
I see: Same DI-rinse card as room 1. This is the room where its "qtime oxide x1.1" matters. Forecast 0.6.
I think: Finally a card with a downside that applies NOW. 0.2 less here vs x1.1 oxide later, unknown size. I'll skip it this run and play it next run to compare.
I try: Run without the card. Lost 0.6.
Mood: curious

### Step 13 — Q-time corridor
Screenshot: docs/playtest/shots/spire-veteran/123456-25-s123-16-qt-corridor.png
I see: Orange box: Q-time window, every minute waiting adds oxide risk. PM +0.040 oxide risk, Procurement/Event +0.010. Cycle time 178 min so far.
I think: Good telegraph: the map marked this QT a whole run ago. But "+0.040 oxide risk" is a unit I can't convert to yield. Also I still have no idea what the 178 min of cycle time is doing to me. It's just a number going up.
I try: Go straight on.
Mood: curious

### Step 14 — Room 6: Deposition (barrier + seed)
Screenshot: docs/playtest/shots/spire-veteran/123456-26-s123-17-room6.png
I see: Forecast 3.2 (room 2, same tool, was 0.8). One card again, the useless pump-purge. No breakdown of the 3.2.
I think: Where does the extra 2.4 come from? Oxide from the Q-time? The screen doesn't say. Again a one-card hand that tells me not to play it.
I try: Run. 86.6 -> 83.2.
Mood: bored

### Step 15 — Shop third time / Room 7: Plating
Screenshot: docs/playtest/shots/spire-veteran/123456-29-s123-18-shop3.png ; docs/playtest/shots/spire-veteran/123456-30-s123-19-plating.png
I see: Shop: still only metrology. Then plating ran itself: "Nothing could be played here, so the lot went straight through." 83.2 -> 78.8, -4.4.
I think: I went to the shop again hoping for a plating item. Nothing. Then a room with zero cards ate 4.4 points and I didn't even get to look at it first. No decision at all. That's a cutscene that does damage.
I try: Continue.
Mood: annoyed

### Step 16 — PM stop before CMP, Room 8: CMP
Screenshot: docs/playtest/shots/spire-veteran/123456-34-s123-20-cmp.png
I see: PM screen: "No practice in your deck can be tuned here." Only CMP left to PM, chart in control. I PM'd it anyway. CMP then auto-ran: "Nothing could be played here." 78.8 -> 72.6, -6.2.
I think: Second room in a row with no hand. I'm 2.6 points over spec and I've had zero input for the last two rooms. PM on an in-control tool probably did nothing; no number to tell me.
I try: Continue, straight to metrology.
Mood: about to quit

### Step 17 — Room 9: Metrology
Screenshot: docs/playtest/shots/spire-veteran/123456-36-s123-21-metrology.png
I see: 0.0 points, nothing to play. "Lot shipped: it meets the customer spec."
I think: The final room is a checkout counter. No boss. The run ended by itself.
I try: See the ship report.
Mood: bored

### Step 18 — Ship report + Diagnose
Screenshot: docs/playtest/shots/spire-veteran/123456-37-s123-22-ship.png ; docs/playtest/shots/spire-veteran/123456-38-s123-23-diagnose.png
I see: Shipped 72.6% vs 70% spec. Cost per good die 4.93 "for reference only". Cycle time 283 min, described only as "room time, side stops and events". Yield-by-step table: etch 9.1, CMP 6.2, plating 4.4, deposition 3.4, litho 2.5. Then a one-guess quiz: which failure mode hurt this lot (4 options).
I think: So cycle time does NOTHING to the win condition, and cash ended at 1260 unspent and also does nothing ("for reference only"). That means every side stop was free and cash is irrelevant. Huge. Next run I take a side stop every corridor and buy everything. For the quiz I picked Etch residue because etch was my biggest loss and the etch rate chart had 8 points below centre. Wrong: it was Keyhole void, plating, 3.6 points. Plating was a room where I had no cards. The seam chart was at 3.37 vs a 3.5 limit, I'll grant that was on screen. But it's a quiz about a room I couldn't act in.
Build at the end of run 1: there is no build. My "deck" was 5 cards, each locked to one room, most single-copy, one unplayable. Hands were 1 card. Rooms 7-9 had none.
I try: Run 2.
Mood: bored
