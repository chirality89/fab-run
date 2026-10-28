// skip.test.js — a room with nothing to play is run for the player (P2 of
// tasks/plan-winnable.md), and a greyed-out card says why.
// No yield numbers here, so nothing to hand-compute: these check yes/no facts.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createRun, enterStep, resolveStep, playCard, walkCorridor, nothingToPlay,
} from '../src/engine/run.js';
import { roomView, resultView } from '../src/ui/view.js';

const SEED = 123456;
const LITHO = 2;   // 0-based step index of litho on the cuLine route
const ETCH = 3;

// Runs a room doing nothing, then goes straight through the corridor after it.
function idleRoom(state) {
  const after = resolveStep(enterStep(state));
  return after.corridor === null ? after : walkCorridor(after, null);
}

// Idle through the rooms before `stepIndex`, then enter that room.
function enterRoomAt(stepIndex, deck) {
  let state = createRun({ seed: SEED, deck });
  while (state.stepIndex < stepIndex) state = idleRoom(state);
  return enterStep(state);
}

test('nothingToPlay: true with an empty deck, false while a card can be played, true once it is played', () => {
  assert.equal(nothingToPlay(enterRoomAt(ETCH, [])), true, `seed ${SEED}, empty deck`);
  const withCard = enterRoomAt(ETCH, ['timedOveretch']);
  assert.equal(nothingToPlay(withCard), false, `seed ${SEED}, timedOveretch in hand`);
  assert.equal(nothingToPlay(playCard(withCard, 'timedOveretch')), true, `seed ${SEED}, hand now empty`);
});

test('nothingToPlay: false outside a room', () => {
  const atTheDoor = createRun({ seed: SEED, deck: [] });
  assert.equal(nothingToPlay(atTheDoor), false);
});

test('resultView: a room run with nothing playable says so and carries the SPC chart', () => {
  const before = enterRoomAt(ETCH, []);
  const view = resultView(before, resolveStep(before));
  assert.match(view.skippedText, /straight through/, `seed ${SEED}`);
  assert.ok(view.spc, 'the SPC chart is shown on the result of a skipped room');
});

test('resultView: no skipped note when a card could have been played, or was', () => {
  const idle = enterRoomAt(ETCH, ['timedOveretch']);   // could play, chose not to
  assert.equal(resultView(idle, resolveStep(idle)).skippedText, null, `seed ${SEED}, card left in hand`);
  const played = playCard(idle, 'timedOveretch');      // played it, hand now empty
  assert.equal(resultView(played, resolveStep(played)).skippedText, null, `seed ${SEED}, card played`);
});

test('a greyed-out Strip and re-expose says what it needs, not just "condition not met"', () => {
  const inLitho = enterRoomAt(LITHO, ['reworkLitho']);
  const card = roomView(inLitho).hand.find(entry => entry.id === 'reworkLitho');
  assert.equal(card.playable, false);
  assert.match(card.reason, /litho step just before/, `seed ${SEED}`);
});

// "A real decision in every room" (M4.5, issue 3): with only the starter
// deck, every room on the Cu line deals at least one playable practice,
// except the rooms listed here, which run by themselves. If a content
// change empties a room, this test names it.
const ROOMS_THAT_RUN_THEMSELVES = ['metro'];   // metrology: measuring, no process choice

test('starter deck: every Cu-line room has a playable practice, except metrology, which runs by itself', () => {
  let state = createRun({ seed: SEED });
  let roomsChecked = 0;
  while (state.status === 'running') {
    if (state.corridor !== null) { state = walkCorridor(state, null); continue; }
    state = enterStep(state);
    const label = `seed ${SEED}, step ${state.stepIndex} (${state.room.id})`;
    if (ROOMS_THAT_RUN_THEMSELVES.includes(state.room.id)) {
      assert.equal(nothingToPlay(state), true, `${label}: expected to run by itself`);
    } else {
      assert.equal(nothingToPlay(state), false, `${label}: no starter practice can be played here`);
    }
    roomsChecked += 1;
    state = resolveStep(state);
  }
  assert.equal(roomsChecked, 9, 'the Cu line has 9 rooms');
});
