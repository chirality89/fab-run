// events.test.js — checks the event side stop (M3 item 2e): drawEvent in
// src/engine/events.js and chooseEventOption in src/engine/run.js, plus the
// addRisk operation and toolHealth's `room`.
// Expected values are hand-computed (tasks/todo.md, M3 item 2e). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lotYield } from '../src/engine/lot.js';
import { applyEffect } from '../src/engine/resolve.js';
import { createRun, enterStep, resolveStep, walkCorridor, chooseEventOption } from '../src/engine/run.js';
import { drawEvent } from '../src/engine/events.js';
import { EVENTS } from '../src/content/events.js';
import { PATTERNS } from '../src/content/content.js';

const SEED = 123456;
const TOLERANCE = 1e-6;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected}`);

// Seed 123456: the corridor after step 2 (index 1) offers an event, and it
// draws the supplier change. Options: 0 = Switch now, 1 = Keep.
const EVENT_CORRIDOR = 1;
const SWITCH_NOW = 0;
const handCheckRun = () => createRun({ seed: SEED, scatterStrength: 0, toolDrift: false });

function openEvent(state) {
  let current = resolveStep(enterStep(state));
  while (current.corridor < EVENT_CORRIDOR) current = resolveStep(enterStep(walkCorridor(current, null)));
  return walkCorridor(current, 'event');
}

function playIdle(state) {
  let current = state;
  while (current.status === 'running') {
    current = resolveStep(enterStep(current));
    if (current.corridor !== null) current = walkCorridor(current, null);
  }
  return current;
}

test('every event has two options, each with a tradeoff, a physics note and known patterns', () => {
  assert.equal(EVENTS.length, 3);
  for (const event of EVENTS) {
    assert.ok(event.draft && event.name && event.text, event.id);
    assert.equal(event.options.length, 2, event.id);
    for (const option of event.options) {
      assert.ok(option.label && option.result && option.tradeoff && option.physicsNote, `${event.id}: ${option.label}`);
      assert.ok(Number.isFinite(option.minutes), `${event.id}: ${option.label} minutes`);
      for (const effect of option.effects) {
        if (effect.pattern) assert.ok(PATTERNS[effect.pattern], `${event.id} pattern ${effect.pattern}`);
      }
    }
  }
});

test('the event stop draws the supplier change for seed 123456, untouched rngState', () => {
  // The lot standing in corridor 1, before taking the event stop.
  const before = resolveStep(enterStep(walkCorridor(resolveStep(enterStep(handCheckRun())), null)));
  const atEvent = openEvent(handCheckRun());
  assert.deepEqual(atEvent.event, { corridor: EVENT_CORRIDOR, eventId: 'slurrySupplier', chosen: null });
  assert.deepEqual(atEvent.eventsSeen, ['slurrySupplier']);
  assert.equal(drawEvent(before, EVENT_CORRIDOR), 'slurrySupplier');
  assert.equal(atEvent.rngState, before.rngState, 'drawing the event leaves the lot\'s generator alone');
});

test('no repeat until all three are seen, then the pool starts over', () => {
  const state = handCheckRun();
  const draws = new Set();
  let seen = [];
  for (let i = 0; i < 3; i++) {
    const id = drawEvent({ ...state, eventsSeen: seen }, i);
    assert.ok(!seen.includes(id), `draw ${i} repeats ${id}`);
    seen = [...seen, id];
    draws.add(id);
  }
  assert.equal(draws.size, 3);
  assert.ok(EVENTS.some(event => event.id === drawEvent({ ...state, eventsSeen: seen }, 3)), 'a fourth draw still gives an event');
});

test('an option applies once; a second choice, a bad index and no event are refused', () => {
  const atEvent = openEvent(handCheckRun());
  const chosen = chooseEventOption(atEvent, SWITCH_NOW);
  assert.equal(chosen.cash, atEvent.cash + 150);
  assert.equal(chosen.tools.cmp.health, atEvent.tools.cmp.health - 40, 'CMP removal rate steps 2σ');
  assert.throws(() => chooseEventOption(chosen, 1), /already chosen/);
  assert.throws(() => chooseEventOption(atEvent, 2), /no option 2/);
  assert.equal(enterStep(chosen).event, null, 'the event closes on entering the next room');
  assert.throws(() => chooseEventOption(enterStep(chosen), 0), /no event open/);
});

test('the hot lot takes 30 minutes off; cycle time never goes below 0', () => {
  const atEvent = { ...openEvent(handCheckRun()), event: { corridor: EVENT_CORRIDOR, eventId: 'hotLot', chosen: null } };
  const hot = chooseEventOption(atEvent, 0);
  assert.equal(hot.cycleTime, atEvent.cycleTime - 30);
  close(hot.lot.risks.particles - (atEvent.lot.risks.particles ?? 0), 0.02, 'particles added');
  const early = chooseEventOption({ ...atEvent, cycleTime: 10 }, 0);
  assert.equal(early.cycleTime, 0);
});

test('the audit in the Q-time corridor: +30 min, Q-time oxide +0.001 × 30, the wet bench +15', () => {
  // The Q-time corridor is the one after step 5 (index 4). Its oxide is
  // 0.028 there (step 5 adds it; step 6 realizes it).
  let state = resolveStep(enterStep(createRun({
    seed: SEED, scatterStrength: 0, toolDrift: false, startingHealth: { clean: 70 },
  })));
  while (state.corridor < 4) state = resolveStep(enterStep(walkCorridor(state, null)));
  const atAudit = { ...state, corridor: null, event: { corridor: 4, eventId: 'audit', chosen: null } };
  const walked = chooseEventOption(atAudit, 0);
  assert.equal(walked.cycleTime, atAudit.cycleTime + 30);
  close(walked.lot.risks.qtime_oxide, 0.058, 'qtime_oxide 0.028 + 0.03');
  assert.equal(walked.tools.clean.health, 85, 'wet bench serviced');
  assert.deepEqual(walked.tools.clean.pmAt, [walked.tools.clean.spc.length], 'the service marks its chart, so old flags stop counting (M4.5 item 4)');
  const later = chooseEventOption(atAudit, 1);
  assert.equal(later.cash, atAudit.cash - 100);
  close(later.lot.risks.qtime_oxide, 0.028, 'no wait, no extra oxide');
});

test('addRisk refuses a negative amount; toolHealth with a room works between rooms', () => {
  const state = handCheckRun();
  assert.throws(() => applyEffect(state, { op: 'addRisk', pattern: 'particles', amount: -0.1 }), /0 or more/);
  const worn = { ...state, tools: { ...state.tools, clean: { ...state.tools.clean, health: 70 } } };
  assert.equal(applyEffect(worn, { op: 'toolHealth', room: 'clean', delta: 15 }).tools.clean.health, 85);
  assert.throws(() => applyEffect(state, { op: 'toolHealth', delta: 15 }), /not in a room/);
});

// Hand check (tasks/todo.md, M3 item 2e; changed by David on review, 25 Oct
// 2026, from an rr_drift risk to a step on the CMP chart): scatter off,
// drift off, seed 123456. "Switch now" at the event after step 2: cash
// +150, and the CMP tool goes 100 → 60, a 2σ shift. rr_drift is even and
// realized only at CMP, so final yield = the idle run × 0.977312 (M3 2b).
test('hand check: switching slurry costs the lot × 0.977312 and pays 150', () => {
  const idle = playIdle(handCheckRun());
  const switched = playIdle(chooseEventOption(openEvent(handCheckRun()), SWITCH_NOW));
  close(lotYield(idle.lot), 0.701678, `the idle run (seed ${SEED})`);
  close(lotYield(switched.lot) / lotYield(idle.lot), 0.977312, `yield ratio (seed ${SEED})`);
  assert.equal(switched.cash, idle.cash + 150, `cash (seed ${SEED})`);
});

test('an event is only drawn if it still matters: none after CMP, a quiet shift', () => {
  const state = handCheckRun();
  assert.equal(drawEvent(state, 7), null, 'after CMP only metrology is left');
  // After plating (corridor 6) only CMP and metrology are ahead: the supplier
  // change still matters (CMP), and so does the hot lot (CMP realizes
  // particles), but not the audit (no wet clean ahead).
  for (let seed = SEED; seed < SEED + 40; seed++) {
    assert.notEqual(drawEvent({ ...createRun({ seed }), eventsSeen: [] }, 6), 'audit', `seed ${seed}`);
  }
});
