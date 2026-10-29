// storage.test.js — checks the save and resume in src/ui/storage.js.
// The save is the seed plus the list of actions; resuming plays them again.
// These tests use a pretend storage, so they run in Node with no browser.
// Run with: npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRun, legalCards, fullPool, runDeck } from '../src/engine/run.js';
import { PRACTICES } from '../src/content/content.js';
import { LOT_TYPES } from '../src/content/lotTypes.js';
import { whyCannotBuy } from '../src/engine/shop.js';
import { whyCannotPm, whyCannotDoe } from '../src/engine/run.js';
import {
  SAVE_KEY, SAVE_VERSION, readJson, writeJson, saveRun, loadRun, clearRun, applyAction, replayRun,
  NOTEBOOK_KEY, loadNotebook, saveNotebook,
} from '../src/ui/storage.js';
import { diagnosisFor, unlockedIds } from '../src/engine/notebook.js';
import { FULL_NOTEBOOK_UNLOCKS } from './shopSeed.js';

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
// `deck` is the starter deck unless a test passes another (fullPool()).
// `unlocked` is what the run began with (M4 item 4); none by default.
function recordingPlayer(seed, deck = undefined, unlocked = []) {
  const player = { state: createRun({ seed, deck, unlocked }), deck, actions: [] };
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

// How many times the player has taken this kind of action so far.
function countActions(player, name) {
  return player.actions.filter(action => action[0] === name).length;
}

// At an open PM/DOE stop: PM a tool and DOE a practice by turns (PM first),
// so a run uses both. Takes whichever is possible if only one is.
function usePmStop(player) {
  const pm = player.state.pm;
  const room = pm.choices.find(roomId => whyCannotPm(player.state, roomId) === null);
  const card = pm.doeOffers.find(cardId => whyCannotDoe(player.state, cardId) === null);
  const doeTurn = countActions(player, 'pm') > countActions(player, 'doe');
  if (card && (doeTurn || !room)) player.act('doe', card);
  else if (room) player.act('pm', room);
}

// After a room: take a side stop whenever one is offered and use it, so a
// run tries every kind of action. Events take their first option.
// Which kind it prefers turns with the corridor's number (PM, then
// procurement, then event), so a run uses all three: since M4.5 item 5 every
// corridor offers PM or an event, so a fixed "PM first" would never shop.
function takeEveryStop(player) {
  const offers = player.state.map[player.state.corridor].offers;
  const kinds = ['pm', 'procurement', 'event'];
  const first = player.state.corridor % kinds.length;
  const kind = [...kinds.slice(first), ...kinds.slice(0, first)].find(name => offers.includes(name));
  if (kind === 'pm') {
    player.act('walk', 'pm');
    usePmStop(player);
  } else if (kind === 'event') {
    player.act('walk', 'event');
    if (player.state.event !== null) player.act('choose', 0);
  } else {
    walkOn(player);
  }
}

// Saves the player's actions, loads them back and replays them from a
// fresh run of the same seed.
function saveAndResume(player) {
  const storage = fakeStorage();
  const run = { seed: player.state.seed, unlocked: player.state.unlocked, actions: player.actions };
  assert.equal(saveRun(run, storage), true, `save failed (seed ${SEED})`);
  const save = loadRun(storage);
  return replayRun(createRun({ seed: save.seed, deck: player.deck, unlocked: save.unlocked }), save.actions);
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

// The first seed from SEED up whose run, taking every stop, uses every
// kind of action that happens before the end.
function seedUsingEveryAction() {
  const wanted = ['enter', 'play', 'run', 'walk', 'buy', 'pm', 'doe', 'choose'];
  for (let seed = SEED; seed < SEED + 200; seed++) {
    const player = recordingPlayer(seed);
    while (player.state.status === 'running') {
      if (player.state.corridor !== null) takeEveryStop(player);
      playRoom(player);
    }
    if (wanted.every(name => countActions(player, name) > 0)) return seed;
  }
  throw new Error(`no seed from ${SEED} uses every action`);
}

test('every kind of action replays: saved after any action, the run resumes exactly there', () => {
  const seed = seedUsingEveryAction();
  const player = recordingPlayer(seed);
  const act = player.act;
  player.act = (...action) => {
    act(...action);
    assert.deepEqual(saveAndResume(player), player.state, `after ${action.join(' ')} (seed ${seed})`);
  };
  while (player.state.status === 'running') {
    if (player.state.corridor !== null) takeEveryStop(player);
    playRoom(player);
  }
});

// Plays a whole run with every practice in the deck: in each room it plays
// legal cards until none is left, and takes every side stop.
function playFullPoolRun(seed) {
  // Everything unlocked, so the shop can sell every item too.
  const player = recordingPlayer(seed, fullPool(), FULL_NOTEBOOK_UNLOCKS);
  while (player.state.status === 'running') {
    if (player.state.corridor !== null) takeEveryStop(player);
    if (player.state.room === null) player.act('enter');
    let legal = legalCards(player.state);
    while (legal.length > 0) {
      player.act('play', legal[0]);
      legal = legalCards(player.state);
    }
    player.act('run');
  }
  return player;
}

test('every practice the Cu line can play, and DOE versions, replay from a save', () => {
  const played = new Set();
  const upgraded = new Set();
  for (let seed = SEED; seed < SEED + 80; seed++) {
    const player = playFullPoolRun(seed);
    assert.deepEqual(saveAndResume(player), player.state, `full deck, end of run (seed ${seed})`);
    for (const [name, value] of player.actions) {
      if (name === 'play') played.add(value);
      if (name === 'doe') upgraded.add(value);
    }
  }
  // Every practice a Cu-line run CAN play was played at least once over
  // these seeds, and some as DOE versions, so the replay covered them.
  // Left out: cards for rooms the Cu line never enters (implant, diffusion),
  // cards that need a lot trait the Cu line doesn't have (siliconFrontEnd),
  // and cards whose trait nothing sets yet (lastStepWasLitho, run.test.js).
  const cuLine = LOT_TYPES.cuLine;
  const routeRooms = new Set(cuLine.route.map(step => step.room));
  const canPlayOnCuLine = (card) =>
    routeRooms.has(card.room) && (!card.when?.lot || cuLine.traits.includes(card.when.lot));
  const neverPlayed = PRACTICES.filter(canPlayOnCuLine).map(card => card.id).filter(id => !played.has(id));
  assert.deepEqual(neverPlayed, [], `never played in seeds ${SEED}–${SEED + 79}`);
  assert.ok(upgraded.size > 0, 'no DOE in these seeds');
  console.log(`full-deck replay: ${played.size} practices played, DOE on ${[...upgraded].join(', ')}`);
});

test('scrapping the lot replays too', () => {
  const player = recordingPlayer(SEED);
  playRoom(player);           // step 1, then the lot stands in a corridor
  player.act('scrap');
  assert.equal(player.state.status, 'scrapped');
  assert.deepEqual(saveAndResume(player), player.state, `after scrap (seed ${SEED})`);
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
  assert.equal(saveRun({ seed: SEED, unlocked: [], actions: [['enter']] }, storage), false);
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
  assert.equal(saveRun({ seed: SEED, unlocked: [], actions: [] }), false);
  assert.equal(loadRun(), null);
  assert.equal(clearRun(), false);
});

test('junk in the save is ignored', () => {
  const junk = [
    'not json {',
    JSON.stringify(null),
    JSON.stringify(42),
    JSON.stringify({ version: 0, seed: SEED, unlocked: [], actions: [] }),
    JSON.stringify({ version: 1, seed: SEED, actions: [] }),   // a save from before M4 item 4
    JSON.stringify({ version: SAVE_VERSION + 1, seed: SEED, unlocked: [], actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, unlocked: [], actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, seed: -1, unlocked: [], actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, seed: 1.5, unlocked: [], actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, seed: SEED, actions: [] }),   // no unlocked list
    JSON.stringify({ version: SAVE_VERSION, seed: SEED, unlocked: 'all', actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, seed: SEED, unlocked: [7], actions: [] }),
    JSON.stringify({ version: SAVE_VERSION, seed: SEED, unlocked: [], actions: 'enter' }),
  ];
  for (const text of junk) {
    const storage = fakeStorage();
    storage.setItem(SAVE_KEY, text);
    assert.equal(loadRun(storage), null, `should ignore: ${text}`);
  }
});

test('clearRun removes the save, and the run key leaves other keys alone', () => {
  const storage = fakeStorage();
  writeJson(NOTEBOOK_KEY, { entries: ['keyholeVoid'] }, storage);

  saveRun({ seed: SEED, unlocked: [], actions: [['enter']] }, storage);
  assert.deepEqual(loadRun(storage), { seed: SEED, unlocked: [], actions: [['enter']] });
  assert.equal(clearRun(storage), true);
  assert.equal(loadRun(storage), null);
  assert.deepEqual(readJson(NOTEBOOK_KEY, storage), { entries: ['keyholeVoid'] });
});

// --- the notebook (M4 item 2) --------------------------------------------

const KEYHOLE = { id: 'fm_keyhole', seed: 123456 };
const PARTICLES = { id: 'fm_particles', seed: 777 };
const notebookOf = (...entries) => ({ version: 1, entries });

test('notebook: save, then load gives the same entries', () => {
  const storage = fakeStorage();
  assert.deepEqual(loadNotebook(storage), notebookOf());   // nothing saved yet
  assert.equal(saveNotebook(notebookOf(KEYHOLE, PARTICLES), storage), true);
  assert.deepEqual(loadNotebook(storage), notebookOf(KEYHOLE, PARTICLES));
});

test('notebook: blocked storage loads empty, saving says no, nothing throws', () => {
  assert.deepEqual(loadNotebook(blockedStorage()), notebookOf());
  assert.equal(saveNotebook(notebookOf(KEYHOLE), blockedStorage()), false);
  assert.deepEqual(loadNotebook(undefined), notebookOf());   // Node has no localStorage
});

test('notebook: junk under the key loads as what is usable, never throws', () => {
  const storage = fakeStorage();
  for (const junk of ['not json {', '42', 'null', '"text"', '{"version":1,"entries":"x"}', '[]']) {
    storage.setItem(NOTEBOOK_KEY, junk);
    assert.deepEqual(loadNotebook(storage), notebookOf(), `junk: ${junk}`);
  }
  // Bad entries are dropped, a duplicate id keeps its first entry.
  writeJson(NOTEBOOK_KEY, { version: 1, entries: [
    KEYHOLE, null, 'fm_residue', { id: 7, seed: 1 }, { id: 'fm_residue' }, { id: '', seed: 1 },
    { id: 'fm_residue', seed: Infinity }, { id: 'fm_keyhole', seed: 999 }, PARTICLES,
  ] }, storage);
  assert.deepEqual(loadNotebook(storage), notebookOf(KEYHOLE, PARTICLES));
});

test('notebook: a run-save version bump and clearRun leave it untouched', () => {
  const storage = fakeStorage();
  saveRun({ seed: SEED, unlocked: [], actions: [['enter']] }, storage);
  saveNotebook(notebookOf(KEYHOLE), storage);
  const notebookText = storage.getItem(NOTEBOOK_KEY);

  // A newer build raised SAVE_VERSION: the old run save is now ignored...
  writeJson(SAVE_KEY, { version: SAVE_VERSION + 1, seed: SEED, actions: [['enter']] }, storage);
  assert.equal(loadRun(storage), null);
  // ...and the page clears it and starts fresh. The notebook stays, byte for byte.
  clearRun(storage);
  assert.equal(storage.getItem(NOTEBOOK_KEY), notebookText);
  assert.deepEqual(loadNotebook(storage), notebookOf(KEYHOLE));
});

test('notebook: an id no longer in the content is kept, and the diagnosis ignores it', () => {
  const storage = fakeStorage();
  const gone = { id: 'fm_renamed_long_ago', seed: 5 };
  saveNotebook(notebookOf(gone, KEYHOLE), storage);
  const notebook = loadNotebook(storage);
  assert.deepEqual(notebook, notebookOf(gone, KEYHOLE));
  saveNotebook(notebook, storage);
  assert.deepEqual(loadNotebook(storage), notebookOf(gone, KEYHOLE));

  // A lot played straight through (it has losses to diagnose): its diagnosis
  // is the same with or without the unknown id in the notebook.
  let state = createRun({ seed: SEED });
  while (state.status === 'running') {
    state = applyAction(applyAction(state, ['enter']), ['run']);
    if (state.status === 'running') state = applyAction(state, ['walk', null]);
  }
  const withoutIt = diagnosisFor(state, notebookOf());
  assert.ok(withoutIt.candidates.length > 0, `seed ${SEED} should have something to diagnose`);
  assert.deepEqual(diagnosisFor(state, notebookOf(gone)), withoutIt);
});

test('notebook: one saved by a newer version is left exactly as it was', () => {
  const storage = fakeStorage();
  const newer = JSON.stringify({ version: 2, pages: { fm_keyhole: { seed: 1 } } });
  storage.setItem(NOTEBOOK_KEY, newer);
  assert.deepEqual(loadNotebook(storage), notebookOf());
  assert.equal(saveNotebook(notebookOf(PARTICLES), storage), false);
  assert.equal(storage.getItem(NOTEBOOK_KEY), newer);
});

test('notebook: two open tabs each save an entry; both are kept', () => {
  const storage = fakeStorage();
  const tabA = loadNotebook(storage);
  const tabB = loadNotebook(storage);   // opened before tab A saved
  saveNotebook({ ...tabA, entries: [...tabA.entries, KEYHOLE] }, storage);
  saveNotebook({ ...tabB, entries: [...tabB.entries, PARTICLES] }, storage);
  assert.deepEqual(loadNotebook(storage), notebookOf(KEYHOLE, PARTICLES));
});

// --- the unlocked pool in the save (M4 item 4) -----------------------------

test('a resumed run uses the unlocked list saved with it, not the notebook as it is now', () => {
  const storage = fakeStorage();
  const unlocked = unlockedIds(notebookOf(KEYHOLE));
  const player = recordingPlayer(SEED, runDeck(unlocked), unlocked);
  playRoom(player);
  saveRun({ seed: SEED, unlocked: player.state.unlocked, actions: player.actions }, storage);
  // Meanwhile another tab diagnoses particles. The saved run doesn't change.
  saveNotebook(notebookOf(KEYHOLE, PARTICLES), storage);
  const save = loadRun(storage);
  assert.deepEqual(save.unlocked, unlocked);
  const resumed = replayRun(createRun({ seed: save.seed, deck: runDeck(save.unlocked), unlocked: save.unlocked }), save.actions);
  assert.deepEqual(resumed, player.state, `seed ${SEED}`);
});
