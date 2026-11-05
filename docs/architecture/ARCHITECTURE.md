# System Architecture

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Architecture style

FacPass is a static, local-first, single-page PWA. GitHub Pages serves immutable application assets. All core business logic executes in the browser.

## Logical components

1. **Presentation layer**: React components, navigation, forms, themes, and accessible feedback.
2. **Generator domain**: secure random selection, character policies, passphrases, pronounceable passwords, and PINs.
3. **Analyzer domain**: entropy/search-space models, pattern detectors, scoring, and explanations.
4. **Privacy boundary**: storage guards, network restrictions, sanitization, and sensitive-state lifecycle.
5. **Optional breach adapter**: local hashing, prefix request, and local suffix matching.
6. **PWA layer**: manifest, service worker, offline application shell, and update experience.

## Runtime model

```text
GitHub Pages -> static assets -> browser
browser -> React UI -> local generator/analyzer -> result
browser -> optional local hash -> hash-prefix request -> local comparison
```

## Key decisions

- React + TypeScript + Vite for a small static application.
- No backend, account, database, or server-held secret.
- Web Crypto for random generation and hashing primitives.
- Hash or GitHub Pages-compatible routing.
- React state first; add Zustand only if cross-feature state becomes demonstrably complex.
- Sensitive values are transient and excluded from persistent stores.

## Module boundaries

```text
src/
  app/
  components/
  features/{generator,analyzer,breach-check,history,education,settings}/
  security/{random,entropy,patterns,hashing}/
  pwa/
  hooks/
  lib/
  types/
  test/
```

UI components MUST call reviewed domain functions rather than implement random selection, entropy formulas, hashing, or scoring directly.

## Error strategy

- Validation errors are expected states and use plain language.
- External breach failures do not affect local workflows.
- Sensitive values are excluded from errors and diagnostics.
- Unrecoverable application errors display a safe recovery action without dumping state.

## Performance strategy

- Lazy-load Learn content and optional breach modules where useful.
- Keep the initial JavaScript bundle small.
- Run expensive analysis only after validated input and debounce interactive analysis if necessary.
- Consider a Web Worker only if measured analysis blocks interaction; do not add one preemptively.

## Security boundary

The browser/device is trusted only to the extent required to run the app. FacPass cannot protect against a compromised OS, malicious browser extension, screen capture, keylogger, or clipboard monitor. These limitations must be documented.
