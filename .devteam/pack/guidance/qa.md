Check each requirement's acceptance criteria against the tests in the build report: a test that renders the component and asserts what a consumer sees or can do (roles, labels, text, keyboard use), not one that only checks that nothing throws. For anything visual, look for tests of the states the requirement names (empty, loading, error, long content, many rows, dark theme). For anything public, look for a test that imports it from the library's entry point, as a consumer would. Confirm the packed-library check ran (installed into a scratch project and imported under CommonJS and ES modules) and say so when it did not.


## About this existing project

This is an existing project that was not created by DevTeam. Extend it; never recreate or restructure it. Follow the conventions already in its code, and reuse what is already there.

- Library (an npm package, TypeScript): in `.`. Its scripts: dev, build, lint, lint:fix, format, test, test:coverage, size, type-check, validate-package, prepare, prepublishOnly.
- Features live in: `src`.

Not set up in this project (so nothing proves these yet):
- Install and import the packed library: Nothing installs the packed library into a scratch project and imports it (no scripts/consumer-smoke.mjs).
- Size budget: The project has no .size-limit.json, so this check has nothing to run.
- Documentation is complete: The project has no scripts/check-docs.mjs, so this check has nothing to run.
Where you touch code, add automated tests for it (write the test for the existing behaviour first, then change the code). Do not create the missing scaffolding unless the request asks for it.
