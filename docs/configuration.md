---
title: Configuration Specification
covers: src/UI/ResponsiveTable.tsx, src/UI/SkeletonView.tsx, src/Styles/ResponsiveTable.module.css, src/Styles/Theme.module.css, src/Data/ResponsiveTableTheme.ts
covers-hash: 5f215582139f4ca21bd8
---

# Configuration Specification
## Parameter Tuning and Interface Customization

This guide details advanced configuration parameters for the ResponsiveTable component, focusing on performance optimization and layout management.

## Table of Contents
*   [Header Stickiness and Positioning](#header-stickiness-and-positioning)
*   [Responsive Breakpoint Management](#responsive-breakpoint-management)
*   [Staggered Entry Animations](#staggered-entry-animations)
*   [Loading State Visualization (Skeleton Views)](#loading-state-visualization-skeleton-views)
*   [Theming and Visual Customization](#theming-and-visual-customization)

---

[← Previous: API Reference](./api.md) | [Next: Architecture and Contribution Guide →](./development.md)
...
### Theming and Visual Customization
The component uses CSS variables for effortless theming. You can override these variables in your global CSS to match your application's design system.

#### Available CSS Variables
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `--primary-color` | `#007bff` | Accent color for selection and loaders. |
| `--table-header-bg` | `#f8f9fa` | Background color for table headers and mobile footers. |
| `--table-border-color` | `#e0e0e0` | Color for all borders and grid lines. |
| `--table-row-hover-bg` | `#f1f3f5` | Background color when hovering over a row. |
| `--card-shadow` | `0 2px 8px rgba(0,0,0,0.06)` | Shadow applied to mobile cards. |

#### Built-in Light, Dark and System Themes
Use the `theme` prop (`'light' | 'dark' | 'system'`), or omit it to follow `body.dark`. The default is light; the device preference is used only for `theme="system"`. An explicit prop wins over `body.dark`. The table does not remember the theme.

The variables above have separate light and dark values. The light values are defaults with zero specificity on `:root`, so overriding a variable on `:root` or `body` still works for a light table. The dark values are set on the wrapper of a dark table, so a dark table does not affect other tables or the host page. The wrapper uses `display: contents` and adds no box, so it never changes layout. State colours also have variables: `--rt-sorted-bg`, `--rt-selected-bg`, `--rt-skeleton-bg`, `--rt-skeleton-shimmer`, `--rt-spinner-track`, `--rt-detail-bg`, `--rt-sort-icon-color`, `--rt-nodata-icon-color`.

To override a variable in the dark look (a `:root` override applies to the light look), target the wrapper's `data-rt-theme` attribute:

```css
[data-rt-theme='dark'] {
  --table-header-bg: #1a1a1a;
  --table-border-color: #333333;
  --text-color: #ffffff;
  --card-bg: #121212;
}
```

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
