import React, { useState, useEffect, useRef, ReactNode, useMemo, useCallback } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { IResponsiveTableColumnDefinition, SortDirection } from '../Data/IResponsiveTableColumnDefinition';
import IFooterRowDefinition from '../Data/IFooterRowDefinition';
import { IResponsiveTablePlugin } from '../Plugins/IResponsiveTablePlugin';
import LoadingSpinner from './LoadingSpinner';
import NoMoreDataMessage from './NoMoreDataMessage';
import { useResponsiveTable } from '../Hooks/useResponsiveTable';
import { useTablePlugins } from '../Hooks/useTablePlugins';
import DesktopView from './DesktopView';
import MobileView from './MobileView';
import SkeletonView from './SkeletonView';

export type ColumnDefinition<TData> = 
  | IResponsiveTableColumnDefinition<TData>
  | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>);

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

  const { processedData, activePlugins } = useTablePlugins({
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

  const currentData = useMemo(() => {
    if (Array.isArray(processedData) && processedData.length > 0) {
      return processedData;
    } else {
      return [];
    }
  }, [processedData]);

  const hasData = useMemo(() => currentData.length > 0, [currentData]);

  const noDataComponentNode = noDataComponent || <div className={styles.noData}>No data</div>;
  const defaultLoadingComponent = <LoadingSpinner />;
  const defaultNoMoreDataComponent = <NoMoreDataMessage />;

  const getRawColumnDefinition = (columnDefinition: ColumnDefinition<TData>): IResponsiveTableColumnDefinition<TData> => {
    if (typeof columnDefinition === 'function') {
      if (currentData.length === 0) {
        return { displayLabel: '', cellRenderer: () => '' };
      }
      return columnDefinition(currentData[0], 0);
    }
    return columnDefinition;
  };

  const getColumnDefinition = (
    columnDefinition: ColumnDefinition<TData>,
    rowIndex: number,
  ): IResponsiveTableColumnDefinition<TData> => {
    if (!hasData) {
      return { displayLabel: '', cellRenderer: () => '' };
    }
    return columnDefinition instanceof Function ? columnDefinition(currentData[rowIndex], rowIndex) : columnDefinition;
  };

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

  const onHeaderClickCallback = (colDef: ColumnDefinition<TData>): ((id: string) => void) | undefined => {
    const rawColumnDefinition = getRawColumnDefinition(colDef);
    return rawColumnDefinition.interactivity?.onHeaderClick;
  };

  const getClickableHeaderClassName = (
    onHeaderClickCallback: ((id: string) => void) | undefined,
    colDef: ColumnDefinition<TData>,
  ): string => {
    const rawColumnDefinition = getRawColumnDefinition(colDef);
    return onHeaderClickCallback
      ? rawColumnDefinition.interactivity?.className || styles.clickableHeader
      : '';
  };

  const getHeaderProps = (colDef: ColumnDefinition<TData>): React.HTMLAttributes<HTMLElement> & { className?: string } => {
    const headerProps: React.HTMLAttributes<HTMLElement> & { className?: string } = {};
    activePlugins.forEach((plugin: IResponsiveTablePlugin<TData>) => {
      if (plugin.getHeaderProps) {
        Object.assign(headerProps, plugin.getHeaderProps(getRawColumnDefinition(colDef)));
      }
    });
    return headerProps;
  };

  const getRowId = (row: TData, index: number): string | number => {
    if (selectionProps && selectionProps.rowIdKey) {
      return row[selectionProps.rowIdKey] as string | number;
    }
    return index;
  };

  const getRowProps = (row: TData): React.HTMLAttributes<HTMLElement> => {
    const rowProps: React.HTMLAttributes<HTMLElement> = {};
    const clickHandlers: React.MouseEventHandler<HTMLElement>[] = [];

    activePlugins.forEach((plugin: IResponsiveTablePlugin<TData>) => {
        if (plugin.getRowProps) {
            const props = plugin.getRowProps(row);

            if (props.className) {
                rowProps.className = `${rowProps.className || ''} ${props.className}`.trim();
            }
            if (props.onClick) {
                clickHandlers.push(props.onClick);
            }
            const { ...rest } = props;
            Object.assign(rowProps, rest);
        }
    });

    if (clickHandlers.length > 0) {
        rowProps.onClick = (e) => {
            clickHandlers.forEach(handler => handler(e));
        };
    }

    return rowProps;
  };

  const renderCell = (
    content: React.ReactNode,
    row: TData,
    colDef: IResponsiveTableColumnDefinition<TData>
  ): React.ReactNode => {
    let processedContent = content;
    activePlugins.forEach((plugin: IResponsiveTablePlugin<TData>) => {
      if (plugin.renderCell) {
        processedContent = plugin.renderCell(processedContent, row, colDef);
      }
    });
    return processedContent;
  };

  const rowClickFunction = onRowClick || (() => {});

  const tableFooter = useMemo(() => {
    if (!footerRows || footerRows.length === 0) {
      return null;
    }

    return (
      <tfoot>
        {footerRows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.columns.map((col, colIndex) => (
              <td
                key={colIndex}
                colSpan={col.colSpan}
                className={`${styles.footerCell} ${col.className || ''} ${col.onCellClick ? styles.clickableFooterCell : ''}`}
                onClick={col.onCellClick}
              >
                {col.cellRenderer()}
              </td>
            ))}
          </tr>
        ))}
      </tfoot>
    );
  }, [footerRows]);

  const mobileFooter = useMemo(() => {
    if (!footerRows || footerRows.length === 0) {
      return null;
    }

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
                      label = getRawColumnDefinition(header).displayLabel;
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
  }, [footerRows, columnDefinitions]);

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

  const desktopView = (
    <DesktopView
      columnDefinitions={columnDefinitions}
      currentData={currentData}
      maxHeight={maxHeight}
      isHeaderSticky={isHeaderSticky}
      tableContainerRef={tableContainerRef}
      headerRef={headerRef}
      getRowProps={getRowProps}
      getHeaderProps={getHeaderProps}
      onHeaderClickCallback={onHeaderClickCallback}
      getClickableHeaderClassName={getClickableHeaderClassName}
      getRawColumnDefinition={getRawColumnDefinition}
      getColumnDefinition={getColumnDefinition}
      renderCell={renderCell}
      rowClickFunction={rowClickFunction}
      tableFooter={tableFooter}
      renderPluginFooters={renderPluginFooters}
      animationProps={animationProps}
      onRowClick={onRowClick}
      selectionProps={selectionProps}
      onScroll={(e) => {
        debouncedScrollHandler(e.currentTarget); // For sticky header
        handleScrollForInfinite(e.currentTarget); // For infinite scroll
      }}
    />
  );

  const mobileView = (
    <MobileView
      currentData={currentData}
      columnDefinitions={columnDefinitions}
      onRowClick={onRowClick}
      selectionProps={selectionProps}
      animationProps={animationProps}
      getRowProps={getRowProps}
      getRowId={getRowId}
      getColumnDefinition={getColumnDefinition}
      onHeaderClickCallback={onHeaderClickCallback}
      getClickableHeaderClassName={getClickableHeaderClassName}
      renderCell={renderCell}
      rowClickFunction={rowClickFunction}
      mobileFooter={mobileFooter}
    />
  );

  const skeletonView = (
    <SkeletonView
      isMobile={isMobile}
      columnDefinitions={columnDefinitions}
    />
  );

  if (animationProps?.isLoading && !hasData) {
    return skeletonView;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {renderPluginHeaders()}
      </div>
      {!hasData && noDataComponentNode}
      {hasData && (isMobile ? mobileView : desktopView)}
      {hasData && infiniteStatusUI}
    </div>
  );
}

export default InfiniteTable;