import React, { CSSProperties, useCallback, useMemo } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import IFooterColumnDefinition from '../Data/IFooterColumnDefinition';
import { useTableContext } from '../Context/TableContext';
import { TableHeaderCell } from './TableHeaderCell';
import { TableBodyRow } from './TableBodyRow';
import { TableSentinel } from './TableSentinel';
import LoadingSpinner from './LoadingSpinner';

interface DesktopViewProps {
  maxHeight?: string;
  isHeaderSticky: boolean;
  tableContainerRef: React.RefObject<HTMLDivElement>;
  headerRef: React.RefObject<HTMLTableSectionElement>;
  footerRows?: { columns: IFooterColumnDefinition[] }[];
  renderPluginFooters: () => React.ReactNode;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

function DesktopView<TData>(props: DesktopViewProps) {
  const {
    maxHeight,
    isHeaderSticky,
    tableContainerRef,
    headerRef,
    footerRows,
    renderPluginFooters,
    onScroll,
  } = props;

  const {
    visibleColumns,
    originalColumnDefinitions,
    currentData,
    getRawColumnDefinition,
    onRowClick,
    selectionProps,
    animationProps,
    pagination,
  } = useTableContext<TData>();

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

  const useFixedHeaders = !!maxHeight;

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
            {visibleColumns.map((columnDefinition, colIndex) => (
              <TableHeaderCell
                key={colIndex}
                columnDefinition={columnDefinition}
                colIndex={colIndex}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map((row, rowIndex) => (
            <TableBodyRow
              key={rowIndex}
              row={row}
              rowIndex={rowIndex}
              columnDefinitions={visibleColumns}
              onRowClick={onRowClick}
              selectionProps={selectionProps}
              animationProps={animationProps}
            />
          ))}
        </tbody>
        {tableFooter}
      </table>
      {pagination?.hasMore && (
        <TableSentinel 
          onIntersect={() => pagination.loadNextPage()} 
          isLoading={pagination.isFetchingMore}
        />
      )}
      {pagination?.isFetchingMore && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
          <LoadingSpinner />
        </div>
      )}
      {renderPluginFooters()}
    </div>
  );
}

export default DesktopView;
