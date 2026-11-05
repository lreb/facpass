# User Stories

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Generation

- As a user, I want to generate a strong password quickly so that I do not invent a predictable one.
- As a user, I want clear presets so that I can choose a sensible length without understanding every setting.
- As an advanced user, I want custom character rules so that I can satisfy a system's password policy.
- As a user, I want excluded characters respected so that I can avoid ambiguous symbols.
- As a user, I want a memorable passphrase so that I can securely remember a secret when a password manager is unavailable.

## Analysis

- As a user, I want to analyze a password locally so that I do not disclose it to a website.
- As a user, I want explanations for weaknesses so that I know how to improve the password.
- As a user, I want breach status shown separately from strength so that I understand that a strong password can still be compromised.
- As a user, I want crack-time assumptions visible so that I do not interpret an estimate as a guarantee.

## Privacy

- As a privacy-conscious user, I want the core app to work offline so that no connection is required.
- As a user, I want history disabled by default so that generated passwords are not retained unexpectedly.
- As a user, I want to clear sensitive screen content and session history immediately.
- As a user, I want to know before an external breach request occurs.

## PWA and UX

- As a mobile user, I want to install the app and use it like a native application.
- As a keyboard user, I want to complete every workflow without a mouse.
- As a low-vision user, I want strong contrast, zoom support, and non-color status labels.
- As a user, I want light, dark, and system themes.

## Engineering and maintenance

- As a maintainer, I want security-sensitive logic isolated and tested so that it is auditable.
- As a maintainer, I want deployment automated through GitHub Actions.
- As a reviewer, I want CI to detect prohibited randomness, logging, storage, and URL patterns.
