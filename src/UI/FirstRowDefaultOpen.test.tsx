import React, { createRef } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable, { ResponsiveTableHandle } from './ResponsiveTable';

type Row = { name: string };

const columns = [
  { displayLabel: 'Name', cellRenderer: (row: Row) => row.name },
];
const data: Row[] = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }];

function setViewport(width: number) {
  global.innerWidth = width;
  fireEvent(window, new Event('resize'));
}

const renderer = (row: Row) => <div>{row.name}-details</div>;

// Row toggles only (the mobile section header is also a button with aria-expanded).
const chevrons = () =>
  screen.getAllByRole('button').filter(b => b.hasAttribute('aria-expanded') && !b.hasAttribute('data-testid'));

describe.each([
  ['desktop', 1024],
  ['mobile', 400],
])('firstRowDefaultOpen (%s)', (_label, width) => {
  beforeEach(() => {
    window.localStorage.clear();
    setViewport(width as number);
  });

  it('keeps every row collapsed by default (prop omitted)', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} />);
    screen.getAllByRole('button').forEach(b => expect(b).toHaveAttribute('aria-expanded', 'false'));
    expect(screen.queryByText('Alice-details')).toBeNull();
  });

  it('keeps every row collapsed when firstRowDefaultOpen={false}', () => {
    render(
      <ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} firstRowDefaultOpen={false} />
    );
    expect(screen.queryByText('Alice-details')).toBeNull();
  });

  it('expands only the first row when firstRowDefaultOpen is true', () => {
    render(
      <ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} firstRowDefaultOpen />
    );
    const [alice, bob, carol] = chevrons();
    expect(alice).toHaveAttribute('aria-expanded', 'true');
    expect(bob).toHaveAttribute('aria-expanded', 'false');
    expect(carol).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Alice-details')).toBeInTheDocument();
    expect(screen.queryByText('Bob-details')).toBeNull();
  });

  it('opens the first row that actually has expandable content', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={row => (row.name === 'Bob' ? <div>Bob-details</div> : null)}
        firstRowDefaultOpen
      />
    );
    expect(screen.getByText('Bob-details')).toBeInTheDocument();
  });

  it('is ignored when defaultExpandedIds is provided', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={renderer}
        firstRowDefaultOpen
        defaultExpandedIds={[1]}
      />
    );
    expect(screen.queryByText('Alice-details')).toBeNull();
    expect(screen.getByText('Bob-details')).toBeInTheDocument();
  });

  it('is ignored when defaultExpandedIds is an empty array', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={renderer}
        firstRowDefaultOpen
        defaultExpandedIds={[]}
      />
    );
    expect(screen.queryByText('Alice-details')).toBeNull();
  });

  it('does nothing without expandRowRenderer', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} firstRowDefaultOpen />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('opens the first row once data arrives after mount', () => {
    const { rerender } = render(
      <ResponsiveTable data={[]} columnDefinitions={columns} expandRowRenderer={renderer} firstRowDefaultOpen />
    );
    rerender(
      <ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} firstRowDefaultOpen />
    );
    expect(screen.getByText('Alice-details')).toBeInTheDocument();
  });

  it('does not reopen the row after the user collapses it and data refreshes', () => {
    const { rerender } = render(
      <ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} firstRowDefaultOpen />
    );
    const alice = chevrons()[0];
    fireEvent.click(alice);
    expect(alice).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <ResponsiveTable
        data={[...data, { name: 'Dave' }]}
        columnDefinitions={columns}
        expandRowRenderer={renderer}
        firstRowDefaultOpen
      />
    );
    chevrons()
      .forEach(b => expect(b).toHaveAttribute('aria-expanded', 'false'));
  });

  it('lets the imperative handle collapse the auto-opened row', () => {
    const ref = createRef<ResponsiveTableHandle<Row>>();
    render(
      <ResponsiveTable ref={ref} data={data} columnDefinitions={columns} expandRowRenderer={renderer} firstRowDefaultOpen />
    );
    act(() => ref.current!.collapseRows(0));
    const alice = chevrons()[0];
    expect(alice).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not play the greeting animation on the auto-opened row', () => {
    render(
      <ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} firstRowDefaultOpen />
    );
    const [alice, bob] = chevrons();
    expect(alice.className).not.toMatch(/expandChevronGreeting/);
    expect(bob.className).toMatch(/expandChevronGreeting/);
  });

  describe('discoveryStorageKey', () => {
    const KEY = 'rt-discovery:orders';

    it('opens the first row and does not write the flag by itself', () => {
      render(
        <ResponsiveTable
          data={data}
          columnDefinitions={columns}
          expandRowRenderer={renderer}
          firstRowDefaultOpen
          discoveryStorageKey="orders"
        />
      );
      expect(screen.getByText('Alice-details')).toBeInTheDocument();
      expect(window.localStorage.getItem(KEY)).toBeNull();
    });

    it('writes the flag when the user toggles any row', () => {
      render(
        <ResponsiveTable
          data={data}
          columnDefinitions={columns}
          expandRowRenderer={renderer}
          firstRowDefaultOpen
          discoveryStorageKey="orders"
        />
      );
      const bob = chevrons()[1];
      fireEvent.click(bob);
      expect(window.localStorage.getItem(KEY)).toBe('1');
    });

    it('does not auto-open when the flag is already stored', () => {
      window.localStorage.setItem(KEY, '1');
      render(
        <ResponsiveTable
          data={data}
          columnDefinitions={columns}
          expandRowRenderer={renderer}
          firstRowDefaultOpen
          discoveryStorageKey="orders"
        />
      );
      expect(screen.queryByText('Alice-details')).toBeNull();
    });

    it('scopes the flag per key', () => {
      window.localStorage.setItem('rt-discovery:other', '1');
      render(
        <ResponsiveTable
          data={data}
          columnDefinitions={columns}
          expandRowRenderer={renderer}
          firstRowDefaultOpen
          discoveryStorageKey="orders"
        />
      );
      expect(screen.getByText('Alice-details')).toBeInTheDocument();
    });

    it('survives a storage that throws', () => {
      const spy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
      expect(() =>
        render(
          <ResponsiveTable
            data={data}
            columnDefinitions={columns}
            expandRowRenderer={renderer}
            firstRowDefaultOpen
            discoveryStorageKey="orders"
          />
        )
      ).not.toThrow();
      spy.mockRestore();
    });
  });
});
