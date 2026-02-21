import React, { CSSProperties, useCallback, useMemo } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';
import IFooterColumnDefinition from '../Data/IFooterColumnDefinition';
import { ColumnDefinition } from './ResponsiveTable';

interface DesktopViewProps<TData> {
  columnDefinitions: ColumnDefinition<TData>[]; // This will be the visible columns
  originalColumnDefinitions: ColumnDefinition<TData>[]; // The full set for footer math
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
  footerRows?: any[];
  renderPluginFooters: () => React.ReactNode;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
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
    originalColumnDefinitions,
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
    footerRows,
    renderPluginFooters,
    animationProps,
    onRowClick,
    selectionProps,
    onScroll,
  } = props;

  const getEffectiveColSpan = useCallback((
    footerCol: IFooterColumnDefinition,
    startIndex: number
  ) => {
    const originalSpan = footerCol.colSpan || 1;
    const endIndex = startIndex + originalSpan;
    
    let visibleCount = 0;
    for (let i = startIndex; i < endIndex; i++) {
      const col = originalColumnDefinitions[i];
      if (col && getRawColumnDefinition(col).visible !== false) {
        visibleCount++;
      }
    }
    return visibleCount;
  }, [originalColumnDefinitions, getRawColumnDefinition]);

  const tableFooter = useMemo(() => {
    if (!footerRows || footerRows.length === 0) {
      return null;
    }

    return (
      <tfoot>
        {footerRows.map((row, rowIndex) => {
          let currentOriginalIndex = 0;
          return (
            <tr key={rowIndex}>
              {row.columns.map((col: IFooterColumnDefinition, colIndex: number) => {
                const effectiveColSpan = getEffectiveColSpan(col, currentOriginalIndex);
                currentOriginalIndex += (col.colSpan || 1);

                if (effectiveColSpan === 0) return null;

                return (
                  <td
                    key={colIndex}
                    colSpan={effectiveColSpan}
                    className={`${styles.footerCell} ${col.className || ''} ${col.onCellClick ? styles.clickableFooterCell : ''}`}
                    onClick={col.onCellClick}
                  >
                    {col.cellRenderer()}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tfoot>
    );
  }, [footerRows, getEffectiveColSpan]);

  const useFixedHeaders = maxHeight ? true : false;
  const isClickable = onRowClick || selectionProps;

  const fixedHeadersStyle = useFixedHeaders
    ? ({ maxHeight, overflowY: 'auto' } as CSSProperties)
    : {};

  const headerClassName = useFixedHeaders
    ? styles.internalStickyHeader
    : (isHeaderSticky ? styles.stickyHeader : '');

  return (
    <div style={fixedHeadersStyle} ref={tableContainerRef} onScroll={onScroll}>
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
