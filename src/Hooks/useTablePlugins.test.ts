import React from 'react';
import { render, act } from '@testing-library/react';
import { useTablePlugins } from './useTablePlugins';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface Row {
  id: number;
}

describe('useTablePlugins — infinite render loop with unmemoized caller props', () => {
  // Mirrors real-world callers (ExpenseList.tsx, StaffPinsList.tsx, and
  // ResponsiveTable.tsx's own pass-through of columnDefinitions/selectionProps)
  // that build columnDefinitions/selectionProps as fresh literals on every
  // render, rather than memoizing them.
  function UnmemoizedCaller({
    data,
    onRenderCountChange,
  }: {
    data: Row[];
    onRenderCountChange: (count: number) => void;
  }) {
    const renderCountRef = React.useRef(0);
    renderCountRef.current += 1;
    onRenderCountChange(renderCountRef.current);

    const columnDefinitions: IResponsiveTableColumnDefinition<Row>[] = [
      { cellRenderer: (row: Row) => row.id, displayLabel: 'Id' },
    ];

    const { processedData } = useTablePlugins<Row>({
      data,
      columnDefinitions,
      selectionProps: { rowIdKey: 'id', onSelectionChange: () => {} },
      getScrollableElement: () => null,
    });

    return React.createElement('div', null, processedData.length);
  }

  it('settles instead of looping forever when columnDefinitions/selectionProps are new references every render', () => {
    let renderCount = 0;
    const data: Row[] = [{ id: 1 }, { id: 2 }];

    act(() => {
      render(
        React.createElement(UnmemoizedCaller, {
          data,
          onRenderCountChange: (count) => {
            renderCount = count;
          },
        })
      );
    });

    // A healthy hook settles within a handful of renders (mount + the
    // effect-driven sync). Before the fix this climbs without bound because
    // initializePlugins() unconditionally hands setActivePlugins/setProcessedData
    // brand-new array references every time it runs, so any caller that
    // doesn't memoize columnDefinitions/selectionProps (the overwhelming
    // majority — see ExpenseList.tsx, StaffPinsList.tsx) re-triggers the
    // effect forever.
    expect(renderCount).toBeLessThan(10);
  });
});
