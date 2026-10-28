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

const isUiCode = /(^|\/)src\/ui\/.*\.(js|css)$/.test(filePath);
const colorPattern = /#[0-9a-fA-F]{3,8}\b|\b(rgb|rgba|hsl|hsla)\(/;
if (isUiCode && codeLines.some((line) => colorPattern.test(line))) {
  problems.push('Hard-coded color in UI code: use a token from src/theme/tokens.css (CLAUDE.md §10).');
}

if (problems.length === 0) process.exit(0);

process.stderr.write(`Rule check on ${filePath}:\n- ${problems.join('\n- ')}\nPlease fix this edit.\n`);
process.exit(2);
