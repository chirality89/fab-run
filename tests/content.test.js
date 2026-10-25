// content.test.js — checks that the content tables hang together.
// Run with: npm test
//
// These tests don't judge balance or physics. They catch broken links:
// an unlock pointing at a failure mode that doesn't exist, a typo in a
// pattern name, a card that requires equipment nobody can get.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ROOMS, PATTERNS, FAILURE_MODES,
  PRACTICES, EQUIPMENT, MATERIALS, CONSUMABLES, STARTER_IDS,
} from '../src/content/content.js';

const ALL_ITEMS = [...PRACTICES, ...EQUIPMENT, ...MATERIALS, ...CONSUMABLES];
const ITEM_IDS = new Set(ALL_ITEMS.map(item => item.id));
const FAILURE_IDS = new Set(FAILURE_MODES.map(fm => fm.id));

// The effect operations the engine will support (CLAUDE.md §6).
const KNOWN_OPS = new Set([
  'defectMult', 'timeCost', 'cashCost', 'setFlag',
  'reveal', 'toolHealth', 'enables', 'decayPerUse', 'addRisk',
]);

test('every id is unique', () => {
  const ids = [...ALL_ITEMS.map(i => i.id), ...FAILURE_MODES.map(f => f.id)];
  assert.equal(new Set(ids).size, ids.length);
});

test('every item has a name, a tradeoff and a physics note', () => {
  for (const item of ALL_ITEMS) {
    assert.ok(item.name, `${item.id} has no name`);
    assert.ok(item.tradeoff, `${item.id} has no tradeoff`);
    assert.ok(item.physicsNote, `${item.id} has no physicsNote`);
  }
});

test('every room an item names exists', () => {
  for (const item of ALL_ITEMS) {
    if (item.room) assert.ok(ROOMS[item.room], `${item.id} names unknown room ${item.room}`);
  }
});

test('every effect uses a known operation and a known pattern', () => {
  for (const item of ALL_ITEMS) {
    for (const effect of item.effects) {
      assert.ok(KNOWN_OPS.has(effect.op), `${item.id} uses unknown op ${effect.op}`);
      if (effect.pattern) {
        assert.ok(PATTERNS[effect.pattern], `${item.id} uses unknown pattern ${effect.pattern}`);
      }
      if (effect.op === 'enables') {
        assert.ok(ITEM_IDS.has(effect.id), `${item.id} enables unknown item ${effect.id}`);
      }
    }
  }
});

test('every required piece of equipment exists', () => {
  for (const item of ALL_ITEMS) {
    const needs = item.when?.equipment;
    if (needs) assert.ok(ITEM_IDS.has(needs), `${item.id} requires unknown equipment ${needs}`);
  }
});

test('unlocks point both ways', () => {
  for (const item of ALL_ITEMS) {
    if (item.unlockedBy === null) continue;
    assert.ok(FAILURE_IDS.has(item.unlockedBy), `${item.id} unlocked by unknown ${item.unlockedBy}`);
    const fm = FAILURE_MODES.find(f => f.id === item.unlockedBy);
    assert.ok(fm.unlocks.includes(item.id), `${fm.id} does not list ${item.id} in its unlocks`);
  }
  for (const fm of FAILURE_MODES) {
    assert.ok(PATTERNS[fm.pattern], `${fm.id} uses unknown pattern ${fm.pattern}`);
    for (const id of fm.unlocks) assert.ok(ITEM_IDS.has(id), `${fm.id} unlocks unknown item ${id}`);
  }
});

test('the starter pool is not empty', () => {
  assert.ok(STARTER_IDS.length > 0);
});

// DOE versions (M3 item 2d): only these fields may change in an upgrade.
const UPGRADE_FIELDS = new Set(['name', 'cost', 'effects', 'tradeoff', 'physicsNote']);

test('every practice has a DOE version that keeps a tradeoff and changes something', () => {
  for (const card of PRACTICES) {
    const upgrade = card.upgrade;
    assert.ok(upgrade, `${card.id} has no DOE upgrade`);
    for (const field of Object.keys(upgrade)) assert.ok(UPGRADE_FIELDS.has(field), `${card.id} upgrade changes ${field}`);
    assert.ok(upgrade.name && upgrade.name !== card.name, `${card.id} upgrade needs its own name`);
    assert.ok(upgrade.tradeoff && upgrade.physicsNote, `${card.id} upgrade needs a tradeoff and a physics note`);
    assert.ok(upgrade.cost || upgrade.effects, `${card.id} upgrade changes neither cost nor effects`);
    for (const effect of upgrade.effects ?? []) {
      assert.ok(KNOWN_OPS.has(effect.op), `${card.id} upgrade uses unknown op ${effect.op}`);
      if (effect.pattern) assert.ok(PATTERNS[effect.pattern], `${card.id} upgrade uses unknown pattern ${effect.pattern}`);
    }
  }
});

test('a DOE version keeps every cost field and every flag or enables of its card', () => {
  for (const card of PRACTICES) {
    const upgrade = card.upgrade;
    if (upgrade.cost) {
      for (const field of Object.keys(card.cost)) {
        assert.ok(field in upgrade.cost, `${card.id} upgrade drops cost.${field} (the whole cost is replaced)`);
      }
    }
    if (upgrade.effects) {
      for (const effect of card.effects.filter(e => e.op === 'setFlag' || e.op === 'enables')) {
        const kept = upgrade.effects.some(e => e.op === effect.op && (e.flag ?? e.id) === (effect.flag ?? effect.id));
        assert.ok(kept, `${card.id} upgrade drops ${effect.op} ${effect.flag ?? effect.id}`);
      }
      assert.ok(!upgrade.effects.some(e => e.op === 'enables'), `${card.id} upgrade adds an enables (run.js GATED_CARDS reads base cards only)`);
    }
  }
});
