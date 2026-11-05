# Responsive Design Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Supported layouts

- Mobile: 320 to 767 CSS px
- Tablet: 768 to 1,023 CSS px
- Desktop: 1,024 CSS px and above

Breakpoints are implementation guides, not device assumptions. Layout must respond to available space.

## Mobile

- Single-column workspace
- Compact top bar and bottom or compact primary navigation
- Full-width primary actions
- Password output wraps safely without page scrolling
- Advanced controls use disclosure panels
- Minimum practical touch target of 44 by 44 CSS px

## Tablet

- Collapsible navigation
- One or two columns depending on content
- Analysis may appear below or beside generator settings when space allows

## Desktop

- Compact sidebar plus primary workspace
- Generated password remains visually dominant
- Settings and analysis may use balanced columns
- Avoid excessively wide text; cap reading widths

## Installed PWA windows

The UI must tolerate narrow desktop windows, display cutouts, mobile safe-area insets, and browser UI changes. Use CSS environment variables where appropriate.

## Content resilience

- Support 200% zoom.
- Support long translated labels.
- Prevent truncation of security explanations.
- Use wrapping or horizontal scrolling only inside the password value component when necessary, never at page level.

## Verification matrix

Test at 320x568, 390x844, 768x1024, 1024x768, 1440x900, and a narrow installed-window layout. Also test landscape mobile and 200% browser zoom.
