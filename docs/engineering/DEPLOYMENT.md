# Deployment Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Target

GitHub Pages using GitHub Actions.

## Build configuration

- Production build created by Vite.
- `base` matches `/<repository-name>/` for a project Pages site, or `/` for a custom/user site.
- Manifest start URL and scope use the same base.
- Asset references must be base-aware.

## Routing

Prefer hash routing for multiple client views. If another method is chosen, it must be validated against direct entry and refresh behavior on GitHub Pages.

## Pipeline

On pull request:

1. Install with `npm ci`
2. Type check
3. Lint
4. Unit/component/property tests
5. Security regression scans
6. Production build
7. Playwright tests against the built app

On protected main branch after checks:

1. Build once
2. Upload Pages artifact
3. Deploy through the official Pages action
4. Run smoke checks where practical

## GitHub hardening

- Protect the main branch.
- Require pull-request review and successful checks.
- Use least-privilege workflow permissions.
- Pin actions to reviewed versions or commit SHAs.
- Do not expose secrets to pull requests from forks.
- No runtime secret is valid in a browser-only application.

## Rollback

Retain known-good release tags. Roll back by redeploying a reviewed prior commit, then investigate and add regression coverage.

## Release checklist

- Version and changelog updated
- Tests and build pass
- Offline and installability verified
- Network/storage privacy inspection complete
- Base-path and routing verified
- Security and privacy documents reflect behavior
