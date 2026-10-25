// balance.test.js — checks the tuning numbers in src/content/balance.js.
// Run with: npm test
//
// These tests don't judge whether the game is fun. They catch numbers that
// would break it: a missing room budget, a spec below the scrap line, a card
// that costs more time than its room ever gives.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ROOMS, PRACTICES } from '../src/content/content.js';
import {
  STARTING_CASH, HAND_SIZE, SCRAP_LINE, CUSTOMER_SPEC,
  SCATTER_STRENGTH, SHAPED_SCATTER_FRACTION, TIME_BUDGETS, SITE_GOOD_LINE,
} from '../src/content/balance.js';

test('every number is finite and in range', () => {
  assert.ok(Number.isFinite(STARTING_CASH) && STARTING_CASH > 0);
  assert.ok(Number.isInteger(HAND_SIZE) && HAND_SIZE > 0);
  assert.ok(Number.isFinite(SCATTER_STRENGTH) && SCATTER_STRENGTH >= 0);
  assert.ok(SHAPED_SCATTER_FRACTION >= 0 && SHAPED_SCATTER_FRACTION <= 1);
});

test('scrap line < customer spec < 1', () => {
  assert.ok(SCRAP_LINE > 0 && SCRAP_LINE < CUSTOMER_SPEC && CUSTOMER_SPEC < 1);
});

test('site good line sits between the customer spec and 1', () => {
  assert.ok(CUSTOMER_SPEC < SITE_GOOD_LINE && SITE_GOOD_LINE < 1);
});

test('every room has a time budget, and only real rooms do', () => {
  assert.deepEqual(Object.keys(TIME_BUDGETS).sort(), Object.keys(ROOMS).sort());
  for (const [room, minutes] of Object.entries(TIME_BUDGETS)) {
    assert.ok(Number.isFinite(minutes) && minutes > 0, `${room}: ${minutes}`);
  }
});

test('every practice fits inside its room budget (no card is unplayable)', () => {
  for (const card of PRACTICES) {
    const time = card.cost.time ?? 0;
    assert.ok(time <= TIME_BUDGETS[card.room], `${card.id}: ${time} min > ${card.room} budget ${TIME_BUDGETS[card.room]}`);
  }
});
