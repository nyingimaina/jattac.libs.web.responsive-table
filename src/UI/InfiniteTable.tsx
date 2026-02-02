import React, { useState, useEffect, useRef, ReactNode, useMemo, useCallback } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';
import IFooterRowDefinition from '../Data/IFooterRowDefinition';
import { IResponsiveTablePlugin } from '../Plugins/IResponsiveTablePlugin';
import { FilterPlugin } from '../Plugins/FilterPlugin';
import LoadingSpinner from './LoadingSpinner';
import NoMoreDataMessage from './NoMoreDataMessage';
import { useResponsiveTable } from '../Hooks/useResponsiveTable';

export type ColumnDefinition<TData> = 
  | IResponsiveTableColumnDefinition<TData>
  | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>);

interface IInfiniteScrollProps<TData> {
  onLoadMore: (currentData: TData[]) => Promise<TData[] | null>;
  hasMore?: boolean;
  loadingMoreComponent?: ReactNode;
  noMoreDataComponent?: ReactNode;
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
  };
  animationProps?: {
    isLoading?: boolean;
    animateOnLoad?: boolean;
  };
}

function InfiniteTable<TData>(props: IProps<TData>) {
  const {
    columnDefinitions,
    data,
    noDataComponent,
    maxHeight,
    onRowClick,
    mobileBreakpoint,
    plugins,
    enablePageLevelStickyHeader,
    infiniteScrollProps,
    filterProps,
    animationProps,
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
  const [processedData, setProcessedData] = useState<TData[]>(data || []);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [internalHasMore, setInternalHasMore] = useState<boolean>(true);
  const [activePlugins, setActivePlugins] = useState<IResponsiveTablePlugin<TData>[]>([]);

  const currentHasMore = infiniteScrollProps?.hasMore !== undefined 
    ? infiniteScrollProps.hasMore 
    : internalHasMore;

  const currentData = useMemo(() => processedData || [], [processedData]);
  const hasData = useMemo(() => currentData.length > 0, [currentData]);

  const noDataComponentNode = noDataComponent || <div className={styles.noData}>No data</div>;
  const defaultLoadingComponent = <LoadingSpinner />;
  const defaultNoMoreDataComponent = <NoMoreDataMessage />;

  const getRawColumnDefinition = useCallback((colDef: ColumnDefinition<TData>): IResponsiveTableColumnDefinition<TData> => {
    if (typeof colDef === 'function') {
      if (currentData.length === 0) {
        return { displayLabel: '', cellRenderer: () => '' };
      }
      return colDef(currentData[0], 0);
    }
    return colDef;
  }, [currentData]);

  const getColumnDefinition = useCallback((colDef: ColumnDefinition<TData>, rowIndex: number): IResponsiveTableColumnDefinition<TData> => {
    if (typeof colDef === 'function') {
      return colDef(currentData[rowIndex], rowIndex);
    }
    return colDef;
  }, [currentData]);

  const processData = useCallback(() => {
    let processed = [...internalData];
    activePlugins.forEach((plugin) => {
      if (plugin.processData) {
        processed = plugin.processData(processed);
      }
    });
    setProcessedData(processed);
  }, [internalData, activePlugins]);

  const initializePlugins = useCallback(() => {
    const pluginsToActivate: IResponsiveTablePlugin<TData>[] = [];
    if (plugins) pluginsToActivate.push(...plugins);
    if (filterProps?.showFilter && !pluginsToActivate.some(p => p.id === 'filter')) {
      pluginsToActivate.push(new FilterPlugin());
    }
    
    setActivePlugins(pluginsToActivate);
    pluginsToActivate.forEach(plugin => {
        plugin.onPluginInit?.({
            getData: () => internalData,
            forceUpdate: processData,
            getScrollableElement: () => tableContainerRef.current,
            ...props,
        });
    });
    processData();
  }, [plugins, filterProps?.showFilter, internalData, processData, props]);

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
    initializePlugins();
  }, [initializePlugins, internalData]); // Re-initialize plugins when internalData changes

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

  const onHeaderClickCallback = useCallback((colDef: ColumnDefinition<TData>): ((id: string) => void) | undefined => {
    const raw = getRawColumnDefinition(colDef);
    return raw.interactivity?.onHeaderClick;
  }, [getRawColumnDefinition]);

  const getClickableHeaderClassName = useCallback((colDef: ColumnDefinition<TData>): string => {
    const raw = getRawColumnDefinition(colDef);
    return raw.interactivity?.onHeaderClick ? raw.interactivity.className || styles.clickableHeader : '';
  }, [getRawColumnDefinition]);

  const getHeaderProps = useCallback((colDef: ColumnDefinition<TData>): React.HTMLAttributes<HTMLElement> & { className?: string } => {
    const headerProps: React.HTMLAttributes<HTMLElement> & { className?: string } = {};
    activePlugins.forEach(plugin => {
        if (plugin.getHeaderProps) {
            Object.assign(headerProps, plugin.getHeaderProps(getRawColumnDefinition(colDef)));
        }
    });
    return headerProps;
  }, [activePlugins, getRawColumnDefinition]);

  const rowClickFunction = onRowClick || (() => {});

  const rowClickStyle = useMemo(() => onRowClick ? { cursor: 'pointer' } : {}, [onRowClick]);

  const mobileView = useMemo(() => {
    return (
        <div>
            {currentData.map((row, rowIndex) => (
                <div key={rowIndex} className={`${styles['card']} ${animationProps?.animateOnLoad ? styles.animatedRow : ''}`} style={{ animationDelay: `${rowIndex * 0.05}s` }} onClick={() => rowClickFunction(row)}>
                    <div className={styles['card-body']}>
                        {columnDefinitions.map((colDef, colIndex) => {
                            const column = getColumnDefinition(colDef, rowIndex);
                            return (
                                <div key={colIndex} className={styles['card-row']}>
                                    <p>
                                        <span className={styles['card-label']}>{column.displayLabel}</span>
                                        <span className={styles['card-value']}>{column.cellRenderer(row)}</span>
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
            {isLoadingMore && (infiniteScrollProps?.loadingMoreComponent || defaultLoadingComponent)}
            {!isLoadingMore && !currentHasMore && (infiniteScrollProps?.noMoreDataComponent || defaultNoMoreDataComponent)}
        </div>
    );
  }, [currentData, animationProps, rowClickFunction, columnDefinitions, getColumnDefinition, isLoadingMore, infiniteScrollProps, defaultLoadingComponent, currentHasMore, defaultNoMoreDataComponent]);

  const largeScreenView = useMemo(() => {
    const headerClassName = maxHeight
      ? styles.internalStickyHeader
      : isHeaderSticky
      ? styles.stickyHeader
      : '';

    return (
      <div
        ref={tableContainerRef}
        onScroll={(e) => {
          debouncedScrollHandler(e.currentTarget); // For sticky header
          handleScrollForInfinite(e.currentTarget); // For infinite scroll
        }}
        style={{ maxHeight: maxHeight, overflowY: 'auto' }}
      >
        <table className={styles['responsiveTable']}>
          <thead ref={headerRef} className={headerClassName}>
            <tr>
              {columnDefinitions.map((colDef, colIndex) => {
                const rawColDef = getRawColumnDefinition(colDef);
                const headerProps = getHeaderProps(rawColDef);
                const onHeaderClick = onHeaderClickCallback(rawColDef);
                const combinedClassName = `${getClickableHeaderClassName(rawColDef)} ${headerProps.className ? styles[headerProps.className] : ''}`.trim();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { className, ...restHeaderProps } = headerProps;

                return (
                  <th key={colIndex} className={combinedClassName} {...restHeaderProps} onClick={onHeaderClick ? () => onHeaderClick(rawColDef.interactivity!.id) : undefined}>
                    <div className={styles.headerInnerWrapper}>
                        <div className={styles.headerContent}>{rawColDef.displayLabel}</div>
                        <span className={styles.sortIcon}></span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIndex) => (
              <tr key={rowIndex} className={animationProps?.animateOnLoad ? styles.animatedRow : ''} style={{ animationDelay: `${rowIndex * 0.05}s` }}>
                {columnDefinitions.map((colDef, colIndex) => (
                  <td key={colIndex} onClick={() => rowClickFunction(row)} style={rowClickStyle}>
                    {getColumnDefinition(colDef, rowIndex).cellRenderer(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {isLoadingMore && (infiniteScrollProps?.loadingMoreComponent || defaultLoadingComponent)}
        {!isLoadingMore && !currentHasMore && (infiniteScrollProps?.noMoreDataComponent || defaultNoMoreDataComponent)}
      </div>
    );
  }, [maxHeight, isHeaderSticky, tableContainerRef, debouncedScrollHandler, handleScrollForInfinite, columnDefinitions, getRawColumnDefinition, getHeaderProps, onHeaderClickCallback, getClickableHeaderClassName, currentData, animationProps, rowClickFunction, rowClickStyle, getColumnDefinition, isLoadingMore, infiniteScrollProps, defaultLoadingComponent, currentHasMore, defaultNoMoreDataComponent]);

  if (animationProps?.isLoading && !hasData) {
    return <div>Skeleton View Placeholder</div>;
  }

  return (
    <div>
      {!hasData && noDataComponentNode}
      {hasData && (isMobile ? mobileView : largeScreenView)}
    </div>
  );
}

export default InfiniteTable;