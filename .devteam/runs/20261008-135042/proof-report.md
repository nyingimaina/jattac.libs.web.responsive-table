# Verification report

Run `20261008-135042` · pack `react-component-library` · 1m 8s · no agent worked and nothing was changed

## Ready to ship?

**Not ready: something is still broken.**

| Status | What was checked | Evidence |
| --- | --- | --- |
| Not proven | The packed library installs and imports | The installed-library check could not run here (it is not set up in this project yet, or there is no internet connection to install into a scratch project), so the library has not been proven to work for the people who install it. |
| Blocked | Automated tests and checks pass | These failed: no-debug-leftovers, lib-validate-package. |
| Ready | The tests run the code (Library) | 82% of lines run by the tests; up 0 points since the last build. |
| Ready | Nothing was skipped | Every check that applies was run. |

_DevTeam 0.27.226_

## Checks

| Check | What happened | Time |
| --- | --- | --- |
| No secrets in code | Passed | 0.2s |
| No debugging leftovers | FAILED | 0.1s |
| Type check (library and tests) | Passed | 4.6s |
| Tests, with coverage | Passed | 18.9s |
| Build (CommonJS, ES modules, type definitions) | Passed | 7.7s |
| Package check (attw and publint) | FAILED | 22.4s |
| What would be published | Passed | 9.9s |
| Size budget | Not run | 0.1s |
| Install and import the packed library | Not run | 0.2s |
| Documentation is complete | Not run | 0.1s |

### No debugging leftovers: failed

```
3 match(es):
src/Plugins/SortPlugin.ts:120: console.log('SortPlugin: Header clicked. Target:', target);
src/Plugins/SortPlugin.ts:123: console.log('SortPlugin: Interactive element clicked, ignoring sort.');
src/Plugins/SortPlugin.ts:127: console.log('SortPlugin: Non-interactive element clicked, proceeding with sort.');
```

### Package check (attw and publint): failed

```
Failed twice in a row, so this is not a one-off.
> jattac.libs.web.responsive-table@0.20.0 validate-package
> attw --pack . && publint


jattac.libs.web.responsive-table v0.20.0

Build tools:
- @arethetypeswrong/cli@^0.18.5
- typescript@^5.2.2
- rollup@^4.2.0
- @rollup/plugin-typescript@^11.1.5

🎭 Import resolved to a CommonJS type declaration file, but an ESM JavaScript file. https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseCJS.md


"jattac.libs.web.responsive-table"

node10: 🟢 
node16 (from CJS): 🟢 (CJS)
node16 (from ESM): 🎭 Masquerading as CJS
bundler: 🟢 

***********************************

"jattac.libs.web.responsive-table/dist/*.css"

node10: (wildcard)
node16 (from CJS): (wildcard)
node16 (from ESM): (wildcard)
bundler: (wildcard)

***********************************
```

### Size budget: not run

```
Not set up in this project: The project has no .size-limit.json, so this check has nothing to run.
```

### Install and import the packed library: not run

```
Not set up in this project: Nothing installs the packed library into a scratch project and imports it  no scripts/consumer-smoke.mjs .
```

### Documentation is complete: not run

```
Not set up in this project: The project has no scripts/check-docs.mjs, so this check has nothing to run.
```

## Browser journeys

**Not run:** you chose not to run them for this run. A real browser was not used on this build.

