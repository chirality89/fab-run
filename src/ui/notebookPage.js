// notebookPage.js — draws the Notebook page (M4 item 3) from the display
// data made by notebookView.js. The button that opens it is in render.js.
//
// No game logic here, and opening the notebook is not a run action: it
// changes nothing in the run and is never saved. Back redraws the screen
// the player came from. Text is always set with textContent.

import { el, panel } from './dom.js';
import { actionButton, showFromTop } from './render.js';

// One diagnosed failure mode: its name, its signature and the seed it was
// found on.
function drawEntry(entry) {
  const item = el('li', 'card notebook-entry');
  item.append(
    el('span', 'card-name', entry.name),
    el('span', 'card-summary', entry.sig),
    el('span', 'notebook-seed', `Found on seed ${entry.seed}`),
  );
  return item;
}

// Draws the Notebook page. `actions` holds onBack().
export function renderNotebook(container, view, actions) {
  const header = el('header', 'room-band map-band');
  header.append(
    el('h1', 'room-name', 'Notebook'),
    el('p', 'room-step', 'The failure modes you have diagnosed, newest first'),
  );

  const box = panel('Diagnosed', 'notebook-panel');
  if (view.emptyText !== null) {
    box.append(el('p', 'outcome-text notebook-empty', view.emptyText));
  } else {
    const list = el('ul', 'notebook-list');
    view.entries.forEach(entry => list.append(drawEntry(entry)));
    box.append(list);
  }
  box.append(el('p', 'notebook-still', view.stillText));
  box.append(actionButton('Back', 'back-button', actions.onBack));

  container.replaceChildren(header, box);
  showFromTop(container);
}
