// tests-before-commit.mjs — a Claude Code hook (runs before every Bash command).
//
// What it does: if the command is a `git commit`, it runs `npm test` first.
// If any test fails, the commit is blocked and Claude is told why.
// This enforces CLAUDE.md §3: "Never commit with failing tests unless David says so."
//
// When David does say so, put FABRUN_ALLOW_RED=1 in front of the command:
//   FABRUN_ALLOW_RED=1 git commit -m "..."
//
// How hooks talk to Claude Code: the tool call arrives as JSON on standard
// input. Exit code 0 lets the command run; exit code 2 blocks it, and what we
// print to standard error is shown to Claude as the reason.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8'));
const command = (input.tool_input && input.tool_input.command) || '';

// "git commit" or "git -C <folder> commit", but not "git commit-tree".
const isCommit = /\bgit\s+(-C\s+\S+\s+)?commit(\s|$)/.test(command);
const allowedRed = command.includes('FABRUN_ALLOW_RED=1');

if (!isCommit || allowedRed) process.exit(0);

try {
  // Run the tests in the project folder; hide their output unless they fail.
  execSync('npm test', {
    cwd: process.env.CLAUDE_PROJECT_DIR || process.cwd(),
    stdio: 'pipe',
  });
  process.exit(0);
} catch (error) {
  const output = String(error.stdout || '') + String(error.stderr || '');
  // Keep only the failing tests and the summary so the message stays short.
  const failures = output
    .split('\n')
    .filter((line) => /^not ok|^# (pass|fail)/.test(line.trim()))
    .slice(0, 20)
    .join('\n');
  process.stderr.write(
    'Commit blocked: npm test is failing (CLAUDE.md §3).\n' +
      failures +
      '\nFix the failing tests first. Only if David says to commit anyway, ' +
      'put FABRUN_ALLOW_RED=1 in front of the git commit command.\n'
  );
  process.exit(2);
}
