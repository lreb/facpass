# Threat Model

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Scope

The model covers the static PWA, browser execution, service worker, local storage mechanisms, optional breach lookup, GitHub Pages deployment, dependencies, and CI/CD.

## Assets

- Generated and entered passwords
- Session history
- Full local hashes
- Integrity of generator and analyzer code
- User trust and security guidance

## Trust boundaries

1. GitHub repository and CI/CD to deployed static assets.
2. Deployed assets to browser execution.
3. Application memory to browser storage/clipboard.
4. Browser to optional breach service.
5. Application to third-party dependencies.

## Threats and mitigations

| ID | Threat | Primary mitigation |
|---|---|---|
| T-01 | Predictable random output | Web Crypto; reviewed unbiased selection; tests |
| T-02 | Modulo bias | Rejection sampling in one audited utility |
| T-03 | Plaintext network leakage | No network path accepting password strings; network allowlist |
| T-04 | Persistent storage leakage | No localStorage/IndexedDB/cache for passwords; session-only opt-in history |
| T-05 | Log or error leakage | Secret-free logging rule; regression scans |
| T-06 | URL/history leakage | No sensitive route or query serialization |
| T-07 | Clipboard exposure | Explicit action, warning, best-effort clearing only |
| T-08 | XSS | No unsafe HTML, minimal dependencies, CSP meta where feasible, secure coding |
| T-09 | Supply-chain compromise | Lockfile, Dependabot, CodeQL, pinned Actions, dependency review |
| T-10 | Malicious service worker caching | Explicit cache list and cache-inspection tests |
| T-11 | Breach-service disclosure | Local hash, minimal prefix, local comparison, no identifiers |
| T-12 | Misleading score | Multi-factor scoring, assumptions, test corpus, no guarantees |
| T-13 | Compromised device/extension | Document limitation; minimize sensitive lifetime |
| T-14 | Repository takeover | Branch protection, required reviews, least-privilege Actions permissions |
| T-15 | UI overlay or click confusion | Clear focus, no hidden copy actions, safe external links |

## Abuse cases

- A malicious change replaces Web Crypto with `Math.random()`.
- A debugging statement logs a generated password.
- A service worker caches a breach-response request.
- A feature places analyzer input in a shareable URL.
- A dependency sends form values to telemetry.
- A score labels a common breached password as strong based on length alone.

Each abuse case requires a preventive control and automated regression test where feasible.

## Residual risks

Browser memory cannot be securely erased from JavaScript. Clipboard contents are outside full application control. Static hosting limits security headers. These are accepted only with transparent documentation and minimized exposure.

## Review cadence

Review this model before version 1.0, before enabling breach checks, after any security incident, and whenever a new trust boundary or external service is introduced.
