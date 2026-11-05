# Cryptography Specification

Status: Approved for implementation
Version: 1.0
Last Updated: 2026-11-05
Owner: Project Team

## Approved primitives

- Randomness: `crypto.getRandomValues()`
- Hashing for approved breach lookup: Web Crypto `subtle.digest` with the algorithm required by the external protocol
- Text conversion: `TextEncoder`

Do not invent cryptographic algorithms.

## Unbiased integer selection

For a target range `[0, n)`, validate that `n` is a positive safe integer. Draw from a fixed unsigned range and reject values above the largest evenly divisible boundary before applying modulo.

Conceptually:

```text
limit = floor(sourceRange / n) * n
repeat draw x until x < limit
return x mod n
```

The implementation must support the maximum configured character set and be unit tested at boundary values.

## Password generation

- Build the allowed character pool from validated user options.
- Fail if the pool is empty.
- Select every character through the approved unbiased utility.
- When minimum class counts are enabled, generate required characters securely, fill remaining positions securely, and perform a cryptographically secure unbiased shuffle.
- Never use array sorting with a random comparator.

## Passphrases

Strength is based on the actual number of valid words and word count:

`entropy ≈ wordCount × log2(wordListSize)`

Adjust the model if filters reduce the selectable list. Separators and predictable formatting should not be counted as independent entropy unless they are selected randomly from a documented set.

## Pronounceable passwords

Model strength from the actual generation grammar, not from a naive full-alphabet assumption. Document that pronounceability introduces structure and can reduce the search space.

## PINs

A uniformly random decimal PIN of length `L` has a search space of `10^L` and approximately `L × log2(10)` bits before considering rate limits. UI guidance must distinguish online rate-limited use from offline attack scenarios.

## Entropy and scoring

Entropy is an estimate, not proof of randomness. If the product generated the value, use the generator's modeled search space. For unknown user-entered passwords, combine conservative search-space estimates with pattern, dictionary, and breach analysis.

## Breach hashing

- Hash locally.
- Normalize only if the external protocol explicitly requires it. Do not silently alter passwords.
- Transmit only the approved prefix.
- Compare returned suffixes locally using canonical casing.
- Discard sensitive derived values after the operation as far as JavaScript permits.

## Prohibited practices

- `Math.random()`
- Homegrown PRNGs
- Random sort comparators
- Naive modulo mapping
- MD5 or SHA-1 for new security designs, except when a specific breach protocol requires SHA-1 as an identifier and not as password storage
- Client-side encryption presented as a substitute for secure password storage

## Required tests

Boundary tests, deterministic tests with injected byte sources, rejection-path tests, constraint tests, large-sample invariant tests, and checks proving no fallback to weak randomness.
