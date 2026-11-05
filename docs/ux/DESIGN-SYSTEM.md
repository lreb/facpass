# Design System

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Visual direction

A clean, premium, product-focused interface inspired by modern developer tools: generous spacing, restrained surfaces, friendly language, and strong hierarchy. Do not copy another product's proprietary assets or exact layout.

## Tokens

Use semantic CSS variables rather than hard-coded component colors:

- `--background`
- `--surface`
- `--surface-elevated`
- `--text-primary`
- `--text-secondary`
- `--border`
- `--accent`
- `--success`
- `--warning`
- `--danger`
- `--focus`

Provide light and dark values with WCAG-aware contrast.

## Typography

Use a locally available system font stack to avoid external font requests. Recommended display sizes:

- Page title: 28 to 36 px responsive
- Section title: 20 to 24 px
- Body: 16 px minimum
- Supporting text: 14 px minimum when contrast is sufficient
- Password display: monospaced system stack, responsive, wrap-safe

## Spacing and shape

- Base spacing unit: 4 px
- Common gaps: 8, 12, 16, 24, 32 px
- Control height: at least 44 px on touch layouts
- Card radius: 12 to 16 px
- Buttons: clear primary, secondary, ghost, and danger variants

## Core components

- App shell
- Sidebar/mobile navigation
- Password display
- Strength badge
- Security finding row
- Generator mode selector
- Length control with slider and number input
- Character-class toggles
- Advanced disclosure
- Copy button
- Clear button
- Toast/live feedback
- Offline indicator
- Update prompt
- Dialog and confirmation pattern

## Security status

Never use color alone. Every state includes text and, where useful, an icon:

- Critical
- Weak
- Fair
- Good
- Strong
- Excellent
- Not checked

## Themes

Support Light, Dark, and System. Theme changes must not cause an unreadable flash. Persist only the non-sensitive preference.

## Icons

Use Lucide or another approved local SVG icon set. Icons supplement labels and must not be the sole means of identifying critical actions.
