# Configuration Specification
## Parameter Tuning and Interface Customization

This guide details advanced configuration parameters for the ResponsiveTable component, focusing on performance optimization and layout management.

## Table of Contents
*   [Header Stickiness and Positioning](#header-stickiness-and-positioning)
*   [Responsive Breakpoint Management](#responsive-breakpoint-management)
*   [Staggered Entry Animations](#staggered-entry-animations)
*   [Loading State Visualization (Skeleton Views)](#loading-state-visualization-skeleton-views)

---

[← Previous: API Reference](./api.md) | [Next: Architecture and Contribution Guide →](./development.md)

### Header Stickiness and Positioning
The component supports dual-mode sticky headers to maintain visibility of column identifiers during vertical scrolling:
1.  **Viewport Level:** Default behavior. The header maintains a fixed position relative to the browser viewport.
2.  **Container Level:** Enabled by providing a `maxHeight` property. The header maintains a fixed position relative to the scrollable container.

```tsx
<ResponsiveTable 
  data={data} 
  columnDefinitions={columns} 
  maxHeight="500px" // Activates container-level stickiness
/>
```

### Responsive Breakpoint Management
The architectural transition between tabular and card-based layouts is controlled by the `mobileBreakpoint` property. This parameter defines the width threshold in pixels.

```tsx
<ResponsiveTable 
  mobileBreakpoint={1024} // Interface transition occurs at tablet width
/>
```

### Staggered Entry Animations
To enhance UI feedback during data transitions, entry animations can be enabled. These animations use staggered delays calculated by row index to provide a predictable visual flow.

```tsx
<ResponsiveTable 
  animationProps={{
    animateOnLoad: true // Activates CSS-driven staggered entry
  }}
/>
```

### Loading State Visualization (Skeleton Views)
The `SkeletonView` component provides a structural placeholder during data initialization or high-latency fetch operations. This maintains layout stability and reduces perceived load time.

```tsx
<ResponsiveTable 
  animationProps={{
    isLoading: true // Activates structural placeholder rendering
  }}
/>
```

---
**Previous:** [API Reference](./api.md) | **Next:** [Architecture and Contribution Guide](./development.md)
