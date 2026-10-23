# PROJECT.md — Universal Claude Code Workflow Template

> How to work on this project using Claude Code autonomous execution principles.
> Recommended by Anthropic developers for high-quality agentic AI development.

## Quick Start for Claude Code

1. Read the **Workflow Orchestration Framework** below (5 min)
2. Check `tasks/todo.md` for current work
3. Check `tasks/lessons.md` for accumulated rules & gotchas
4. Start with **Plan First** — write your plan to `tasks/todo.md` before coding
5. After any correction or learning: update `tasks/lessons.md`

---

## Workflow Orchestration Framework

### Core Principles (Anthropic Developer Guidelines)

#### 1. Plan Node Default
**Every non-trivial task (3+ steps or architectural decisions) requires an entry plan.**

- Write a detailed plan to `tasks/todo.md` before starting implementation
- If something goes sideways mid-execution, STOP and re-plan immediately
- Don't keep pushing if the plan isn't working — replanning costs less than wrong code
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

**When to plan:**
- ✅ New feature with multiple components
- ✅ Complex bug with uncertain root cause
- ✅ Architectural decision or refactor
- ✅ Any change affecting multiple modules
- ❌ Skip for trivial fixes or single-line corrections

---

#### 2. Subagent Strategy
**Use subagents liberally to keep context clean and solve problems in parallel.**

- Create a subagent for research, exploration, or parallel analysis
- Delegate R&D questions to separate subagents to avoid polluting main context
- For complex problems, throw more compute at it via subagents
- One focused task per subagent for clean execution
- Subagents keep the main window focused on implementation

**When to use subagents:**
- Exploring multiple solution approaches
- Debugging in parallel with feature work
- Research/documentation that doesn't need to be in main context
- Complex analysis (e.g., performance profiling, data mining)
- Parallel tasks (e.g., test suite + implementation)

---

#### 3. Self-Improvement Loop
**After ANY correction or learning, immediately document it so mistakes don't repeat.**

- Every time you hit a bug or get feedback: update `tasks/lessons.md`
- Write a rule that prevents the same mistake from happening again
- Ruthlessly iterate on these lessons until your mistake rate drops
- Review `tasks/lessons.md` at the start of each session on this project
- Pattern: (Bug Found) → (Root Cause) → (Rule to Prevent) → (Test/Verify)

**Example entry in tasks/lessons.md:**

```
## Wafer Map Defect Propagation Bug

### What Happened
Die defect counts weren't accumulating across modules. 
Realized we were resetting the map instead of carrying state forward.

### Root Cause
Module gate transition was creating new wafer object instead of 
cloning existing one with updated properties.

### Rule to Prevent
✅ Always clone immutable objects; never create new ones in state transitions
✅ Wafer map state is a contract — validate it exists before and after module shift
✅ Add unit test for multi-module state continuity
```

---

#### 4. Verification Before Done
**Never mark a task complete without proving it works.**

- Don't just assume code runs — test it
- Diff behavior between main and your changes when relevant
- For UI changes, visually verify on target device (mobile/desktop)
- Ask yourself: "Would a staff engineer at my company approve this?"
- Run tests, check logs, demonstrate correctness in output
- Document what you verified in your task notes

**Verification checklist:**
- [ ] Code runs without errors
- [ ] Tests pass (unit + integration if applicable)
- [ ] Output matches expected behavior
- [ ] No console errors or warnings
- [ ] Logs confirm the right path was taken
- [ ] Edge cases handled (empty input, null, boundary values)
- [ ] Performance acceptable (no obvious hangs/slowness)

---

#### 5. Demand Elegance (Balanced)
**For non-trivial changes, pause and ask: "Is there a more elegant way?"**

- Don't implement the first solution that works — refine it
- If you're fighting the codebase, the solution might be hacky
- Elegance = clarity, conciseness, maintainability, aligned with existing patterns
- For simple, obvious fixes: ship it. Don't over-engineer.
- Challenge your own work before presenting it

**When to demand elegance:**
- ✅ Multi-step feature implementation
- ✅ Bug fix that required refactoring to understand
- ✅ Code that felt hacky or "workaround-y" while writing
- ❌ Skip for typos, config changes, simple one-liners
- ❌ Skip if it's a known tech debt item (defer elegance, just unblock)

**How to evaluate:**
- Is this the simplest code that solves the problem?
- Would I need to explain this to someone else?
- Does it follow the existing codebase patterns?
- Does it scale if requirements expand slightly?

---

#### 6. Autonomous Bug Fixing
**When given a bug report: just fix it. Don't ask for hand-holding.**

- You have logs, error messages, failing tests — use them
- Point at the evidence (logs, errors, stack traces) and resolve
- Zero context switching required from the user
- Fix failing CI tests autonomously without being asked
- Explain what you found and how you fixed it in the task notes

**Process:**
1. Read the bug report or error
2. Find the failing test / error log / reproduction step
3. Trace the code path
4. Fix the root cause
5. Verify the fix
6. Document in `tasks/lessons.md` if it's a pattern worth remembering

---

### Task Management Pattern

Follow this workflow for every piece of work:

1. **++Plan First++**
   - Write plan to `tasks/todo.md` with checkable items
   - Include acceptance criteria (how will you know it's done?)
   - List any architectural decisions or unknowns

2. **++Verify Plan++**
   - Check in with collaborators or review it yourself
   - Make sure plan is solid before implementing
   - Adjust if new information emerges

3. **++Track Progress++**
   - Mark items complete as you go (`- [x]`)
   - Note blockers or changes to the plan as they happen
   - Update `tasks/todo.md` at step boundaries, not line-by-line

4. **++Explain Changes++**
   - High-level summary at each major step
   - What you changed, why, and what you verified
   - Keep explanations in `tasks/todo.md` or in commit messages

5. **++Document Results++**
   - Add final review section to `tasks/todo.md`
   - Link to PRs, commits, or artifacts if applicable
   - Note any incomplete or deferred work

6. **++Capture Lessons++**
   - After corrections or discoveries: update `tasks/lessons.md`
   - Pattern: What happened → Why → Rule to prevent
   - Review at session start so patterns improve

---

### Core Development Principles

#### ++Simplicity First++
Every change should be as simple as possible with minimal code impact.

- Single Responsibility Principle: one function does one thing
- Don't add features you don't need yet
- Refactor only when it unblocks progress
- Favor obvious code over clever code

#### ++No Laziness++
Find root causes. No temporary fixes. Senior developer standards.

- "Fix it properly or don't fix it" — no band-aids
- If you don't understand why something failed, keep investigating
- Document the root cause, not the symptom
- Test at the failure point, not downstream

#### ++Minimal Impact++
Changes should only touch what's necessary. Avoid introducing bugs.

- Scope changes tightly
- Don't refactor unrelated code while fixing bugs
- Use feature flags for large changes
- Minimize side effects and dependencies

---

## File Structure & Conventions

```
project/
├── PROJECT.md                 ← You are here
├── DESIGN.md                  ← What you're building (or ARCHITECTURE.md)
├── tasks/
│   ├── todo.md                ← Current work + sprint planning
│   └── lessons.md             ← Accumulated learnings & rules
├── src/                       ← Application source code
├── tests/                     ← Test suite
├── docs/                      ← Additional documentation
└── README.md                  ← Setup & quickstart for new developers
```

### tasks/todo.md Structure

```markdown
# Fab Run — Sprint / Current Work

## Current Sprint: [Name or Date Range]

### Task: [Feature/Bug/Refactor Name]
- [ ] Sub-item 1
- [ ] Sub-item 2
- [ ] Sub-item 3

**Acceptance Criteria:**
- Works on [target platform]
- Tests pass
- No console errors

**Progress Notes:**
- [Date]: Started investigating...
- [Date]: Found root cause in [file]
- [Date]: Implementation complete, testing now

**Result:**
[Commit link or PR link]
```

### tasks/lessons.md Structure

```markdown
# Lessons Learned

## [Clear Title of Lesson]

### What Happened
[2-3 sentences describing the bug, mistake, or discovery]

### Root Cause
[Why it happened — dig into the mechanism]

### Rule to Prevent
✅ [Specific rule to avoid this in future]
✅ [Test or check to catch it if violated]
✅ [Link to code/test if applicable]

### Example
[Code snippet or scenario showing the lesson]
```

---

## Workflow Checklist (Before Submitting Work)

- [ ] Plan was written and reviewed before implementation
- [ ] Code runs without errors
- [ ] All tests pass (or new tests added for new code)
- [ ] Verification done: output matches expected behavior
- [ ] No console errors, warnings, or debug logs left in
- [ ] `tasks/lessons.md` updated if you hit a bug or learned something
- [ ] `tasks/todo.md` marked complete with notes
- [ ] Code follows project conventions (naming, structure, style)
- [ ] Commit message / summary explains the change clearly

---

## Integration with Design/Architecture

This workflow document is a **companion to DESIGN.md** (or ARCHITECTURE.md):

- **DESIGN.md**: *What* you're building (features, mechanics, tech stack)
- **PROJECT.md**: *How* you work on it (workflow, principles, task management)

Both should exist. DESIGN.md is immutable vision; PROJECT.md is the operating system for development.

---

## Customization Guide

This template is **universal**, but projects should customize:

1. **technology node table** (if applicable) — copy from DESIGN.md
2. **File structure** — adjust to match your actual directory layout
3. **Testing setup** — specify which test framework and how to run
4. **Deployment** — add deployment or build steps if needed
5. **Key design rules** — copy critical rules from DESIGN.md into this file or link to them

Example customization:

```markdown
## [Your Project Name] Specifics

### Tech Stack
- React 18 + Vite
- Zustand for state
- Vitest for testing
- [other key tools]

### File Naming Conventions
- Components: PascalCase.jsx
- Utilities: camelCase.js
- Tests: [name].test.js
- Stores: [name]Store.js

### Key Design Rules
- [Rule 1]
- [Rule 2]
- [Link to DESIGN.md for full list]

### Build & Deploy
```
npm run dev      # Local development
npm run test     # Run tests
npm run build    # Production build
```
```

---

## Quick Reference: When to Use Each File

| Need | File | Purpose |
|------|------|---------|
| **Understanding the game/product** | DESIGN.md | Vision, mechanics, tech stack, design rules |
| **Planning your work** | tasks/todo.md | Current sprint, tasks, acceptance criteria |
| **Learning from mistakes** | tasks/lessons.md | Rules to prevent repeating bugs |
| **How to work autonomously** | PROJECT.md | Workflow orchestration, principles, checklist |
| **Setting up for dev** | README.md | Installation, local dev, contributing |
| **Deep technical docs** | docs/ | Architecture details, API specs, etc. |

---

## Session Startup Routine (Claude Code)

Every time you start work on this project:

1. **Read context files** (5 min total):
   - Skim DESIGN.md if unfamiliar with the project
   - Fully read `tasks/lessons.md` — these are patterns to avoid

2. **Check current work**:
   - Read `tasks/todo.md` to see what's in progress
   - Understand the acceptance criteria and blockers

3. **Decide your approach**:
   - Is this a new task? → Plan First (write to `tasks/todo.md`)
   - Is this a bug? → Autonomous Bug Fixing (trace + fix)
   - Is this a refactor? → Demand Elegance (pause and design before coding)
   - Is this verification? → Verification Before Done (test thoroughly)

4. **Work autonomously** using the principles above

5. **Session close** (before handing off):
   - Update `tasks/todo.md` with your progress
   - Update `tasks/lessons.md` with any learnings
   - Document results clearly so next session can pick up

---

## Questions?

**For Claude Code developers:**
This workflow is battle-tested by Anthropic. If something feels slow or painful, adjust the process — but always maintain the core loop: **Plan → Implement → Verify → Learn → Improve**.

**For team leads:**
If multiple people work on this project, share PROJECT.md in onboarding. It's the operating system for how work gets done here.

---

*Last updated: [Your date]*
*Project: [Your project name]*
