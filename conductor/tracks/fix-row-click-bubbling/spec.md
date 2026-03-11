# Specification: Fix Row Click Event Bubbling (Explicit Contract)

## Problem Statement
When a user clicks on an interactive element (e.g., a custom button or complex component) within a table cell, the event bubbles up to the parent `<tr>`. This triggers the row's `onRowClick` or selection logic, causing unintended side effects.

## Proposed Solution: The "Ignore Contract"
Instead of attempting to "guess" if an element is clickable (which is prone to errors in custom React components), we will implement an explicit contract using a data attribute: `data-rt-ignore-row-click`.

### Mechanism
The `TableBodyRow` click handler will check if the click target (or any of its ancestors within the cell) possesses the `data-rt-ignore-row-click` attribute. If found, the row-level click logic is skipped.

## Success Criteria
- [ ] Row click is **ignored** when the target has `data-rt-ignore-row-click`.
- [ ] Row click is **ignored** when the target is a *child* of an element with `data-rt-ignore-row-click`.
- [ ] Row click **still works** on all other surfaces of the row/cell.
- [ ] Exhaustive documentation is added to README, JSDoc, and a new technical guide.
- [ ] Test coverage for the fix and the documentation examples is >= 81%.

## Documentation Requirements
- **README.md:** Add a high-level "Interactive Elements" section.
- **JSDoc:** Comprehensive `@param` and `@example` tags for `onRowClick`.
- **Technical Guide:** Create `docs/handling-interactive-elements.md` with real-world scenarios.
