// floorPlan.js — draws the map screen (the cleanroom floor plan) and the
// placeholder screen after a side stop, from mapView() and stopView() in
// view.js.
//
// The floor plan lays the route's bays out as a snake, three to a row:
//   row 1:  1 → 2 → 3
//   row 2:  6 ← 5 ← 4
//   row 3:  7 → 8 → 9
// Corridors sit between neighbouring bays, and at the ends of the rows
// where the route turns. The look is plain for now; the toy-diorama art
// comes in M6.
//
// No game logic here, and text only through textContent (see render.js).

import { el, panel, onSingleClick, actionButton, showFromTop } from './render.js';

const BAYS_PER_ROW = 3;

// Where bay `index` (0-based) sits in its row, counting from the left.
// Rows go left to right, then right to left, and so on.
function columnOf(index) {
  const row = Math.floor(index / BAYS_PER_ROW);
  const along = index % BAYS_PER_ROW;
  return row % 2 === 0 ? along : BAYS_PER_ROW - 1 - along;
}

// The plan is a grid with a narrow corridor track between bays:
//   grid columns 1, 3, 5 hold bays; 2 and 4 hold corridors between them
//   grid rows    1, 3, 5 hold bays; 2 and 4 hold the turns between rows
// These two functions give the CSS grid line numbers (counted from 1).
function bayCell(index) {
  const row = Math.floor(index / BAYS_PER_ROW);
  return { row: row * 2 + 1, column: columnOf(index) * 2 + 1 };
}

function corridorCell(afterStep) {
  const from = bayCell(afterStep);
  const to = bayCell(afterStep + 1);
  if (from.row === to.row) {
    // Side by side: the corridor is the column between them.
    return { row: from.row, column: Math.min(from.column, to.column) + 1, turn: false };
  }
  // End of a row: the corridor is the row between them, under the last bay.
  return { row: from.row + 1, column: from.column, turn: true };
}

function placeIn(node, cell) {
  node.style.gridRow = String(cell.row);
  node.style.gridColumn = String(cell.column);
}

// Words that say what state a bay is in, so it never rests on color alone.
const BAY_STATUS_TEXT = { done: 'Done', next: 'Next', ahead: '' };

function drawBay(bay, index) {
  const tile = el('div', `bay room-${bay.roomId} bay-${bay.status}`);
  tile.setAttribute('role', 'listitem');
  const statusText = BAY_STATUS_TEXT[bay.status];
  tile.setAttribute('aria-label', `Step ${bay.number}: ${bay.label}${statusText ? `, ${statusText.toLowerCase()}` : ''}`);
  tile.title = bay.label;
  tile.append(el('span', 'bay-number', String(bay.number)), el('span', 'bay-name', bay.roomName));
  if (statusText) tile.append(el('span', 'bay-status', statusText));
  placeIn(tile, bayCell(index));
  return tile;
}

// One corridor: its offers as short labels, the one taken filled in, a Q-time
// mark, and "Lot" where the lot stands now.
function drawCorridor(corridor) {
  const cell = corridorCell(corridor.afterStep);
  const classes = ['corridor', cell.turn ? 'corridor-turn' : 'corridor-across'];
  if (corridor.here) classes.push('corridor-here');
  if (corridor.walked) classes.push('corridor-walked');
  if (corridor.qtime) classes.push('corridor-qtime');
  const node = el('div', classes.join(' '));
  node.setAttribute('role', 'listitem');

  const offerNames = corridor.offers.map(offer => offer.short).join(', ');
  const parts = [`Corridor after step ${corridor.afterStep + 1}: ${offerNames}`];
  if (corridor.qtime) parts.push('Q-time window');
  if (corridor.taken) parts.push(`took ${corridor.taken}`);
  else if (corridor.walked) parts.push('went straight on');
  if (corridor.here) parts.push('the lot is here');
  node.setAttribute('aria-label', parts.join(', '));

  if (corridor.here) node.append(el('span', 'chip chip-lot', 'LOT'));
  if (corridor.qtime) node.append(el('span', 'chip chip-qtime', 'QT'));
  for (const offer of corridor.offers) {
    const taken = corridor.taken === offer.kind;
    node.append(el('span', taken ? 'chip chip-taken' : 'chip', offer.short));
  }
  placeIn(node, cell);
  return node;
}

function drawPlan(view) {
  const box = panel('Floor plan', 'plan-panel');
  const grid = el('div', 'floor-plan');
  grid.setAttribute('role', 'list');
  grid.setAttribute('aria-label', 'Floor plan of the route');
  view.bays.forEach((bay, index) => grid.append(drawBay(bay, index)));
  view.corridors.forEach(corridor => grid.append(drawCorridor(corridor)));
  box.append(grid);
  box.append(el('p', 'map-key', `${view.stopKeyText} · QT Q-time window · LOT where the lot is now`));
  return box;
}

// Top bar of the map screen: the plan's own band, the seed, and the lot's numbers.
function drawMapHeader(view) {
  const header = el('header', 'room-band map-band');
  header.append(el('h1', 'room-name', 'Floor plan'));
  header.append(el('p', 'room-step', `Inlaid Cu line · yield ${view.yieldPercent.toFixed(1)}%`));
  const facts = el('p', 'room-facts');
  facts.append(
    el('span', 'seed', `Seed ${view.seed}`),
    el('span', 'cash', `Cash ${view.cash}`),
    el('span', 'cash', `Cycle time ${view.cycleTime} min`),
  );
  header.append(facts);
  return header;
}

// One side stop the lot can take here.
function drawOffer(offer, actions) {
  const button = el('button', 'stop-button');
  const top = el('span', 'card-top');
  top.append(el('span', 'card-name', offer.name), el('span', 'card-cost', `+${offer.minutes} min`));
  button.append(top, el('span', 'card-summary', `${offer.what} (coming next update)`));
  if (offer.qtimeRisk > 0) {
    button.append(el('span', 'stop-qtime', `Waits in Q-time: +${offer.qtimeRisk.toFixed(3)} oxide risk`));
  }
  onSingleClick(button, () => actions.onTakeStop(offer.kind));
  return button;
}

function drawChoices(view, actions) {
  const box = panel(view.position === 'start' ? 'Start' : 'Corridor', 'choice-panel');
  box.append(el('p', 'outcome-text', view.whereText));
  if (view.qtimeText) box.append(el('p', 'qtime-warning', view.qtimeText));
  if (view.offers.length > 0) {
    const list = el('div', 'stop-list');
    for (const offer of view.offers) list.append(drawOffer(offer, actions));
    box.append(el('h3', 'choice-heading', 'Take one side stop'), list);
    box.append(el('h3', 'choice-heading', 'Or go straight on'));
  }
  box.append(actionButton(view.goText, 'go-button', actions.onGoStraight));
  return box;
}

// Draws the map screen. `actions` holds onTakeStop(kind) and onGoStraight().
export function renderMap(container, view, actions) {
  const body = el('div', 'map-body');
  body.append(drawChoices(view, actions), drawPlan(view));
  container.replaceChildren(drawMapHeader(view), body);
  showFromTop(container);
}

// The placeholder screen after a side stop. `actions` holds onContinue().
export function renderStop(container, view, actions) {
  const header = el('header', 'room-band map-band');
  header.append(el('h1', 'room-name', view.name), el('p', 'room-step', view.what));
  header.append(el('p', 'room-facts', `Seed ${view.seed}`));
  const box = panel('Side stop', 'stop-panel');
  box.setAttribute('role', 'status');
  box.append(el('p', 'outcome-text', view.text));
  box.append(actionButton(view.goText, 'go-button', actions.onContinue));
  container.replaceChildren(header, box);
  showFromTop(container);
}
