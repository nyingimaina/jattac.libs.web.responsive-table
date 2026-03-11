import React from 'react';
import { useTableContext, ColumnDefinition } from '../Context/TableContext';
import styles from '../Styles/ResponsiveTable.module.css';
import { TableBodyCell } from './TableBodyCell';

interface TableBodyRowProps<TData> {
  /** The data item representing this row. */
  row: TData;
  /** The index of the row in the current dataset. */
  rowIndex: number;
  /** The column definitions for the table. */
  columnDefinitions: ColumnDefinition<TData>[];
  /**
   * Optional callback triggered when the row is clicked.
   * 
   * @note To prevent this handler from firing when clicking interactive elements 
   * (e.g., buttons, links) inside a cell, add the `data-rt-ignore-row-click` 
   * attribute to those elements.
   * 
   * @example
   * // In your column definition's cellRenderer:
   * (row) => <button data-rt-ignore-row-click onClick={() => delete(row)}>Delete</button>
   */
  onRowClick?: (item: TData) => void;
  /** Configuration for row selection. */
  selectionProps?: {
    onSelectionChange: (selectedItems: TData[]) => void;
    rowIdKey: keyof TData;
    mode?: 'single' | 'multiple';
    selectedItems?: TData[];
    selectedRowClassName?: string;
  };
  /** Configuration for row animations. */
  animationProps?: {
    isLoading?: boolean;
    animateOnLoad?: boolean;
  };
}

export function TableBodyRow<TData>(props: TableBodyRowProps<TData>) {
  const {
    row,
    rowIndex,
    columnDefinitions,
    onRowClick,
    selectionProps,
    animationProps,
  } = props;

  const { getRowProps } = useTableContext<TData>();

  const rowProps = getRowProps(row);
  const isClickable = onRowClick || selectionProps;
  const pluginOnClick = rowProps.onClick;

  return (
    <tr
      className={`${isClickable ? styles.clickableRow : ''} ${animationProps?.animateOnLoad ? styles.animatedRow : ''} ${rowProps.className || ''}`.trim()}
      style={{ animationDelay: `${rowIndex * 0.05}s` }}
      aria-selected={rowProps['aria-selected']}
    onClickCapture={(e: React.MouseEvent<HTMLTableRowElement>) => {
        // Capture Phase: Check for the ignore attribute BEFORE child handlers run.
        // This prevents issues where child handlers trigger a re-render/unmount
        // that detaches the target from the DOM before the bubbling phase.
        const target = e.target as HTMLElement;
        if (target.closest('[data-rt-ignore-row-click]')) {
          (e.nativeEvent as any)._rtIgnoreRowClick = true;
        }
    }}
    onClick={(e: React.MouseEvent<HTMLTableRowElement>) => {
        // Bubbling Phase: Check the flag set during the capture phase.
        if ((e.nativeEvent as any)._rtIgnoreRowClick) {
          return;
        }

        if (pluginOnClick) {
          pluginOnClick(e);
        }
        if (onRowClick) {
          onRowClick(row);
        }
      }}
    >
      {columnDefinitions.map((columnDefinition, colIndex) => (
        <td key={colIndex}>
          <TableBodyCell
            row={row}
            rowIndex={rowIndex}
            columnDefinition={columnDefinition}
          />
        </td>
      ))}
    </tr>
  );
}
