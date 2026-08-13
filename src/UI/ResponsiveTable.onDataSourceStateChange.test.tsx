import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from './ResponsiveTable';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface TestData {
  id: number;
}

const columnDefinitions: IResponsiveTableColumnDefinition<TestData>[] = [
  { columnId: 'id', displayLabel: 'ID', cellRenderer: (d: TestData) => d.id },
];

describe('ResponsiveTable — onDataSourceStateChange render loop', () => {
  // Mirrors real callers (ExpenseList.tsx) that pass onDataSourceStateChange
  // as a fresh inline arrow function every render, and whose handler
  // unconditionally triggers a re-render on every call (exactly what
  // module-state-manager's updateObject()->rerender() does, unconditionally,
  // for every *Logic.ts class in this app).
  function UnmemoizedCaller({
    dataSource,
    onRenderCountChange,
  }: {
    dataSource: () => Promise<TestData[]>;
    onRenderCountChange: (count: number) => void;
  }) {
    const renderCountRef = React.useRef(0);
    renderCountRef.current += 1;
    onRenderCountChange(renderCountRef.current);

    const [, forceRerender] = React.useReducer((c: number) => c + 1, 0);

    return (
      <ResponsiveTable
        data={[]}
        dataSource={dataSource}
        pageSize={20}
        columnDefinitions={columnDefinitions}
        onDataSourceStateChange={() => forceRerender()}
      />
    );
  }

  it('settles instead of looping forever when onDataSourceStateChange is a new reference every render and always triggers a rerender', async () => {
    let renderCount = 0;
    const dataSource = jest.fn().mockResolvedValue([]);

    await act(async () => {
      render(
        <UnmemoizedCaller
          dataSource={dataSource}
          onRenderCountChange={(count) => {
            renderCount = count;
          }}
        />
      );
    });

    // Before the fix this climbs without bound: ResponsiveTable's
    // onDataSourceStateChange effect depends on the raw callback reference,
    // so every rerender it causes recreates that reference and re-fires the
    // effect, forever.
    expect(renderCount).toBeLessThan(10);
  });
});
