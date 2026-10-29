// render.js — draws the room and result screens from the display data made
// by view.js.
//
// No game logic here: every number and word comes from roomView() or
// resultView(). Buttons only call the functions main.js hands in. Text is
// always set with textContent (never innerHTML), so nothing in the data can
// turn into page code.

import { el, panel } from './dom.js';
import { drawSpc, drawSpcPicture } from './spcChart.js';

// el and panel live in dom.js; they are passed on from here so the other
// screen files can keep importing them from render.js.
export { el, panel };

// Calls `handler` when the button is clicked, tapped or pressed with Enter
// or Space, but ignores the second click of a double click. Playing a card
// redraws the screen at once, so without this the second click of a fast
// double tap would land on whatever slid into that spot (often Run etch).
// event.detail counts the clicks in a row: 1, then 2 for a double click
// (0 for a key press).
export function onSingleClick(button, handler) {
  button.type = 'button';
  button.addEventListener('click', event => {
    if (event.detail > 1) return;
    handler();
  });
}

// Top bar: the room name on its room color, the step, the seed, cash and
// the Words button (`words` is { onOpen }).
function drawHeader(view, words) {
  const header = el('header', `room-band room-${view.roomId}`);
  header.append(el('h1', 'room-name', view.roomName));
  header.append(el('p', 'room-step', `Step ${view.stepNumber} of ${view.stepCount} · ${view.stepLabel}`));
  const facts = el('p', 'room-facts');
  const seed = el('span', 'seed', `Seed ${view.seed}`);
  const cash = el('span', 'cash', `Cash ${view.cash}`);
  facts.append(seed, cash);
  header.append(facts);
  if (view.cashNoteText) header.append(el('p', 'room-step cash-note', view.cashNoteText));   // where cash just went
  header.append(headerButtons(null, words));
  return header;
}

// A mark on the yield bar (scrap line or spec), placed at its percent.
function barMark(percent, label, className) {
  const mark = el('div', `bar-mark ${className}`);
  mark.style.left = `${percent}%`;
  mark.append(el('span', 'bar-mark-label', label));
  return mark;
}

// Yield bar: always shows its number, with marks at the scrap line and spec.
function drawYield(view) {
  const box = panel('Line yield', 'yield-panel');
  box.append(el('p', 'yield-number', `${view.yieldPercent.toFixed(1)}%`));

  const bar = el('div', 'yield-bar');
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', `Yield ${view.yieldPercent}%, scrap line ${view.scrapLine}%, spec ${view.spec}%`);
  const fill = el('div', `yield-fill yield-${view.yieldBand}`);
  fill.style.width = `${view.yieldPercent}%`;
  bar.append(fill, barMark(view.scrapLine, `Scrap ${view.scrapLine}%`, 'mark-scrap'),
    barMark(view.spec, `Spec ${view.spec}%`, 'mark-spec'));
  box.append(bar);
  box.append(el('p', 'expected-loss', view.expectedLossText));
  if (view.carriedInText) box.append(el('p', 'carried-in', view.carriedInText));
  return box;
}

// Wafer map: 5 × 5 tiles, each with its band (color AND pattern) and percent.
function drawWaferMap(view) {
  const box = panel('Wafer map', 'map-panel');
  const grid = el('div', 'wafer-map');
  grid.setAttribute('role', 'list');
  view.sites.forEach((site, index) => {
    const tile = el('div', `site site-${site.band}`);
    tile.setAttribute('role', 'listitem');
    tile.setAttribute('aria-label', `Site ${index + 1}: ${site.percent}% good, ${site.band}`);
    tile.append(el('span', 'site-number', `${site.percent}`));
    grid.append(tile);
  });
  box.append(grid);
  box.append(el('p', 'map-key', view.mapKeyText));
  return box;
}

// A labelled meter (time left, tool health): text first, then a plain bar.
function meter(title, text, fraction, className) {
  const box = panel(title, className);
  box.append(el('p', 'meter-text', text));
  const bar = el('div', 'meter-bar');
  const fill = el('div', 'meter-fill');
  fill.style.width = `${Math.max(0, Math.min(1, fraction)) * 100}%`;
  bar.append(fill);
  box.append(bar);
  return box;
}

// Slots: the equipment and materials in this room, or "empty".
function drawSlots(view) {
  const box = panel('Slots', 'slots-panel');
  if (view.slots.length === 0) {
    box.append(el('p', 'slot-empty', 'empty'));
    return box;
  }
  const list = el('ul', 'slot-list');
  for (const item of view.slots) list.append(el('li', 'slot-item', `${item.name} (${item.kind})`));
  box.append(list);
  return box;
}

// The cost line on a card, e.g. "4 min" or "20 min · 150 cash".
function costText(card) {
  const parts = [`${card.minutes} min`];
  if (card.cash > 0) parts.push(`${card.cash} cash`);
  return parts.join(' · ');
}

// One card in the hand. A playable card is a button: tapping it calls
// actions.onPlay(cardId). An unplayable card is a plain box with its reason.
function drawCard(card, actions) {
  const node = card.playable
    ? el('button', 'card card-button')
    : el('div', 'card card-unplayable');
  if (card.playable) onSingleClick(node, () => actions.onPlay(card.id));
  const top = el('div', 'card-top');
  top.append(el('span', 'card-name', card.name), el('span', 'card-cost', costText(card)));
  node.append(top);
  if (card.doe) node.append(el('span', 'chip chip-doe', 'DOE'));   // upgraded at a DOE stop
  node.append(el('span', 'card-summary', card.summary));
  if (card.effectsText) node.append(el('span', 'card-effects', card.effectsText));   // what it does, in numbers
  if (card.pointsText) node.append(el('span', 'card-points', card.pointsText));      // what that does to this room
  if (!card.playable) node.append(el('span', 'card-reason', `Can't play: ${card.reason}`));
  return node;
}

// The button that ends the room: "Run etch".
function drawRunButton(view, actions) {
  const run = el('button', 'action-button run-button', `Run ${view.roomName.toLowerCase()}`);
  onSingleClick(run, actions.onRunRoom);
  return run;
}

// The hand, then the button that ends the room.
function drawHand(view, actions) {
  const box = panel('Hand', 'hand-panel');
  if (view.hand.length === 0) {
    box.append(el('p', 'slot-empty hand-empty', 'No practices left in your hand.'));
  } else {
    const list = el('ul', 'hand');
    list.setAttribute('role', 'list');   // some screen readers drop it when bullets are hidden
    for (const card of view.hand) {
      const item = el('li', 'hand-item');
      item.append(drawCard(card, actions));
      list.append(item);
    }
    box.append(list);
  }
  box.append(drawRunButton(view, actions));
  return box;
}

// Draws the whole room into the given container, replacing what was there.
// `actions` holds what the buttons call: onPlay(cardId), onRunRoom() and
// words ({ onOpen }, for the Words button).
export function renderRoom(container, view, actions) {
  const body = el('div', 'room-body');
  body.append(
    drawWaferMap(view),
    meter('Time budget', `${view.timeLeft} of ${view.budget} min left`, view.timeLeft / view.budget, 'time-panel'),
    drawSlots(view),
    drawSpc(view.spc),
    drawHand(view, actions),
  );
  container.replaceChildren(drawHeader(view, actions.words), drawYield(view), body);
}

// After a card is played, moves keyboard focus to the playable card now in
// the same place in the hand (`position`, counted from 0), or the nearest
// playable card after it, or else the Run button. That way a keyboard
// player doesn't lose their place when the screen redraws.
export function focusNextAction(container, position) {
  const items = [...container.querySelectorAll('.hand-item')];
  const later = items.slice(position).map(item => item.querySelector('.card-button'));
  const earlier = items.slice(0, position).reverse().map(item => item.querySelector('.card-button'));
  const card = [...later, ...earlier].find(button => button !== null);
  // `??` means: use the right-hand side if the left is missing (undefined).
  const target = card ?? container.querySelector('.run-button');
  target.focus();
}

// The yield before and after the room, with the bar showing "after".
function drawResultYield(view) {
  const box = panel('Line yield', 'yield-panel');
  box.append(el('p', 'yield-number', `${view.yieldBeforePercent.toFixed(1)}% → ${view.yieldAfterPercent.toFixed(1)}%`));
  const bar = el('div', 'yield-bar');
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', `Yield ${view.yieldAfterPercent}%, scrap line ${view.scrapLine}%, spec ${view.spec}%`);
  const fill = el('div', `yield-fill yield-${view.yieldBand}`);
  fill.style.width = `${view.yieldAfterPercent}%`;
  bar.append(fill, barMark(view.scrapLine, `Scrap ${view.scrapLine}%`, 'mark-scrap'),
    barMark(view.spec, `Spec ${view.spec}%`, 'mark-spec'));
  box.append(bar, el('p', 'expected-loss', view.lossText));
  if (view.driftText) box.append(el('p', 'drift-note', view.driftText));
  return box;
}

// A plain button that calls `onClick`.
export function actionButton(text, className, onClick) {
  const button = el('button', `action-button ${className}`, text);
  onSingleClick(button, onClick);
  return button;
}

// The row of page buttons in a header: Notebook ("Notebook (3)") when
// `notebook` ({ count, onOpen }) is given, then Words ({ onOpen }), which
// opens the Words page (wordsPage.js). The room header has Words only.
export function headerButtons(notebook, words) {
  const row = el('div', 'header-buttons');
  if (notebook) row.append(actionButton(`Notebook (${notebook.count})`, 'notebook-button secondary-button', notebook.onOpen));
  row.append(actionButton('Words', 'words-button secondary-button', words.onOpen));
  return row;
}

// The screen after a room is run: what it cost, the new wafer map, what
// happens next, and two ways to play again.
// `actions` holds onContinue() (shown only while the run goes on),
// onShip() (shown once it is over), onReplay() and onNewSeed().
export function renderResult(container, view, actions) {
  const outcome = panel('Result', 'result-panel');
  outcome.setAttribute('role', 'status');
  if (view.skippedText) outcome.append(el('p', 'skipped-text', view.skippedText));
  outcome.append(el('p', 'outcome-text', view.outcomeText));
  const buttons = el('div', 'result-buttons');
  // While the run goes on, Continue is the main button; once it is over,
  // the ship report is. Replay and New seed are always the plain ones.
  if (view.status === 'running') {
    buttons.append(actionButton('Continue to the corridor', 'continue-button', actions.onContinue));
  } else {
    buttons.append(actionButton('See the ship report', 'ship-button', actions.onShip));
  }
  buttons.append(
    actionButton('Replay this seed', 'replay-button secondary-button', actions.onReplay),
    actionButton('New seed', 'new-seed-button secondary-button', actions.onNewSeed),
  );
  outcome.append(buttons);
  container.replaceChildren(
    drawHeader(view), drawResultYield(view), outcome, ...(view.spc ? [drawSpc(view.spc)] : []), drawWaferMap(view),
  );
  showFromTop(container);
}

// --- the ship report (M3 item 3) -------------------------------------------

// One of the three numbers: label, big value, and what it is made of.
function drawTile(tile) {
  const box = el('div', 'ship-tile');
  box.append(el('p', 'ship-tile-label', tile.label), el('p', 'ship-tile-value', tile.value),
    el('p', 'ship-tile-detail', tile.detail));
  return box;
}

// Yield by step: where the lot was lost, one row per room it ran through.
function drawStepTable(view) {
  const box = panel('Yield by step', 'steps-panel');
  const table = el('table', 'step-table');
  const head = el('tr');
  for (const title of ['Step', 'Room', 'Yield after', 'Points lost']) head.append(el('th', null, title));
  table.append(head);
  for (const step of view.steps) {
    const row = el('tr');
    row.append(el('td', null, `${step.stepNumber}`));
    const room = el('td', null);
    room.append(el('span', `room-chip room-${step.roomId}`, step.roomName));
    if (step.stepLabel) room.append(` ${step.stepLabel}`);
    row.append(room, el('td', null, `${step.yieldPercent}%`), el('td', null, step.lossPoints));
    table.append(row);
  }
  box.append(table);
  if (view.stepsNotRun > 0) box.append(el('p', 'map-key', `${view.stepsNotRun} later steps were not run.`));
  return box;
}

// The Diagnose panel (M4 item 1): four failure modes to choose from, then
// what the guess earned. Each choice is a button with its signature text.
function drawDiagnose(view, actions) {
  const box = panel('Diagnose', 'diagnose-panel');
  box.setAttribute('role', 'status');   // the result is announced when it appears
  box.append(el('p', 'diagnose-text', view.text));
  if (view.evidence) box.append(el('p', 'map-key diagnose-evidence', view.evidence));
  if (view.state === 'choose') {
    const list = el('div', 'stop-list');
    for (const choice of view.candidates) {
      const button = el('button', 'stop-button diagnose-button');
      const top = el('span', 'card-top');
      top.append(el('span', 'card-name', choice.name));
      if (choice.known) top.append(el('span', 'chip chip-known', 'In notebook'));
      button.append(top, el('span', 'card-summary', choice.sig));
      onSingleClick(button, () => actions.onDiagnose(choice.id));
      list.append(button);
    }
    box.append(list);
  }
  if (view.state === 'done' && view.earned) {
    const text = view.unlocks.length > 0
      ? `Unlocks for later runs: ${view.unlocks.join(', ')}.`
      : 'It unlocks nothing yet.';
    box.append(el('p', 'map-key', text));
  }
  return box;
}

// Every monitored tool's SPC chart after the run: drift is evidence too.
function drawRouteSpc(view) {
  const box = panel('Tool SPC after the run', 'route-spc-panel');
  const grid = el('div', 'route-spc');
  for (const tool of view.tools) {
    const item = el('div', 'route-spc-item');
    item.append(el('span', `room-chip room-${tool.roomId}`, tool.roomName),
      el('p', 'spc-title', `${tool.spc.parameter} (${tool.spc.unit})`), drawSpcPicture(tool.spc),
      el('p', tool.spc.inControl ? 'spc-verdict' : 'spc-verdict spc-verdict-out', tool.spc.verdictText));
    grid.append(item);
  }
  box.append(grid);
  return box;
}

// The screen after a run ends: the verdict, the three numbers, the diagnose
// panel, yield by step, the tools' SPC and the final wafer map. `actions`
// holds onDiagnose(id), onReplay(), onNewSeed(), notebook ({ count,
// onOpen }, for the Notebook button) and words ({ onOpen }).
export function renderShip(container, view, actions) {
  const header = el('header', 'room-band map-band');
  header.append(el('h1', 'room-name', 'Ship report'), el('p', 'room-step', view.lotName));
  const facts = el('p', 'room-facts');
  facts.append(el('span', 'seed', `Seed ${view.seed}`), el('span', 'cash', `Cash ${view.cash}`));
  header.append(facts, headerButtons(actions.notebook, actions.words));

  const verdict = panel('Verdict', `result-panel verdict-${view.status}`);
  verdict.setAttribute('role', 'status');
  verdict.append(el('p', 'outcome-text', view.verdictText));
  const tiles = el('div', 'ship-tiles');
  view.tiles.forEach(tile => tiles.append(drawTile(tile)));
  verdict.append(tiles);
  const buttons = el('div', 'result-buttons');
  buttons.append(
    actionButton('Replay this seed', 'replay-button', actions.onReplay),
    actionButton('New seed', 'new-seed-button secondary-button', actions.onNewSeed),
  );
  verdict.append(buttons);
  container.replaceChildren(header, verdict, drawDiagnose(view.diagnose, actions), drawStepTable(view),
    drawWaferMap(view), drawRouteSpc(view));
  showFromTop(container);
}

// After a new screen is drawn: scroll back to the top and put keyboard
// focus on the screen's title, so a screen reader announces the new screen
// and Tab goes on to the first button. (Focusing a button instead drew a
// focus ring that looked like a choice already made.) tabIndex -1 lets the
// title take focus without becoming a Tab stop itself.
export function showFromTop(container) {
  window.scrollTo(0, 0);
  const title = container.querySelector('h1');
  if (!title) return;
  title.tabIndex = -1;
  title.focus({ preventScroll: true });
}

// A plain message instead of a room, e.g. when the lot was scrapped before
// reaching the room this screen shows.
export function renderMessage(container, text) {
  const box = el('div', 'panel message-box');
  box.setAttribute('role', 'status');
  box.append(el('p', 'message-text', text));
  container.replaceChildren(box);
}

// Shows an error in a visible box, so a broken page never just looks blank.
export function renderError(container, error) {
  const box = el('div', 'error-box');
  box.setAttribute('role', 'alert');
  box.append(el('h2', 'error-title', 'Something went wrong'));
  box.append(el('pre', 'error-text', String(error && error.stack ? error.stack : error)));
  container.replaceChildren(box);
}

// One line at the top after a reload picked up a saved run: "Resumed seed
// 123456". It sits above the screen just drawn and goes with the next redraw.
export function renderResumedNote(container, seed) {
  renderNote(container, `Resumed seed ${seed}`, 'resumed-note');
}

// The same kind of line when the address held a seed that isn't one
// (view.js badSeedText): it says which seed started instead.
export function renderSeedNote(container, text) {
  renderNote(container, text, 'resumed-note seed-note');
}

function renderNote(container, text, className) {
  const note = el('p', className, text);
  note.setAttribute('role', 'status');
  container.prepend(note);
}
