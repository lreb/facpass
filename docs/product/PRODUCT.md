# Product Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Product name

Working name: **FacPass**.

## Vision

FacPass is a privacy-first password generator and security analyzer that runs entirely in the browser, works offline after installation, and can be deployed as a static Progressive Web App on GitHub Pages.

## Product promise

- Passwords are generated locally.
- Plaintext passwords are never transmitted.
- No account or backend is required.
- Core generation and analysis work offline.
- Security findings are explained in clear language.

## Target users

- Individuals who need strong passwords or passphrases.
- Developers and IT professionals validating password policies.
- Users learning password-security concepts.
- Privacy-conscious users who do not want to submit passwords to a remote service.

## Core outcomes

1. Generate a secure password in under 10 seconds.
2. Understand why a password is strong or weak.
3. Create memorable passphrases using secure local randomness.
4. Optionally check breach exposure without sending plaintext.
5. Install and use the application offline.

## Primary capabilities

- Random password generator
- Passphrase generator
- Pronounceable-password generator
- Numeric PIN generator
- Local security analyzer
- Pattern and common-password detection
- Entropy and search-space estimation
- Optional privacy-preserving breach lookup
- Session-only history, disabled by default
- Educational security guidance
- Responsive light and dark UI

## Non-goals

FacPass is not a password vault, password manager, authentication provider, cloud synchronization service, browser autofill extension, or compliance certification product.

## Success measures

- 100% of core workflows available offline.
- Zero plaintext-password network requests.
- Zero persistent password storage by default.
- WCAG 2.2 AA target met for core workflows.
- No use of `Math.random()` in security-sensitive code.
- PWA installability verified in Chromium-based browsers.

## Risks

- Browser extensions or compromised devices may observe displayed or copied passwords.
- GitHub Pages limits control over response headers.
- Crack-time estimates can mislead users if assumptions are hidden.
- Pronounceable passwords may have less entropy than uniformly random strings.

## Related documents

- `REQUIREMENTS.md`
- `../architecture/ARCHITECTURE.md`
- `../security/SECURITY.md`
- `../ux/UX.md`
- `../../AGENTS.md`
