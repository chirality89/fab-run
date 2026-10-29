# P3: base risks cut to 70%. Test values to recompute (proposal, 28 Oct 2026)

**Status: waiting for David's OK. No test is edited. The change itself is in `tasks/p3-risk70.patch` (apply with `git apply`); it is not applied yet.**

## The change
Every base risk in `src/content/lotTypes.js` is multiplied by 0.7: particles 0.01 → 0.007; cd_error 0.03 → 0.021; residue 0.04 → 0.028; underlayer attack 0.03 → 0.021; edge ring 0.03 → 0.021; Q-time oxide 0.04 → 0.028; void 0.08 → 0.056; rr_drift 0.04 → 0.028; depth variation and dishing at the start 0.08 → 0.056. Tool drift, cards, items and events are untouched.

## Result with `npm run exit-check -- --seeds 100`
| deck / policy | shipped | mean yield |
|---|---|---|
| starter / idle | 0% | 61.1 |
| starter / random | 3% | 61.5 |
| starter / casual | 20% | 68.2 |
| starter / smart | 49% | 69.6 |
| full / smart | 100% | 82.4 |

All six targets pass (before: smart with the starter deck shipped 0%). A diagnosis still always has a right answer (checked on 60 seeds × 3 policies).

## How the new values were checked
An independent Python model of the lot (site weights, `e^(−risk × weight)`, losses multiply) first reproduced every OLD expected value below to the printed digits (0.941765, 16.1976, 0.589352, the three ring values, 10.6861, 0.834904, 8.3540, 0.858225, 6.8 and 2.8, 17.9668, 1.9475, 0.5925). Then it computed the new values, and they match the engine. Nothing is copied from the engine alone.

## Values that change (old → new)
**`tests/lot.test.js` / `run.test.js` (idle run, scatter off)**
- Idle yield 0.589352 → **0.690471**; centre 0.657047 → **0.745276**, inner 0.625002 → **0.719643**, outer 0.567295 → **0.672460**.
- Start risks `{ depth_variation: 0.08, dishing: 0.08 }` → `0.056` each.
- Step risks at litho/etch entry: residue 0.04 → 0.028; with the endpoint detector depth variation 0.056 → 0.0392 (×0.7 of 0.056); timed over-etch residue 0.012 → 0.0084.
- Scrap test (1.0 particles added): yield e^−1.01 = 0.364219 → e^−1.007 = **0.365313**.
- PM in the Q-time corridor: Q-time oxide 0.08 → **0.068**; the factor e^(−0.04) is unchanged; the idle baseline 0.589352 → 0.690471.

**`tests/view.test.js` (etch room)**
- Yield at etch entry 0.941765 (shown 94.2) → **0.95887** (shown 95.9).
- Etch forecast 16.1976 → **11.8893** points (text 16.2 → 11.9); after timed over-etch 15.1772 → **11.1214** (15.2 → 11.1); saving 1.0204 → **0.7679** ("About 1.0 point" → "About 0.8 points").
- Run etch with nothing played: 94.2% → 78.0% becomes **95.9% → 84.0%**; after over-etch 79.0% → **84.8%**.
- Etch stop: underlayer attack 0.009 → **0.0063** (without the stop 0.03 → 0.021); forecast 10.6861 → **7.7630**; yield after 0.834904 → **0.881240**; with over-etch attack 0.00945 → **0.006615**, forecast 8.3540 → **6.0471**, yield after 0.858225 → **0.898399**.
- Carried-in sentence: "6.8 of 16.2 points, 2.8 with the stop" → "**5.0 of 11.9** points, **2.1** with the stop".
- Yield band test: raw fraction 0.941765 → 0.95887.
- Drift at etch (tool at health 60): drift share 0.364570 → **0.450436**; loss 17.9668 → **13.7950**; drift points 1.9475 → **2.0380** (text "about 1.9 points" → "about 2.0 points"); with over-etch drift points 0.5925 → **0.6189**.

**`tests/doe.test.js`**: underlayer attack before playing 0.03 → 0.021; the ratio 1.007528 (= e^0.0075) → **1.005264** (= e^0.00525, since 0.021 × 0.25).

**`tests/events.test.js`**: audit: Q-time oxide 0.04 + 0.03 = 0.07 → 0.028 + 0.03 = **0.058**. Slurry hand check: only the idle baseline moves (0.589352 → 0.690471); its ratio × 0.977312 is unchanged. CMP at health 60: same, baseline only.

**`tests/notebook.test.js` "T-top is only right when the lot waited before bake"**: its setup needs CD error to have cost at least 3 points, which no longer holds (it is about 3.1 → below 3). Proposal: add enough CD-error risk in the test's setup so the premise holds again; the assertion that T-top is not offered stays as it is.

**Screen specs**: none expected to change (they derive the right diagnosis from the engine). They will be re-run.
