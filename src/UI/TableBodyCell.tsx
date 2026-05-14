import React from 'react';
import { useTableContext, ColumnDefinition } from '../Context/TableContext';

interface TableBodyCellProps<TData> {
  row: TData;
  rowIndex: number;
  columnDefinition: ColumnDefinition<TData>;
}

export function TableBodyCell<TData>(props: TableBodyCellProps<TData>) {
  const { row, rowIndex, columnDefinition } = props;
  const { getColumnDefinition, renderCell } = useTableContext<TData>();

  const colDef = getColumnDefinition(columnDefinition, rowIndex);
  const cellContent = colDef.cellRenderer(row);

  return (
    <div 
      className={colDef.cellClassName} 
      style={colDef.cellStyle}
    >
      {renderCell(cellContent, row, colDef)}
    </div>
  );
}
