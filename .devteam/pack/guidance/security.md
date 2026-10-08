Look specifically for: `dangerouslySetInnerHTML` or direct DOM writes with consumer-supplied content (a component library is a cross-site-scripting surface for every app that installs it); URLs from props used in `href`/`src` without checking the scheme; `eval`, `new Function`, or dynamic `import()` of consumer-supplied strings; secrets, tokens or registry credentials in source, in `package.json` scripts, in `.npmrc` or in test fixtures; install-time scripts (`preinstall`, `postinstall`) in the library; new dependencies (supply chain: who maintains them, how many transitive packages they add); and anything the packed file list would publish that should not leave the repository.


## About this existing project

This is an existing project that was not created by DevTeam. Extend it; never recreate or restructure it. Follow the conventions already in its code, and reuse what is already there.

- Library (an npm package, TypeScript): in `.`. Its scripts: dev, build, lint, lint:fix, format, test, test:coverage, size, type-check, validate-package, prepare, prepublishOnly.
- Features live in: `src`.

Not set up in this project (so nothing proves these yet):
- Install and import the packed library: Nothing installs the packed library into a scratch project and imports it (no scripts/consumer-smoke.mjs).
- Size budget: The project has no .size-limit.json, so this check has nothing to run.
- Documentation is complete: The project has no scripts/check-docs.mjs, so this check has nothing to run.
Where you touch code, add automated tests for it (write the test for the existing behaviour first, then change the code). Do not create the missing scaffolding unless the request asks for it.
