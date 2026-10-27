# Spire veteran — seed 123456 (first run, newcomer)

### Step 1 — Floor plan (first screen)
Screenshot: docs/playtest/shots/spire-veteran/123456-00-s123-01-first.png
I see: A grid of 9 numbered rooms (Wet clean, Deposition, Litho bay, Etch, Wet clean, Deposition, Plating, CMP, Metrology) in a snake. Little tags between rooms: MET, PM, BUY, EVT, QT. Etch has a red SPC badge. Yield 100%, Cash 1500, Cycle time 0. One button: Enter step 1.
I think: This is the map, but it's one fixed road 1 to 9. No branching. The tags between rooms are presumably side stops (BUY = shop, EVT = event, PM = rest?). Red SPC on Etch reads like an elite/danger warning, nice — I can see it coming. But I have no idea if I get to choose the side stops. Zero decisions yet.
I try: Enter step 1 — it's the only button.
Mood: curious

### Step 2 — Room 1: Wet clean
Screenshot: docs/playtest/shots/spire-veteran/123456-01-s123-02-room1.png
I see: Line yield 100% bar with Scrap 40% and Spec 70% marks. "This room will cost about 1.0 points of yield if nothing changes." A 5x5 wafer map all 100. Time budget 10 min, slots empty, a tool chart (in control). Hand: "No practices left in your hand." One button: Run wet clean.
I think: Good: the health bar is clear, and I know the loss line (40) and the win line (70). Losing 1 point per room x 9 rooms is nothing, so the danger must come from somewhere else. But my hand is empty in the very first room. "No practices left" — left? I never had any. So the first combat has zero cards. That's a tutorial room at best, a dead room at worst.
I try: Run wet clean (only button).
Mood: confused

### Step 3 — Result of room 1
Screenshot: docs/playtest/shots/spire-veteran/123456-02-s123-03-after1.png
I see: Yield 100 → 99.1%. Wafer map now 98s and 99s. Buttons: Continue to the corridor / Replay this seed / New seed.
I think: Predicted 1.0, cost 0.9. Fine. I made zero choices and it took one click. "Replay this seed" on the result screen of room 1 is odd — it looks like an end-of-run button.
I try: Continue to the corridor.
Mood: bored

### Step 4 — Corridor after step 1
Screenshot: docs/playtest/shots/spire-veteran/123456-03-s123-04-corridor.png
I see: "Take one side stop": Metrology +20 min "reveals hidden values (coming in a later update)"; Event +10 min "A choice with a tradeoff"; or go straight to step 2; Scrap the lot. Cycle time is now 10 min.
I think: OK so this is the node choice. Cost is cycle time. But I don't know what cycle time does to me — nothing on screen says cycle time is a resource with a limit. Metrology literally says "coming in a later update", so it's a +20 min tax for nothing. Never take. Event is +10 for an unknown. If time has no visible penalty, Event is free and always right. That's the classic "? room" — I'll take it to see.
I try: Event.
Mood: curious

### Step 5 — Event: Quality audit
Screenshot: docs/playtest/shots/spire-veteran/123456-04-s123-05-event.png
I see: Two options: "Walk them through now" (+30 min cycle time, Wet clean tool serviced) or "Ask them to come back later" (−100 cash). Plus a big "Continue to step 2" button under them.
I think: Numbers are shown, good. But I can't weigh them: I don't know what 30 min of cycle time costs me, or what 100 cash buys. "Wet clean tool serviced" — the wet clean tool isn't the flagged one; Etch is the one with the red SPC. So the upside is meh. Also the Continue button sits there like a third free "skip" option, even though the text says "Choose one option". If skip is free, it's strictly better than "-100 cash". Cycle time has no visible cap, so I'll eat the time.
I try: Walk them through now.
Mood: curious

### Step 6 — Event result
Screenshot: none
I see: "The audit holds the lot 30 minutes... wet clean tool is in better shape." Continue to step 2.
I think: Fine, but the wet clean room is behind me. I see a second Wet clean at step 5, so maybe it helps there. The game doesn't tell me "this helps at step 5". Also note: the event header only shows Cash, not yield or cycle time, so I can't see the cost land.
I try: Continue.
Mood: curious

### Step 7 — Room 2: Deposition
Screenshot: docs/playtest/shots/spire-veteran/123456-06-s123-06-room2.png
I see: Same layout as room 1. Will cost ~1.0. Time budget 15 min. Slots empty. Hand: "No practices left in your hand." One button: Run deposition.
I think: Second room, still no cards. I'm a card-game player and I've now been through two "fights" without a hand. I have 1500 cash and nowhere has offered me a card. Time budget 15 min that I can't spend on anything. This is a click-through.
I try: Run deposition.
Mood: bored

### Step 8 — Corridor after step 2
Screenshot: docs/playtest/shots/spire-veteran/123456-08-s123-07-corridor2.png
I see: Room 2 cost 0.9, yield 98.2%. Cycle time 65 min. Side stops: PM/DOE +40, Procurement +10, Event +10.
I think: Cycle time keeps climbing and still nothing tells me where the limit is. It feels like a currency with no price. Procurement = shop. I have 1500 untouched gold. Shop.
I try: Procurement.
Mood: curious

### Step 9 — Procurement (shop)
Screenshot: docs/playtest/shots/spire-veteran/123456-09-s123-08-shop.png
I see: Three items. In-situ pad conditioner 350 (equipment, CMP, "stable polish rate, but pads consumed faster"). Chemically amplified DUV resist 140 (material, litho, "prints fine lines, but punishes any wait between expose and bake"). Thick resist 90 ("survives long etches (TSVs) at the cost of resolution and bake time"). Each says which step it's next used at, and what it replaces.
I think: Nice that each shows where it applies and what it replaces. But there are zero numbers on the effect. "Stable polish rate" — by how much? Is "pads consumed faster" a cost to me in cash, yield, time? In Spire a relic says "+1 energy, can't rest". Here I'm buying flavour text. No cards for sale — so where do cards come from? The two resists both say "replaces the i-line positive resist", so I can't stack; I'm guessing. I'm making a vibes purchase. "Fine lines" sounds like the generic upgrade, and I don't know what a TSV is. Cash seems to have no other sink, so buy.
I try: Buy DUV resist (140) and the pad conditioner (350).
Mood: confused

### Step 10 — Bought both, went to Litho
Screenshot: none
I see: After buying the DUV resist, the Thick resist now says "Replaces the Chemically amplified DUV resist". Bought the pad conditioner too. Cash 1010.
I think: Shop updated the "replaces" line live, that's good feedback. Still bought on flavour.
I try: Continue to step 3.
Mood: curious

### Step 11 — Room 3: Litho bay
Screenshot: docs/playtest/shots/spire-veteran/123456-12-s123-09-litho.png
I see: Yellow room. Will cost ~4.5 points. Time 30 min. Slot shows my DUV resist. Hand has ONE card: "Strip and re-expose — 30 min · 150 cash — Saves a bad exposure, but only before etch, and each strip adds handling particles." In red: "Can't play: Its condition is not met". Button: Run litho bay.
I think: First card of the game, step 3, and it's greyed out with "its condition is not met" — which condition? It doesn't say. Guessing: I need a bad exposure first. So it's a reaction card that can only be played after a bad roll, but I press "Run" once and the room is over — when would I ever get to play it? 4.5 points predicted. Did my resist change that number? No before/after shown, so I can't tell if my 140 cash did anything.
I try: Run litho bay.
Mood: confused

### Step 12 — Litho bay, lower half
Screenshot: docs/playtest/shots/spire-veteran/123456-12-s123-10-litho-lower.png
I see: Time budget 30/30, slot list, an SPC chart with spec/control lines, all points near centre, "In control".
I think: Chart is readable: dots near the black line, far from red = safe. That's my "enemy intent" equivalent, and it says calm. Fine.
I try: Run litho bay.
Mood: confused

### Step 13 — Litho result
Screenshot: docs/playtest/shots/spire-veteran/123456-13-s123-11-litho-result.png
I see: 98.2 → 93.5, cost 4.6 (predicted 4.5). Map now 89–97.
I think: The prediction is basically exact. So rooms are deterministic-ish tolls, and "Run" is the only verb. I never used the card. 30 minutes of time budget unspent.
I try: Continue.
Mood: bored

### Step 14 — Corridor after Litho
Screenshot: none
I see: Metrology / Procurement / Event. Next room is Etch, which has had the red SPC badge since the start. Cycle time 105.
I think: Etch is the elite. The map told me from minute one. The obvious answer would be "go PM the Etch tool before I get there" — but the PM stop was one corridor back (after Deposition), and here there's no PM. I didn't know PM = fix a tool until now, and the legend just said "PM / DOE". So I already walked past my only chance. That's fair-ish (it was on the map) but the game never connected "red SPC on Etch" with "PM fixes it". Let's see if an event helps.
I try: Event.
Mood: annoyed

### Step 15 — Event: Hot lot request
Screenshot: docs/playtest/shots/spire-veteran/123456-15-s123-12-event2.png
I see: "Run it hot": −30 min cycle time, +150 cash, +0.02 risk: random dots across the wafer. Or "Keep its place in line: nothing changes".
I think: "+0.02 risk" — 0.02 of what? 2 percentage points of yield? 2% chance? Is it per room for the rest of the run? I can't compare. Cash I have plenty of and nothing good to buy, and cycle time has no visible limit, so the upside is two currencies I don't value. "Nothing changes" being an option means this event is skippable — which is the honest Spire answer when I can't read the risk. But I want to learn what risk does, so I'll take it.
I try: Run it hot.
Mood: confused

### Step 16 — Hot lot result
Screenshot: none
I see: Cash 1160. "30 minutes saved and a 150 expedite fee earned, with rushed handling on the way."
I think: The risk didn't show up anywhere I can see. Delayed consequence, I guess. Fine if it's later shown.
I try: Continue to Etch.
Mood: curious

### Step 17 — Room 4: Etch (the SPC room)
Screenshot: docs/playtest/shots/spire-veteran/123456-17-s123-13-etch.png
I see: "This room will cost about 25.1 points of yield if nothing changes." Time budget 8 min. SPC: "Out of control: the etch rate may be shifting... 8 points in a row below the centre line." Hand: one card "Timed over-etch (+20%) — 4 min — Clears residue but attacks the film below, unless an etch stop is there."
I think: THIS is the elite. 25 points versus 1–4 for every other room — one room is worth more than the rest of the run combined. Telegraphed from the first screen, good. But my only answer is a card whose effect I can't read in game terms: does it reduce the 25.1? Add to it? "Unless an etch stop is there" — is there one? Nothing on screen says. The card doesn't preview a new yield number. In Spire I'd see "Block 8". Here I see prose. The chart says rate is drifting LOW, and the card says over-etch +20%, so... more etching compensates for slow etching? That's the only logic I can make from the numbers. Trying it.
I try: Timed over-etch.
Mood: hooked (first actual decision, 17 steps in)

### Step 18 — Played Timed over-etch
Screenshot: docs/playtest/shots/spire-veteran/123456-18-s123-14-etch-played.png
I see: Prediction dropped 25.1 → 21.7. Time 4 of 8 left. Hand empty.
I think: OK — the card is worth 3.4 points of yield for 4 min. I only learn the number AFTER playing it. No undo, no preview. 4 min of time left, nothing to spend it on. One card, one decision, and the decision was "play the only card, yes or no".
I try: Run etch.
Mood: annoyed

### Step 19 — Etch result
Screenshot: docs/playtest/shots/spire-veteran/123456-19-s123-15-etch-result.png
I see: 93.5 → 71.8. Map is now mostly orange (warning) with red striped fails along the edges. Just above Spec 70%.
I think: That was the run. One room took 22 points; the other three rooms combined took 6. I had one card worth 3. The only real lever was the PM stop two corridors back, and nobody told me PM was the counter to the red SPC badge. The loss feels telegraphed, but my tools to answer it were hidden. Now I'm 1.8 points above spec with 5 rooms to go at ~1 each. I'm probably already lost and I know it.
I try: Continue.
Mood: annoyed

### Step 20 — Corridor after Etch
Screenshot: none
I see: Metrology / PM-DOE / Procurement. Yield 71.8.
I think: I want to understand PM now, too late to matter.
I try: PM / DOE.
Mood: annoyed

### Step 21 — PM / DOE stop (the "campfire")
Screenshot: docs/playtest/shots/spire-veteran/123456-21-s123-16-pm.png
I see: DOE: "Measure all 25 sites (Metrology): now 20 min · 150 cash → after DOE 12 min · 150 cash", 100 cash. Or PM one tool ahead: Wet clean, Deposition, Plating, CMP, each "In control". "PM brings a tool back to 75–95% health, never perfect (a tool already healthier stays as it is)."
I think: This is the rest site: rest (PM) or smith (DOE). And it's clear — it says exactly what PM does. If I'd seen this screen BEFORE Etch I'd have PM'd the Etch tool and saved maybe 20 points. That's the whole run, decided by whether I stumbled into the right side stop at the right corridor. And the DOE offer upgrades a card I've never seen in my hand ("Measure all 25 sites"). Upgrading a card I don't own? Every tool ahead is in control, so PM is worth zero here. I just paid 40 min for nothing. Also: tool "health" is a number I've never been shown anywhere.
I try: Continue without doing anything.
Mood: annoyed

### Step 22 — Room 5: Wet clean (strip)
Screenshot: none
I see: Predicted 0.7, no hand, run button. Result 71.8 → 71.2.
I think: The audit "serviced" this wet clean tool back at step 1. Predicted 0.7 vs 1.0 last time — maybe that's the payoff? I can't tell, there's no "your audit saved you 0.3" line. Another zero-decision room.
I try: Run, continue.
Mood: bored

### Step 23 — Corridor in a Q-time window
Screenshot: docs/playtest/shots/spire-veteran/123456-24-s123-17-qtime.png
I see: "Q-time window: native oxide keeps growing until the barrier goes on. Every minute the lot waits at a side stop here adds oxide risk." Metrology: +0.020 oxide risk; Event: +0.010 oxide risk.
I think: Clear: side stops cost extra here. Good — that's a real "don't stop" signal. Still "risk" with no unit. I'm 1.2 above spec, so no gambling.
I try: Go straight to step 6.
Mood: curious

### Step 24 — Room 6: Deposition (barrier + seed)
Screenshot: none
I see: Predicted 3.6, no hand. Result 71.2 → 67.4. Now under the Spec 70% line.
I think: There it is. I'm below spec and I made no choice in this room. 3.6 instead of ~1 — maybe the hot-lot "risk" or some oxide thing, nothing tells me why this room cost more than its twin at step 2. I'm watching a health bar tick down while pressing one button.
I try: Continue.
Mood: about to quit

### Step 25 — Corridor after step 6
Screenshot: none
I see: Yield 67.4, cash 1160. Metrology / Procurement / Event.
I think: I have 1160 gold and nothing to do with it. Let me see if the shop sells anything that heals or helps Plating.
I try: Procurement.
Mood: annoyed

### Step 26 — Procurement #2
Screenshot: docs/playtest/shots/spire-veteran/123456-28-s123-18-shop2.png
I see: Inline metrology 500 (equipment, metrology, "shows drift sooner; does not fix anything by itself", next used at step 9 — the last step). Three-additive copper bath 200 (plating, "bottom-up fill... ages every lot").
I think: Inline metrology for the final room of the run = dead item this run. Maybe it persists? Nothing says equipment carries between runs. Bath for the very next room — buy on faith.
I try: Buy bath, go to Plating.
Mood: bored

### Step 27 — Room 7: Plating
Screenshot: none
I see: Slot: my copper bath. Predicted 2.0. No hand. Result 67.4 → 65.2 (2.2).
I think: Did the bath help? No before/after. I bought it after the prediction was invisible to me, so I can't tell if it changed anything. Shopping is blind.
I try: Run, continue.
Mood: bored

### Step 28 — Event: cheaper CMP slurry
Screenshot: none
I see: "Switch now: +150 cash · CMP tool steps off target (watch its SPC chart)" vs "Keep the qualified slurry: nothing changes".
I think: I've learned that an off-target tool = the 22-point Etch disaster. +150 cash I can't spend usefully. Trivially "keep". Not a decision when cash has no use; every event so far has been "free nothing" vs "currency I don't need + danger".
I try: Keep the qualified slurry.
Mood: bored

### Step 29 — Room 8: CMP
Screenshot: docs/playtest/shots/spire-veteran/123456-35-s123-19-cmp.png
I see: Predicted 6.6 points. Slot: In-situ pad conditioner. SPC in control (226.9, near the lower control line). No hand.
I think: 6.6 even "in control" and with my 350-cash conditioner. Why? No breakdown. It's like being hit by an enemy with no intent icon. And no cards, again. 7 of 8 rooms had either zero cards or an unplayable one.
I try: Run CMP.
Mood: about to quit

### Step 30 — Corridor after CMP, Room 9: Metrology
Screenshot: docs/playtest/shots/spire-veteran/123456-39-s123-20-end.png
I see: CMP took 6.2 (cash also dropped 960 → 940 in CMP — the pad conditioner eating pads, I guess; nothing announced it). Went straight to Metrology. Metrology room predicts 0.0 cost and finally gives me a card: "Measure all 25 sites, 20 min · 150 cash, full information". I just ran it. Result: "Lot rejected: shipped below the customer spec."
I think: The last room is free and the only card is information I can no longer use. The lot was dead three rooms ago.
I try: See the ship report.
Mood: about to quit

### Step 31 — Ship report + Diagnose
Screenshot: docs/playtest/shots/spire-veteran/123456-40-s123-21-report.png
I see: Rejected, 58.9% vs 70%. Cost per good die 6.95, cycle time 218 min. Yield-by-step table (Etch: 21.7 points lost). A DIAGNOSE section: "Which failure mode hurt this lot? One guess." Options: Edge ring / Keyhole void / Etch residue ("Opens spread evenly across the whole wafer after etch, while the etch rate falls on the etch SPC chart") / Post-exposure delay T-top.
I think: The yield table is the best screen in the game — I finally see where I bled. And the diagnose quiz looks trivially easy: Etch residue's description is literally what happened. Etch was the 21.7 room, the etch chart said rate below centre 8 in a row, losses spread across the whole wafer.
I try: Etch residue.
Mood: curious

### Step 32 — Diagnose answer
Screenshot: docs/playtest/shots/spire-veteran/123456-41-s123-22-diagnosed.png and docs/playtest/shots/spire-veteran/123456-41-s123-23-report-map.png
I see: "Not this one. What did hurt this lot: Edge ring. It is not written in your notebook: diagnose it on a later run to earn it." The final wafer map: every site red except the centre (72); edges 51–58, inner sites 57–69.
I think: What? Edge ring says "only the outer ring fails; inner sites are clean". My inner sites are NOT clean — they're 57, 60, 61, 63, 64, 69, all red. And the etch chart still says out of control, rate falling, exactly the Etch residue text. I picked the answer that matched the description word for word and got told I'm wrong. This is the one place the game asked me to think, and the evidence pointed the other way. That feels like a rigged quiz. One guess, no partial credit, no notebook entry. Also no idea what "notebook" is — first time I see the word.
I try: Done with this run. Replay later with seed 42.
Mood: annoyed

Run summary: rejected at 58.9%. Real decisions made: ~4 (which side stop, two shop buys on flavour, play/not play one card). The run was decided by the Etch room, which I could only have answered with a PM I didn't know existed until after.
