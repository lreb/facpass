# Architecture Decision Records

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## ADR process

This file is the index for architecture decisions. Add new decisions as numbered sections or separate files under `docs/architecture/adr/` when the record becomes substantial.

## ADR-001: Static browser-only PWA

**Status:** Accepted

**Decision:** Deploy a static PWA to GitHub Pages with no backend.

**Reason:** Core generation and analysis do not require a server. This reduces cost, operational burden, data exposure, and attack surface.

**Consequences:** No server-held secrets, accounts, synchronization, custom server headers, or server-side routing.

## ADR-002: React, TypeScript, and Vite

**Status:** Accepted

**Decision:** Use React, strict TypeScript, and Vite.

**Reason:** Strong ecosystem, static-build support, maintainable component model, and straightforward GitHub Pages/PWA integration.

**Rejected alternatives:** Next.js because SSR and server features are unnecessary; a custom framework because it increases maintenance.

## ADR-003: Web Crypto as the randomness source

**Status:** Accepted

**Decision:** Use `crypto.getRandomValues()` with reviewed rejection sampling.

**Reason:** Browser-native cryptographically secure randomness without another dependency.

## ADR-004: No persistent password history

**Status:** Accepted

**Decision:** History is disabled by default and limited to memory or sessionStorage after explicit opt-in.

**Reason:** Persistent history creates disproportionate privacy and device-compromise risk.

## ADR-005: Progressive disclosure in UI

**Status:** Accepted

**Decision:** Present common controls first and place specialized policy settings in an Advanced section.

**Reason:** A simple default path improves usability without removing expert control.

## ADR-006: Hash-compatible routing

**Status:** Accepted

**Decision:** Prefer hash routing unless deployment validation proves another static-compatible approach reliable.

**Reason:** GitHub Pages does not provide arbitrary SPA rewrite rules.
