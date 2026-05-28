import '@testing-library/jest-dom';

// Mock ZestTextbox with a plain input so its theme/animation effects don't run in jsdom
jest.mock('jattac.libs.web.zest-textbox', () => ({
  __esModule: true,
  default: ({ value, onChange, placeholder, className }: {
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    className?: string;
    zest?: unknown;
  }) => {
    const React = require('react');
    return React.createElement('input', { value, onChange, placeholder, className, 'data-testid': 'zest-textbox' });
  },
}));