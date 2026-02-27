import React from 'react';
import { useTableContext, ColumnDefinition } from '../Context/TableContext';
import styles from '../Styles/ResponsiveTable.module.css';
import { TableBodyCell } from './TableBodyCell';

interface TableBodyRowProps<TData> {
  row: TData;
  rowIndex: number;
  columnDefinitions: ColumnDefinition<TData>[];
  onRowClick?: (item: TData) => void;
  selectionProps?: {
    onSelectionChange: (selectedItems: TData[]) => void;
    rowIdKey: keyof TData;
    mode?: 'single' | 'multiple';
    selectedItems?: TData[];
    selectedRowClassName?: string;
  };
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
      onClick={(e: React.MouseEvent<HTMLTableRowElement>) => {
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
