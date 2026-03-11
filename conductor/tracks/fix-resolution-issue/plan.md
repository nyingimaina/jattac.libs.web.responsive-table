# Implementation Plan: Fix Package Resolution Issue

## Atoms
1.  **[BUILD-FIX]** Update `rollup.config.js` to output both **CommonJS** (`index.js`) and **ES Modules** (`index.es.js`) into the `dist/` directory, matching the `package.json` specifications.
2.  **[PACKAGE-FIX]** Ensure the `package.json` names correctly align with the `rollup` output (including the `exports` and `types` fields).
3.  **[VERIFY]** Run `npm run build` and confirm the `dist/` directory contains all required files and matches the `package.json` expectations.
