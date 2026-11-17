---
title: Version Transition Guide
covers: src/Hooks/useTablePlugins.ts, src/UI/DesktopView.tsx, src/UI/ThemeRoot.tsx, src/Hooks/useResolvedTheme.ts, src/Styles/Theme.module.css
covers-hash: 636cd9006df2ad8c056d
---

# Version Transition Guide
## Management of Breaking Changes and Migration Pathways

This document details significant architectural modifications and provides migration pathways for existing implementations.

## Table of Contents
*   [v0.7.x Architectural Transition](#v07x-architectural-transition)

---

[← Previous: Architecture and Contribution Guide](./development.md) | [Return to Overview](../README.md)

## v0.20.0 (additive; one styling note)
The `theme` prop and the `ResponsiveTableTheme` type are new. Existing props, exports and defaults are unchanged, and the look is the same for apps that pass no `theme` and have no `body.dark`. The light colour variables are now defaults with zero specificity on `:root`, so overrides you set on `:root` or `body` keep working (and now also reach the table itself). Each table is wrapped in a `display: contents` element with a `data-rt-theme` attribute; it adds no box, so layout is unchanged. Only apps that targeted the table's hashed class to override colour variables need to move those overrides to `:root`, `body` or `[data-rt-theme]`.

## v0.7.x Architectural Transition
The v0.7.x release series introduced a fundamental internal refactor to transition from a monolithic design to an atomized architecture.

### Plugin State Persistence
**Legacy Behavior:** Internal plugins were re-instantiated during every render cycle, resulting in the loss of non-reactive state such as sort direction and filter strings.
**Revised Behavior:** The `useTablePlugins` hook now manages persistent plugin instances. While the public API remains unchanged, system performance and state consistency are significantly enhanced.

### Header Event Prioritization
**Legacy Behavior:** Header click events for sorting were intercepted and potentially discarded if a custom `onHeaderClick` callback was absent.
**Revised Behavior:** The orchestration logic now explicitly prioritizes plugin-defined event handlers to ensure functional integrity.

### Presentation Unit Encapsulation
The desktop interface is now encapsulated within the `DesktopView` internal component. Implementations that relied on specific internal DOM structures or non-modular CSS selectors may require validation against the new structural patterns.

---
**Previous:** [Architecture and Contribution Guide](./development.md) | **Next:** [Overview (README)](../README.md)
