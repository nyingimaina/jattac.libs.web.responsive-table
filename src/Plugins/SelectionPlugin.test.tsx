import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from '../UI/ResponsiveTable';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface TestData {
  id: number;
  name: string;
}

const testData: TestData[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

const columns: IResponsiveTableColumnDefinition<TestData>[] = [
  {
    displayLabel: 'ID',
    dataKey: 'id',
    cellRenderer: (row) => row.id,
  },
  {
    displayLabel: 'Name',
    dataKey: 'name',
    cellRenderer: (row) => row.name,
  },
];

describe('SelectionPlugin', () => {
  it('should call onSelectionChange with the selected item when a row is clicked', () => {
    const handleSelectionChange = jest.fn();

    const { getByText } = render(
      <ResponsiveTable
        data={testData}
        columnDefinitions={columns}
        selectionProps={{
          onSelectionChange: handleSelectionChange,
          rowIdKey: 'id',
        }}
      />
    );

    fireEvent.click(getByText('Alice'));

    expect(handleSelectionChange).toHaveBeenCalledWith([testData[0]]);
  });
});
