# AGENTS.md

Status: Approved for implementation
Version: 2.0
Last Updated: 2026-11-05
Owner: Project Team

## Purpose

This file defines the mandatory rules for every human developer and AI coding agent working on FacPass. Detailed requirements are under `/docs` and are part of the source of truth.

## Mission

Build a local-first, offline-capable, browser-only password generator and security analyzer deployed as a static PWA on GitHub Pages.

## Required reading

Always read this file. Then read the documents relevant to the task:

- Product work: `docs/product/`
- Architecture/PWA/data flow: `docs/architecture/`
- Randomness, hashing, storage, networking, clipboard, or security scoring: `docs/security/`
- UI work: `docs/ux/`
- Stack, tests, deployment, or code conventions: `docs/engineering/`

## Non-negotiable rules

1. Use `crypto.getRandomValues()` for all security-sensitive randomness.
2. Use reviewed rejection sampling; never use naive modulo mapping.
3. Never use `Math.random()` for passwords, passphrases, PINs, shuffling, or security tokens.
4. Never transmit plaintext passwords.
5. Never log passwords or include them in errors, analytics, URLs, or diagnostics.
6. Never persist passwords in localStorage, IndexedDB, cookies, Cache Storage, or files.
7. History is disabled by default and may use only memory or sessionStorage after explicit opt-in.
8. Core generation and analysis must work offline.
9. No backend, account, remote database, Firebase, Supabase, or serverless function without an approved ADR and threat-model change.
10. No client-side secret is valid; anything shipped to the browser is public.
11. Optional breach checking must hash locally, transmit only the approved prefix, and compare locally.
12. Do not claim guaranteed security, exact crack time, or regulatory compliance.
13. Service workers must cache only approved static assets, never sensitive input or user-specific breach data.
14. Security-sensitive logic must be isolated from React components and covered by tests.
15. Do not weaken or delete security tests to make CI pass.

## Approved stack

React, strict TypeScript, Vite, Tailwind CSS, `vite-plugin-pwa`, Web Crypto API, Vitest, React Testing Library, Playwright, GitHub Actions, and GitHub Pages. Use React state first. New runtime dependencies require justification and review.

## Product boundaries

In scope: secure password/passphrase/PIN generation, local analysis, explanations, optional privacy-preserving breach lookup, offline PWA, responsive themes, accessibility, and session-only opt-in history.

Out of scope: password vault, user accounts, cloud synchronization, autofill extension, team sharing, advertising, remote analytics, AI-generated passwords, and plaintext export collections.

## Agent workflow

1. Read relevant specifications.
2. Identify security, privacy, storage, network, PWA, and accessibility impact.
3. Implement the smallest safe change.
4. Reuse reviewed security utilities.
5. Add positive, negative, and failure-path tests.
6. Run type check, lint, tests, security scans, and production build.
7. Inspect changed code for secret leakage.
8. Update affected documentation.
9. Summarize changes, tests, and residual risks.

## Stop conditions

Stop and report a conflict if a task requires plaintext transmission, persistent password storage, weak randomness, a frontend secret, an unapproved backend or external endpoint, hidden tracking, misleading security claims, or removal of a required control.

## Definition of done

A change is complete only when acceptance criteria pass, quality checks succeed, core offline behavior remains intact, no sensitive value is transmitted/logged/persisted, accessibility and responsive behavior are verified, GitHub Pages base-path build succeeds, and documentation matches implementation.

## Precedence

1. Security/privacy rules in this file
2. Approved `/docs` specifications
3. Approved ADRs
4. Task acceptance criteria
5. Existing conventions

When uncertain, choose the option that keeps data local, minimizes retention/dependencies, preserves offline behavior, and is easiest to audit.
