Look specifically for: exports added, removed or changed in `UI/index.ts` that the design did not name (LIB-001); a breaking change without an entry in `docs/breaking-changes.md` and a matching version bump; `react`, `react-dom` or another peer in `dependencies`, or missing from the Rollup `external` list (LIB-004); a new dependency without a stated reason (DEP-001); work inside render that grows with the data (sort, filter, map over a large array) without `useMemo`, long lists that are neither paged nor virtualized, effects or listeners that do not clean up, state that grows without bound, callbacks recreated on every render and passed to memoized children (EFF-002); colours that are not CSS variables, `px` sizes other than borders, missing focus styles, missing ARIA roles or accessible names, controls that cannot be used with the keyboard (UI-001); tests placed beside the source or inside a folder `tsconfig.json` compiles; tests that assert nothing specific; documentation that does not match the code, a missing example for something new, or broken Previous/Next links (DOC-001); a raised size budget that is not a recorded decision (EFF-001).


## About this existing project

This is an existing project that was not created by DevTeam. Extend it; never recreate or restructure it. Follow the conventions already in its code, and reuse what is already there.

- Library (an npm package, TypeScript): in `.`. Its scripts: dev, build, lint, lint:fix, format, test, test:coverage, size, type-check, validate-package, prepare, prepublishOnly.
- Features live in: `src`.

Not set up in this project (so nothing proves these yet):
- Install and import the packed library: Nothing installs the packed library into a scratch project and imports it (no scripts/consumer-smoke.mjs).
- Size budget: The project has no .size-limit.json, so this check has nothing to run.
- Documentation is complete: The project has no scripts/check-docs.mjs, so this check has nothing to run.
Where you touch code, add automated tests for it (write the test for the existing behaviour first, then change the code). Do not create the missing scaffolding unless the request asks for it.
