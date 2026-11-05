# Approved Technology Stack

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Runtime and hosting

- Browser runtime
- Static deployment on GitHub Pages
- No backend or database

## Application

- React
- TypeScript in strict mode
- Vite
- Tailwind CSS
- Radix UI primitives when an accessible primitive is necessary
- Lucide icons

## PWA

- `vite-plugin-pwa`
- Workbox through the plugin where needed
- Web App Manifest
- Service Worker

## Browser APIs

- Web Crypto API
- Clipboard API after explicit user action
- `sessionStorage` only for opt-in password history
- localStorage or IndexedDB only for non-sensitive preferences

## State

Use React hooks and context by default. Zustand requires a documented demonstrated need. Redux is not planned.

## Quality

- ESLint
- Prettier
- Vitest
- React Testing Library
- Playwright
- axe-core
- TypeScript compiler

## CI/CD and security

- GitHub Actions
- GitHub Pages deployment action
- Dependabot
- CodeQL
- npm audit as an advisory signal, with reviewed exceptions rather than blind upgrades

## Package manager

Use npm with a committed `package-lock.json` unless the repository explicitly standardizes on another manager before implementation begins.

## Prohibited by default

- Next.js
- Backend frameworks
- Firebase/Supabase
- Remote analytics SDKs
- External script CDNs
- Client-side secrets
- Cryptography libraries replacing adequate Web Crypto primitives
