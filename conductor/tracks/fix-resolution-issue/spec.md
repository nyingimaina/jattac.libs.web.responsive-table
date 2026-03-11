# Specification: Resolve Client App Import Failure

## Problem
Client applications (specifically Next.js) are unable to resolve the package `jattac.libs.web.responsive-table` even though it is added to `package.json` and imported correctly.

## Root Cause Analysis
The package's `package.json` specifies an ES module entry point at `./dist/index.es.js` and a CommonJS entry point at `./dist/index.js`.
However, the current `rollup.config.js` is only configured to output a single CommonJS bundle into `dist/index.js`.
As Next.js defaults to ES modules for modern imports, it fails to find the `./dist/index.es.js` file, leading to the "Can't resolve" error.

## Requirements
1.  Update `rollup.config.js` to output both **CommonJS** (`dist/index.js`) and **ES Modules** (`dist/index.es.js`).
2.  Ensure that the filenames in `dist/` exactly match the `exports`, `main`, and `module` fields in `package.json`.
3.  Maintain current TypeScript declaration generation (`dist/index.d.ts`).
4.  Optionally, use `rollup-plugin-dts` to bundle the `.d.ts` files into a single, clean declaration if necessary (for better compatibility).

## Constraints
- Do not change the package name or its public API.
- Adhere to the project's existing build system (Rollup).
- Ensure that the CSS is correctly exported and resolvable.
