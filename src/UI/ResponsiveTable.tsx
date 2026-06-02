import React, { useRef, ReactNode, useMemo, useCallback, useState, useEffect, forwardRef, ForwardedRef, useImperativeHandle } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { SortDirection } from '../Data/IResponsiveTableColumnDefinition';
import IFooterRowDefinition from '../Data/IFooterRowDefinition';
import { IResponsiveTablePlugin } from '../Plugins/IResponsiveTablePlugin';

import DesktopView from './DesktopView';
import MobileView from './MobileView';
import SkeletonView from './SkeletonView';
import InfiniteTable from './InfiniteTable';
import { useResponsiveTable } from '../Hooks/useResponsiveTable';
import { useTablePlugins } from '../Hooks/useTablePlugins';
import { TableProvider, ColumnDefinition, DataSource } from '../Context/TableContext';
import { useTableDataSource, DataSourceState } from '../Hooks/useTableDataSource';

export { ColumnDefinition };
export interface ResponsiveTableHandle<TData> {
  loadNextPage: () => Promise<void>;
  resetAndFetch: () => Promise<void>;
  getState: () => DataSourceState<TData>;
}
interface IInfiniteScrollProps<TData> {
  onLoadMore: (currentData: TData[]) => Promise<TData[] | null>;
  hasMore?: boolean;
  loadingMoreComponent?: ReactNode;
  noMoreDataComponent?: ReactNode;
}

interface ISortProps {
    initialSortColumn?: string;
    initialSortDirection?: SortDirection;
}

interface IProps<TData> {
  /** The definitions for each column in the table. */
  columnDefinitions: ColumnDefinition<TData>[];
  /** The initial data to display. If using dataSource, this acts as the starting set. */
  data: TData[];
  /** 
   * A smart data source function for server-side pagination, sorting, and filtering.
   * If provided, the table automatically handles infinite scroll and re-fetching on sort/filter.
   */
  dataSource?: DataSource<TData>;
  /** The number of items to fetch per page when using dataSource. Defaults to 20. */
  pageSize?: number;
  /** A component to display when there is no data. */
  noDataComponent?: ReactNode;
  /** The maximum height of the table container (enables internal scrolling). */
  maxHeight?: string;
  /** 
   * Callback for when a row is clicked. 
   * 
   * @note To prevent this event from triggering when clicking interactive elements 
   * (buttons, links, custom components) inside a cell, add the `data-rt-ignore-row-click` 
   * attribute to those elements.
   * 
   * @example
   * (row) => (
   *   <button 
   *     data-rt-ignore-row-click 
   *     onClick={() => handleAction(row)}
   *   >
   *     Action
   *   </button>
   * )
   */
  onRowClick?: (item: TData) => void;
  /** Custom definitions for footer rows. */
  footerRows?: IFooterRowDefinition[];
  /** The pixel width at which the table switches to mobile card view. Defaults to 600. */
  mobileBreakpoint?: number;
  /** An array of plugins to extend table functionality. */
  plugins?: IResponsiveTablePlugin<TData>[];
  /** If true, the header will stick to the top of the page when scrolling. */
  enablePageLevelStickyHeader?: boolean;
  /** 
   * Props for manual infinite scroll handling. 
   * NOTE: Prefer using `dataSource` for a more seamless experience.
   */
  infiniteScrollProps?: IInfiniteScrollProps<TData>;
  /** Configuration for the built-in filter plugin. */
  filterProps?: {
    showFilter?: boolean;
    filterPlaceholder?: string;
    className?: string;
    /** Default: 'server' when dataSource is present, 'client' otherwise. Pass 'client' to force in-memory filtering even with a dataSource. */
    mode?: 'client' | 'server';
  };
  /** Configuration for row selection. */
  selectionProps?: {
    onSelectionChange: (selectedItems: TData[]) => void;
    rowIdKey: keyof TData;
    mode?: 'single' | 'multiple';
    selectedItems?: TData[];
    selectedRowClassName?: string;
  };
  /** Configuration for loading states and entrance animations. */
  animationProps?: {
    isLoading?: boolean;
    animateOnLoad?: boolean;
  };
  /** Initial sort state for the table. */
  sortProps?: ISortProps;
  /** Custom CSS class to apply to each card in mobile view. */
  mobileCardClassName?: string;
  /** Callback fired whenever the dataSource state changes (data, page, loading, error). */
  onDataSourceStateChange?: (state: DataSourceState<TData>) => void;
  /** Callback fired when the current page changes. */
  onPageChange?: (page: number) => void;
  /** Callback fired when a dataSource fetch fails. */
  onDataSourceError?: (error: Error) => void;
}

/**
 * A highly customizable, mobile-first responsive React table.
 * Supports static data or async data sources with built-in infinite scroll.
 */
function ResponsiveTableInner<TData>(props: IProps<TData>, ref: ForwardedRef<ResponsiveTableHandle<TData>>) {
  const {
    columnDefinitions,
    data: initialData,
    dataSource,
    pageSize,
    noDataComponent,
    maxHeight,
    onRowClick,
    footerRows,
    mobileBreakpoint,
    plugins,
    enablePageLevelStickyHeader,
    infiniteScrollProps,
    filterProps,
    selectionProps,
    animationProps,
    sortProps,
    mobileCardClassName,
    onDataSourceStateChange,
    onPageChange,
    onDataSourceError,
  } = props;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  const { isMobile, isHeaderSticky } = useResponsiveTable({
    mobileBreakpoint,
    enablePageLevelStickyHeader,
    maxHeight,
    headerRef,
    scrollableRef: tableContainerRef,
  });

  const getScrollableElement = useCallback(() => tableContainerRef.current, []);

  // Track active sort state for dataSource
  const [activeSort /*, setActiveSort*/] = useState<{ columnId: string, direction: 'asc' | 'desc' } | undefined>(
    sortProps?.initialSortColumn ? { columnId: sortProps.initialSortColumn, direction: sortProps.initialSortDirection || 'asc' } : undefined
  );

  // Track active filter state for dataSource
  const [activeFilter, setActiveFilter] = useState<string>('');
  const handleFilterChange = useCallback((text: string) => {
    setActiveFilter(text);
  }, []);

  const isServerFilter = !!dataSource && !!filterProps?.showFilter && filterProps?.mode !== 'client';

  const resolvedFilterProps = useMemo(() => {
    if (!filterProps) return undefined;
    return {
      showFilter: filterProps.showFilter,
      filterPlaceholder: filterProps.filterPlaceholder,
      className: filterProps.className,
      mode: isServerFilter ? 'server' as const : (filterProps.mode ?? 'client' as const),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProps?.showFilter, filterProps?.filterPlaceholder, filterProps?.className, filterProps?.mode, isServerFilter]);

  const {
    data: sourceData,
    isLoading: isSourceLoading,
    isFetchingMore,
    hasMore,
    totalCount,
    currentPage,
    loadNextPage,
    error,
    resetAndFetch,
  } = useTableDataSource({
    dataSource,
    pageSize,
    initialData,
    sort: activeSort,
    filter: isServerFilter ? activeFilter : undefined,
  });

  useImperativeHandle(ref, () => ({
    loadNextPage: () => loadNextPage(),
    resetAndFetch: () => resetAndFetch(),
    getState: () => ({
      data: sourceData,
      currentPage,
      hasMore,
      totalCount,
      isLoading: isSourceLoading,
      isFetchingMore,
      error,
    }),
  }), [loadNextPage, resetAndFetch, sourceData, currentPage, hasMore, totalCount, isSourceLoading, isFetchingMore, error]);

  const currentDataToProcess = dataSource ? sourceData : initialData;

  const { processedData, activePlugins, visibleColumns } = useTablePlugins({
    data: currentDataToProcess,
    plugins,
    onFilterChange: isServerFilter ? handleFilterChange : undefined,
    filterProps: resolvedFilterProps,
    selectionProps,
    sortProps,
    columnDefinitions,
    getScrollableElement,
    infiniteScrollProps,
  });

  // Fire onDataSourceStateChange when dataSource state changes
  useEffect(() => {
    if (dataSource && onDataSourceStateChange) {
      onDataSourceStateChange({
        data: sourceData,
        currentPage,
        hasMore,
        totalCount,
        isLoading: isSourceLoading,
        isFetchingMore,
        error,
      });
    }
  }, [dataSource, sourceData, currentPage, hasMore, totalCount, isSourceLoading, isFetchingMore, error, onDataSourceStateChange]);

  // Fire onPageChange when page changes
  useEffect(() => {
    if (dataSource && onPageChange) {
      onPageChange(currentPage);
    }
  }, [dataSource, currentPage, onPageChange]);

  // Fire onDataSourceError when error occurs
  useEffect(() => {
    if (dataSource && error && onDataSourceError) {
      onDataSourceError(error);
    }
  }, [dataSource, error, onDataSourceError]);

  const hasData = useMemo(() => processedData.length > 0, [processedData]);

  const noDataSvg = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="#ccc" height="40" width="40" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z" />
    </svg>
  );

  const noDataComponentNode = noDataComponent || (
    <div className={styles.noDataWrapper}>
      {noDataSvg}
      <div className={styles.noData}>No data</div>
    </div>
  );

  const mobileFooter = useMemo(() => {
    if (!footerRows || footerRows.length === 0) {
      return null;
    }

    // Helper to get raw column definition in this context
    const getRaw = (colDef: ColumnDefinition<TData>) => {
        if (typeof colDef === 'function') {
            return processedData.length > 0 ? colDef(processedData[0], 0) : { displayLabel: '', cellRenderer: () => '' };
        }
        return colDef;
    };

    return (
      <div className={styles.footerCard}>
        <div className={styles['footer-card-body']}>
          {footerRows.map((row, rowIndex) => {
            let currentColumnIndex = 0;
            return (
              <div key={rowIndex}>
                {row.columns.map((col, colIndex) => {
                  let label = col.displayLabel;
                  if (!label && col.colSpan === 1) {
                    const header = columnDefinitions[currentColumnIndex];
                    if (header) {
                      label = getRaw(header).displayLabel;
                    }
                  }
                  currentColumnIndex += col.colSpan;
                  return (
                    <p
                      key={colIndex}
                      className={`${styles['footer-card-row']} ${col.className || ''} ${
                        col.onCellClick ? styles.clickableFooterCell : ''
                      }`}
                      onClick={col.onCellClick}
                    >
                      {label && <span className={styles['card-label']}>{label}</span>}
                      <span className={styles['card-value']}>{col.cellRenderer()}</span>
                    </p>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [footerRows, columnDefinitions, processedData]);

  const renderPluginHeaders = useCallback(() => {
    if (!activePlugins) {
      return null;
    }

    return activePlugins.map((plugin: IResponsiveTablePlugin<TData>) => {
      if (plugin.renderHeader) {
        if (plugin.id === 'sort' && !isMobile) {
          return null;
        }
        return <div key={plugin.id}>{plugin.renderHeader()}</div>;
      }
      return null;
    });
  }, [activePlugins, isMobile]);

  const renderPluginFooters = useCallback(() => {
    if (!plugins) {
      return null;
    }

    return plugins.map((plugin: IResponsiveTablePlugin<TData>) => {
      if (plugin.renderFooter) {
        return <div key={plugin.id + '-footer'}>{plugin.renderFooter()}</div>;
      }
      return null;
    });
  }, [plugins]);

  const isLoading = animationProps?.isLoading || isSourceLoading;

  const resolvedAnimationProps = useMemo(() => ({
    animateOnLoad: animationProps?.animateOnLoad,
    isLoading,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [animationProps?.animateOnLoad, animationProps?.isLoading, isLoading]);

  if (infiniteScrollProps) {
    return <InfiniteTable {...props} />;
  }

  if (isLoading && !hasData) {
    return <SkeletonView isMobile={isMobile} columnDefinitions={visibleColumns} />;
  }

  if (error && !isLoading && !hasData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        gap: '1rem',
        color: '#6c757d',
        border: '2px dashed #e0e0e0',
        borderRadius: '12px',
        backgroundColor: '#f8f9fa',
      }}>
        <div style={{ fontWeight: 500, fontSize: '1.1rem' }}>Failed to load data</div>
        <div style={{ fontSize: '0.85rem', textAlign: 'center' }}>{error.message}</div>
        <button
          onClick={resetAndFetch}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <TableProvider
      value={{
        data: currentDataToProcess,
        processedData,
        visibleColumns,
        originalColumnDefinitions: columnDefinitions,
        activePlugins,
        onRowClick,
        selectionProps,
        animationProps: resolvedAnimationProps,
        dataSource,
        pagination: dataSource ? {
          currentPage,
          pageSize: pageSize || 20,
          hasMore,
          totalCount,
          isLoading: isSourceLoading,
          isFetchingMore,
          loadNextPage,
          error,
        } : undefined,
        mobileCardClassName,
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {renderPluginHeaders()}
        </div>
        {!hasData && !isLoading && noDataComponentNode}
        {(hasData || isLoading) && isMobile && (
          <MobileView mobileFooter={mobileFooter} />
        )}
        {(hasData || isLoading) && !isMobile && (
          <DesktopView
            maxHeight={maxHeight}
            isHeaderSticky={isHeaderSticky}
            tableContainerRef={tableContainerRef}
            headerRef={headerRef}
            footerRows={footerRows}
            renderPluginFooters={renderPluginFooters}
          />
        )}
      </div>
    </TableProvider>
  );
}

const ResponsiveTable = forwardRef(ResponsiveTableInner) as <TData>(
  props: IProps<TData> & { ref?: React.Ref<ResponsiveTableHandle<TData>> }
) => React.ReactElement;

export default ResponsiveTable;
