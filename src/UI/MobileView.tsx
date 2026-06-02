import React, { useState, useCallback } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { useTableContext } from '../Context/TableContext';
import { TableBodyCell } from './TableBodyCell';
import { TableSentinel } from './TableSentinel';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface MobileViewProps {
  mobileFooter: React.ReactNode;
}

interface RTNativeEvent extends Event {
  _rtIgnoreRowClick?: boolean;
}

interface MobileDetailSectionProps<TData> {
  row: TData;
  rowIndex: number;
  expandRowRenderer: (row: TData, rowIndex: number) => React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

function MobileDetailSection<TData>({ row, rowIndex, expandRowRenderer, isExpanded, onToggle }: MobileDetailSectionProps<TData>) {
  const content = expandRowRenderer(row, rowIndex);
  const hasContent = content != null;
  const [everExpanded, setEverExpanded] = useState(false);
  if (isExpanded && !everExpanded) setEverExpanded(true);

  if (!hasContent) return null;

  return (
    <div className={styles.mobileDetailOuter}>
      <div className={`${styles.detailToggleBar} ${styles.detailToggleBarVisible}`}>
        <button
          className={styles.detailToggleBtn}
          onClick={onToggle}
          aria-expanded={isExpanded}
          data-rt-ignore-row-click
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      <div className={`${styles.detailContentWrapper} ${isExpanded ? styles.detailContentWrapperExpanded : ''}`}>
        <div className={styles.detailContentInner}>
          {everExpanded && content}
        </div>
      </div>
    </div>
  );
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
    expandRowRenderer,
  } = useTableContext<TData>();

  const isClickable = onRowClick || selectionProps;

  const [expandedIds, setExpandedIds] = useState<Set<string | number>>(new Set());

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

  const inferDataType = (colDef: IResponsiveTableColumnDefinition<TData>, value: React.ReactNode): string => {
    if (colDef.dataType) return colDef.dataType;
    
    // Inference logic
    if (typeof value === 'number') return 'number';
    if (value instanceof Date) return 'date';
    if (typeof value === 'string') {
        // Check for images
        if (value.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) || value.startsWith('data:image/')) return 'image';
        // Check for dates
        if (!isNaN(Date.parse(value)) && (value.includes('-') || value.includes('/'))) return 'date';
    }
    // Check for React elements that might be inputs/buttons
    if (React.isValidElement(value)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const type = (value.type as any)?.name || (value.type as any);
        if (['button', 'input', 'select', 'textarea'].includes(typeof type === 'string' ? type.toLowerCase() : '')) return 'input';
    }
    
    return 'text';
  };

  const getTypeClassName = (dataType: string): string => {
    switch (dataType) {
      case 'number': return styles.numberValue;
      case 'date': return styles.dateValue;
      case 'image': return styles.imageValue;
      case 'input': return styles.inputValue;
      default: return '';
    }
  };

  return (
    <div className={styles.cardContainer}>
      {currentData.map((row, rowIndex) => {
        const rowProps = getRowProps(row);
        const pluginOnClick = rowProps.onClick;

        return (
          <React.Fragment key={getRowId(row, rowIndex)}>
          <div
            className={`${styles.card} ${isClickable ? styles.clickableRow : ''} ${animationProps?.animateOnLoad ? styles.animatedRow : ''} ${rowProps.className || ''} ${mobileCardClassName || ''}`.trim()}
            style={{ animationDelay: `${rowIndex * 0.05}s` }}
            aria-selected={rowProps['aria-selected']}
            onClickCapture={(e: React.MouseEvent<HTMLDivElement>) => {
              const target = e.target as HTMLElement;
              if (target.closest('[data-rt-ignore-row-click]')) {
                (e.nativeEvent as RTNativeEvent)._rtIgnoreRowClick = true;
              }
            }}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              if ((e.nativeEvent as RTNativeEvent)._rtIgnoreRowClick) {
                return;
              }
              if (pluginOnClick) pluginOnClick(e);
              if (onRowClick) onRowClick(row);
            }}
          >
            <div className={styles['card-body']}>
              {visibleColumns.map((columnDefinition, colIndex) => {
                const colDef = getColumnDefinition(columnDefinition, rowIndex);
                const onHeaderClick = onHeaderClickCallback(columnDefinition);
                const clickableHeaderClassName = getClickableHeaderClassName(onHeaderClick, columnDefinition);
                
                // Use a dummy call or dataKey to get a sample value for inference if cellRenderer is too complex
                // For now, we'll try to infer from what cellRenderer returns if it's a simple primitive
                const sampleValue = colDef.dataKey ? (row as Record<string, unknown>)[colDef.dataKey as string] : null;
                const dataType = inferDataType(colDef, sampleValue as React.ReactNode);
                const typeClassName = getTypeClassName(dataType);

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
                      className={`${styles['card-value']} ${typeClassName} ${colDef.cellClassName || ''}`}
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
          {expandRowRenderer && (
            <MobileDetailSection
              row={row}
              rowIndex={rowIndex}
              expandRowRenderer={expandRowRenderer}
              isExpanded={expandedIds.has(getRowId(row, rowIndex))}
              onToggle={() => toggleExpanded(getRowId(row, rowIndex))}
            />
          )}
        </React.Fragment>
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
