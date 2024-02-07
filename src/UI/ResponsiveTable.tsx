import React, { CSSProperties, Component, ReactNode } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import IResponsiveTableColumnDefinition from '../Data/IResponsiveTableColumnDefinition';

type ColumnDefinition<TData> =
  | IResponsiveTableColumnDefinition<TData>
  | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>);
interface IProps<TData> {
  columnDefinitions: ColumnDefinition<TData>[];
  data: TData[];
  noDataComponent?: ReactNode;
  maxHeight?: string;
}

interface IState {
  isMobile: boolean;
}

// Class component
class ResponsiveTable<TData> extends Component<IProps<TData>, IState> {
  constructor(props: IProps<TData>) {
    super(props);
    this.state = {
      isMobile: false,
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
    this.setState(() => {
      return { isMobile: window.innerWidth <= 600 };
    });

    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = (): void => {
    this.setState(() => {
      return { isMobile: window.innerWidth <= 600 };
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

  private get mobileView(): ReactNode {
    return (
      <div>
        {this.data.map((row, rowIndex) => (
          <div key={rowIndex} className={styles['card']}>
            <div className={styles['card-header']}> </div>
            <div className={styles['card-body']}>
              {this.props.columnDefinitions.map((columnDefinition, colIndex) => {
                const colDef = this.getColumnDefinition(columnDefinition, rowIndex);
                const onHeaderClickCallback = this.onHeaderClickCallback(colDef);
                const clickableHeaderClassName = this.getClickableHeaderClassName(onHeaderClickCallback, colDef);
                return (
                  <div key={colIndex}>
                    <p>
                      <span
                        className={`font-bold ${clickableHeaderClassName}`}
                        onClick={
                          onHeaderClickCallback ? () => onHeaderClickCallback(colDef.interactivity!.id) : undefined
                        }
                      >
                        {colDef.displayLabel}:
                      </span>{' '}
                      {colDef.cellRenderer(row)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
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
        <table className={styles['responsiveTable']}>
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
              <tr key={rowIndex}>
                {this.props.columnDefinitions.map((columnDefinition, colIndex) => (
                  <td key={colIndex}>{this.getColumnDefinition(columnDefinition, rowIndex).cellRenderer(row)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  render() {
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
