# TypeScript 7 migration — BLOCKED

**Status:** BLOCKED (2026-09-01)  
**Pinned:** `typescript@^6.0.3` (required for `typescript-eslint`)

## Why

`typescript-eslint` still declares a peer range that excludes TypeScript 7. There is no public TypeScript 7 Compiler API yet; upstream closed TS 7 support as not planned until that API lands (~TS 7.1).

## npm peer evidence (checked 2026-09-01)

```text
$ npm view typescript-eslint@latest version peerDependencies
{ "version": "8.69.0", "peerDependencies": { "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0", "typescript": ">=4.8.4 <6.1.0" } }

$ npm view typescript-eslint@8.69.1-alpha.0 version peerDependencies
{ "version": "8.69.1-alpha.0", "peerDependencies": { "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0", "typescript": ">=4.8.4 <6.1.0" } }

$ npm view typescript@latest version
7.0.2
```

## Install failure evidence

```text
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
npm error Found: typescript@7.0.2
npm error Could not resolve dependency:
npm error peer typescript@">=4.8.4 <6.1.0" from typescript-eslint@8.69.1-alpha.0
```

## Upstream

- https://github.com/typescript-eslint/typescript-eslint/issues/12518 (TS 7 support — closed, blocked on TS 7 API)
- Side-by-side TS 6 tooling + TS 7 `tsc` is a possible interim workaround, not a full migration

## Revisit when

`typescript-eslint` peerDependencies include TypeScript 7, or Microsoft ships a TS 7 Compiler API consumed by eslint tooling.
