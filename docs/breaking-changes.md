# Version Transition Guide
## Management of Breaking Changes and Migration Pathways

This document details significant architectural modifications and provides migration pathways for existing implementations.

## Table of Contents
*   [v0.7.x Architectural Transition](#v07x-architectural-transition)

---

[← Previous: Architecture and Contribution Guide](./development.md) | [Return to Overview](../README.md)

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
