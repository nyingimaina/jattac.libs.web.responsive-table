import React, { useState, useEffect, useRef, ReactNode, useMemo, useCallback } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { SortDirection } from '../Data/IResponsiveTableColumnDefinition';
import IFooterRowDefinition from '../Data/IFooterRowDefinition';
import { IResponsiveTablePlugin } from '../Plugins/IResponsiveTablePlugin';
import LoadingSpinner from './LoadingSpinner';
import NoMoreDataMessage from './NoMoreDataMessage';
import { useResponsiveTable } from '../Hooks/useResponsiveTable';
import { useTablePlugins } from '../Hooks/useTablePlugins';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import SkeletonView from './SkeletonView';
import { TableProvider, ColumnDefinition } from '../Context/TableContext';

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
  columnDefinitions: ColumnDefinition<TData>[];
  data: TData[];
  noDataComponent?: ReactNode;
  maxHeight?: string;
  onRowClick?: (item: TData) => void;
  footerRows?: IFooterRowDefinition[];
  mobileBreakpoint?: number;
  plugins?: IResponsiveTablePlugin<TData>[];
  enablePageLevelStickyHeader?: boolean;
  infiniteScrollProps?: IInfiniteScrollProps<TData>;
  filterProps?: {
    showFilter?: boolean;
    filterPlaceholder?: string;
    className?: string;
  };
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
  sortProps?: ISortProps;
}

function InfiniteTable<TData>(props: IProps<TData>) {
  const {
    columnDefinitions,
    data,
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
  } = props;

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  const { isMobile, isHeaderSticky, debouncedScrollHandler } = useResponsiveTable({
    mobileBreakpoint,
    enablePageLevelStickyHeader,
    maxHeight,
    headerRef,
    scrollableRef: tableContainerRef,
  });

  const [internalData, setInternalData] = useState<TData[]>(data || []);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [internalHasMore, setInternalHasMore] = useState<boolean>(true);

  const getScrollableElement = useCallback(() => tableContainerRef.current, []);

  const { processedData, activePlugins, visibleColumns } = useTablePlugins({
    data: internalData,
    plugins,
    filterProps,
    selectionProps,
    sortProps,
    columnDefinitions,
    getScrollableElement,
    infiniteScrollProps,
  });

  const currentHasMore = infiniteScrollProps?.hasMore !== undefined 
    ? infiniteScrollProps.hasMore 
    : internalHasMore;

  const hasData = useMemo(() => processedData.length > 0, [processedData]);

  const noDataComponentNode = noDataComponent || <div className={styles.noData}>No data</div>;
  const defaultLoadingComponent = <LoadingSpinner />;
  const defaultNoMoreDataComponent = <NoMoreDataMessage />;

  const loadMoreData = useCallback(async () => {
    if (!infiniteScrollProps || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const newItems = await infiniteScrollProps.onLoadMore?.(internalData);

      if (infiniteScrollProps.hasMore === undefined) {
        if (!newItems || newItems.length === 0) {
          setInternalHasMore(false);
        }
      }

      if (newItems && newItems.length > 0) {
        setInternalData(prevData => [...prevData, ...newItems]);
      }
    } catch (error) {
      console.error("Failed to load more items for infinite scroll:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [infiniteScrollProps, isLoadingMore, internalData]);

  useEffect(() => {
    setInternalData(data || []);
  }, [data]);

  useEffect(() => {
    if (data.length === 0) {
        loadMoreData();
    }
  }, [data.length, loadMoreData]);

  const handleScrollForInfinite = useCallback((currentTarget: HTMLDivElement) => {
    if (!currentTarget) return;
    const { scrollHeight, scrollTop, clientHeight } = currentTarget;

    if (currentHasMore && !isLoadingMore && scrollHeight - scrollTop - clientHeight < 100) {
      loadMoreData();
    }
  }, [currentHasMore, isLoadingMore, loadMoreData]);

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

  const infiniteStatusUI = (
    <>
      {isLoadingMore && (infiniteScrollProps?.loadingMoreComponent || defaultLoadingComponent)}
      {!isLoadingMore && !currentHasMore && (infiniteScrollProps?.noMoreDataComponent || defaultNoMoreDataComponent)}
    </>
  );

  if (animationProps?.isLoading && !hasData) {
    return <SkeletonView isMobile={isMobile} columnDefinitions={visibleColumns} />;
  }

  return (
    <TableProvider
      value={{
        data: internalData,
        processedData,
        visibleColumns,
        originalColumnDefinitions: columnDefinitions,
        activePlugins,
        onRowClick,
        selectionProps,
        animationProps,
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {renderPluginHeaders()}
        </div>
        {!hasData && noDataComponentNode}
        {hasData && (isMobile ? (
          <MobileView mobileFooter={mobileFooter} />
        ) : (
          <DesktopView
            maxHeight={maxHeight}
            isHeaderSticky={isHeaderSticky}
            tableContainerRef={tableContainerRef}
            headerRef={headerRef}
            footerRows={footerRows}
            renderPluginFooters={renderPluginFooters}
            onScroll={(e) => {
              debouncedScrollHandler(e.currentTarget); // For sticky header
              handleScrollForInfinite(e.currentTarget); // For infinite scroll
            }}
          />
        ))}
        {hasData && infiniteStatusUI}
      </div>
    </TableProvider>
  );
}

export default InfiniteTable;