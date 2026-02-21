import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from './ResponsiveTable';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface TestData {
  id: number;
  name: string;
  age: number;
}

describe('ResponsiveTable', () => {
  beforeEach(() => {
    global.innerWidth = 1024;
    fireEvent(window, new Event('resize'));
  });

  const mockColumnDefinitions: IResponsiveTableColumnDefinition<TestData>[] = [
    {
      columnId: 'id',
      displayLabel: 'ID',
      cellRenderer: (data: TestData) => data.id,
      getSortableValue: (data: TestData) => data.id,
      getFilterableValue: (data: TestData) => data.id.toString(),
    },
    {
      columnId: 'name',
      displayLabel: 'Name',
      cellRenderer: (data: TestData) => data.name,
      getSortableValue: (data: TestData) => data.name,
      getFilterableValue: (data: TestData) => data.name,
    },
    {
      columnId: 'age',
      displayLabel: 'Age',
      cellRenderer: (data: TestData) => data.age,
      getSortableValue: (data: TestData) => data.age,
      getFilterableValue: (data: TestData) => data.age.toString(),
    },
  ];

  const mockData: TestData[] = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 24 },
    { id: 3, name: 'Charlie', age: 35 },
  ];

  it('renders without crashing', () => {
    render(
      <ResponsiveTable
        columnDefinitions={mockColumnDefinitions}
        data={mockData}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('renders no data component when data is empty', () => {
    render(
      <ResponsiveTable
        columnDefinitions={mockColumnDefinitions}
        data={[]}
        noDataComponent={<div>No items to display</div>}
      />
    );
    expect(screen.getByText('No items to display')).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    const onRowClick = jest.fn();
    render(
      <ResponsiveTable
        columnDefinitions={mockColumnDefinitions}
        data={mockData}
        onRowClick={onRowClick}
      />
    );

    fireEvent.click(screen.getByText('Alice'));
    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('sorts data when a sortable header is clicked', () => {
    render(
      <ResponsiveTable
        columnDefinitions={mockColumnDefinitions}
        data={mockData}
        sortProps={{ initialSortColumn: 'name', initialSortDirection: 'asc' }}
      />
    );

    // Initial order: Alice, Bob, Charlie (alphabetical)
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Alice');
    expect(rows[2]).toHaveTextContent('Bob');
    expect(rows[3]).toHaveTextContent('Charlie');

    // Click Age header to sort by age
    fireEvent.click(screen.getByText('Age'));

    // New order by age: Bob (24), Alice (30), Charlie (35)
    const sortedRows = screen.getAllByRole('row');
    expect(sortedRows[1]).toHaveTextContent('Bob');
    expect(sortedRows[2]).toHaveTextContent('Alice');
    expect(sortedRows[3]).toHaveTextContent('Charlie');
  });

  it('filters data when filter input is used', async () => {
    render(
      <ResponsiveTable
        columnDefinitions={mockColumnDefinitions}
        data={mockData}
        filterProps={{ showFilter: true }}
      />
    );

    const filterInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(filterInput, { target: { value: 'Alice' } });

    // Wait for debounce
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 400));
    });

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
  });

  it('switches to mobile view based on window width', () => {
    // Set window width to mobile breakpoint (default 600)
    global.innerWidth = 500;
    fireEvent(window, new Event('resize'));

    render(
      <ResponsiveTable
        columnDefinitions={mockColumnDefinitions}
        data={mockData}
      />
    );

    // In mobile view, headers should be rendered within cards, not as table headers
    // The default card-label class should be present
    const cardLabels = screen.getAllByText('Name');
    // One for each row in card view (3)
    expect(cardLabels.length).toBe(3);
  });

  it('hides columns when visible property is false', () => {
    const columnDefinitionsWithHidden: IResponsiveTableColumnDefinition<TestData>[] = [
      {
        displayLabel: 'ID',
        cellRenderer: (data: TestData) => data.id,
        visible: false,
      },
      {
        displayLabel: 'Name',
        cellRenderer: (data: TestData) => data.name,
      },
    ];

    render(
      <ResponsiveTable
        columnDefinitions={columnDefinitionsWithHidden}
        data={mockData}
      />
    );

    expect(screen.queryByText('ID')).not.toBeInTheDocument();
    // Using getAllByText because in some views 'Name' might appear multiple times (e.g. if we accidentally render mobile labels)
    // but in desktop view it should be at least once in the header.
    expect(screen.getAllByText('Name').length).toBeGreaterThan(0);
  });

  it('scales footer colSpans when columns are hidden', () => {
    const columnDefinitionsWithHidden: IResponsiveTableColumnDefinition<TestData>[] = [
      {
        displayLabel: 'ID',
        cellRenderer: (data: TestData) => data.id,
        visible: false,
      },
      {
        displayLabel: 'Name',
        cellRenderer: (data: TestData) => data.name,
      },
      {
        displayLabel: 'Age',
        cellRenderer: (data: TestData) => data.age,
      },
    ];

    const footerRows = [
      {
        columns: [
          {
            colSpan: 2,
            cellRenderer: () => 'Footer 1',
          },
          {
            colSpan: 1,
            cellRenderer: () => 'Footer 2',
          },
        ],
      },
    ];

    render(
      <ResponsiveTable
        columnDefinitions={columnDefinitionsWithHidden}
        data={mockData}
        footerRows={footerRows}
      />
    );

    const footerCells = screen.getAllByRole('cell').filter(cell => cell.tagName === 'TD' && cell.closest('tfoot'));
    
    // Footer 1 spanned ID and Name. ID is hidden, so Footer 1 should now have colSpan 1.
    expect(footerCells[0]).toHaveTextContent('Footer 1');
    expect(footerCells[0]).toHaveAttribute('colSpan', '1');
    
    // Footer 2 spanned Age. Age is visible, so Footer 2 should still have colSpan 1.
    expect(footerCells[1]).toHaveTextContent('Footer 2');
    expect(footerCells[1]).toHaveAttribute('colSpan', '1');
  });
});
