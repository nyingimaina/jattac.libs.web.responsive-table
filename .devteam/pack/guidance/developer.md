Stack: a React component library (TypeScript, Rollup, CSS Modules, Vitest + Testing Library). Copy the pattern of the existing components in `UI/components/`: one folder per component with the component, its `.module.css` and its types; export it from `UI/index.ts` (named exports only).

- Tests live in `tests/` (mirroring `UI/`), never beside the source: files under the folders `tsconfig.json` compiles break the build's type check. Test behaviour through the rendered output with Testing Library (roles, labels, text), not implementation details. Name each test after the requirement it proves.
- Run, cheapest first and stopping at the first failure (chain with `&&`): `npm run typecheck`, then `npx vitest run <the test file>`. At the end of your step run once: `npm run build && npm run test:coverage`. The package checks (attw, publint, the size budget, the installed-library test) are re-run automatically, so run `npm run validate-package` yourself only if you changed `package.json`, the build config or an export.
- Coverage may not fall: add tests for every line you add, and for the behaviour of any code you change before you change it.
- Styles: CSS variables for colour with light, dark and system values, `rem` for sizes (px only for borders), mobile first, a visible keyboard focus style. Components are keyboard-operable with the right ARIA role and an accessible name.
- Performance: no sorting, filtering or mapping of the whole data set inside render without `useMemo`; long lists are paged or virtualized; every effect and event listener cleans up; callbacks passed to children are stable (`useCallback`) where they would cause re-renders.
- Never `console.log`. Never add a dependency without it being in the design. Never change what `UI/index.ts` exports unless the design says so; if you do, update `docs/breaking-changes.md` and the version in `package.json`.
- Documentation is part of the change: update `README.md` and the pages in `docs/` that the change touches (each has Previous/Next links; `npm run check-docs` verifies them), with a working example for anything new.
- Do not publish, tag, or merge. Publishing to npm is always the builder's own step.


## About this existing project

This is an existing project that was not created by DevTeam. Extend it; never recreate or restructure it. Follow the conventions already in its code, and reuse what is already there.

- Library (an npm package, TypeScript): in `.`. Its scripts: dev, build, lint, lint:fix, format, test, test:coverage, size, type-check, validate-package, prepare, prepublishOnly.
- Features live in: `src`.

Not set up in this project (so nothing proves these yet):
- Install and import the packed library: Nothing installs the packed library into a scratch project and imports it (no scripts/consumer-smoke.mjs).
- Size budget: The project has no .size-limit.json, so this check has nothing to run.
- Documentation is complete: The project has no scripts/check-docs.mjs, so this check has nothing to run.
Where you touch code, add automated tests for it (write the test for the existing behaviour first, then change the code). Do not create the missing scaffolding unless the request asks for it.
