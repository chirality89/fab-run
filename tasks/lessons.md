# Lessons Learned

Add an entry after any bug or correction. Format: what happened → root cause → rule to prevent it.

The first two entries are carried over from FabSim2 because they apply here too.

## Template

### What Happened
[2–3 sentences]

### Root Cause
[Why it happened]

### Rule to Prevent
✅ [Specific rule]
✅ [Test or check that would catch it]

---

## Notes edit silently did nothing (from FabSim2)

### What Happened
Results were supposed to go into `tasks/todo.md` and were reported as recorded, but they never landed.

### Root Cause
A scripted find-and-replace looked for text with different capitalization. It found no match, made no change and raised no error.

### Rule to Prevent
✅ After any scripted text edit, check the diff shows the new text before committing or reporting it as done
✅ Prefer the Edit tool for notes, since it fails loudly when the old text isn't found

## Phone screenshot silently came out at desktop size (from FabSim2)

### What Happened
"Phone" screenshots came out at 1280×720.

### Root Cause
The Playwright device preset name didn't exist in that version. The lookup returned nothing and the browser fell back to desktop size without an error.

### Rule to Prevent
✅ Give phone screenshots an explicit size: `viewport: {width: 375, height: 812}, isMobile: true, hasTouch: true`
✅ Check every screenshot's pixel size before judging it

## Repo check tripped on its own warning comment

### What Happened
The new "no `Math.random` in `src/`" test failed on the first run. The only match was the comment in `rng.js` that says never to use it.

### Root Cause
The check searched the whole file text, comments included, so a warning about the rule looked like breaking it.

### Rule to Prevent
✅ Text-search checks over source code skip comment lines (`codeOnly()` in `tests/rng.test.js`)
✅ After loosening a check, prove it still fails on a real violation before trusting it

## Finite inputs can still make an infinite risk (lot.js review)

### What Happened
`physics-reviewer` found that `scaleRisk` checked its multiplier but not the result. A huge finite multiplier could push a risk to Infinity, and Infinity × a site weight of 0 (edge ring, center site) gives NaN on the wafer map.

### Root Cause
Input checks guard each argument, but overflow happens in the arithmetic after the checks.

### Rule to Prevent
✅ Engine functions that store a number check the stored *result* with `Number.isFinite`, not just the inputs
✅ When writing an overflow test, confirm the input really overflows (1e300 + 1.7e308 is still finite; `Number.MAX_VALUE` twice is not)

## Wrote expected values before the calculation returned

### What Happened
While planning lotTypes.js, the do-nothing yield was written into `tasks/todo.md` in the same step as the script that computed it. Two digits were guessed and came out wrong (0.518320 instead of 0.517954).

### Root Cause
The expected values were typed from mental arithmetic and not copied from the computed output.

### Rule to Prevent
✅ Compute expected values first, then copy them from the output in a separate step
✅ Engine tests use these values, so a wrong one in the plan becomes a wrong test

## Read the sign convention from the code, not from memory (M1 bot, 24 Oct 2026)
- What happened: the bot plan said the i-line resist's `timeCost: -5` made litho 25 minutes. The engine (and the balance table) treat a negative cost as minutes given back, so litho is 35 and idle cycle time is 133, not 123. The test caught it.
- Root cause: I hand-computed from what "−5" looked like instead of reading `resolve.js` timeCost.
- Rule: before writing an expected value that goes through an effect op, read that op's code and its comment for the sign.

## Colour from the raw number, not the rounded one (M2 room, 24 Oct 2026)
- What happened: the yield bar picked its colour from the value rounded to 0.1%, so a raw 69.96% showed "70.0%" in the pass colour while the engine rejects it. Found by code-explainer.
- Root cause: the screen made its own pass/fail call from a display string instead of the same number the engine judges.
- Rule: any verdict shown on screen (pass, warn, fail, scrap) is computed from the raw engine value, in view.js, with a test at the edge (e.g. 0.6996). Rounding is for printing only.

## Started over on work an earlier session had already done

### What Happened
A session started from `main`, saw M0 unticked and began planning `rng.js` again, re-asking David decisions O2–O8. All of M1 and M2 item 1 already existed on an earlier session's branch (PR #1), which had never been merged.

### Root Cause
The start routine only reads files on the current branch. Work that lives on an open PR or another branch is invisible from there.

### Rule to Prevent
✅ At session start, list open PRs and remote branches (`git branch -r`, GitHub PR list) and check none holds newer roadmap work before picking an item
✅ When an item is done, get its PR merged to `main` (or tell David it's still open) before the session ends

## A double tap could play a card and run the room

### What Happened
Playing a card redraws the screen at once. In review, the second click of a fast double tap was found to land on whatever slid into the card's place, which with one card in hand is the Run etch button.

### Root Cause
Buttons that move under the finger after a redraw. Nothing told a deliberate second tap from the tail end of a double tap.

### Rule to Prevent
✅ Every button that changes the run uses `onSingleClick` (render.js), which ignores the second click of a double click
✅ After any redraw on tap, test a fast double tap at the same spot in the browser

## A screen test tapped off the edge of the screen

### What Happened
The phone double-tap test failed: the card was never played. No click reached the page at all.

### Root Cause
On the phone the card sits below the bottom of the screen. A raw `page.touchscreen.tap(x, y)` does not scroll, so it tapped a spot outside the window. (`locator.tap()` does scroll, which is why the other tests passed.)

### Rule to Prevent
✅ Before a raw tap or click at coordinates, call `scrollIntoViewIfNeeded()` on the target and measure it after
✅ When a guard test passes, switch the guard off once and confirm the test then fails


## A screen test's tap was eaten as the second click of a double click

### What Happened
After the screen tests started walking the route to reach etch, the phone double-tap test failed: the card was never played. The test had tapped "go straight on" a moment before, at about the same spot.

### Root Cause
Chrome counts two taps close together in time and place as a double click (`event.detail` 2), even across a screen change. The double-tap guard (`onSingleClick`) correctly ignored the second one; the test was simply faster than a person.

### Rule to Prevent
✅ In screen tests, wait out the double-click window (`DOUBLE_CLICK_WINDOW_MS`) before a tap that must count as a fresh gesture
✅ When a tap seems to do nothing, log `event.detail` and the click target before changing game code

## A layout change elsewhere broke an unrelated phone test

### What Happened
After the procurement offer lost its "(coming next update)" note, the phone etch test "tapping timed over-etch plays it" failed: the card tap did nothing. Only the double-tap test had waited out the double-click window; the other etch tests tapped the card straight after "go straight on".

### Root Cause
The shorter map buttons moved "go straight on" to about where the etch card appears. The same double-click window as the lesson above, hit by a test that had never needed the wait.

### Rule to Prevent
✅ A helper that ends on a tap and hands over to a test that taps again waits out the double-click window itself, once, so no test depends on where the last button happened to sit

## The shop sold items for rooms the lot had already left

### What Happened
code-explainer found that a shop after litho could offer a resist, which could never act again. The plan only said "rooms not on the route at all", and I built exactly that.

### Root Cause
"On the route" was checked against the whole route, not the part still ahead. The screen's "Not used again on this route" line hid the gap instead of showing it as a bug.

### Rule to Prevent
✅ Anything offered to the player must be able to matter from where the lot stands now. Check against the route still ahead, not the whole route.
✅ When a screen needs a "this does nothing" message, ask first whether the thing should be offered at all

## A bot test said "cash ≥ 0", but decision O4 allows running costs below 0

### What Happened
Once the bot could buy the pad conditioner, seed 17 (random, full deck) ended at −20 cash: it spent down to 0, then CMP charged 20 for pads. The bot test failed.

### Root Cause
The test's check was stricter than the agreed rule (O4: buying is blocked below 0, running costs may still go below). Until buying existed, nothing could reach that case.

### Rule to Prevent
✅ A test's limits come from the written decision, not from what the engine happens to do today. Read the decision before writing the limit.
✅ When a check fails, ask David which is right, the check or the rule. Never loosen it silently (David chose to change the test, 25 Oct 2026).

## The SPC chart drew a lower spec limit on particle counts

### What Happened
physics-reviewer found that the particle (clean, deposition) and seam-rate (plating) charts showed a lower spec line, and the yield math counted a lower tail. That teaches that "too few particles" is out of spec, which is false.

### Root Cause
I used one two-sided capability model for every parameter. Some parameters are only bad in one direction.

### Rule to Prevent
✅ For every monitored parameter, ask whether it has a lower spec, an upper spec, or both, and keep that as data (`oneSided`)
✅ A chart line on screen is a claim about physics: review it as content, not as decoration

## New content entries went in without draft: true

### What Happened
code-explainer found the six tool monitors had no `draft: true`, which CLAUDE.md §6 requires.

### Root Cause
They were a new kind of content in a new file, so the existing entries weren't there as a pattern to copy.

### Rule to Prevent
✅ Every new entry in `src/content/`, of any kind and in any file, starts with `draft: true`

## A PM could make a healthy tool worse

### What Happened
code-explainer found that a PM set health to the 75–95 roll whatever the tool's health was before, so a PM on a tool at 100 dropped it to 84.

### Root Cause
I built "PM restores to 75–95" literally as "set to 75–95" and never tested a tool that was already healthier than the range.

### Rule to Prevent
✅ For any "restore" or "repair" action, test it on something already in good shape. Repairing must never make a thing worse unless David asked for that as a side effect.
✅ When a rule moves a value into a range, write down what happens to values already above and below the range

## The double-click window caught a new screen test again

### What Happened
The phone DOE screen test failed every time on "Continue to the corridor". Its "Run litho" tap landed where "Continue to step 3" had been tapped a moment before, so the double-tap guard ignored it. My own run of the suite had passed once by timing luck.

### Root Cause
The rule from the earlier lessons (wait out the double-click window) lives in each spec file, not in one shared helper, so a new spec didn't have it.

### Rule to Prevent
✅ Every screen test that taps twice across a screen change waits `DOUBLE_CLICK_WINDOW_MS` between the taps. When a new spec chains screens, add the wait at each screen change.
✅ Run a new screen test with `--repeat-each=5` on the phone before calling it done

## An event's risk could not be diagnosed, and some options cost nothing

### What Happened
physics-reviewer found that the cheaper-slurry option added a polish-rate risk that never showed on any chart, so rule 6 (every failure is diagnosable) broke. It also found that an event could come up after its room had passed, making "take the cash" free.

### Root Cause
I checked each option against the physics but not against the evidence on screen, nor against where the lot is on the route. The second is the same root cause as the shop lesson.

### Rule to Prevent
✅ Every new way to lose yield must show up somewhere on screen (SPC, wafer map, metrology) before it ships. Name where.
✅ Anything offered between rooms (shop items, PM tools, DOE cards, events) is checked against the route still ahead

## The ship report said "Shipped yield" for a scrapped lot, and "CMP CMP"

### What Happened
The unit tests for the ship report passed, but the screenshots showed two wrong texts: a lot the player scrapped was labelled "Shipped yield", and steps whose label equals the room's name read twice ("CMP CMP", "Metrology Metrology").

### Root Cause
I wrote the labels for the shipped case and tested numbers, not words. Text built from two content fields can repeat itself when the fields hold the same words.

### Rule to Prevent
✅ Every label on an end screen is checked once for each end state (shipped, rejected, scrapped by the line, scrapped by the player)
✅ When text joins two content fields, check the screenshot for the case where both say the same thing

## Splitting yield loss by the wafer average under-credited a pattern

### What Happened
To say how many yield points each pattern cost, I took each pattern's exponent averaged over the wafer and split the total loss in that ratio. physics-reviewer showed it was wrong when one pattern saturates some sites: an edge ring that kills the outer sites takes almost all the credit, and particles that cost about 6.5 points were credited about 1.2. A right diagnosis would then be graded wrong.

### Root Cause
Yield is the average of the sites' survivals, not e to the power of the average exponent. A ratio of averaged exponents is not a ratio of yield lost.

### Rule to Prevent
✅ Split a yield loss where it happens: per site, then add the sites up. Check that the parts add up to the whole.
✅ Test an attribution with a pattern that saturates some sites next to one that is spread evenly
✅ A failure mode is a right answer only if its cause was present, not just its pattern (several causes can make the same pattern)

## Two green PRs merged into a red main

### What Happened
PR #12 (Lane D, card art) and PR #16 (Lane C, content) were each green against main, and I merged them one after the other. Together they broke main. Lane D's test says every practice needs a cross-section, but Lane C's 9 new practices had none, and a line Lane C added made the "Stop on endpoint" card overflow its frame.

### Root Cause
Each PR was tested against main without the other. Neither branch had the other's rule or the other's content, so no one tested the two together before they landed.

### Rule to Prevent
✅ Before merging a second lane PR, merge both branches locally and run `npm test` and `npm run screens` on the combined result
✅ When a lane adds a rule that covers all content ("every practice has art"), tell the content lane before either merges

## Rounded numbers hid a failing contrast step (Lane D)

### What Happened
The contrast script printed 1.345 as "1.35", so etch shade1 looked like it met the 1.35:1 rule. It didn't, and the new test caught it.

### Root Cause
A limit was judged from a rounded printout.

### Rule to Prevent
✅ Compare raw ratios against limits in code (the test does); round only what people read
✅ Never copy a "passes" judgement from rounded output

## Cards shrank in a one-row hand (Lane D)

### What Happened
A fixed-width card in a `nowrap` flex row was squeezed below 260 px and its text overflowed.

### Root Cause
Flex items shrink by default.

### Rule to Prevent
✅ Fixed-size UI pieces get `flex: none`
✅ The art-preview screen test checks that no card text overflows

## A long text squeezed the card name away (Lane D)

### What Happened
Lane C's longer tradeoffs didn't fit the 260 × 380 card. Flex let the card name shrink to zero height on 11 cards, and the overflow test didn't notice.

### Root Cause
Flex items shrink by default, and the test measured the container, not its parts.

### Rule to Prevent
✅ Fixed parts of a card get `flex: none`
✅ Test that each part is visible, not only that the container doesn't overflow

## A test assumed the first room deals cards (Lane B)

### What Happened
A "room with a hand" check ran at wet clean, but the starter deck has no wet-clean cards.

### Root Cause
The test relied on a hand without checking which rooms the deck covers.

### Rule to Prevent
✅ Before a test relies on a hand, check which room's cards are in the deck

## A test helper assumed the lot was never already in a room (Lane B)

### What Happened
A helper that walks a run assumed it started at a door, and broke when the lot was already in a room.

### Root Cause
The helper didn't look at where the lot stood.

### Rule to Prevent
✅ Helpers that walk a run start from wherever the lot stands (door, room, corridor, shop)

## A test passed on a lot that had nothing to test

### What Happened
A test checked that an unknown notebook id doesn't change the diagnosis. It used a lot scrapped on its first move. That lot lost nothing, so there were no choices at all, and "the same with or without the id" was true for an empty list.

### Root Cause
The test compared two results without checking that the results had anything in them.

### Rule to Prevent
✅ When a test compares "with X" against "without X", first assert the result is not empty
✅ For diagnosis tests, play the lot through (the idle walk) so it has losses to diagnose

## A test expected item names typed from memory

### What Happened
A new Notebook test expected "Additive bath" and "Electrostatic chuck upgrade". The items are named "Three-additive copper bath" and "Edge-tuned chuck", so the test failed on its first run.

### Root Cause
The expected names were written from the items' ids, not read from `content.js`.

### Rule to Prevent
✅ Before writing an expected name or number from content, print it from `content.js` first
✅ When a brand-new test fails, check the expected value's source before touching the code


## A test helper that always took the first offered stop stopped testing the shop (26 Oct 2026)
- **What happened:** after the map stopped offering metrology, every corridor offered PM or an event. `takeEveryStop` in `storage.test.js` always took PM first, then event, so it never shopped, and the "every action replays" test found no seed that used `buy`.
- **Root cause:** the helper's preference order quietly depended on which stops a corridor could offer. Taking a kind out of the pool changed what the helper could ever reach.
- **Rule:** a test helper that has to cover every kind of choice should turn its preference with something that varies (here the corridor number), not use a fixed "first match" order. When a pool of choices changes, check which helpers pick from it.

## A screenshot caught what a test didn't: the map legend still listed a stop the map no longer offers (26 Oct 2026)
- **What happened:** M4.5 item 5 took metrology off the map, but the floor-plan legend was built from every stop in `sideStops.js`, so it still said "MET Metrology". No test checked the legend, and I didn't look at a floor-plan screenshot after that item.
- **Root cause:** two lists described the same thing (the stops in content, the stops the map offers), and I changed only one of them.
- **Rule:** when a change takes something out of the game, search for every place that lists it (legends, keys, help text), and look at the screenshot of every screen that could show it, not only the screens the change was about.

## 26 Oct 2026 — "Carried in" told the player the room was blameless
- **What happened:** the etch forecast's new sentence said depth variation "was not added in this room". The physics review caught that it is false: without a stop, depth variation comes from this etch's own rate non-uniformity, and dishing is made by the polish itself. Only how big each risk gets was set earlier (stack, layout).
- **Root cause:** I wrote plain words for "startRisks" (risk entered at the start) and read that as "caused earlier". Where a risk enters the model is not where the physics happens.
- **Rule:** text that explains a model mechanic must say what the physics does, not what the code does. Have `physics-reviewer` read player-facing explanations, not only effect numbers, and keep the reason per pattern in data next to the pattern.

## 27 Oct 2026 — An SPC verdict said fewer particles cost yield
- **What happened:** the new verdicts said "A shifted tool costs yield" for any shift, including a run below the centre line on a one-sided chart (particle adders, seam rate), where fewer is never out of spec. The physics review caught it.
- **Root cause:** I wrote the verdict from the rule alone and forgot the chart's spec shape, the same miss as the earlier lower-spec-line lesson.
- **Rule:** any text that says a chart signal costs yield must check `oneSided` and the drift `direction` first. Test every new SPC sentence on a one-sided chart as well as a two-sided one.

## 28 Oct 2026 — A flow change broke 16 screen specs I had not run
- **What happened:** letting a room with nothing to play run itself, and adding starter practices to most rooms, passed `npm test` but broke 16 Playwright specs (they press Run in every room, expect an empty plating hand, and expect certain DOE offers). I found out only because I ran `npm run screens` before committing; the first commit went out with the unit tests green and the screens not yet run.
- **Root cause:** `npm test` does not cover the screens, and I treated it as the whole check for a change that touches what the player does on a screen.
- **Rule:** a change to the room flow, the starter deck or any text a spec reads needs `npm run screens` before the commit, and the commit message says if any spec is still red. Check specs for flows that "press the same button in every room".

## 28 Oct 2026 — The starter cards were too small to change the outcome, and I found out late
- **What happened:** five starter practices raised the smart bot's starter-deck result by only 2 points. Each card acts on one room's pattern, and those patterns hold about 1% of risk, so no single card could move the lot.
- **Root cause:** I drafted cards before measuring how much yield each room can give back. The bot (`npm run exit-check`) shows it in seconds.
- **Rule:** before drafting cards for a balance goal, run the smart bot with the full deck and note where the points are lost (`pointsLostByPattern`). Draft for the patterns that hold the points, or change the base risks.

## 28 Oct 2026 — The smart bot chose side stops after looking inside them
- **What happened:** to pick a side stop, the smart bot opened each one on a copy of the run, saw its shop stock, event or PM restore roll, then chose. A player sees only the stop's kind. The bot changed its choice in 17 of 240 corridors when only those hidden dice changed.
- **Root cause:** "try every option on a copy" also tries options whose outcome a player cannot know yet. The copy carried the run's own seed, which decides what is inside each stop.
- **Rule:** a bot that measures good play scores a choice only on what a player could see. Where the outcome is hidden, score it on imagined dice and average (`IMAGINED_SEEDS` in `tools/smartBot.js`). Test it by changing only the hidden dice and checking the choice stays the same, and check that test fails on the old bot.

## 29 Oct 2026 — A card that costs only minutes nobody else wants is always worth playing
- **What happened:** five starter cards were "real tradeoffs" on paper, but the smart bot played them in 30 of 30 lots. In a room with one card, the card's minutes are free, and the side effects were too small to outweigh the gain.
- **Root cause:** the tradeoff was checked as text, not measured. A cost only counts if it can ever be bigger than the gain.
- **Rule:** before calling a card a decision, measure its worth per lot (gain with and without it, split by what the screen shows, e.g. SPC flagged or quiet). It should lose in some lots and win in others, and the screen should tell them apart. If it never loses, it is routine: make it a route step (game rule 8).

## 29 Oct 2026 — One room ate a third of every first run, and the player could not act on it
- **What happened:** a playtest said etch "ends most runs". Measured on 100 seeds, etch lost 13.5 of about 48 points when idle, and the smart bot with the starter deck still lost 11.7 there. Every etch remedy (etch stop, endpoint detector, e-chuck) was locked behind the notebook, so a first run had only the over-etch card and a PM. The exit-check passed because it only measures totals.
- **Root cause:** balance was judged on total yield, not per room, and not on how much of each room's loss a new player could recover.
- **Rule:** when balancing the first run, tabulate points lost per room and what the starter deck can recover in each (idle vs smart). A room that loses much more than its neighbours and offers no starter lever is a wall; fix it with base risks (balance), not by bending physics.

## 29 Oct 2026 — A new header button crashed the room result screen
- **What happened:** the Words button went into `drawHeader`, the room's top bar. The room screen got its `words` action, but the result screen after Run uses the same `drawHeader` and didn't. Every Run showed "Something went wrong". I committed after the unit tests passed, while the screen tests were still running, and only the etch screen tests caught it.
- **Root cause:** I changed a shared drawing function's inputs and updated the callers I was thinking of, not every caller. Unit tests don't draw screens.
- **Rule:** when a drawing function gets a new input, grep every caller (`grep -n "drawHeader(" src/ui/*.js`) and pass it everywhere. Don't commit a UI change until `npm run screens` has finished green. A screen test should open each new button from every screen that shows it.

## The bot gave up on lots going under, and sold yield for cash (31 Oct 2026)
- **What happened:** with cost counting, a bot scoring only cost per good die took every cash event and never reached the yield spec. Then a make-believe scrap scored a flat −1, so every option tied and the bot stopped trying to save the lot: 12% of NMOS smart lots were scrapped.
- **Root cause:** the score did not match the win rule (two targets), and it had a flat region where all options look equal.
- **Rule:** a bot's score must be the margin to the actual win rule, and must keep a slope everywhere, including in losing states. When a bot's scrap or loss rate jumps after a scoring change, check for ties first.
