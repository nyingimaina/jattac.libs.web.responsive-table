import React, { useRef, ReactNode, useMemo, useCallback } from 'react';
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
import { TableProvider, ColumnDefinition } from '../Context/TableContext';

export { ColumnDefinition };
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

function ResponsiveTable<TData>(props: IProps<TData>) {
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

  const { isMobile, isHeaderSticky } = useResponsiveTable({
    mobileBreakpoint,
    enablePageLevelStickyHeader,
    maxHeight,
    headerRef,
    scrollableRef: tableContainerRef,
  });

  const getScrollableElement = useCallback(() => tableContainerRef.current, []);

  const { processedData, activePlugins, visibleColumns } = useTablePlugins({
    data,
    plugins,
    filterProps,
    selectionProps,
    sortProps,
    columnDefinitions,
    getScrollableElement,
    infiniteScrollProps,
  });

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

  if (infiniteScrollProps) {
    return <InfiniteTable {...props} />;
  }

  if (animationProps?.isLoading) {
    return <SkeletonView isMobile={isMobile} columnDefinitions={visibleColumns} />;
  }

  return (
    <TableProvider
      value={{
        data,
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
        {hasData && isMobile && (
          <MobileView mobileFooter={mobileFooter} />
        )}
        {hasData && !isMobile && (
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

export default ResponsiveTable;