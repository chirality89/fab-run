// wordsPage.js — draws the Words page: the fab words the screens use, A to
// Z, from glossary.js. The Words button that opens it is in render.js
// (headerButtons).
//
// No game logic here, and opening the page is not a run action: it changes
// nothing in the run and is never saved. Back redraws the screen the player
// came from. Text is always set with textContent.

import { el, panel } from './dom.js';
import { actionButton, showFromTop } from './render.js';
import { GLOSSARY } from '../content/glossary.js';

// One term: the word, what it is in a fab, and where you meet it here.
function drawTerm(entry) {
  const item = el('li', 'card words-entry');
  const inGame = el('span', 'words-in-game');
  inGame.append(el('strong', '', 'In the game: '), entry.inGame);
  item.append(
    el('span', 'card-name', entry.term),
    el('span', 'card-summary', entry.plain),
    inGame,
  );
  return item;
}

// Draws the Words page. `actions` holds onBack().
export function renderWords(container, actions) {
  const header = el('header', 'room-band map-band');
  header.append(
    el('h1', 'room-name', 'Words'),
    el('p', 'room-step', 'The fab words this game uses, A to Z'),
  );

  // Back at the top and the bottom: on a phone the list is several screens long.
  const box = panel('Words', 'words-panel');
  const list = el('ul', 'words-list');
  GLOSSARY.forEach(entry => list.append(drawTerm(entry)));
  box.append(
    actionButton('Back', 'back-button', actions.onBack),
    list,
    actionButton('Back', 'back-button', actions.onBack),
  );

  container.replaceChildren(header, box);
  showFromTop(container);
}
