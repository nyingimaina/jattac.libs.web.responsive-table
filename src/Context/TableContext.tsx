import React, { createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';
import { IResponsiveTablePlugin } from '../Plugins/IResponsiveTablePlugin';
import styles from '../Styles/ResponsiveTable.module.css';

export type ColumnDefinition<TData> =
  | IResponsiveTableColumnDefinition<TData>
  | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>);

interface TableContextValue<TData> {
  // Data & Columns
  data: TData[];
  processedData: TData[];
  currentData: TData[]; // Added for backward compatibility/clarity
  visibleColumns: ColumnDefinition<TData>[];
  originalColumnDefinitions: ColumnDefinition<TData>[];
  
  // Plugin State
  activePlugins: IResponsiveTablePlugin<TData>[];
  
  // Props
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

  // Helper Functions (Logic)
  getRawColumnDefinition: (colDef: ColumnDefinition<TData>) => IResponsiveTableColumnDefinition<TData>;
  getColumnDefinition: (colDef: ColumnDefinition<TData>, rowIndex: number) => IResponsiveTableColumnDefinition<TData>;
  onHeaderClickCallback: (colDef: ColumnDefinition<TData>) => ((id: string) => void) | undefined;
  getClickableHeaderClassName: (onHeaderClick: ((id: string) => void) | undefined, colDef: ColumnDefinition<TData>) => string;
  getHeaderProps: (colDef: ColumnDefinition<TData>) => React.HTMLAttributes<HTMLElement> & { className?: string };
  getRowProps: (row: TData) => React.HTMLAttributes<HTMLElement>;
  getRowId: (row: TData, index: number) => string | number;
  renderCell: (content: React.ReactNode, row: TData, colDef: IResponsiveTableColumnDefinition<TData>) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TableContext = createContext<TableContextValue<any> | undefined>(undefined);

export const useTableContext = <TData,>() => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context as TableContextValue<TData>;
};

interface TableProviderProps<TData> {
  children: ReactNode;
  value: Omit<TableContextValue<TData>, 
    | 'currentData'
    | 'getRawColumnDefinition' 
    | 'getColumnDefinition' 
    | 'onHeaderClickCallback' 
    | 'getClickableHeaderClassName' 
    | 'getHeaderProps' 
    | 'getRowProps' 
    | 'getRowId' 
    | 'renderCell'
  >;
}

export function TableProvider<TData>({ children, value }: TableProviderProps<TData>) {
  const { 
    processedData, 
    activePlugins, 
    selectionProps, 
  } = value;

  const getRawColumnDefinition = useCallback((columnDefinition: ColumnDefinition<TData>): IResponsiveTableColumnDefinition<TData> => {
    if (typeof columnDefinition === 'function') {
      if (processedData.length === 0) {
        return { displayLabel: '', cellRenderer: () => '' };
      }
      return columnDefinition(processedData[0], 0);
    }
    return columnDefinition;
  }, [processedData]);

  const getColumnDefinition = useCallback((
    columnDefinition: ColumnDefinition<TData>,
    rowIndex: number,
  ): IResponsiveTableColumnDefinition<TData> => {
    if (processedData.length === 0) {
      return { displayLabel: '', cellRenderer: () => '' };
    }
    return columnDefinition instanceof Function ? columnDefinition(processedData[0], rowIndex) : columnDefinition;
  }, [processedData]);

  const onHeaderClickCallback = useCallback((colDef: ColumnDefinition<TData>): ((id: string) => void) | undefined => {
    const rawColumnDefinition = getRawColumnDefinition(colDef);
    return rawColumnDefinition.interactivity?.onHeaderClick;
  }, [getRawColumnDefinition]);

  const getClickableHeaderClassName = useCallback((
    onHeaderClick: ((id: string) => void) | undefined,
    colDef: ColumnDefinition<TData>,
  ): string => {
    const rawColumnDefinition = getRawColumnDefinition(colDef);
    return onHeaderClick
      ? rawColumnDefinition.interactivity?.className || styles.clickableHeader
      : '';
  }, [getRawColumnDefinition]);

  const getHeaderProps = useCallback((colDef: ColumnDefinition<TData>): React.HTMLAttributes<HTMLElement> & { className?: string } => {
    const headerProps: React.HTMLAttributes<HTMLElement> & { className?: string } = {};
    activePlugins.forEach((plugin: IResponsiveTablePlugin<TData>) => {
      if (plugin.getHeaderProps) {
        Object.assign(headerProps, plugin.getHeaderProps(getRawColumnDefinition(colDef)));
      }
    });
    return headerProps;
  }, [activePlugins, getRawColumnDefinition]);

  const getRowId = useCallback((row: TData, index: number): string | number => {
    if (selectionProps && selectionProps.rowIdKey) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (row as any)[selectionProps.rowIdKey] as string | number;
    }
    return index;
  }, [selectionProps]);

  const getRowProps = useCallback((row: TData): React.HTMLAttributes<HTMLElement> => {
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
  }, [activePlugins]);

  const renderCell = useCallback((
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
  }, [activePlugins]);

  const contextValue = useMemo(() => ({
    ...value,
    currentData: processedData,
    getRawColumnDefinition,
    getColumnDefinition,
    onHeaderClickCallback,
    getClickableHeaderClassName,
    getHeaderProps,
    getRowProps,
    getRowId,
    renderCell,
  }), [
    value,
    processedData,
    getRawColumnDefinition,
    getColumnDefinition,
    onHeaderClickCallback,
    getClickableHeaderClassName,
    getHeaderProps,
    getRowProps,
    getRowId,
    renderCell,
  ]);

  return (
    <TableContext.Provider value={contextValue}>
      {children}
    </TableContext.Provider>
  );
}
