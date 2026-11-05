# FacPass

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Overview

FacPass is a privacy-first password generator and security analyzer designed as a browser-only Progressive Web App for deployment on GitHub Pages.

The project is currently in the specification phase. The repository documentation is the source of truth for implementation.

## Product principles

- Local-first
- Offline-capable
- No backend
- No account
- No plaintext-password transmission
- No persistent password history by default
- Secure Web Crypto randomness
- Accessible and responsive

## Documentation map

### Start here

1. `AGENTS.md` for mandatory rules
2. `docs/product/PRODUCT.md` for vision and boundaries
3. `docs/product/REQUIREMENTS.md` for functional and non-functional requirements
4. `docs/architecture/ARCHITECTURE.md` for system design
5. `docs/security/SECURITY.md` and `docs/security/THREAT-MODEL.md` before security-sensitive work

### By work type

- Generator: `REQUIREMENTS.md`, `CRYPTOGRAPHY.md`, `TESTING.md`
- Analyzer: `REQUIREMENTS.md`, `SECURITY.md`, `TESTING.md`
- Breach check: `DATA-FLOW.md`, `THREAT-MODEL.md`, `PRIVACY.md`
- UI: `UX.md`, `DESIGN-SYSTEM.md`, `RESPONSIVE.md`, `ACCESSIBILITY.md`
- PWA/deployment: `PWA.md`, `DEPLOYMENT.md`

## Planned stack

React, TypeScript, Vite, Tailwind CSS, Web Crypto API, `vite-plugin-pwa`, Vitest, React Testing Library, Playwright, GitHub Actions, and GitHub Pages.

## Current status

- Product specification: complete
- Architecture specification: complete
- Security specification: complete
- UX specification: complete
- Engineering specification: complete
- Application implementation: not started

## Critical rule

Never use `Math.random()` or another weak or homegrown random source for password, passphrase, or PIN generation.
