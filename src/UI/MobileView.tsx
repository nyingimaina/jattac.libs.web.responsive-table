import React from 'react';
import styles from '../Styles/ResponsiveTable.module.css';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';
import { ColumnDefinition } from './ResponsiveTable';

interface MobileViewProps<TData> {
  currentData: TData[];
  columnDefinitions: ColumnDefinition<TData>[];
  onRowClick?: (item: TData) => void;
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
  getRowProps: (row: TData) => React.HTMLAttributes<HTMLElement>;
  getRowId: (row: TData, index: number) => string | number;
  getColumnDefinition: (colDef: ColumnDefinition<TData>, rowIndex: number) => IResponsiveTableColumnDefinition<TData>;
  onHeaderClickCallback: (colDef: ColumnDefinition<TData>) => ((id: string) => void) | undefined;
  getClickableHeaderClassName: (onHeaderClick: ((id: string) => void) | undefined, colDef: ColumnDefinition<TData>) => string;
  renderCell: (content: React.ReactNode, row: TData, colDef: IResponsiveTableColumnDefinition<TData>) => React.ReactNode;
  rowClickFunction: (item: TData) => void;
  mobileFooter: React.ReactNode;
}

function MobileView<TData>(props: MobileViewProps<TData>) {
  const {
    currentData,
    columnDefinitions,
    onRowClick,
    selectionProps,
    animationProps,
    getRowProps,
    getRowId,
    getColumnDefinition,
    onHeaderClickCallback,
    getClickableHeaderClassName,
    renderCell,
    rowClickFunction,
    mobileFooter,
  } = props;

  const isClickable = onRowClick || selectionProps;

  return (
    <div>
      {currentData.map((row, rowIndex) => {
        const rowProps = getRowProps(row);
        const pluginOnClick = rowProps.onClick;

        return (
          <div
            key={getRowId(row, rowIndex)}
            className={`${styles.card} ${isClickable ? styles.clickableRow : ''} ${animationProps?.animateOnLoad ? styles.animatedRow : ''} ${rowProps.className || ''}`.trim()}
            style={{ animationDelay: `${rowIndex * 0.05}s` }}
            aria-selected={rowProps['aria-selected']}
            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
              if (pluginOnClick) pluginOnClick(e);
              rowClickFunction(row);
            }}
          >
            <div className={styles['card-header']}> </div>
            <div className={styles['card-body']}>
              {columnDefinitions.map((columnDefinition, colIndex) => {
                const colDef = getColumnDefinition(columnDefinition, rowIndex);
                const onHeaderClick = onHeaderClickCallback(colDef);
                const clickableHeaderClassName = getClickableHeaderClassName(onHeaderClick, colDef);
                return (
                  <div key={colIndex} className={styles['card-row']}>
                    <p>
                      <span
                        className={`${styles['card-label']} ${clickableHeaderClassName}`}
                        onClick={
                          (e) => {
                            if (onHeaderClick) {
                              e.stopPropagation();
                              onHeaderClick(colDef.interactivity!.id)
                            }
                          }
                        }
                      >
                        {colDef.displayLabel}
                      </span>
                      <span className={styles['card-value']}>{renderCell(colDef.cellRenderer(row), row, colDef)}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      {mobileFooter}
    </div>
  );
}

export default MobileView;
