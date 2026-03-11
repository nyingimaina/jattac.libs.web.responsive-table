# Pitfalls & Avoidance

This document tracks discovered issues, architectural gotchas, and pitfalls encountered during development to ensure they are avoided in future iterations.

## TypeScript & Linting

### 1. The `any` Type Prohibition (Strict Directive)
- **Mandate:** The use of `any` is strictly prohibited in application code. It causes lint failures that block the `npm publish` pipeline.
- **Strict Avoidance:**
    - **NEVER** use `as any` for quick casting. Define a local interface or use `unknown` with a type guard.
    - If a third-party library or native API requires dynamic property access, use a properly typed extension interface (e.g., `interface CustomEvent extends Event { ... }`).
    - **CRITICAL:** Before every commit, you **MUST** execute `npm run lint` and `npm run type-check`. A task is not "implemented" until it passes these checks locally.

### 2. Unused Variables/Imports
- **Issue:** TypeScript and ESLint are configured to fail on unused locals or imports.
- **Avoidance:** Always run `npm run type-check` and `npm run lint` after refactoring.

## Environment & Build

### 3. Build Artifact Consistency
- **Issue:** Rollup might produce multiple CSS files (e.g., `index.css` and `index.es.css`) if not explicitly named, leading to confusion for consumers.
- **Avoidance:** Explicitly name the extracted CSS file in `rollup.config.js` (e.g., `extract: 'index.css'`).
