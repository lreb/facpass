# PWA Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Goals

- Installable on supported desktop and mobile browsers.
- Core generation and analysis available offline after initial load.
- Safe, predictable updates.
- Standalone app-like experience.

## Manifest

The manifest MUST define name, short name, description, start URL, scope, standalone display mode, theme/background colors, and appropriate icons. Start URL and scope MUST include the GitHub Pages repository base path.

Recommended shortcuts:

- Generate password
- Generate passphrase
- Analyze password

Shortcuts MUST NOT include sensitive values.

## Service worker

Use `vite-plugin-pwa` with an explicit caching strategy.

Precache:

- Versioned application assets
- Icons
- Local word lists
- Static educational content

Never cache:

- Passwords or analyzer values
- Session history
- Clipboard content
- URL parameters containing sensitive data
- Breach responses associated with a user query

## Offline UX

- Show an unobtrusive offline indicator.
- Keep Generate, Analyze, Learn, and Settings usable.
- Disable breach lookup with a concise explanation.
- Do not display a blocking full-page offline error.

## Update UX

Use a user-visible update prompt when a new service worker is ready. Do not refresh automatically while sensitive unsaved content is visible. After user approval, clear transient sensitive state before reload.

## Install UX

Display installation guidance only when supported and useful. Do not repeatedly nag users who dismiss it. iOS-specific Add to Home Screen guidance MAY be provided when native install prompting is unavailable.

## Validation

- Manifest validation
- Service-worker registration test
- Offline Playwright test
- GitHub Pages base-path test
- Update-flow test
- Cache inspection confirming no sensitive values
