import React from 'react';
import { render, screen, act } from '@testing-library/react';
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
  },
  {
    columnId: 'name',
    displayLabel: 'Name',
    cellRenderer: (data: TestData) => data.name,
  },
];

describe('ResponsiveTable Smart Data Source', () => {
  let intersectCallback: any;

  beforeAll(() => {
    (global as any).IntersectionObserver = jest.fn().mockImplementation((callback) => {
      intersectCallback = callback;
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    });
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
    // Return only 1 item when pageSize is 2 -> should set hasMore to false
    const dataSource = jest.fn().mockResolvedValue([{ id: 1, name: 'Alice' }]);

    let container: any;
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

    // Sentinel shouldn't be rendered if hasMore is false
    // Note: Our current implementation sets hasMore based on newItems.length === pageSize
    expect(container.querySelector('[style="height: 1px;"]')).not.toBeInTheDocument();
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

    // Trigger intersection
    await act(async () => {
      intersectCallback([{ isIntersecting: true }]);
    });

    expect(dataSource).toHaveBeenCalledTimes(2);
    expect(dataSource).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });
});
