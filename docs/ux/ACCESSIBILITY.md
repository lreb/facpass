# Accessibility Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Target

WCAG 2.2 Level AA for all core workflows.

## Keyboard

- Every action is keyboard operable.
- Focus order follows visual order.
- Focus is visible against all themes.
- Dialogs trap focus correctly and restore it on close.
- Escape closes non-destructive overlays where expected.

## Forms

- Every control has a programmatic label.
- Sliders have synchronized accessible numeric input when precision matters.
- Errors identify the control and explain correction.
- Required state and constraints are communicated to assistive technology.

## Dynamic feedback

Use restrained `aria-live` regions for copy confirmation, generation completion when needed, validation summaries, breach-result status, offline changes, and update readiness. Do not announce every keystroke during analysis.

## Visual

- Text contrast meets 4.5:1 for normal text and 3:1 for large text.
- UI component and focus contrast meet applicable WCAG requirements.
- Security state is not color-only.
- Content remains usable at 200% zoom and with text spacing overrides.

## Motion

Respect `prefers-reduced-motion`. Avoid flashing and unnecessary continuous animation.

## Password fields

Show/hide buttons need explicit labels such as `Show password` and `Hide password`. Copy confirmation must not depend solely on a visual icon.

## Testing

- Automated: axe-core in component and end-to-end tests.
- Manual: keyboard-only flow, browser zoom, high-contrast inspection, and at least one screen-reader pass using NVDA or VoiceOver.
- Test all themes and responsive layouts.

## Accessibility definition of done

A feature is incomplete if its primary path cannot be completed without a mouse, if status is color-only, or if changing state is not perceivable to assistive technology.
