Stack: a React component library (TypeScript, Rollup, CSS Modules, Vitest). Layout: components in `UI/components/<Component>/` (the component, its `.module.css`, its types), shared helpers, hooks and styles in `UI/shared/`, tests in `tests/` (never inside the folders the build compiles), documentation in `docs/`, release scripts in `scripts/`.

- Name the public surface in the design: every export that is added, changed or removed from `UI/index.ts`, with its prop types. Anything not exported is private and may change freely.
- Say what each component costs: the dependencies it needs (prefer none; a new one must be a peer dependency or tiny, with the reason recorded), whether it keeps state, and how it behaves with a hundred times more data (paging, virtualization, memoization). Name the budget in `.size-limit.json` if the change could move it.
- Peer dependencies (`react`, `react-dom`, and any UI library the components wrap) are listed in `peerDependencies` with a range and are external in the Rollup config, including `react/jsx-runtime`. Never put them in `dependencies`.
- Styles are CSS Modules injected into the bundle (consumers import no CSS). Themes use CSS variables with light, dark and system values; sizes in `rem`; mobile first.
- The package output is dual: `dist/index.cjs` and `dist/index.mjs` with `index.d.ts` and `index.d.mts`, a `"use client"` banner, `"sideEffects": false`, and an `exports` map with `types` first. Do not change the build output layout without a decision.
- Scope must include the documentation pages the change touches and `docs/breaking-changes.md` for a breaking change. Changing `package.json` dependencies is allowed only when the design names the change and the reason.


## About this existing project

This is an existing project that was not created by DevTeam. Extend it; never recreate or restructure it. Follow the conventions already in its code, and reuse what is already there.

- Library (an npm package, TypeScript): in `.`. Its scripts: dev, build, lint, lint:fix, format, test, test:coverage, size, type-check, validate-package, prepare, prepublishOnly.
- Features live in: `src`.

Not set up in this project (so nothing proves these yet):
- Install and import the packed library: Nothing installs the packed library into a scratch project and imports it (no scripts/consumer-smoke.mjs).
- Size budget: The project has no .size-limit.json, so this check has nothing to run.
- Documentation is complete: The project has no scripts/check-docs.mjs, so this check has nothing to run.
Where you touch code, add automated tests for it (write the test for the existing behaviour first, then change the code). Do not create the missing scaffolding unless the request asks for it.
