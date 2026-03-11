# Handling Interactive Elements

When using the `onRowClick` prop, clicking any element within a row will trigger the callback. This can be problematic if you have interactive elements like buttons, links, or custom inputs inside your cells.

To prevent the row click from triggering when interacting with these elements, use the `data-rt-ignore-row-click` attribute.

## The Problem: Event Bubbling
By default, browser events "bubble up" from the target element to its parents. If you have a button inside a `<tr>` that has an `onClick` handler, clicking the button will fire both the button's handler and then the row's handler.

## The Solution: Explicit Ignore Contract
The `ResponsiveTable` implements an explicit contract: any element (or ancestor of an element) with the `data-rt-ignore-row-click` attribute will cause the table to skip the row-level click logic.

### 1. Simple Buttons
For standard action buttons, simply add the attribute to the button element.

```tsx
const columns = [
  {
    displayLabel: 'Actions',
    cellRenderer: (row) => (
      <button 
        data-rt-ignore-row-click 
        onClick={() => handleDelete(row.id)}
      >
        Delete
      </button>
    )
  }
];
```

### 2. Links
If you want a link to navigate without selecting the row or triggering a row click:

```tsx
const columns = [
  {
    displayLabel: 'Profile',
    cellRenderer: (row) => (
      <a 
        href={`/users/${row.id}`}
        data-rt-ignore-row-click
      >
        View Profile
      </a>
    )
  }
];
```

### 3. Custom Components
For complex or custom components, you can wrap them in a container with the attribute, or apply it directly to the component if it forwards attributes to its root DOM element.

```tsx
const columns = [
  {
    displayLabel: 'Status',
    cellRenderer: (row) => (
      <div data-rt-ignore-row-click>
        <MyCustomToggle 
          value={row.isActive} 
          onChange={(val) => updateStatus(row.id, val)} 
        />
      </div>
    )
  }
];
```

### 4. Icons inside Buttons
The detection uses `.closest()`, so clicking an icon *inside* a button that has the attribute will correctly ignore the row click.

```tsx
const columns = [
  {
    displayLabel: 'Edit',
    cellRenderer: (row) => (
      <button data-rt-ignore-row-click onClick={() => edit(row)}>
        <i className="fa fa-edit" /> {/* Clicking here is safe! */}
      </button>
    )
  }
];
```

## Why not automatic detection?
While we could automatically ignore all `<button>` and `<a>` tags, many modern applications use custom components (like styled `div`s) that act like buttons. By requiring an explicit attribute, we provide a 100% reliable way to handle these "roundabout" implementations without introducing "magic" behavior or false positives.
