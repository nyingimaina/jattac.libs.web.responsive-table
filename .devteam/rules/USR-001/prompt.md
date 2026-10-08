You turn a house rule, written in plain English by the owner of an app, into automatic checks that a build tool will enforce. The rule is the owner's order: it is not a suggestion.

Rule USR-001: For the frontend use the following npm i jattac.libs.web.zest-responsive-layout, npm i jattac.libs.web.zest-file-upload, npm i jattac.libs.web.zest-tabs, npm i jattac.libs.web.responsive-table, npm i jattac.libs.web.zest-textbox, npm i jattac.libs.web.zest-sidekick-menu, npm i jattac.libs.web.zest-button, npm i jattac.libs.web.overflow-menu, and npm i jattac-web-poller in preference of any other components or native ui elements that may perform the same function

What the app looks like (a sample of its files, and its package.json when it has one):
- .eslintrc.json
- .gitignore
- .prettierrc
- CHANGELOG.md
- LICENSE
- README.md
- bug-reports/responsive-table-infinite-loop-report.md
- conductor/archive/mobile-styling-20260514/index.md
- conductor/archive/mobile-styling-20260514/metadata.json
- conductor/archive/mobile-styling-20260514/plan.md
- conductor/archive/mobile-styling-20260514/spec.md
- conductor/avoidance.md
- conductor/code_styleguides/html-css.md
- conductor/code_styleguides/javascript.md
- conductor/code_styleguides/typescript.md
- conductor/index.md
- conductor/product-guidelines.md
- conductor/product.md
- conductor/setup_state.json
- conductor/tech-stack.md
- conductor/tracks.md
- conductor/tracks/column-visibility/plan.md
- conductor/tracks/column-visibility/spec.md
- conductor/tracks/documentation/guidelines.md
- conductor/tracks/fix-lint-issues/plan.md
- conductor/tracks/fix-lint-issues/spec.md
- conductor/tracks/fix-resolution-issue/plan.md
- conductor/tracks/fix-resolution-issue/spec.md
- conductor/tracks/fix-row-click-bubbling/index.md
- conductor/tracks/fix-row-click-bubbling/metadata.json
- conductor/tracks/fix-row-click-bubbling/plan.md
- conductor/tracks/fix-row-click-bubbling/spec.md
- conductor/tracks/refactor-atomize-v2/plan.md
- conductor/tracks/refactor-atomize-v2/spec.md
- conductor/tracks/refactor-atomize/plan.md
- conductor/tracks/smart-datasource/plan.md
- conductor/tracks/smart-datasource/spec.md
- conductor/workflow.md
- coverage/clover.xml
- coverage/coverage-final.json
- coverage/lcov-report/Context/TableContext.tsx.html
- coverage/lcov-report/Context/index.html
- coverage/lcov-report/Hooks/index.html
- coverage/lcov-report/Hooks/useResponsiveTable.ts.html
- coverage/lcov-report/Hooks/useTableDataSource.ts.html
- coverage/lcov-report/Hooks/useTablePlugins.ts.html
- coverage/lcov-report/Plugins/FilterPlugin.tsx.html
- coverage/lcov-report/Plugins/SelectionPlugin.ts.html
- coverage/lcov-report/Plugins/SortPlugin.ts.html
- coverage/lcov-report/Plugins/index.html
- coverage/lcov-report/UI/DesktopView.tsx.html
- coverage/lcov-report/UI/InfiniteTable.tsx.html
- coverage/lcov-report/UI/LoadingSpinner.tsx.html
- coverage/lcov-report/UI/MobileView.tsx.html
- coverage/lcov-report/UI/NoMoreDataMessage.tsx.html
- coverage/lcov-report/UI/ResponsiveTable.tsx.html
- coverage/lcov-report/UI/SkeletonView.tsx.html
- coverage/lcov-report/UI/TableBodyCell.tsx.html
- coverage/lcov-report/UI/TableBodyRow.tsx.html
- coverage/lcov-report/UI/TableHeaderCell.tsx.html
- coverage/lcov-report/UI/TableSentinel.tsx.html
- coverage/lcov-report/UI/index.html
- coverage/lcov-report/base.css
- coverage/lcov-report/block-navigation.js
- coverage/lcov-report/favicon.png
- coverage/lcov-report/index.html
- coverage/lcov-report/prettify.css
- coverage/lcov-report/prettify.js
- coverage/lcov-report/sort-arrow-sprite.png
- coverage/lcov-report/sorter.js
- coverage/lcov.info
- docs/api.md
- docs/breaking-changes.md
- docs/configuration.md
- docs/custom-plugin-example.md
- docs/development.md
- docs/examples.md
- docs/expand-collapse.md
- docs/features.md
- docs/handling-interactive-elements.md
- docs/recommendations.md
- docs/scroll-position.md
- gemini/context/1.md
- gemini/context/2.md
- gemini/index.md
- gemini/inferences/1.md
- gemini/inferences/2.md
- gemini/inferences/3.md
- gemini/inferences/4.md
- gemini/inferences/5.md
- gemini/inferences/6.md
- gemini/inferences/7.md
- gemini/project_analysis.md
- gemini/project_memos.md
- gemini/release_git_steps.md
- jest-setup.ts
- package-lock.json
- package.json
- rollup.config.js
- set-origin-urls.sh
- src/Context/TableContext.tsx
- src/Data/IFooterColumnDefinition.ts
- src/Data/IFooterRowDefinition.ts
- src/Data/IResponsiveTableColumnDefinition.tsx
- src/Hooks/useResponsiveTable.test.ts
- src/Hooks/useResponsiveTable.ts
- src/Hooks/useTableDataSource.ts
- src/Hooks/useTablePlugins.test.ts
- src/Hooks/useTablePlugins.ts
- src/Plugins/FilterPlugin.tsx
- src/Plugins/IResponsiveTablePlugin.ts
- src/Plugins/SelectionPlugin.ts
- src/Plugins/SortPlugin.ts
- src/Styles/LoadingSpinner.module.css
- src/Styles/NoMoreDataMessage.module.css
- src/Styles/ResponsiveTable.module.css
- src/UI/DesktopView.tsx
- src/UI/DetailRow.test.tsx
- src/UI/DetailRow.tsx
- src/UI/ExpandCollapse.test.tsx
- src/UI/LoadingSpinner.tsx
- src/UI/MobileView.test.tsx
- src/UI/MobileView.tsx
- src/UI/NoMoreDataMessage.tsx
- src/UI/ResponsiveTable.onDataSourceStateChange.test.tsx
- src/UI/ResponsiveTable.test.tsx
- src/UI/ResponsiveTable.tsx
- src/UI/ScrollPosition.test.tsx
- src/UI/SkeletonView.tsx
- src/UI/SmartDataSource.test.tsx
- src/UI/TableBodyCell.tsx
- src/UI/TableBodyRow.tsx
- src/UI/TableHeaderCell.tsx
- src/UI/TableSentinel.test.tsx
- src/UI/TableSentinel.tsx
- src/index.tsx
- src/typings.d.ts
- tsconfig.json
- update-dependancies.sh

package.json:
{
  "name": "jattac.libs.web.responsive-table",
  "version": "0.19.0",
  "description": "A fully responsive, customizable, and lightweight React table component with a modern, mobile-first design and a powerful plugin system.",
  "author": {
    "name": "Nyingi Maina",
    "email": "nyingi@jattac.com"
  },
  "license": "MIT",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./dist/*.css": "./dist/*.css"
  },
  "files": [
    "dist",
    "docs",
    "README.md",
    "LICENSE"
  ],
  "sideEffects": [
    "**/*.css",
    "**/*.scss"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/nyingimaina/jattac.libs.web.responsive-table.git"
  },
  "bugs": {
    "url": "https://github.com/nyingimaina/jattac.libs.web.responsive-table/issues"
  },
  "homepage": "https://github.com/nyingimaina/jattac.libs.web.responsive-table#readme",
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "dev": "rollup -c -w",
    "build": "rollup -c",
    "lint": "eslint \"src/**/*.{ts,tsx}\"",
    "lint:fix": "eslint \"src/**/*.{ts,tsx}\" --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "size": "size-limit",
    "type-check": "tsc --noEmit",
    "validate-p
…


Write checks of these kinds only:
- "pattern": looks line by line in every file matching the "files" patterns (paths relative to the app folder, forward slashes, ** and * allowed) and FAILS if the regular expression in "forbid" matches a line. Use this to forbid what the rule forbids (for example a native element or an import the rule says not to use).
- "command": runs a shell command in "workingDir" (relative to the app folder) and FAILS if it exits with a non-zero code. Use it only when no pattern can decide the rule (for example a dependency that must be present). The owner is shown the command before anything is saved.

Also give two short snippets: "good" (code that follows the rule) and "bad" (code that breaks it). Every pattern check is tested against them: the pattern checks together must match the bad example, and none may match the good example. If the rule has parts no check can decide, say what in "cannotTest" (a reviewer will judge those). If NO check can decide the rule at all, answer with an empty "checks" list and explain in "cannotTest".

Be precise: a check must not fire on code that follows the rule. Prefer few, reliable checks (at most 6). Never write a check that matches every line.

Write ONLY a JSON file at D:\work\nyingi\code\systems\jattac-web-libs\Jattac.Libs.Web.ResponsiveTable\.devteam\rules\USR-001\result.json with exactly this shape:
{ "checks": [ { "name": "short plain name", "kind": "pattern", "files": ["web/src/**/*.tsx"], "forbid": "<button[ >]" } ], "good": "snippet", "bad": "snippet", "cannotTest": "" }
Do not change any other file.