import React, { CSSProperties, Component, ReactNode, createRef, UIEvent } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';
import IFooterRowDefinition from '../Data/IFooterRowDefinition';
import { IResponsiveTablePlugin } from '../Plugins/IResponsiveTablePlugin';
import { FilterPlugin } from '../Plugins/FilterPlugin';
import LoadingSpinner from './LoadingSpinner';
import NoMoreDataMessage from './NoMoreDataMessage';

export type ColumnDefinition<TData> = 
  | IResponsiveTableColumnDefinition<TData>
  | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>);

type InfiniteScrollDisabled = {
  enableInfiniteScroll?: false;
  onLoadMore?: never;
  hasMore?: never;
  loadingMoreComponent?: never;
  noMoreDataComponent?: never;
};

type InfiniteScrollEnabled<TData> = {
  enableInfiniteScroll: true;
  onLoadMore: (currentData: TData[]) => Promise<TData[] | null>;
  hasMore?: boolean;
  loadingMoreComponent?: ReactNode;
  noMoreDataComponent?: ReactNode;
};

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
  infiniteScrollProps?: InfiniteScrollDisabled | InfiniteScrollEnabled<TData>;
  filterProps?: {
    showFilter?: boolean;
    filterPlaceholder?: string;
  };
  animationProps?: {
    isLoading?: boolean;
    animateOnLoad?: boolean;
  };
}

interface IState<TData> {
  isMobile: boolean;
  internalData: TData[]; // Source of truth for all loaded items
  processedData: TData[]; // Data to be rendered after plugins (e.g., filter) are applied
  isLoadingMore: boolean;
  internalHasMore: boolean;
  isHeaderSticky: boolean;
  activePlugins: IResponsiveTablePlugin<TData>[];
}

class InfiniteTable<TData> extends Component<IProps<TData>, IState<TData>> {
  private debouncedResize: () => void;
  private tableContainerRef = createRef<HTMLDivElement>();
  private headerRef = createRef<HTMLTableSectionElement>();
  private throttledScrollHandler: (event: UIEvent<HTMLDivElement>) => void;

  constructor(props: IProps<TData>) {
    super(props);
    this.state = {
      isMobile: false,
      internalData: props.data || [],
      processedData: props.data || [],
      isLoadingMore: false,
      internalHasMore: true,
      isHeaderSticky: false,
      activePlugins: [],
    };
    this.debouncedResize = this.debounce(this.handleResize, 200);
    this.throttledScrollHandler = this.throttle(this.handleScroll, 200);
  }

  componentDidUpdate(prevProps: IProps<TData>) {
    if (prevProps.data !== this.props.data) {
      this.setState({ internalData: this.props.data }, () => this.processData());
    }
  }

  componentDidMount(): void {
    this.handleResize();
    window.addEventListener('resize', this.debouncedResize);
    this.initializePlugins();
    if (this.props.data.length === 0) {
        this.loadMoreData();
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.debouncedResize);
  }

  private debounce(func: () => void, delay: number): () => void {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(), delay);
    };
  }

  private throttle = (func: (event: UIEvent<HTMLDivElement>) => void, limit: number) => {
    let inThrottle: boolean;
    return (event: UIEvent<HTMLDivElement>) => {
      if (!inThrottle) {
        func(event);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  handleResize = (): void => {
    this.setState({
      isMobile: window.innerWidth <= (this.props.mobileBreakpoint || 600),
    });
  };

  private handleScroll = (event: UIEvent<HTMLDivElement>): void => {
    const { currentTarget } = event;
    const { scrollHeight, scrollTop, clientHeight } = currentTarget;
    const { isLoadingMore } = this.state;
    const hasMore = this.props.infiniteScrollProps?.hasMore !== undefined 
        ? this.props.infiniteScrollProps.hasMore 
        : this.state.internalHasMore;

    if (this.props.enablePageLevelStickyHeader !== false && this.headerRef.current) {
        const { top } = this.headerRef.current.getBoundingClientRect();
        const isSticky = top <= 0;
        if (isSticky !== this.state.isHeaderSticky) {
            this.setState({ isHeaderSticky: isSticky });
        }
    }

    if (hasMore && !isLoadingMore && scrollHeight - scrollTop - clientHeight < 100) {
      this.loadMoreData();
    }
  };

  private loadMoreData = () => {
    const { infiniteScrollProps } = this.props;
    if (!infiniteScrollProps) return;

    this.setState({ isLoadingMore: true }, async () => {
        const newItems = await infiniteScrollProps?.onLoadMore?.(this.state.internalData);

        if (this.props.infiniteScrollProps?.hasMore === undefined) {
            if (!newItems || newItems.length === 0) {
                this.setState({ internalHasMore: false });
            }
        }

        if (newItems && newItems.length > 0) {
            const newInternalData = [...this.state.internalData, ...newItems];
            this.setState({ internalData: newInternalData }, () => {
                this.processData(); // Re-process data after new items are added
            });
        }

        this.setState({ isLoadingMore: false });
    });
  }

  private initializePlugins() {
    const plugins: IResponsiveTablePlugin<TData>[] = [];
    if (this.props.plugins) plugins.push(...this.props.plugins);
    if (this.props.filterProps?.showFilter && !plugins.some(p => p.id === 'filter')) {
      plugins.push(new FilterPlugin());
    }
    
    this.setState({ activePlugins: plugins }, () => {
        plugins.forEach(plugin => {
            plugin.onPluginInit?.({
                getData: () => this.state.internalData,
                forceUpdate: () => this.processData(),
                getScrollableElement: () => this.tableContainerRef.current,
                ...this.props,
            });
        });
        this.processData();
    });
  }

  private processData = () => {
    let processed = [...this.state.internalData];
    this.state.activePlugins.forEach((plugin) => {
      if (plugin.processData) {
        processed = plugin.processData(processed);
      }
    });
    this.setState({ processedData: processed });
  }

  private get data(): TData[] {
    return this.state.processedData || [];
  }

  private get hasData(): boolean {
    return this.data.length > 0;
  }
  
  private get noDataComponent(): ReactNode {
    return this.props.noDataComponent || <div className={styles.noData}>No data</div>;
  }

  private get defaultLoadingComponent(): ReactNode {
    return <LoadingSpinner />;
  }

  private get defaultNoMoreDataComponent(): ReactNode {
    return <NoMoreDataMessage />;
  }

  private getColumnDefinition = (colDef: ColumnDefinition<TData>, rowIndex: number): IResponsiveTableColumnDefinition<TData> => {
    if (typeof colDef === 'function') {
      return colDef(this.data[rowIndex], rowIndex);
    }
    return colDef;
  }

  private getRawColumnDefinition = (colDef: ColumnDefinition<TData>): IResponsiveTableColumnDefinition<TData> => {
    if (typeof colDef === 'function') {
      return colDef(this.data[0], 0);
    }
    return colDef;
  }

  private onHeaderClickCallback = (colDef: ColumnDefinition<TData>): ((id: string) => void) | undefined => {
    const raw = this.getRawColumnDefinition(colDef);
    return raw.interactivity?.onHeaderClick;
  }

  private getClickableHeaderClassName = (colDef: ColumnDefinition<TData>): string => {
    const raw = this.getRawColumnDefinition(colDef);
    return raw.interactivity?.onHeaderClick ? raw.interactivity.className || styles.clickableHeader : '';
  }

  private getHeaderProps = (colDef: ColumnDefinition<TData>): React.HTMLAttributes<HTMLElement> & { className?: string } => {
    const headerProps: React.HTMLAttributes<HTMLElement> & { className?: string } = {};
    this.state.activePlugins.forEach(plugin => {
        if (plugin.getHeaderProps) {
            Object.assign(headerProps, plugin.getHeaderProps(this.getRawColumnDefinition(colDef)));
        }
    });
    return headerProps;
  }

  private get rowClickFunction(): (item: TData) => void {
    return this.props.onRowClick || (() => {});
  }

  private get rowClickStyle(): CSSProperties {
    return this.props.onRowClick ? { cursor: 'pointer' } : {};
  }

  private get mobileView(): ReactNode {
    const { infiniteScrollProps } = this.props;
    const { isLoadingMore } = this.state;
    const hasMore = this.props.infiniteScrollProps?.hasMore !== undefined ? this.props.infiniteScrollProps.hasMore : this.state.internalHasMore;

    return (
        <div>
            {this.data.map((row, rowIndex) => (
                <div key={rowIndex} className={`${styles['card']} ${this.props.animationProps?.animateOnLoad ? styles.animatedRow : ''}`} style={{ animationDelay: `${rowIndex * 0.05}s` }} onClick={() => this.rowClickFunction(row)}>
                    <div className={styles['card-body']}>
                        {this.props.columnDefinitions.map((colDef, colIndex) => {
                            const column = this.getColumnDefinition(colDef, rowIndex);
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
            {isLoadingMore && (infiniteScrollProps?.loadingMoreComponent || this.defaultLoadingComponent)}
            {!isLoadingMore && !hasMore && (infiniteScrollProps?.noMoreDataComponent || this.defaultNoMoreDataComponent)}
        </div>
    );
  }

  private get largeScreenView(): ReactNode {
    const { infiniteScrollProps } = this.props;
    const { isLoadingMore } = this.state;
    const hasMore = this.props.infiniteScrollProps?.hasMore !== undefined ? this.props.infiniteScrollProps.hasMore : this.state.internalHasMore;

    return (
      <div
        ref={this.tableContainerRef}
        onScroll={this.throttledScrollHandler}
        style={{ maxHeight: this.props.maxHeight, overflowY: 'auto' }}
      >
        <table className={styles['responsiveTable']}>
          <thead ref={this.headerRef} className={this.state.isHeaderSticky ? styles.stickyHeader : ''}>
            <tr>
              {this.props.columnDefinitions.map((colDef, colIndex) => {
                const rawColDef = this.getRawColumnDefinition(colDef);
                const headerProps = this.getHeaderProps(rawColDef);
                const onHeaderClickCallback = this.onHeaderClickCallback(rawColDef);
                const combinedClassName = `${this.getClickableHeaderClassName(rawColDef)} ${headerProps.className ? styles[headerProps.className] : ''}`.trim();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { className, ...restHeaderProps } = headerProps;

                return (
                  <th key={colIndex} className={combinedClassName} {...restHeaderProps} onClick={onHeaderClickCallback ? () => onHeaderClickCallback(rawColDef.interactivity!.id) : undefined}>
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
            {this.data.map((row, rowIndex) => (
              <tr key={rowIndex} className={this.props.animationProps?.animateOnLoad ? styles.animatedRow : ''} style={{ animationDelay: `${rowIndex * 0.05}s` }}>
                {this.props.columnDefinitions.map((colDef, colIndex) => (
                  <td key={colIndex} onClick={() => this.rowClickFunction(row)} style={this.rowClickStyle}>
                    {this.getColumnDefinition(colDef, rowIndex).cellRenderer(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {isLoadingMore && (infiniteScrollProps?.loadingMoreComponent || this.defaultLoadingComponent)}
        {!isLoadingMore && !hasMore && (infiniteScrollProps?.noMoreDataComponent || this.defaultNoMoreDataComponent)}
      </div>
    );
  }

  render() {
    if (this.props.animationProps?.isLoading && !this.hasData) {
      return <div>Skeleton View Placeholder</div>;
    }

    return (
      <div>
        {!this.hasData && this.noDataComponent}
        {this.hasData && (this.state.isMobile ? this.mobileView : this.largeScreenView)}
      </div>
    );
  }
}

export default InfiniteTable;