import React from 'react';
import { useTableContext, ColumnDefinition } from '../Context/TableContext';
import styles from '../Styles/ResponsiveTable.module.css';

interface TableHeaderCellProps<TData> {
  columnDefinition: ColumnDefinition<TData>;
  colIndex: number;
}

export function TableHeaderCell<TData>(props: TableHeaderCellProps<TData>) {
  const { columnDefinition, colIndex } = props;
  const {
    onHeaderClickCallback,
    getClickableHeaderClassName,
    getHeaderProps,
    getRawColumnDefinition,
    getColumnDefinition,
  } = useTableContext<TData>();

  const onHeaderClick = onHeaderClickCallback(columnDefinition);
  const rawColDef = getRawColumnDefinition(columnDefinition);
  const clickableHeaderClassName = getClickableHeaderClassName(
    onHeaderClick,
    columnDefinition,
  );
  const headerProps = getHeaderProps(columnDefinition);

  const combinedClassName = `${clickableHeaderClassName} ${headerProps.className ? styles[headerProps.className] : ''} ${rawColDef.headerClassName || ''}`.trim();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { className, ...restHeaderProps } = headerProps;

  return (
    <th
      key={colIndex}
      className={combinedClassName}
      style={{ ...headerProps.style, ...rawColDef.headerStyle }}
      {...restHeaderProps}
      onClick={onHeaderClick ? () => onHeaderClick(rawColDef.interactivity!.id) : restHeaderProps.onClick}
    >
      <div className={styles.headerInnerWrapper}>
        <div className={styles.headerContent}>
          {getColumnDefinition(columnDefinition, 0).displayLabel}
        </div>
        <span className={styles.sortIcon}></span>
      </div>
    </th>
  );
}
