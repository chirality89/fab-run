// dom.js — the two smallest building blocks for drawing screens. Kept in
// their own file so every drawing file can use them without importing each
// other in a circle.
//
// Text is always set with textContent (never innerHTML), so nothing in the
// data can turn into page code.

// Makes an element with a class and, optionally, some text.
export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// A small heading for each panel.
export function panel(title, className) {
  const box = el('section', `panel ${className}`);
  box.append(el('h2', 'panel-title', title));
  return box;
}
