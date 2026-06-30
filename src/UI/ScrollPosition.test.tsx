import React, { createRef } from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable, { ResponsiveTableHandle } from './ResponsiveTable';

type Row = { name: string };

const columns = [{ displayLabel: 'Name', cellRenderer: (row: Row) => row.name }];
const data: Row[] = [{ name: 'Alice' }, { name: 'Bob' }];

function forceDesktop() {
  global.innerWidth = 1024;
  fireEvent(window, new Event('resize'));
}

// identity-obj-proxy returns the CSS module key as the class name
const tableContainerSelector = '.tableContainer';

describe('scroll position — internal container (maxHeight)', () => {
  beforeEach(forceDesktop);

  it('calls onScrollPositionChange with scrollTop on internal container scroll', () => {
    const onScroll = jest.fn();
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        maxHeight="400px"
        onScrollPositionChange={onScroll}
      />
    );

    const container = document.querySelector(tableContainerSelector) as HTMLElement;
    expect(container).not.toBeNull();

    Object.defineProperty(container, 'scrollTop', { value: 300, configurable: true });
    fireEvent.scroll(container);

    expect(onScroll).toHaveBeenCalledWith(300);
  });

  it('calls onScrollPositionChange on each successive scroll event', () => {
    const onScroll = jest.fn();
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        maxHeight="400px"
        onScrollPositionChange={onScroll}
      />
    );

    const container = document.querySelector(tableContainerSelector) as HTMLElement;

    Object.defineProperty(container, 'scrollTop', { value: 100, configurable: true });
    fireEvent.scroll(container);
    Object.defineProperty(container, 'scrollTop', { value: 200, configurable: true });
    fireEvent.scroll(container);

    expect(onScroll).toHaveBeenNthCalledWith(1, 100);
    expect(onScroll).toHaveBeenNthCalledWith(2, 200);
  });

  it('does not register a window scroll listener when maxHeight is set', () => {
    const onScroll = jest.fn();
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        maxHeight="400px"
        onScrollPositionChange={onScroll}
      />
    );

    fireEvent.scroll(window);

    expect(onScroll).not.toHaveBeenCalled();
  });

  it('ref.scrollTo() calls scrollTo on the internal container', () => {
    const ref = createRef<ResponsiveTableHandle<Row>>();
    render(
      <ResponsiveTable
        ref={ref}
        data={data}
        columnDefinitions={columns}
        maxHeight="400px"
      />
    );

    const container = document.querySelector(tableContainerSelector) as HTMLElement;
    const scrollToMock = jest.fn();
    Object.defineProperty(container, 'scrollTo', { value: scrollToMock, configurable: true });

    ref.current!.scrollTo(500);

    expect(scrollToMock).toHaveBeenCalledWith({ top: 500 });
  });
});

describe('scroll position — page-level scroll (no maxHeight)', () => {
  beforeEach(forceDesktop);

  afterEach(() => {
    // Restore scrollY to 0 between tests
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });

  it('calls onScrollPositionChange with window.scrollY on window scroll', () => {
    const onScroll = jest.fn();
    Object.defineProperty(window, 'scrollY', { value: 250, configurable: true });

    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        onScrollPositionChange={onScroll}
      />
    );

    fireEvent.scroll(window);

    expect(onScroll).toHaveBeenCalledWith(250);
  });

  it('does not call onScrollPositionChange when the prop is omitted and window scrolls', () => {
    // Re-assert: without the prop, no listener is registered and no callback fires
    const onScroll = jest.fn();
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        // no onScrollPositionChange
      />
    );

    fireEvent.scroll(window);

    expect(onScroll).not.toHaveBeenCalled();
  });

  it('removes the window scroll listener on unmount', () => {
    const onScroll = jest.fn();
    const removeSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        onScrollPositionChange={onScroll}
      />
    );

    unmount();

    expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    removeSpy.mockRestore();
  });

  it('ref.scrollTo() calls window.scrollTo when no maxHeight', () => {
    const scrollToMock = jest.fn();
    const originalScrollTo = window.scrollTo;
    window.scrollTo = scrollToMock as unknown as typeof window.scrollTo;

    const ref = createRef<ResponsiveTableHandle<Row>>();
    render(
      <ResponsiveTable
        ref={ref}
        data={data}
        columnDefinitions={columns}
      />
    );

    ref.current!.scrollTo(500);

    expect(scrollToMock).toHaveBeenCalledWith({ top: 500 });
    window.scrollTo = originalScrollTo;
  });
});

describe('scroll reset on server filter change (Bug D)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn(),
    }));
    forceDesktop();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('scrolls internal container to top when server filter changes', async () => {
    type Row = { name: string };
    const dataSource = jest.fn()
      .mockResolvedValueOnce([{ name: 'Alice' }, { name: 'Bob' }])
      .mockResolvedValueOnce([{ name: 'Alice' }]);

    const { container } = render(
      <ResponsiveTable
        columnDefinitions={[{ displayLabel: 'Name', cellRenderer: (r: Row) => r.name }]}
        data={[]}
        dataSource={dataSource}
        pageSize={20}
        maxHeight="400px"
        filterProps={{ showFilter: true, mode: 'server' }}
      />
    );

    // Flush initial load — mount useEffect fires with scrollTo not yet defined on container
    await act(async () => { await Promise.resolve(); });

    const tableContainer = container.querySelector(tableContainerSelector) as HTMLElement;
    const scrollToMock = jest.fn();
    // Define mock AFTER initial flush so only the filter-change call is captured
    Object.defineProperty(tableContainer, 'scrollTo', { value: scrollToMock, configurable: true });

    const filterInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(filterInput, { target: { value: 'Alice' } });
    act(() => jest.advanceTimersByTime(300)); // flush FilterPlugin debounce
    await act(async () => { await Promise.resolve(); }); // flush resetAndFetch promise

    // BUG D: scroll position is never reset — this fails before the fix
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0 });
  });

  it('scrolls window to top when no maxHeight and server filter changes', async () => {
    type Row = { name: string };
    const dataSource = jest.fn().mockResolvedValue([{ name: 'Alice' }]);

    render(
      <ResponsiveTable
        columnDefinitions={[{ displayLabel: 'Name', cellRenderer: (r: Row) => r.name }]}
        data={[]}
        dataSource={dataSource}
        pageSize={20}
        filterProps={{ showFilter: true, mode: 'server' }}
      />
    );

    // Flush initial load before installing the mock
    await act(async () => { await Promise.resolve(); });

    const windowScrollTo = jest.fn();
    const originalScrollTo = window.scrollTo;
    window.scrollTo = windowScrollTo as unknown as typeof window.scrollTo;

    const filterInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(filterInput, { target: { value: 'Alice' } });
    act(() => jest.advanceTimersByTime(300));
    await act(async () => { await Promise.resolve(); });

    // BUG D: window.scrollTo is never called — this fails before the fix
    expect(windowScrollTo).toHaveBeenCalledWith({ top: 0 });

    window.scrollTo = originalScrollTo;
  });
});

describe('scroll position — no callback provided', () => {
  beforeEach(forceDesktop);

  it('does not throw when scrolling with no onScrollPositionChange prop', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        maxHeight="400px"
      />
    );

    const container = document.querySelector(tableContainerSelector) as HTMLElement;
    expect(() => fireEvent.scroll(container)).not.toThrow();
  });

  it('does not throw on window scroll with no onScrollPositionChange prop', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
      />
    );

    expect(() => fireEvent.scroll(window)).not.toThrow();
  });
});
