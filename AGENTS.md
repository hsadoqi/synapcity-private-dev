<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Execution and token budget

Minimize tool calls, repeated verification, and progress narration.

### Implementation loop

For each scoped task:

1. Inspect relevant files once.
2. Make one coherent implementation pass.
3. Run one focused test command.
4. Make one consolidated correction pass if needed.
5. Re-run the focused tests once.
6. Run final verification once.

Do not narrate routine file reads, edits, or passing commands.

### Retry limits

- Maximum two focused test runs before reporting a blocker.
- Maximum one full test-suite run per task.
- Maximum one typecheck, one lint, and one build per task.
- Maximum one screenshot-capture pass.
- Maximum one screenshot-driven correction pass.
- Do not repeat the entire verification chain after subjective visual tweaks.

If a later change is small and isolated, run only the directly affected focused checks plus typecheck.

### UI testing policy

Add automated tests for:

- state transitions;
- persistence;
- accessibility behavior;
- keyboard/focus behavior;
- route-specific behavior;
- containment boundaries;
- confirmed regressions.

Do not add automated tests solely for:

- spacing;
- dimensions;
- visual hierarchy;
- density;
- subjective preview dominance;
- border/radius choices;
- CSS geometry at several viewport widths.

Verify visual composition with one final screenshot pass.

### Screenshot policy

Screenshot review is for detecting:

- clipping;
- inaccessible or missing controls;
- horizontal overflow;
- broken responsive transformations;
- direct violations of an approved design requirement.

Do not autonomously continue polishing based on subjective visual preference.

Report non-blocking aesthetic observations for user review.

Do not change approved breakpoint thresholds based only on screenshot preference without user approval.

### Verification

For normal UI work, final verification is:

- focused affected tests;
- typecheck;
- lint;
- build only when route/runtime/build behavior changed;
- git diff --check.

Run the full test suite only when shared domain, store, provider, routing, or application-shell behavior changed.