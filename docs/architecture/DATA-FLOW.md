# Data Flow Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Data classification

### Sensitive

- Generated passwords
- User-entered passwords
- Passphrases and PINs
- Session history
- Full password hashes and derived comparison material

### Non-sensitive preferences

- Theme
- Default generator type
- Default length
- Accessibility preferences
- Dismissed onboarding state

## Generation flow

```text
User options -> validation -> Web Crypto random bytes -> unbiased selection
-> generated value in memory -> display/copy -> clear/reset
```

No network, persistent storage, URL, analytics, or log step is allowed.

## Analysis flow

```text
User input -> in-memory analyzer -> independent detectors -> scoring/explanations
-> display -> clear/reset
```

The input and findings remain local. Findings must not reproduce more of the password than necessary.

## Optional breach flow

```text
User initiation -> local hash -> extract approved prefix -> external range request
-> response in memory -> local suffix comparison -> display count/status -> discard
```

The plaintext and full hash are not transmitted. Network code must accept only the prefix type, not the password string.

## Session-history flow

```text
Explicit opt-in -> generated value -> memory/sessionStorage -> display -> clear/session end
```

History is disabled by default. It never uses localStorage, IndexedDB, Cache Storage, cookies, or remote persistence.

## Preferences flow

Validated non-sensitive settings may use localStorage or IndexedDB. Storage keys must be documented and namespaced.

## Service-worker flow

The service worker handles versioned static assets only. Sensitive application requests must not be intercepted into a cache strategy.

## Network allowlist

Production should require no network endpoint for core functionality. If breach checking is enabled, only the approved breach range endpoint is allowed. New runtime endpoints require threat-model and privacy updates.

## Data deletion

- Clear button: removes active generated/analyzed values and in-memory findings.
- Clear history: removes in-memory and sessionStorage history.
- Reset settings: removes non-sensitive persisted preferences.
- Application uninstall/browser data removal: removes cached application assets and preferences according to browser behavior.
