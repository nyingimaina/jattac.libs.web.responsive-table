import React from 'react';
import { render, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from './ResponsiveTable';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface TestData { id: number; name: string; }

const cols: IResponsiveTableColumnDefinition<TestData>[] = [
  { columnId: 'id', displayLabel: 'ID', cellRenderer: (r) => r.id },
  { columnId: 'name', displayLabel: 'Name', cellRenderer: (r) => r.name },
];

// pageSize=2, dataSource returns exactly 2 items → hasMore=true → sentinel renders
const twoItems: TestData[] = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];

describe('TableSentinel — Bug C: IntersectionObserver root for internal-scroll containers', () => {
  let MockObserver: jest.Mock;

  beforeEach(() => {
    MockObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).IntersectionObserver = MockObserver;
    global.innerWidth = 1024;
    fireEvent(window, new Event('resize'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses the scroll container element as IntersectionObserver root when maxHeight is set', async () => {
    const dataSource = jest.fn().mockResolvedValue(twoItems);

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={cols}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
          maxHeight="400px"
        />
      );
    });

    // Identify the sentinel's observer by its rootMargin (the only observer using '200px')
    const sentinelCall = MockObserver.mock.calls.find(
      ([, opts]: [unknown, IntersectionObserverInit]) => opts?.rootMargin === '200px'
    );
    expect(sentinelCall).toBeDefined();

    // BUG C: root is null (viewport) instead of the internal scroll container
    expect(sentinelCall![1].root).not.toBeNull();
    expect(sentinelCall![1].root).toBeInstanceOf(HTMLElement);
  });

  it('uses null (viewport) as root when maxHeight is not set', async () => {
    const dataSource = jest.fn().mockResolvedValue(twoItems);

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={cols}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
          // no maxHeight — page-level scroll, viewport is the correct root
        />
      );
    });

    const sentinelCall = MockObserver.mock.calls.find(
      ([, opts]: [unknown, IntersectionObserverInit]) => opts?.rootMargin === '200px'
    );
    expect(sentinelCall).toBeDefined();
    expect(sentinelCall![1].root).toBeNull();
  });
});
