# Pitfalls & Avoidance

This document tracks discovered issues, architectural gotchas, and pitfalls encountered during development to ensure they are avoided in future iterations.

## TypeScript & Linting

### 1. The `any` Type Trap (Lint Failures on Publish)
- **Issue:** Using the `any` type triggers `@typescript-eslint/no-explicit-any`, which causes `npm run lint` to fail. Since `prepublishOnly` runs linting, this blocks `npm publish`.
- **Scenario:** This often happens in generic Context providers or when mocking globals (like `IntersectionObserver`) in tests.
- **Avoidance:**
    - Prefer `unknown` over `any` when possible.
    - If `any` is truly unavoidable (e.g., generic React Context initialization), use `// eslint-disable-next-line @typescript-eslint/no-explicit-any`.
    - Ensure all new test files are checked with `npm run lint` before committing.

### 2. Unused Variables/Imports
- **Issue:** TypeScript and ESLint are configured to fail on unused locals or imports.
- **Avoidance:** Always run `npm run type-check` and `npm run lint` after refactoring.

## Environment & Build

### 3. Build Artifact Consistency
- **Issue:** Rollup might produce multiple CSS files (e.g., `index.css` and `index.es.css`) if not explicitly named, leading to confusion for consumers.
- **Avoidance:** Explicitly name the extracted CSS file in `rollup.config.js` (e.g., `extract: 'index.css'`).
