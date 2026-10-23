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
  'reveal', 'toolHealth', 'enables', 'decayPerUse',
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
