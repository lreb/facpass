# Security Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Security objectives

1. Prevent plaintext-password transmission.
2. Prevent unintended persistence or logging.
3. Use cryptographically secure, unbiased generation.
4. Minimize third-party code and network dependency.
5. Explain limitations honestly.

## Mandatory controls

- Web Crypto is the only approved randomness source.
- Random range conversion uses centralized rejection sampling.
- Passwords never appear in URLs, logs, analytics, error payloads, or persistent storage.
- History is opt-in and session-only.
- Breach checking is explicit, prefix-based, and locally compared.
- Core features require no network.
- Security logic is isolated from React views and covered by tests.
- Runtime network destinations are allowlisted.

## Content security

- Do not use `eval`, `new Function`, inline dynamic scripts, or unsanitized HTML.
- Avoid `dangerouslySetInnerHTML`; static educational Markdown must be rendered through a reviewed safe path.
- Validate all configuration imports if import functionality is later approved.
- Treat third-party icons, fonts, and scripts as supply-chain dependencies. Prefer bundled local assets.

## Dependency security

- Commit lockfiles.
- Use Dependabot and CodeQL.
- Review dependencies that receive or transform sensitive values.
- Avoid a dependency when a small auditable implementation using browser standards is sufficient.
- Pin GitHub Actions to reviewed versions, preferably commit SHAs.

## Browser security limitations

FacPass cannot guarantee protection against:

- Compromised operating systems or browsers
- Malicious extensions
- Keyloggers or screen capture
- Clipboard monitoring
- Shoulder surfing
- Developer-tools inspection on an unlocked device

The UI must not claim otherwise.

## Incident handling

If a release is found to transmit, log, cache, or persist secrets unexpectedly:

1. Disable or remove the affected feature.
2. Publish a corrected build.
3. Document the affected versions and behavior.
4. Rotate any external integration credentials if applicable.
5. Add regression tests before re-enabling the feature.

## Security review triggers

Required for changes to randomness, word lists, hashing, breach endpoints, storage, service workers, clipboard behavior, network policy, dependency injection, or security scoring.
