# Coding Standards

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## TypeScript

- Enable strict mode.
- Avoid `any`; use `unknown` plus validation when input type is uncertain.
- Use discriminated unions for generator modes and analysis states.
- Validate external and persisted data at boundaries.
- Prefer immutable values and pure domain functions.

## Architecture

- Keep security logic outside React components.
- Components render state and invoke domain services.
- One reviewed utility owns unbiased random selection.
- Pattern detectors are independent, named, and testable.
- No module may transmit or persist a password unless explicitly allowed by approved specifications.

## React

- Prefer functional components and hooks.
- Avoid derived state when it can be calculated safely.
- Keep effects narrow and cleanup subscriptions/listeners.
- Do not place passwords in global debug state or development instrumentation.
- Use accessible native controls before custom widgets.

## Errors and validation

- Clamp or reject invalid numeric ranges.
- Never display `NaN`, `Infinity`, `undefined`, or blank computed status.
- Error messages contain no sensitive values.
- External failures degrade only the affected optional feature.

## Security prohibitions

- No `Math.random()` in security-sensitive code
- No `eval` or `new Function`
- No random sort comparator
- No password logging
- No password in URL or persistent browser storage
- No unsafe HTML from user-controlled input
- No hidden runtime secrets

## Formatting and naming

- Use ESLint and Prettier.
- Name booleans with `is`, `has`, `can`, or `should` where clear.
- Use descriptive security function names such as `secureRandomInt` and `secureShuffle`.
- Document formulas, assumptions, and non-obvious rejection logic.

## Pull requests

Keep changes focused. Include purpose, security/privacy impact, tests performed, screenshots for UI changes, documentation changes, and residual risks.
