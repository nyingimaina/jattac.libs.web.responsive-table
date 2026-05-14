import React from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { useTableContext } from '../Context/TableContext';
import { TableBodyCell } from './TableBodyCell';
import { TableSentinel } from './TableSentinel';

interface MobileViewProps {
  mobileFooter: React.ReactNode;
}

function MobileView<TData>(props: MobileViewProps) {
  const { mobileFooter } = props;
  const {
    currentData,
    visibleColumns,
    onRowClick,
    selectionProps,
    animationProps,
    getRowProps,
    getRowId,
    getColumnDefinition,
    onHeaderClickCallback,
    getClickableHeaderClassName,
    pagination,
    mobileCardClassName,
  } = useTableContext<TData>();

  const isClickable = onRowClick || selectionProps;

  return (
    <div className={styles.cardContainer}>
      {currentData.map((row, rowIndex) => {
        const rowProps = getRowProps(row);
        const pluginOnClick = rowProps.onClick;

        return (
          <div
            key={getRowId(row, rowIndex)}
            className={`${styles.card} ${isClickable ? styles.clickableRow : ''} ${animationProps?.animateOnLoad ? styles.animatedRow : ''} ${rowProps.className || ''} ${mobileCardClassName || ''}`.trim()}
            style={{ animationDelay: `${rowIndex * 0.05}s` }}
            aria-selected={rowProps['aria-selected']}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              if (pluginOnClick) pluginOnClick(e);
              if (onRowClick) onRowClick(row);
            }}
          >
            <div className={styles['card-body']}>
              {visibleColumns.map((columnDefinition, colIndex) => {
                const colDef = getColumnDefinition(columnDefinition, rowIndex);
                const onHeaderClick = onHeaderClickCallback(columnDefinition);
                const clickableHeaderClassName = getClickableHeaderClassName(onHeaderClick, columnDefinition);
                return (
                  <div key={colIndex} className={`${styles['card-row']} ${styles.stacked}`}>
                    <span
                      className={`${styles['card-label']} ${clickableHeaderClassName} ${colDef.headerClassName || ''}`}
                      style={colDef.headerStyle}
                      onClick={
                        (e) => {
                          if (onHeaderClick) {
                            e.stopPropagation();
                            onHeaderClick(colDef.interactivity!.id)
                          }
                        }
                      }
                    >
                      {colDef.displayLabel}
                    </span>
                    <span 
                      className={`${styles['card-value']} ${colDef.cellClassName || ''}`}
                      style={colDef.cellStyle}
                    >
                      <TableBodyCell
                        row={row}
                        rowIndex={rowIndex}
                        columnDefinition={columnDefinition}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
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
      {mobileFooter}
    </div>
  );
}

export default MobileView;
