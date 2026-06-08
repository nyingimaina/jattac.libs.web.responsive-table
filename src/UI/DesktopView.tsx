import React, { CSSProperties, useCallback, useEffect, useMemo, useState } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import styles from '../Styles/ResponsiveTable.module.css';
import IFooterColumnDefinition from '../Data/IFooterColumnDefinition';
import { useTableContext } from '../Context/TableContext';
import { TableHeaderCell } from './TableHeaderCell';
import { TableBodyRow } from './TableBodyRow';
import { DetailRow } from './DetailRow';
import { TableSentinel } from './TableSentinel';

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
    expandRowRenderer,
    expandChevronClassName,
    getRowId,
  } = useTableContext<TData>();

  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());
  const [hoveredRowId, setHoveredRowId] = useState<string | number | null>(null);
  const [greetingActive, setGreetingActive] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGreetingActive(false), 3200);
    return () => clearTimeout(t);
  }, []);

  const toggleExpanded = useCallback((id: string | number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

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
              {expandRowRenderer && <td className={styles.expandColumn} />}
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
  }, [footerRows, getEffectiveColSpan, expandRowRenderer]);

  const useFixedHeaders = !!maxHeight;

  const fixedHeadersStyle = useFixedHeaders
    ? ({ maxHeight, overflowY: 'auto' } as CSSProperties)
    : {};

  const headerClassName = useFixedHeaders
    ? styles.internalStickyHeader
    : (isHeaderSticky ? styles.stickyHeader : '');

  return (
    <div className={styles.tableContainer} style={fixedHeadersStyle} ref={tableContainerRef} onScroll={onScroll}>
      <table className={styles['responsiveTable']}>
        <thead ref={headerRef} className={headerClassName}>
          <tr>
            {expandRowRenderer && <th className={styles.expandColumn} />}
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
          {currentData.map((row, rowIndex) => {
            const rowId = getRowId(row, rowIndex);
            const isExpanded = expandedIds.has(rowId);
            const isHovered = hoveredRowId === rowId;
            const rowContent = expandRowRenderer?.(row, rowIndex);
            const rowHasContent = rowContent != null;

            const chevronClasses = [
              styles.expandChevron,
              greetingActive && rowHasContent ? styles.expandChevronGreeting : '',
              isExpanded ? styles.expandChevronExpanded : '',
              isHovered && !isExpanded ? styles.expandChevronHovered : '',
              expandChevronClassName ?? '',
            ].filter(Boolean).join(' ').trim();

            return (
              <React.Fragment key={rowId}>
                <TableBodyRow
                  row={row}
                  rowIndex={rowIndex}
                  columnDefinitions={visibleColumns}
                  onRowClick={onRowClick}
                  selectionProps={selectionProps}
                  animationProps={animationProps}
                  isExpandable={!!(expandRowRenderer && rowHasContent)}
                  expandCell={expandRowRenderer ? (
                    <td
                      className={styles.expandColumn}
                      style={{ '--row-idx': rowIndex } as React.CSSProperties}
                    >
                      {rowHasContent && (
                        <span
                          className={chevronClasses}
                          role="button"
                          tabIndex={0}
                          aria-expanded={isExpanded}
                          onClick={(e) => { e.stopPropagation(); toggleExpanded(rowId); }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpanded(rowId); } }}
                          data-rt-ignore-row-click
                        >
                          <MdArrowDropDown />
                        </span>
                      )}
                    </td>
                  ) : undefined}
                  onMouseEnter={() => expandRowRenderer && setHoveredRowId(rowId)}
                  onMouseLeave={() => expandRowRenderer && setHoveredRowId(null)}
                />
                {expandRowRenderer && rowHasContent && (
                  <DetailRow
                    row={row}
                    rowIndex={rowIndex}
                    colSpan={visibleColumns.length + 1}
                    expandRowRenderer={expandRowRenderer}
                    isExpanded={isExpanded}
                  />
                )}
              </React.Fragment>
            );
          })}
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
        <div className={styles.infoContainer}>
          <div className={styles.spinner}></div>
          <span>Loading more items...</span>
        </div>
      )}
      {renderPluginFooters()}
    </div>
  );
}

export default DesktopView;
