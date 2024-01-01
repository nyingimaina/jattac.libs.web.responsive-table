import React, { Component, ReactNode } from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import IResponsiveTableColumnDefinition from '../Data/IResponsiveTableColumnDefinition';

type ColumnDefinition<TData> =
  | IResponsiveTableColumnDefinition<TData>
  | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>);
interface IProps<TData> {
  columnDefinitions: ColumnDefinition<TData>[];
  data: TData[];
  noDataComponent?: ReactNode;
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

  render() {
    if (!this.hasData) {
      return this.noDataComponent;
    }
    if (this.state.isMobile) {
      return (
        <div>
          {this.data.map((row, rowIndex) => (
            <div key={rowIndex} className={styles['card']}>
              <div className={styles['card-header']}> </div>
              <div className={styles['card-body']}>
                {this.props.columnDefinitions.map((columnDefinition, colIndex) => {
                  const colDef = this.getColumnDefinition(columnDefinition, rowIndex);
                  return (
                    <div key={colIndex}>
                      <p>
                        <span className="font-bold">{colDef.displayLabel}:</span> {colDef.cellRenderer(row)}
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

    return (
      <div className={styles.tableContainer}>
        <table className={styles['responsiveTable']}>
          <thead>
            <tr>
              {this.props.columnDefinitions.map((columnDefinition, colIndex) => (
                <th key={colIndex}>{this.getColumnDefinition(columnDefinition, 0).displayLabel}</th>
              ))}
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
}

export default ResponsiveTable;
