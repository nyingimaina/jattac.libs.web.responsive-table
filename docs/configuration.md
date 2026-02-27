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

#### Example: Dark Mode Theme
```css
:root {
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
