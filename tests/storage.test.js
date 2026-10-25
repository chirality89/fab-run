// storage.test.js — checks the save and resume in src/ui/storage.js.
// The save is the seed plus the list of actions; resuming plays them again.
// These tests use a pretend storage, so they run in Node with no browser.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, legalCards } from '../src/engine/run.js';
import { whyCannotBuy } from '../src/engine/shop.js';
import {
  SAVE_KEY, SAVE_VERSION, readJson, writeJson, saveRun, loadRun, clearRun, applyAction, replayRun,
} from '../src/ui/storage.js';

const SEED = 123456;   // its corridor after step 2 offers procurement (tasks/todo.md)

// A pretend localStorage: the same three methods, kept in a Map.
function fakeStorage() {
  const items = new Map();
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, text) => { items.set(key, String(text)); },
    removeItem: (key) => { items.delete(key); },
  };
}

// A storage that refuses everything, like a blocked browser storage.
function blockedStorage() {
  const refuse = () => { throw new Error('storage is blocked'); };
  return { getItem: refuse, setItem: refuse, removeItem: refuse };
}

// A player that records every action it takes, the way main.js will.
function recordingPlayer(seed) {
  const player = { state: createRun({ seed }), actions: [] };
  player.act = (...action) => {
    player.state = applyAction(player.state, action);
    player.actions.push(action);
  };
  return player;
}

// One room: enter (unless already in it), play the first legal card (if
// any), run.
function playRoom(player) {
  if (player.state.room === null) player.act('enter');
  const [card] = legalCards(player.state);
  if (card) player.act('play', card);
  player.act('run');
}

// After a room: buy the first affordable item at a procurement stop if one
// is offered, otherwise go straight on.
function walkOn(player) {
  const offers = player.state.map[player.state.corridor].offers;
  if (!offers.includes('procurement')) {
    player.act('walk', null);
    return;
  }
  player.act('walk', 'procurement');
  const affordable = player.state.shop.stock.filter(id => whyCannotBuy(player.state, id) === null);
  const item = affordable[0];
  if (item) player.act('buy', item);
}

// Plays rooms and corridors until the run ends.
function finish(player) {
  while (player.state.status === 'running') {
    if (player.state.corridor !== null) walkOn(player);
    playRoom(player);
  }
}

// Saves the player's actions, loads them back and replays them from a
// fresh run of the same seed.
function saveAndResume(player) {
  const storage = fakeStorage();
  assert.equal(saveRun(player.state.seed, player.actions, storage), true, `save failed (seed ${SEED})`);
  const save = loadRun(storage);
  return replayRun(createRun({ seed: save.seed }), save.actions);
}

test('resuming mid-run gives exactly the same state, and the same ending', () => {
  const live = recordingPlayer(SEED);
  playRoom(live);
  walkOn(live);
  playRoom(live);
  walkOn(live);            // seed 123456: procurement here, with a purchase
  playRoom(live);
  const actionNames = live.actions.map(action => action[0]);
  assert.ok(actionNames.includes('buy'), `no purchase in the first half (seed ${SEED})`);

  const resumedPlayer = recordingPlayer(SEED);
  resumedPlayer.state = saveAndResume(live);
  assert.deepEqual(resumedPlayer.state, live.state, `resumed state differs (seed ${SEED})`);

  // Finish both the same way, then compare the endings.
  finish(live);
  finish(resumedPlayer);
  for (const field of ['status', 'cash', 'cycleTime', 'minutesUsed', 'rngState']) {
    assert.equal(resumedPlayer.state[field], live.state[field], `${field} differs (seed ${SEED})`);
  }
  assert.deepEqual(resumedPlayer.state.lot, live.state.lot, `lot differs (seed ${SEED})`);
});

test('replay lands on every kind of spot: room with a hand, open shop, corridor, end of run', () => {
  const player = recordingPlayer(SEED);
  function check(label) {
    assert.deepEqual(saveAndResume(player), player.state, `${label}: resumed state differs (seed ${SEED})`);
  }

  check('at the door, before step 1');
  player.act('enter');
  check('in a room');
  player.act('run');
  check('in a corridor');
  player.act('walk', null);
  playRoom(player);
  player.act('walk', 'procurement');   // seed 123456 offers it after step 2
  assert.notEqual(player.state.shop, null);
  check('with the shop open');
  player.act('enter');                  // step 3, litho: the first room that deals cards
  assert.ok(player.state.hand.length > 0, `litho dealt no cards (seed ${SEED})`);
  check('in a room with a hand');
  finish(player);
  assert.notEqual(player.state.status, 'running');
  check(`at the end (${player.state.status})`);
});

test('a bad action list replays as null, never a half-played state', () => {
  const start = createRun({ seed: SEED });
  assert.equal(replayRun(start, [['jump']]), null, 'unknown action');
  assert.equal(replayRun(start, [['enter'], ['play', 'notACard']]), null, 'card not in hand');
  assert.equal(replayRun(start, [['enter'], ['run'], ['walk', 'nowhere']]), null, 'stop not offered');
  assert.equal(replayRun(start, [['run']]), null, 'run before entering a room');
  assert.equal(replayRun(start, ['enter']), null, 'action that is not a list');
  assert.equal(replayRun(start, [['toString']]), null, 'a built-in name is not an action');
});

test('blocked storage: saving says no, loading finds nothing, nothing throws', () => {
  const storage = blockedStorage();
  assert.equal(saveRun(SEED, [['enter']], storage), false);
  assert.equal(loadRun(storage), null);
  assert.equal(clearRun(storage), false);
  assert.equal(readJson('anything', storage), null);
  assert.equal(writeJson('anything', 1, storage), false);
});

// Relies on Node 22 having no localStorage (globalThis.localStorage is
// undefined here). The first assert checks that, so a newer Node that has
// one fails loudly instead of quietly testing something else.
test('no storage at all (Node has no localStorage): the defaults do not throw', () => {
  assert.equal(globalThis.localStorage, undefined, 'this Node has a localStorage; give the test a stub');
  assert.equal(saveRun(SEED, []), false);
  assert.equal(loadRun(), null);
  assert.equal(clearRun(), false);
});

test('junk in the save is ignored', () => {
  const junk = [
    'not json {',
    JSON.stringify(null),
    JSON.stringify(42),
    JSON.stringify({ version: 0, seed: SEED, actions: [] }),
    JSON.stringify({ version: SAVE_VERSION + 1, seed: SEED, actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, seed: -1, actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, seed: 1.5, actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, seed: SEED, actions: 'enter' }),
  ];
  for (const text of junk) {
    const storage = fakeStorage();
    storage.setItem(SAVE_KEY, text);
    assert.equal(loadRun(storage), null, `should ignore: ${text}`);
  }
});

test('clearRun removes the save, and the run key leaves other keys alone', () => {
  const storage = fakeStorage();
  const NOTEBOOK_KEY = 'fabrun.notebook.v1';   // stands in for the M4 notebook
  writeJson(NOTEBOOK_KEY, { entries: ['keyholeVoid'] }, storage);

  saveRun(SEED, [['enter']], storage);
  assert.deepEqual(loadRun(storage), { seed: SEED, actions: [['enter']] });
  assert.equal(clearRun(storage), true);
  assert.equal(loadRun(storage), null);
  assert.deepEqual(readJson(NOTEBOOK_KEY, storage), { entries: ['keyholeVoid'] });
});
