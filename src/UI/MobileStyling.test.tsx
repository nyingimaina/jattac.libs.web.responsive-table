import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from './ResponsiveTable';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface TestData {
  id: number;
  name: string;
}

describe('Mobile Styling', () => {
  beforeEach(() => {
    global.innerWidth = 500;
    fireEvent(window, new Event('resize'));
  });

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

  const mockData: TestData[] = [
    { id: 1, name: 'Alice' },
  ];

  it('renders with stacked layout in mobile view', () => {
    render(
      <ResponsiveTable
        columnDefinitions={mockColumnDefinitions}
        data={mockData}
      />
    );

    // In stacked layout, card-row should NOT have justify-content: space-between (flex-direction: column)
    // We'll check this by looking for the new stacked class or verifying the structure
    // Since we haven't implemented it yet, this is a placeholder for the red phase
    const cardRows = document.querySelectorAll('.card-row');
    expect(cardRows[0]).toHaveClass('stacked'); // This should fail
  });

  it('supports custom mobileCardClassName', () => {
    render(
      <ResponsiveTable
        columnDefinitions={mockColumnDefinitions}
        data={mockData}
        // @ts-ignore - Prop doesn't exist yet
        mobileCardClassName="custom-mobile-card"
      />
    );

    const cards = document.querySelectorAll('.card');
    expect(cards[0]).toHaveClass('custom-mobile-card');
  });

  it('inherits visual cues from column definitions', () => {
    const styledDefinitions: IResponsiveTableColumnDefinition<TestData>[] = [
      {
        columnId: 'id',
        displayLabel: 'ID',
        cellRenderer: (data: TestData) => data.id,
        headerStyle: { color: 'red' },
        cellStyle: { fontWeight: 'bold' },
      },
    ];

    render(
      <ResponsiveTable
        columnDefinitions={styledDefinitions}
        data={mockData}
      />
    );

    const label = screen.getByText('ID');
    const value = screen.getByText('1');

    expect(label).toHaveStyle({ color: 'rgb(255, 0, 0)' });
    expect(value.parentElement).toHaveStyle({ fontWeight: 'bold' });
  });

  it('infers number type and applies monospace styling', () => {
    const dataWithNumbers = [{ id: 123, name: 'Alice' }];
    render(
      <ResponsiveTable
        columnDefinitions={[
          { columnId: 'id', displayLabel: 'ID', cellRenderer: (d) => d.id, dataKey: 'id' }
        ]}
        data={dataWithNumbers}
      />
    );

    const value = screen.getByText('123');
    // Check for monospace font-family (mapped to numberValue class)
    expect(value.parentElement).toHaveClass('numberValue');
  });

  it('infers image type and applies image styling', () => {
    const dataWithImages = [{ id: 1, avatar: 'https://example.com/photo.jpg' }];
    render(
      <ResponsiveTable
        columnDefinitions={[
          { columnId: 'avatar', displayLabel: 'Avatar', cellRenderer: (d) => <img src={d.avatar} alt="Avatar" />, dataKey: 'avatar' }
        ]}
        data={dataWithImages}
      />
    );

    // The imageValue class is on the .card-value span, which is the parent of the TableBodyCell div, 
    // which is the parent of the img.
    const img = screen.getByAltText('Avatar');
    const cardValue = img.closest('.card-value');
    expect(cardValue).toHaveClass('imageValue');
  });

  it('respects explicit dataType override', () => {
    const data = [{ id: 1, status: 'Active' }];
    render(
      <ResponsiveTable
        columnDefinitions={[
          { 
            columnId: 'status', 
            displayLabel: 'Status', 
            cellRenderer: (d) => d.status, 
            dataType: 'number' // Explicitly override text as number for monospace
          }
        ]}
        data={data}
      />
    );

    const value = screen.getByText('Active');
    expect(value.parentElement).toHaveClass('numberValue');
  });

  it('optimizes inputs for full width and tap targets', () => {
    const dataWithButtons = [{ id: 1, action: 'Save' }];
    render(
      <ResponsiveTable
        columnDefinitions={[
          { 
            columnId: 'action', 
            displayLabel: 'Action', 
            cellRenderer: (d) => <button>{d.action}</button>,
            dataType: 'input'
          }
        ]}
        data={dataWithButtons}
      />
    );

    const container = screen.getByText('Save').closest('.card-value');
    expect(container).toHaveClass('inputValue');
  });
});
