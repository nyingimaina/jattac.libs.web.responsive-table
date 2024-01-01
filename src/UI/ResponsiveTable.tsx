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
    if (Array.isArray(this.props.data) && this.props.data.length === 0) {
      return this.props.data;
    } else {
      return [];
    }
  }

  private get hasData(): boolean {
    return this.data.length > 0;
  }

  private get noDataComponent(): ReactNode {
    return this.props.noDataComponent || <div className={styles.noData}>No data</div>;
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
    return columnDefinition instanceof Function ? columnDefinition(this.props.data[0], rowIndex) : columnDefinition;
  }

  render() {
    if (!this.hasData) {
      return this.noDataComponent;
    }
    if (this.state.isMobile) {
      return (
        <div>
          {this.props.data.map((row, rowIndex) => (
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
            {this.props.data.map((row, rowIndex) => (
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
