# Product Requirements

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Requirement notation

- **MUST**: mandatory for release.
- **SHOULD**: expected unless a documented trade-off is approved.
- **MAY**: optional enhancement.

## Functional requirements

### Generation

- FR-GEN-001: The application MUST generate random passwords using `crypto.getRandomValues()`.
- FR-GEN-002: Users MUST be able to set length and enabled character classes.
- FR-GEN-003: Generation MUST avoid modulo bias through rejection sampling.
- FR-GEN-004: Users MUST be able to exclude ambiguous and custom characters.
- FR-GEN-005: The application MUST support passphrases, pronounceable passwords, and numeric PINs.
- FR-GEN-006: Invalid or impossible policies MUST produce an actionable validation message.
- FR-GEN-007: The application MUST provide accessible Copy and Regenerate actions.

### Analysis

- FR-ANA-001: Analysis MUST occur locally except for an explicitly initiated breach lookup.
- FR-ANA-002: The analyzer MUST evaluate length, estimated entropy, repetition, sequences, common patterns, dictionary/common-password matches, and character diversity.
- FR-ANA-003: Findings MUST explain both the detected issue and a practical improvement.
- FR-ANA-004: `Not checked` and `Not found in breach data` MUST be distinct states.
- FR-ANA-005: Crack-time estimates MUST disclose assumptions.

### Breach check

- FR-BRE-001: The feature MUST be optional and user initiated.
- FR-BRE-002: Plaintext MUST never leave the browser.
- FR-BRE-003: Hashing MUST happen locally.
- FR-BRE-004: Only the minimum prefix needed for a range query MAY be transmitted.
- FR-BRE-005: Suffix comparison MUST occur locally.
- FR-BRE-006: The feature MUST fail safely offline.

### History and settings

- FR-HIS-001: Password history MUST be disabled by default.
- FR-HIS-002: Enabled history MUST be limited to memory or `sessionStorage`.
- FR-HIS-003: Users MUST be able to clear history immediately.
- FR-SET-001: Non-sensitive preferences MAY persist locally.
- FR-SET-002: Theme, default generator mode, and accessibility preferences SHOULD persist.

### PWA

- FR-PWA-001: The app MUST be installable.
- FR-PWA-002: The application shell and core features MUST work offline.
- FR-PWA-003: The service worker MUST NOT cache passwords, analysis input, or breach responses tied to user input.
- FR-PWA-004: Updates MUST be communicated without silently interrupting active work.

## Non-functional requirements

- NFR-SEC-001: No plaintext password may be logged, persisted, placed in a URL, or transmitted.
- NFR-PER-001: Initial usable UI SHOULD render within 2.5 seconds on a mid-range mobile device over a normal 4G connection.
- NFR-PER-002: Local generation and analysis SHOULD respond within 100 ms for normal input sizes.
- NFR-ACC-001: Core workflows MUST target WCAG 2.2 AA.
- NFR-COM-001: The production build MUST support the configured GitHub Pages base path.
- NFR-QA-001: Type checking, linting, unit tests, security checks, and production build MUST pass in CI.
- NFR-PRI-001: Telemetry and behavioral tracking MUST be absent by default.

## Supported range defaults

- Random password: 4 to 256 characters; recommended presets 16, 20, 24, 32, and 64.
- PIN: 4 to 32 digits.
- Passphrase: 3 to 12 words; recommended default 5.
- Analyzer input: up to 1,024 characters, with explicit validation above that limit.

## Release boundary

Version 1.0 includes secure generation, local analysis, offline PWA behavior, responsive UI, themes, accessibility, and documented privacy behavior. Optional breach checking may ship only after its threat model and tests are complete.
