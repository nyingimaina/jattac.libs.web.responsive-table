import React, { CSSProperties } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';
import { ColumnDefinition } from './ResponsiveTable';

interface DesktopViewProps<TData> {
  columnDefinitions: ColumnDefinition<TData>[];
  currentData: TData[];
  maxHeight?: string;
  isHeaderSticky: boolean;
  tableContainerRef: React.RefObject<HTMLDivElement>;
  headerRef: React.RefObject<HTMLTableSectionElement>;
  getRowProps: (row: TData) => React.HTMLAttributes<HTMLElement>;
  getHeaderProps: (colDef: ColumnDefinition<TData>) => React.HTMLAttributes<HTMLElement> & { className?: string };
  onHeaderClickCallback: (colDef: ColumnDefinition<TData>) => ((id: string) => void) | undefined;
  getClickableHeaderClassName: (onHeaderClick: ((id: string) => void) | undefined, colDef: ColumnDefinition<TData>) => string;
  getRawColumnDefinition: (colDef: ColumnDefinition<TData>) => IResponsiveTableColumnDefinition<TData>;
  getColumnDefinition: (colDef: ColumnDefinition<TData>, rowIndex: number) => IResponsiveTableColumnDefinition<TData>;
  renderCell: (content: React.ReactNode, row: TData, colDef: IResponsiveTableColumnDefinition<TData>) => React.ReactNode;
  rowClickFunction: (item: TData) => void;
  tableFooter: React.ReactNode;
  renderPluginFooters: () => React.ReactNode;
  animationProps?: {
    isLoading?: boolean;
    animateOnLoad?: boolean;
  };
  selectionProps?: any;
  onRowClick?: (item: TData) => void;
}

function DesktopView<TData>(props: DesktopViewProps<TData>) {
  const {
    columnDefinitions,
    currentData,
    maxHeight,
    isHeaderSticky,
    tableContainerRef,
    headerRef,
    getRowProps,
    getHeaderProps,
    onHeaderClickCallback,
    getClickableHeaderClassName,
    getRawColumnDefinition,
    getColumnDefinition,
    renderCell,
    rowClickFunction,
    tableFooter,
    renderPluginFooters,
    animationProps,
    onRowClick,
    selectionProps,
  } = props;

  const useFixedHeaders = maxHeight ? true : false;
  const isClickable = onRowClick || selectionProps;

  const fixedHeadersStyle = useFixedHeaders
    ? ({ maxHeight, overflowY: 'auto' } as CSSProperties)
    : {};

  const headerClassName = useFixedHeaders
    ? styles.internalStickyHeader
    : (isHeaderSticky ? styles.stickyHeader : '');

  return (
    <div style={fixedHeadersStyle} ref={tableContainerRef}>
      <table className={styles['responsiveTable']}>
        <thead ref={headerRef} className={headerClassName}>
          <tr>
            {columnDefinitions.map((columnDefinition, colIndex) => {
              const onHeaderClick = onHeaderClickCallback(columnDefinition);
              const clickableHeaderClassName = getClickableHeaderClassName(
                onHeaderClick,
                columnDefinition,
              );
              const headerProps = getHeaderProps(columnDefinition);

              const combinedClassName = `${clickableHeaderClassName} ${headerProps.className ? styles[headerProps.className] : ''}`.trim();

              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { className, ...restHeaderProps } = headerProps;

              return (
                <th
                  key={colIndex}
                  className={combinedClassName}
                  {...restHeaderProps}
                  onClick={onHeaderClick ? () => onHeaderClick(getRawColumnDefinition(columnDefinition).interactivity!.id) : restHeaderProps.onClick}
                >
                  <div className={styles.headerInnerWrapper}>
                    <div className={styles.headerContent}>
                      {getColumnDefinition(columnDefinition, 0).displayLabel}
                    </div>
                    <span className={styles.sortIcon}></span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {currentData.map((row, rowIndex) => {
            const rowProps = getRowProps(row);
            const pluginOnClick = rowProps.onClick;
            
            return (
              <tr
                key={rowIndex} // Using index as fallback, key handling should be refined
                className={`${isClickable ? styles.clickableRow : ''} ${animationProps?.animateOnLoad ? styles.animatedRow : ''} ${rowProps.className || ''}`.trim()}
                style={{ animationDelay: `${rowIndex * 0.05}s` }}
                aria-selected={rowProps['aria-selected']}
                onClick={(e: React.MouseEvent<HTMLTableRowElement>) => {
                  if (pluginOnClick) {
                      pluginOnClick(e);
                  }
                  rowClickFunction(row);
                }}
              >
                {columnDefinitions.map((columnDefinition, colIndex) => {
                  const colDef = getColumnDefinition(columnDefinition, rowIndex);
                  const cellContent = colDef.cellRenderer(row);
                  return (
                    <td key={colIndex}>
                      {renderCell(cellContent, row, colDef)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        {tableFooter}
      </table>
      {renderPluginFooters()}
    </div>
  );
}

export default DesktopView;
