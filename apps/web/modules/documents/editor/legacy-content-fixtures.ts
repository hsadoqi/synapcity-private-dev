/**
 * Explicit legacy-content fixtures (test-only). These exist independently
 * of the seed documents — the seeds are versioned envelopes now, so the
 * legacy markdown reading path must stay covered by its own fixtures for
 * as long as pre-existing user localStorage can contain raw markdown
 * (until a storage migration retires the path, ADR-3).
 */
export const LEGACY_MARKDOWN_FIXTURE =
  "# Product vision\n\nDocument content is now editable from the route shell."

export const LEGACY_MARKDOWN_MULTI_HEADING_FIXTURE =
  "# Title\n\nIntro paragraph.\n\n## Section\n\n- item one\n- item two\n\n### Detail\n\nClosing."
