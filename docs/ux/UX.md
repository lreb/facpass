# UX Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Experience principles

- Calm, focused, and friendly
- Private by design
- Clear before clever
- Progressive disclosure
- Actionable security education
- No fear, shame, or absolute guarantees

## Information architecture

Primary destinations:

1. Generate
2. Analyze
3. Learn
4. Settings

History appears only when enabled and may be integrated into Generate rather than occupying permanent navigation.

## Generate workspace

Priority order:

1. Generated value
2. Strength label and concise explanation
3. Copy and Regenerate
4. Generator mode
5. Length or word count
6. Common options
7. Advanced settings
8. Detailed analysis

Passwords should be masked by default only if usability testing supports it; provide an explicit show/hide control with an accessible name. Do not make copying dependent on revealing the value.

## Analyze workspace

- Explain that analysis is local.
- Provide password field, show/hide, Analyze, and Clear.
- Avoid auto-submitting data to external services.
- Present overall rating followed by findings and improvements.
- Breach status is a separate optional action.

## First-run experience

A short first-run panel should communicate:

- Generated locally
- Works offline after installation
- No account
- No tracking
- Passwords do not leave the device

Primary action: `Generate a password`.

## Feedback patterns

- Copy: concise toast/live announcement.
- Invalid settings: inline message near the control.
- Offline: passive indicator plus contextual message on online-only action.
- Update available: non-blocking prompt.
- Breach found: calm, direct recommendation to stop using and replace the password.

## Writing style

Prefer: `This password contains a common word and a predictable year.`

Avoid: `This password is terrible.`

Prefer: `Estimated under the selected offline-attack assumptions.`

Avoid: `Impossible to crack.`

## Motion

Use subtle transitions for state changes. Respect `prefers-reduced-motion`. Never delay a security action for decorative animation.
