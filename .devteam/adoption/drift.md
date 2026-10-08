# How this library differs from the house standard

These are notes, not tasks. DevTeam never changes your project because of this list, and none of it blocks a run. Fix what you want, when you want; then run `devteam adopt refresh`.

## 1. The build does not add "use client" to the bundle

Next.js apps using the App Router fail to import components that use state or effects unless the bundle starts with "use client".

To fix: Add banner: '"use client";' to the rollup output options.

## 2. Test files are inside the folder the build compiles

tsconfig.json includes folders that hold tests (src/Hooks/useResponsiveTable.test.ts, src/Hooks/useTablePlugins.test.ts) and does not exclude them, so a build can fail on test-only types, or the tests can leak into the type definitions.

To fix: Add "**/*.test.*" and "**/__tests__/**" to "exclude" in tsconfig.json (or move the tests out of the folder the build compiles).

