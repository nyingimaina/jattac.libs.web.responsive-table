import React, { CSSProperties, Component, ReactNode } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import IResponsiveTableColumnDefinition from '../Data/IResponsiveTableColumnDefinition';
import IFooterRowDefinition from '../Data/IFooterRowDefinition';

export type ColumnDefinition<TData> =
  | IResponsiveTableColumnDefinition<TData>
  | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>);
interface IProps<TData> {
  columnDefinitions: ColumnDefinition<TData>[];
  data: TData[];
  noDataComponent?: ReactNode;
  maxHeight?: string;
  onRowClick?: (item: TData) => void;
  footerRows?: IFooterRowDefinition[];
  mobileBreakpoint?: number;
  isLoading?: boolean;
  animateOnLoad?: boolean;
}

interface IState {
  isMobile: boolean;
}

// Class component
class ResponsiveTable<TData> extends Component<IProps<TData>, IState> {
  private debouncedResize: () => void;

  constructor(props: IProps<TData>) {
    super(props);
    this.state = {
      isMobile: false,
    };

    this.debouncedResize = this.debounce(this.handleResize, 200);
  }

  private get mobileBreakpoint(): number {
    return this.props.mobileBreakpoint || 600;
  }

  private debounce(func: () => void, delay: number): () => void {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(), delay);
    };
  }

  private get data(): TData[] {
    if (Array.isArray(this.props.data) && this.props.data.length > 0) {
      return this.props.data;
    } else {
      return [];
    }
  }

  private get noDataSvg(): ReactNode {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="#ccc" height="40" width="40" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-14h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    );
  }

  private get hasData(): boolean {
    return this.data.length > 0;
  }

  private get noDataComponent(): ReactNode {
    return (
      this.props.noDataComponent || (
        <div className={styles.noDataWrapper}>
          {this.noDataSvg}
          <div className={styles.noData}>No data</div>
        </div>
      )
    );
  }

  componentDidMount(): void {
    this.handleResize(); // Initial check
    window.addEventListener('resize', this.debouncedResize);
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.debouncedResize);
  }

  handleResize = (): void => {
    this.setState({
      isMobile: window.innerWidth <= this.mobileBreakpoint,
    });
  };

  private getColumnDefinition(
    columnDefinition: ColumnDefinition<TData>,
    rowIndex: number,
  ): IResponsiveTableColumnDefinition<TData> {
    if (!this.hasData) {
      return { displayLabel: '', cellRenderer: () => '' };
    }
    return columnDefinition instanceof Function ? columnDefinition(this.data[0], rowIndex) : columnDefinition;
  }

  private getRawColumnDefinition(columnDefinition: ColumnDefinition<TData>): IResponsiveTableColumnDefinition<TData> {
    let rawColumnDefinition: IResponsiveTableColumnDefinition<TData> = {} as IResponsiveTableColumnDefinition<TData>;
    if (columnDefinition instanceof Function) {
      rawColumnDefinition = columnDefinition(this.data[0], 0);
    } else {
      rawColumnDefinition = columnDefinition as IResponsiveTableColumnDefinition<TData>;
    }
    return rawColumnDefinition;
  }

  private onHeaderClickCallback(columnDefinition: ColumnDefinition<TData>): ((id: string) => void) | undefined {
    const rawColumnDefinition = this.getRawColumnDefinition(columnDefinition);
    if (rawColumnDefinition.interactivity && rawColumnDefinition.interactivity.onHeaderClick) {
      return rawColumnDefinition.interactivity.onHeaderClick;
    } else {
      return undefined;
    }
  }

  private getClickableHeaderClassName(
    onHeaderClickCallback: ((id: string) => void) | undefined,
    colDef: ColumnDefinition<TData>,
  ): string {
    const rawColumnDefinition = this.getRawColumnDefinition(colDef);
    const clickableHeaderClassName = onHeaderClickCallback
      ? rawColumnDefinition.interactivity!.className || styles.clickableHeader
      : '';
    return clickableHeaderClassName;
  }

  private get rowClickFunction(): (item: TData) => void {
    if (this.props.onRowClick) {
      return this.props.onRowClick;
    } else {
      return () => {};
    }
  }

  private get rowClickStyle(): CSSProperties {
    if (this.props.onRowClick) {
      return { cursor: 'pointer' } as CSSProperties;
    } else {
      return {};
    }
  }

  private get tableFooter(): ReactNode {
    if (!this.props.footerRows || this.props.footerRows.length === 0) {
      return null;
    }

    return (
      <tfoot>
        {this.props.footerRows.map((row, rowIndex) => (
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
  }

  private get mobileFooter(): ReactNode {
    if (!this.props.footerRows || this.props.footerRows.length === 0) {
      return null;
    }

    return (
      <div className={styles.footerCard}>
        <div className={styles['footer-card-body']}>
          {this.props.footerRows.map((row, rowIndex) => {
            let currentColumnIndex = 0;
            return (
              <div key={rowIndex}>
                {row.columns.map((col, colIndex) => {
                  let label = col.displayLabel;
                  if (!label && col.colSpan === 1) {
                    const header = this.props.columnDefinitions[currentColumnIndex];
                    if (header) {
                      label = this.getRawColumnDefinition(header).displayLabel;
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
  }

  private get skeletonView(): ReactNode {
    const skeletonRowCount = 5; // Or make this configurable
    const columnCount = this.props.columnDefinitions.length;

    if (this.state.isMobile) {
      return (
        <div>
          {[...Array(skeletonRowCount)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              {[...Array(columnCount)].map((_, j) => (
                <div key={j} className={`${styles.skeleton} ${styles.skeletonText}`} style={{ marginBottom: '0.5rem' }} />
              ))}
            </div>
          ))}
        </div>
      );
    }

    return (
      <table className={styles.responsiveTable}>
        <thead>
          <tr>
            {[...Array(columnCount)].map((_, i) => (
              <th key={i}>
                <div className={`${styles.skeleton} ${styles.skeletonText}`} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(skeletonRowCount)].map((_, i) => (
            <tr key={i}>
              {[...Array(columnCount)].map((_, j) => (
                <td key={j}>
                  <div className={`${styles.skeleton} ${styles.skeletonText}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  private get mobileView(): ReactNode {
    return (
      <div>
        {this.data.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`${styles['card']} ${this.props.animateOnLoad ? styles.animatedRow : ''}`}
            style={{ animationDelay: `${rowIndex * 0.05}s` }}
            onClick={(e) => {
              this.rowClickFunction(row);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <div className={styles['card-header']}> </div>
            <div className={styles['card-body']}>
              {this.props.columnDefinitions.map((columnDefinition, colIndex) => {
                const colDef = this.getColumnDefinition(columnDefinition, rowIndex);
                const onHeaderClickCallback = this.onHeaderClickCallback(colDef);
                const clickableHeaderClassName = this.getClickableHeaderClassName(onHeaderClickCallback, colDef);
                return (
                  <div key={colIndex} className={styles['card-row']}>
                    <p>
                      <span
                        className={`${styles['card-label']} ${clickableHeaderClassName}`}
                        onClick={
                          onHeaderClickCallback ? () => onHeaderClickCallback(colDef.interactivity!.id) : undefined
                        }
                      >
                        {colDef.displayLabel}
                      </span>
                      <span className={styles['card-value']}>{colDef.cellRenderer(row)}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {this.mobileFooter}
      </div>
    );
  }

  private get largeScreenView(): ReactNode {
    const useFixedHeaders = this.props.maxHeight ? true : false;

    const fixedHeadersStyle = useFixedHeaders
      ? ({ maxHeight: this.props.maxHeight, overflowY: 'auto' } as CSSProperties)
      : {};

    return (
      <div style={fixedHeadersStyle}>
        <table className={styles['responsiveTable']} style={{ zIndex: -1 }}>
          <thead>
            <tr>
              {this.props.columnDefinitions.map((columnDefinition, colIndex) => {
                const onHeaderClickCallback = this.onHeaderClickCallback(columnDefinition);
                const clickableHeaderClassName = this.getClickableHeaderClassName(
                  onHeaderClickCallback,
                  columnDefinition,
                );
                return (
                  <th
                    key={colIndex}
                    className={`${clickableHeaderClassName}`}
                    style={{ zIndex: 0 }}
                    onClick={
                      onHeaderClickCallback
                        ? () => onHeaderClickCallback(this.getColumnDefinition(columnDefinition, 0).interactivity!.id)
                        : undefined
                    }
                  >
                    {this.getColumnDefinition(columnDefinition, 0).displayLabel}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {this.data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={this.props.animateOnLoad ? styles.animatedRow : ''}
                style={{ animationDelay: `${rowIndex * 0.05}s` }}
              >
                {this.props.columnDefinitions.map((columnDefinition, colIndex) => (
                  <td onClick={() => this.rowClickFunction(row)} key={colIndex}>
                    <span style={{ ...this.rowClickStyle }}>
                      {this.getColumnDefinition(columnDefinition, rowIndex).cellRenderer(row)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {this.tableFooter}
        </table>
      </div>
    );
  }

  render() {
    if (this.props.isLoading) {
      return this.skeletonView;
    }

    if (!this.hasData) {
      return this.noDataComponent;
    }
    if (this.state.isMobile) {
      return this.mobileView;
    }

    return this.largeScreenView;
  }
}

export default ResponsiveTable;
