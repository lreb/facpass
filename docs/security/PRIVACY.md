# Privacy Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Privacy posture

FacPass is designed for zero collection by default. It has no account, backend database, advertising, fingerprinting, session replay, or behavioral analytics.

## Data processed locally

- Generated passwords, passphrases, and PINs
- User-entered passwords for analysis
- Strength findings
- Session-only history when explicitly enabled
- Non-sensitive preferences

## Data retained

By default, no password is retained after the active page state is cleared or the session ends. Non-sensitive preferences may persist locally.

## External communication

Core workflows make no runtime request after the application assets are available. An optional breach lookup may send only the minimum approved hash prefix after user initiation. The plaintext password and full hash are never sent.

## Consent and transparency

Before the first breach lookup, the UI must explain:

- A network request will occur.
- The password is hashed locally.
- Only a partial hash prefix is sent.
- Candidate comparison occurs locally.
- The service may observe the user's IP address as part of ordinary network operation.

## Telemetry

Telemetry is prohibited unless separately approved through a privacy and threat review. If approved later, it must be opt-in, secret-free, documented, and non-essential.

## User controls

- Clear current value
- Clear session history
- Disable history
- Reset preferences
- View privacy explanation

## Honesty requirements

Do not claim perfect anonymity, secure memory erasure, guaranteed clipboard clearing, or protection from malicious devices/extensions.

## Privacy verification

Release testing must inspect network traffic, Application Storage, Cache Storage, service-worker caches, browser history, console output, and error paths while using representative passwords.
