import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from './ResponsiveTable';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface TestData {
  id: number;
  name: string;
  age: number;
}

describe('ResponsiveTable', () => {
  const mockColumnDefinitions: IResponsiveTableColumnDefinition<TestData>[] = [
    {
      displayLabel: 'ID',
      cellRenderer: (data: TestData) => data.id,
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

  const mockData: TestData[] = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 24 },
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

  // Add more tests here as needed for other functionalities
});
