import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from './ResponsiveTable';

const columns = [
  { displayLabel: 'Name', cellRenderer: (row: { name: string }) => row.name },
];
const data = [
  { name: 'Alice' },
  { name: 'Bob' },
  { name: 'Carol' },
];

function forceDesktop() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false, media: query, onchange: null,
      addListener: jest.fn(), removeListener: jest.fn(),
      addEventListener: jest.fn(), removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

function forceMobile() {
  global.innerWidth = 400;
  fireEvent(window, new Event('resize'));
}

describe('ResponsiveTable expand/collapse (desktop)', () => {
  beforeEach(forceDesktop);

  it('renders no toggle buttons when expandRowRenderer is not provided', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders a toggle for each row when expandRowRenderer returns content', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={() => <div>details</div>}
      />
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('renders no toggle for rows where expandRowRenderer returns null', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => row.name === 'Bob' ? <div>Bob details</div> : null}
      />
    );
    // Only Bob gets a toggle
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('toggle buttons start as + (collapsed)', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={() => <div>details</div>}
      />
    );
    screen.getAllByRole('button').forEach(btn => expect(btn).toHaveTextContent('+'));
  });

  it('clicking + expands the row and shows content', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => <div>{row.name}-details</div>}
      />
    );
    const [aliceBtn] = screen.getAllByRole('button');
    expect(aliceBtn).toHaveTextContent('+');
    fireEvent.click(aliceBtn);
    expect(aliceBtn).toHaveTextContent('−');
    expect(screen.getByText('Alice-details')).toBeInTheDocument();
  });

  it('clicking − collapses the row', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => <div>{row.name}-details</div>}
      />
    );
    const [aliceBtn] = screen.getAllByRole('button');
    fireEvent.click(aliceBtn); // expand
    expect(aliceBtn).toHaveTextContent('−');
    fireEvent.click(aliceBtn); // collapse
    expect(aliceBtn).toHaveTextContent('+');
  });

  it('expanding one row does not expand others', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => <div>{row.name}-details</div>}
      />
    );
    const [aliceBtn] = screen.getAllByRole('button');
    fireEvent.click(aliceBtn);
    expect(screen.getByText('Alice-details')).toBeInTheDocument();
    expect(screen.queryByText('Bob-details')).toBeNull();
    expect(screen.queryByText('Carol-details')).toBeNull();
  });

  it('multiple rows can be expanded independently', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => <div>{row.name}-details</div>}
      />
    );
    const [aliceBtn, bobBtn] = screen.getAllByRole('button');
    fireEvent.click(aliceBtn);
    fireEvent.click(bobBtn);
    expect(screen.getByText('Alice-details')).toBeInTheDocument();
    expect(screen.getByText('Bob-details')).toBeInTheDocument();
    expect(screen.queryByText('Carol-details')).toBeNull();
  });
});

describe('ResponsiveTable expand/collapse (mobile)', () => {
  beforeEach(forceMobile);

  it('renders no toggle buttons when expandRowRenderer is not provided', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders a toggle for each row when expandRowRenderer returns content', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={() => <div>details</div>}
      />
    );
    expect(screen.getAllByRole('button')).toHaveLength(3);
  });

  it('renders no toggle for rows where expandRowRenderer returns null', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => row.name === 'Bob' ? <div>Bob details</div> : null}
      />
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('clicking + expands the row and shows content', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => <div>{row.name}-details</div>}
      />
    );
    const [aliceBtn] = screen.getAllByRole('button');
    fireEvent.click(aliceBtn);
    expect(aliceBtn).toHaveTextContent('−');
    expect(screen.getByText('Alice-details')).toBeInTheDocument();
  });

  it('clicking − collapses the row', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => <div>{row.name}-details</div>}
      />
    );
    const [aliceBtn] = screen.getAllByRole('button');
    fireEvent.click(aliceBtn);
    fireEvent.click(aliceBtn);
    expect(aliceBtn).toHaveTextContent('+');
  });

  it('expanding one row does not expand others', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => <div>{row.name}-details</div>}
      />
    );
    const [aliceBtn] = screen.getAllByRole('button');
    fireEvent.click(aliceBtn);
    expect(screen.getByText('Alice-details')).toBeInTheDocument();
    expect(screen.queryByText('Bob-details')).toBeNull();
    expect(screen.queryByText('Carol-details')).toBeNull();
  });
});
