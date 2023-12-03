# FormField React Component

FormField is a powerful React component designed to streamline the creation of form fields with built-in support for validation, labels, hints, and optional indicators.

## Installation

```js
npm install jattac.libs.web.form-field
```

## Example

```js
import React from 'react';
import FormField from 'jattac.libs.web.form-field';

const MyForm = () => {
  const validationErrors = [
    // Your validation errors here
  ];

  return (
    <form>
      <FormField
        label="Email"
        id="email"
        validationErrors={[{ key: 'email', errors: ['Invalid email address'] }]}
        optional={true}
        hint="We'll never share your email with anyone else."
      >
        <input type="email" />
      </FormField>

      {/* Add more FormField components for other form elements */}
    </form>
  );
};
```

## Props

- **label** (required): The label for the form field.
- **id** (required): A unique identifier for the form field.
- **children** (required): The content of the form field, typically an input element.
- **validationErrors**: An array of validation errors for the form field.
- **optional**: A boolean indicating whether the field is optional. Defaults to false.
- **hint**: Additional information or guidance for the form field.
