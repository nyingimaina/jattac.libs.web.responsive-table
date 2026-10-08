Stack: a React component library published to npm (TypeScript, Rollup, CSS Modules, Vitest). The "users" are developers who install it and the people who use their apps.

- Write requirements from the point of view of the developer who installs the library: what they import, which props they pass, what they see. Every new prop, export or behaviour is a requirement with an example of the code a consumer would write.
- Say whether a change is **additive** or **breaking** (a removed or renamed export, prop or type, a changed default, a changed render output that apps may style against). A breaking change needs the builder's decision before it is designed, and a note in `docs/breaking-changes.md`.
- Non-functional requirements to consider (only those the change touches): works in light, dark and system themes; keyboard use and screen-reader labels; small screens first; stays fast with a hundred times more data than the example; does not grow the bundle (the size budget in `.size-limit.json`); works in Next.js App Router apps ("use client") and in apps on React 18 and 19.
- Every requirement that adds something visible also needs a documentation requirement: where it is explained and the example that appears there.


## About this existing project

This is an existing project that was not created by DevTeam. Extend it; never recreate or restructure it. Follow the conventions already in its code, and reuse what is already there.

- Library (an npm package, TypeScript): in `.`. Its scripts: dev, build, lint, lint:fix, format, test, test:coverage, size, type-check, validate-package, prepare, prepublishOnly.
- Features live in: `src`.

Not set up in this project (so nothing proves these yet):
- Install and import the packed library: Nothing installs the packed library into a scratch project and imports it (no scripts/consumer-smoke.mjs).
- Size budget: The project has no .size-limit.json, so this check has nothing to run.
- Documentation is complete: The project has no scripts/check-docs.mjs, so this check has nothing to run.
Where you touch code, add automated tests for it (write the test for the existing behaviour first, then change the code). Do not create the missing scaffolding unless the request asks for it.
