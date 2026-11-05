# Acceptance Criteria

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Version 1.0 release criteria

### Secure random generator

- Given an enabled character set and valid length, generation returns exactly the requested length.
- No prohibited character appears.
- Required character-class constraints are satisfied.
- The implementation uses Web Crypto and reviewed rejection sampling.
- Static checks find no security-sensitive use of `Math.random()`.
- Unit and property-based invariant tests pass.

### Passphrase generator

- Output contains the requested number of locally sourced words.
- Separators and capitalization follow the selected policy.
- Word choice uses unbiased secure randomness.
- The UI states that passphrase strength depends on word-list size and word count.

### Analyzer

- Empty input produces guidance, not a score.
- Common passwords produce a critical warning.
- Repeated substrings and common sequences are detected by independent rules.
- Findings include a reason and recommended improvement.
- No analyzed value appears in logs, URLs, persistence, or network traffic.

### Clipboard

- Copy occurs only after user activation.
- Success is announced visually and through an accessible live region.
- The UI provides an honest clipboard exposure notice.
- The application does not promise guaranteed automatic clearing.

### History

- History is off on first use.
- Enabling history requires explicit action.
- History is stored only in memory or `sessionStorage`.
- Clear removes visible and stored session history.
- Closing the browser session does not produce persistent history.

### PWA and offline

- Manifest and service worker pass installability checks.
- After first successful load, generation and local analysis work offline.
- Online-only breach lookup shows an offline-safe state.
- No sensitive input is present in Cache Storage.
- A new production version can be activated through a clear update flow.

### Accessibility and responsive UI

- Core workflows are operable by keyboard.
- Focus order and focus indicators are clear.
- Status is not communicated by color alone.
- UI works at 320 CSS pixels without page-level horizontal scrolling.
- Browser zoom at 200% preserves core workflows.
- Automated accessibility checks and manual keyboard checks pass.

### Deployment

- `npm run build` succeeds.
- GitHub Pages base path is configured.
- Direct application entry uses a Pages-compatible routing strategy.
- GitHub Actions deploys only after quality checks pass.
