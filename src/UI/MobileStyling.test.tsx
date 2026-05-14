import React from 'react';
import { render, fireEvent } from '@testing-library/react';
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
    expect(cards[0]).toHaveClass('custom-mobile-card'); // This should fail
  });
});
