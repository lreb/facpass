# Testing Strategy

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Test pyramid

1. Unit tests for domain and security utilities
2. Component tests for workflows and accessibility
3. Property/invariant tests for generators
4. End-to-end tests for critical paths, offline behavior, and deployment
5. Manual security/privacy inspection before release

## Unit coverage priorities

- Secure random integer and rejection path
- Secure shuffle
- Character-set policy construction
- All generator modes
- Entropy/search-space models
- Every pattern detector
- Scoring thresholds
- Hash-prefix transformation
- Storage and cache guards

Coverage percentage is secondary to meaningful branch and failure testing. Security modules should aim for complete branch coverage where practical.

## Representative test corpus

Include:

- Common passwords
- Dictionary word plus year
- Keyboard sequences
- Repeated substrings
- Long low-diversity strings
- Strong generated samples
- Unicode and emoji inputs
- Empty and extreme-length inputs
- Impossible generation policies

Do not place real user passwords in fixtures.

## Property/invariant tests

Run thousands of generated cases for length, allowed characters, required classes, word count, index bounds, and exclusion rules. Statistical output checks are regression indicators, not cryptographic proof.

## End-to-end scenarios

- Generate, regenerate, copy, and clear
- Generate passphrase and PIN
- Analyze and explain findings
- Enable and clear session history
- Offline load after initial visit
- Breach feature offline/error/success using mocked responses
- PWA update prompt
- Keyboard navigation and themes
- GitHub Pages base path

## Security scans

CI should scan application source for prohibited uses of `Math.random`, sensitive logging, password serialization to URL/storage, unsafe HTML, and unexpected endpoints. Review false positives rather than disabling checks globally.

## Release verification

Inspect DevTools Network, Console, Application Storage, Cache Storage, Service Workers, and browser history while running representative workflows.
