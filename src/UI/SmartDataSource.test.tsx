import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from './ResponsiveTable';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface TestData {
  id: number;
  name: string;
}

const mockColumnDefinitions: IResponsiveTableColumnDefinition<TestData>[] = [
  {
    columnId: 'id',
    displayLabel: 'ID',
    cellRenderer: (data: TestData) => data.id,
    getFilterableValue: (data: TestData) => String(data.id),
  },
  {
    columnId: 'name',
    displayLabel: 'Name',
    cellRenderer: (data: TestData) => data.name,
    getFilterableValue: (data: TestData) => data.name,
  },
];

describe('ResponsiveTable Smart Data Source', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let intersectCallback: any;

  beforeAll(() => {
    jest.useFakeTimers();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).IntersectionObserver = jest.fn().mockImplementation((callback) => {
      intersectCallback = callback;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('fetches initial data from dataSource', async () => {
    const mockData = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    const dataSource = jest.fn().mockResolvedValue(mockData);

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
        />
      );
    });

    expect(dataSource).toHaveBeenCalledWith(expect.objectContaining({
      page: 1,
      pageSize: 2,
    }));
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('detects hasMore based on pageSize', async () => {
    const dataSource = jest.fn().mockResolvedValue([{ id: 1, name: 'Alice' }]);

    let container: HTMLElement | undefined;
    await act(async () => {
      const result = render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
        />
      );
      container = result.container;
    });

    expect(container?.querySelector('[style="height: 1px;"]')).not.toBeInTheDocument();
  });

  it('paginates when sentinel is intersected', async () => {
    const mockPage1 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    const mockPage2 = [{ id: 3, name: 'Charlie' }];
    
    const dataSource = jest.fn()
      .mockResolvedValueOnce(mockPage1)
      .mockResolvedValueOnce(mockPage2);

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
        />
      );
    });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();

    await act(async () => {
      intersectCallback([{ isIntersecting: true }]);
    });

    expect(dataSource).toHaveBeenCalledTimes(2);
    expect(dataSource).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  it('fires onDataSourceStateChange callback with current state', async () => {
    const mockData = [{ id: 1, name: 'Alice' }];
    const dataSource = jest.fn().mockResolvedValue(mockData);
    const onStateChange = jest.fn();

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
          onDataSourceStateChange={onStateChange}
        />
      );
    });

    expect(onStateChange).toHaveBeenCalledWith(expect.objectContaining({
      data: mockData,
      currentPage: 1,
      hasMore: false,
      isLoading: false,
      isFetchingMore: false,
      error: undefined,
    }));
  });

  it('fires onPageChange when page changes', async () => {
    const mockPage1 = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];
    const mockPage2 = [{ id: 3, name: 'Charlie' }];
    const dataSource = jest.fn()
      .mockResolvedValueOnce(mockPage1)
      .mockResolvedValueOnce(mockPage2);
    const onPageChange = jest.fn();

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
          onPageChange={onPageChange}
        />
      );
    });

    expect(onPageChange).toHaveBeenCalledWith(1);

    await act(async () => {
      intersectCallback([{ isIntersecting: true }]);
    });

    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('shows retry UI on dataSource error', async () => {
    const dataSource = jest.fn().mockRejectedValue(new Error('Network error'));

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
        />
      );
    });

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    expect(screen.getByText('Network error')).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('calls dataSource with filter param in server mode', async () => {
    const mockData = [{ id: 1, name: 'Alice' }];
    const dataSource = jest.fn().mockResolvedValue(mockData);

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={10}
          filterProps={{ showFilter: true, mode: 'server' }}
        />
      );
    });

    expect(dataSource).toHaveBeenCalledTimes(1);

    const filterInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(filterInput, { target: { value: 'Alice' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(dataSource).toHaveBeenCalledTimes(2);
    expect(dataSource).toHaveBeenLastCalledWith(expect.objectContaining({
      filter: 'Alice',
    }));
  });

  it('does not call dataSource with filter param in client mode (default)', async () => {
    const mockData = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const dataSource = jest.fn().mockResolvedValue(mockData);

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={10}
          filterProps={{ showFilter: true, mode: 'client' }}
        />
      );
    });

    expect(dataSource).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();

    const filterInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(filterInput, { target: { value: 'Alice' } });

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await act(async () => {
      await Promise.resolve();
    });

    // Client mode: dataSource should NOT be called again
    expect(dataSource).toHaveBeenCalledTimes(1);
  });

  it('fires onDataSourceError callback on fetch failure', async () => {
    const dataSource = jest.fn().mockRejectedValue(new Error('API failure'));
    const onError = jest.fn();

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
          onDataSourceError={onError}
        />
      );
    });

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({
      message: 'API failure',
    }));
  });

  it('retries fetch when retry button is clicked', async () => {
    const dataSource = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([{ id: 1, name: 'Alice' }]);

    await act(async () => {
      render(
        <ResponsiveTable
          columnDefinitions={mockColumnDefinitions}
          data={[]}
          dataSource={dataSource}
          pageSize={2}
        />
      );
    });

    expect(screen.getByText('Failed to load data')).toBeInTheDocument();

    const retryButton = screen.getByText('Retry');
    await act(async () => {
      fireEvent.click(retryButton);
    });

    expect(dataSource).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
