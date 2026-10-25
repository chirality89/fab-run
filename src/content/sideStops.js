// sideStops.js — the four kinds of side stop on the floor plan (DESIGN.md §4,
// decision O3). Data only: names and words the screen shows.
//
//   name         the stop's name on its button and screen
//   short        its label in the corridor on the floor plan
//   what         one line on what the stop does
//   placeholder  true while the stop only costs its minutes and does
//                nothing else yet (metrology and events come later in M3)
//
// What each stop costs in minutes is a balance number (balance.js
// SIDE_STOP_MINUTES); which stops a corridor offers comes from the seed
// (src/engine/map.js).

export const SIDE_STOPS = {
  metrology:   { name: 'Metrology',   short: 'MET', what: 'Measure: reveals hidden values', placeholder: true },
  pm:          { name: 'PM / DOE',    short: 'PM',  what: 'PM one tool, or DOE one practice', placeholder: false },
  procurement: { name: 'Procurement', short: 'BUY', what: 'Spend cash on equipment and materials', placeholder: false },
  event:       { name: 'Event',       short: 'EVT', what: 'A choice with a tradeoff', placeholder: true },
};
