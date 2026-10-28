// check-src-edit.mjs — a Claude Code hook (runs after every Edit or Write).
//
// What it does: when a file in src/ is changed, it looks at the new text for
// two rule breaks that a person can easily miss:
//   - Math.random anywhere in src/ (CLAUDE.md §8: every random number comes
//     from rng.js, or seeds stop being reproducible)
//   - a hard-coded color in src/ui/ (CLAUDE.md §10: use the tokens in
//     src/theme/tokens.css)
// Comment lines are skipped, so a comment that warns about the rule is fine
// (see the "Repo check tripped on its own warning comment" lesson).
//
// The edit has already happened when this runs, so it can't block it. Exit
// code 2 shows our message to Claude, which then fixes the edit.

import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const toolInput = input.tool_input || {};
const filePath = String(toolInput.file_path || '').replace(/\\/g, '/');

// Only files inside src/ are checked. tokens.css is where colors belong.
if (!/(^|\/)src\//.test(filePath) || filePath.endsWith('src/theme/tokens.css')) {
  process.exit(0);
}

// The new text: Write sends `content`, Edit sends `new_string`,
// a multi-edit sends a list of `edits`.
const newText = [
  toolInput.content,
  toolInput.new_string,
  ...(toolInput.edits || []).map((edit) => edit.new_string),
]
  .filter(Boolean)
  .join('\n');

// Drop comment lines (// … and * … inside /* */ blocks).
const codeLines = newText
  .split('\n')
  .filter((line) => !/^\s*(\/\/|\*|\/\*)/.test(line));

const problems = [];

if (codeLines.some((line) => line.includes('Math.random'))) {
  problems.push('Math.random in src/: use the seeded generator in src/engine/rng.js (CLAUDE.md §8).');
}

// Colors. In CSS, any hex or rgb()/hsl() value is a hard-coded color. In JS,
// "#add" is as likely to be an element id or a link ("#add" is also valid
// hex), so JS is only flagged when it clearly holds a color:
//   - a quoted 6- or 8-digit hex string, like '#1a2b3c'
//   - a hex after a color-like word, like  fill: #fff  or  background = '#fff'
//   - an rgb()/hsl() call
const hexAnywhere = /#[0-9a-fA-F]{3,8}\b/;
const colorFunction = /\b(rgb|rgba|hsl|hsla)\(/;
const jsQuotedHex = /(['"`])#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\1/;
const jsHexAfterColorWord = /(color|background|fill|stroke|border|shadow)\b[^;\n]*#[0-9a-fA-F]{3,8}\b/i;

const isUiCss = /(^|\/)src\/ui\/.*\.css$/.test(filePath);
const isUiJs = /(^|\/)src\/ui\/.*\.js$/.test(filePath);
const hasHardCodedColor = (line) =>
  colorFunction.test(line) ||
  (isUiCss && hexAnywhere.test(line)) ||
  (isUiJs && (jsQuotedHex.test(line) || jsHexAfterColorWord.test(line)));

if ((isUiCss || isUiJs) && codeLines.some(hasHardCodedColor)) {
  problems.push('Hard-coded color in UI code: use a token from src/theme/tokens.css (CLAUDE.md §10).');
}

if (problems.length === 0) process.exit(0);

process.stderr.write(`Rule check on ${filePath}:\n- ${problems.join('\n- ')}\nPlease fix this edit.\n`);
process.exit(2);
