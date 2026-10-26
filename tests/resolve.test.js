// resolve.test.js — checks the effect operations in src/engine/resolve.js.
// Expected values are hand-computed (tasks/todo.md, M1 item 3). Never edit
// one to make a test pass; ask David.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS, PRACTICES, EQUIPMENT, MATERIALS, CONSUMABLES } from '../src/content/content.js';
import { createLot } from '../src/engine/lot.js';
import { conditionMet, applyEffect, applyEffects } from '../src/engine/resolve.js';

const TOLERANCE = 1e-9;
const close = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < TOLERANCE, `${label}: got ${actual}, expected ${expected}`);

const ITEM = { id: 'testItem', effects: [] };   // a stand-in source for single effects

// A small test state. `changes` overrides any top-level field.
function makeState(changes = {}) {
  return {
    lot: createLot(),
    cash: 1000,
    room: { id: 'etch', timeLeft: 30, revealed: [] },
    tools: { etch: { health: 80 } },
    equipment: [],
    slots: {},
    enabled: [],
    lotTraits: [],
    ...changes,
  };
}

// A state whose lot already carries the given risks.
const withRisks = (risks, changes = {}) =>
  makeState({ lot: { ...createLot(), risks }, ...changes });

const findItem = (list, id) => list.find(item => item.id === id);

// --- one test per operation -------------------------------------------------

test('defectMult scales the risk; unknown pattern throws', () => {
  const after = applyEffect(withRisks({ residue: 0.2 }), { op: 'defectMult', pattern: 'residue', mult: 0.3 }, ITEM);
  close(after.lot.risks.residue, 0.06, 'residue');
  assert.throws(() => applyEffect(makeState(), { op: 'defectMult', pattern: 'nope', mult: 2 }, ITEM), /nope/);
});

test('timeCost takes minutes, gives them back when negative, never below 0', () => {
  assert.equal(applyEffect(makeState(), { op: 'timeCost', delta: 10 }, ITEM).room.timeLeft, 20);
  assert.equal(applyEffect(makeState(), { op: 'timeCost', delta: -5 }, ITEM).room.timeLeft, 35);
  assert.equal(applyEffect(makeState(), { op: 'timeCost', delta: 50 }, ITEM).room.timeLeft, 0);
});

test('cashCost spends cash and may go below 0', () => {
  assert.equal(applyEffect(makeState(), { op: 'cashCost', delta: 20 }, ITEM).cash, 980);
  assert.equal(applyEffect(makeState({ cash: 10 }), { op: 'cashCost', delta: 30 }, ITEM).cash, -20);
});

test('setFlag adds the flag once', () => {
  const once = applyEffect(makeState(), { op: 'setFlag', flag: 'etch_stop' }, ITEM);
  const twice = applyEffect(once, { op: 'setFlag', flag: 'etch_stop' }, ITEM);
  assert.deepEqual(twice.lot.flags, ['etch_stop']);
});

test('reveal adds to room.revealed once; "none" does nothing', () => {
  const once = applyEffect(makeState(), { op: 'reveal', what: 'allSites' }, ITEM);
  const twice = applyEffect(once, { op: 'reveal', what: 'allSites' }, ITEM);
  assert.deepEqual(twice.room.revealed, ['allSites']);
  const state = makeState();
  assert.equal(applyEffect(state, { op: 'reveal', what: 'none' }, ITEM), state);
});

test('toolHealth changes the current room tool, kept within 0..100', () => {
  assert.equal(applyEffect(makeState(), { op: 'toolHealth', delta: -5 }, ITEM).tools.etch.health, 75);
  assert.equal(applyEffect(makeState(), { op: 'toolHealth', delta: 100 }, ITEM).tools.etch.health, 100);
  assert.equal(applyEffect(makeState(), { op: 'toolHealth', delta: -200 }, ITEM).tools.etch.health, 0);
});

test('enables adds the card id once', () => {
  const once = applyEffect(makeState(), { op: 'enables', id: 'endpointEtch' }, ITEM);
  const twice = applyEffect(once, { op: 'enables', id: 'endpointEtch' }, ITEM);
  assert.deepEqual(twice.enabled, ['endpointEtch']);
});

test('decayPerUse scales by the slot decay, then grows it; no slot throws', () => {
  const slots = { bath: { id: 'testItem', shelfLife: 5, decay: 2 } };
  const after = applyEffect(withRisks({ void: 0.1 }, { slots }), { op: 'decayPerUse', target: 'void', mult: 1.5 }, ITEM);
  close(after.lot.risks.void, 0.2, 'void');
  close(after.slots.bath.decay, 3, 'decay');
  assert.throws(() => applyEffect(makeState(), { op: 'decayPerUse', target: 'void', mult: 1.5 }, ITEM), /testItem/);
});

// --- when conditions --------------------------------------------------------

test('when: each of the four kinds, true and false', () => {
  const state = makeState({
    lot: { ...createLot(), flags: ['etch_stop'] },
    equipment: ['oesEndpoint'],
    slots: { resist: { id: 'resistIline', shelfLife: 8, decay: 1 } },
    lotTraits: ['tightCD'],
  });
  assert.equal(conditionMet(state, { flag: 'etch_stop' }), true);
  assert.equal(conditionMet(state, { flag: 'other' }), false);
  assert.equal(conditionMet(state, { equipment: 'oesEndpoint' }), true);
  assert.equal(conditionMet(state, { equipment: 'rta' }), false);
  assert.equal(conditionMet(state, { material: 'resistIline' }), true);
  assert.equal(conditionMet(state, { material: 'resistCAR' }), false);
  assert.equal(conditionMet(state, { lot: 'tightCD' }), true);
  assert.equal(conditionMet(state, { lot: 'deepEtch' }), false);
  assert.equal(conditionMet(state, undefined), true);
  assert.equal(conditionMet(state, { flag: 'etch_stop', lot: 'tightCD' }), true);
  assert.equal(conditionMet(state, { flag: 'etch_stop', lot: 'deepEtch' }), false);
});

test('timed over-etch: underlayer 0.1 → 0.15 without etch stop, 0.105 with it (×1.5 × 0.7)', () => {
  const card = findItem(PRACTICES, 'timedOveretch');
  const risks = { underlayer_attack: 0.1, residue: 0.1 };
  const plain = applyEffects(withRisks(risks), card);
  close(plain.lot.risks.underlayer_attack, 0.15, 'no etch stop');
  close(plain.lot.risks.residue, 0.03, 'residue, no etch stop');
  const stopped = applyEffects(makeState({ lot: { ...createLot(), risks, flags: ['etch_stop'] } }), card);
  close(stopped.lot.risks.underlayer_attack, 0.105, 'with etch stop');
  close(stopped.lot.risks.residue, 0.03, 'residue, with etch stop');
});

test('additive bath on narrow features: 0.1, 0.115, 0.13225 over three uses', () => {
  const bath = findItem(MATERIALS, 'additiveBath');
  let state = makeState({
    room: { id: 'plate', timeLeft: 30, revealed: [] },
    slots: { bath: { id: 'additiveBath', shelfLife: 10, decay: 1 } },
    lotTraits: ['narrowFeatures'],
  });
  const expected = [[0.1, 1], [0.115, 1.15], [0.13225, 1.3225]];
  for (const [voidRisk, decayBefore] of expected) {
    close(state.slots.bath.decay, decayBefore, 'decay before use');
    state = applyEffects({ ...state, lot: { ...state.lot, risks: { void: 0.4 } } }, bath);
    close(state.lot.risks.void, voidRisk, 'void after use');
  }
  close(state.slots.bath.decay, 1.520875, 'decay after 3 uses');
});

// --- errors and purity ------------------------------------------------------

test('unknown op and unknown when key throw, naming them', () => {
  assert.throws(() => applyEffect(makeState(), { op: 'heal', delta: 5 }, ITEM), /heal/);
  assert.throws(() => conditionMet(makeState(), { weather: 'rain' }), /weather/);
});

test('nothing is changed in place', () => {
  const tools = Object.fromEntries(Object.keys(ROOMS).map(id => [id, { health: 50 }]));
  const state = makeState({
    lot: { ...createLot(), risks: { underlayer_attack: 0.1, void: 0.4 }, flags: [] },
    tools,
    slots: { bath: { id: 'additiveBath', shelfLife: 10, decay: 1 } },
    lotTraits: ['narrowFeatures'],
  });
  const before = structuredClone(state);
  for (const item of [...PRACTICES, ...EQUIPMENT, ...MATERIALS, ...CONSUMABLES]) {
    applyEffects({ ...state, room: { ...state.room, id: item.room ?? 'etch' } }, item);
  }
  assert.deepEqual(state, before);
});

// True if any number anywhere inside `value` is NaN or ±Infinity.
function hasBadNumber(value) {
  if (typeof value === 'number') return !Number.isFinite(value);
  if (value && typeof value === 'object') return Object.values(value).some(hasBadNumber);
  return false;
}

test('applying every item in content.js leaves no NaN or Infinity', () => {
  const tools = Object.fromEntries(Object.keys(ROOMS).map(id => [id, { health: 50 }]));
  const slots = Object.fromEntries(MATERIALS.map(m => [m.id, { id: m.id, shelfLife: m.shelfLife ?? 1, decay: 1 }]));
  const lotTraits = ['tightCD', 'deepEtch', 'narrowFeatures'];
  const fresh = makeState({ tools, slots, lotTraits });
  const risks = { underlayer_attack: 0.1, residue: 0.1, void: 0.4, cd_error: 0.2 };
  let state = { ...fresh, lot: { ...fresh.lot, risks } };
  for (const item of [...PRACTICES, ...EQUIPMENT, ...MATERIALS, ...CONSUMABLES]) {
    const roomId = item.room ?? 'etch';   // consumables have no room; use etch
    state = applyEffects({ ...state, room: { ...state.room, id: roomId } }, item);
  }
  assert.equal(hasBadNumber(state), false, JSON.stringify(state));
});

test('a typo in content (missing or NaN number) is refused, not stored as NaN', () => {
  const state = makeState({ tools: { etch: { health: 50 } } });
  assert.throws(() => applyEffect(state, { op: 'timeCost' }));
  assert.throws(() => applyEffect(state, { op: 'cashCost', delta: NaN }));
  assert.throws(() => applyEffect(state, { op: 'toolHealth', delta: undefined }));
});

test('decayPerUse refuses a mult below 1 and a missing source', () => {
  const slots = { bath: { id: 'additiveBath', decay: 1 } };
  const state = makeState({ slots });
  const bath = { id: 'additiveBath' };
  assert.throws(() => applyEffect(state, { op: 'decayPerUse', target: 'void', mult: 0.9 }, bath));
  assert.throws(() => applyEffect(state, { op: 'decayPerUse', target: 'void', mult: 1.15 }));
});
