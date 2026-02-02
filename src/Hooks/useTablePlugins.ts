import { useState, useEffect, useCallback, useRef } from 'react';
import { IResponsiveTablePlugin, IPluginAPI } from '../Plugins/IResponsiveTablePlugin';
import { FilterPlugin } from '../Plugins/FilterPlugin';
import { SelectionPlugin } from '../Plugins/SelectionPlugin';
import { SortPlugin } from '../Plugins/SortPlugin';
import { IResponsiveTableColumnDefinition, SortDirection } from '../Data/IResponsiveTableColumnDefinition';

interface UseTablePluginsProps<TData> {
  data: TData[];
  plugins?: IResponsiveTablePlugin<TData>[];
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
  };
  sortProps?: {
    initialSortColumn?: string;
    initialSortDirection?: SortDirection;
  };
  columnDefinitions: (IResponsiveTableColumnDefinition<TData> | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>))[];
  getScrollableElement: () => HTMLElement | null;
  infiniteScrollProps?: any; // TODO: Define proper type for IInfiniteScrollProps
}

interface UseTablePluginsReturn<TData> {
  processedData: TData[];
  activePlugins: IResponsiveTablePlugin<TData>[];
  forceUpdatePlugins: () => void;
}

export const useTablePlugins = <TData>(props: UseTablePluginsProps<TData>): UseTablePluginsReturn<TData> => {
  const {
    data,
    plugins,
    filterProps,
    selectionProps,
    sortProps,
    columnDefinitions,
    getScrollableElement,
    infiniteScrollProps,
  } = props;

  const [processedData, setProcessedData] = useState<TData[]>(data);
  const [activePlugins, setActivePlugins] = useState<IResponsiveTablePlugin<TData>[]>([]);
  const filterPluginRef = useRef<FilterPlugin<TData> | null>(null);

  // Memoize getRawColumnDefinition to avoid re-creation
  const getRawColumnDefinition = useCallback((columnDefinition: IResponsiveTableColumnDefinition<TData> | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>)): IResponsiveTableColumnDefinition<TData> => {
    if (typeof columnDefinition === 'function') {
      // This is a simplified version for plugin initialization context.
      // In actual rendering, it would use real data.
      return columnDefinition(data[0] || {} as TData, 0); 
    }
    return columnDefinition;
  }, [data]);

  const processData = useCallback((currentData: TData[], currentActivePlugins: IResponsiveTablePlugin<TData>[]): TData[] => {
    let processed = [...currentData];
    currentActivePlugins.forEach((plugin) => {
      if (plugin.processData) {
        processed = plugin.processData(processed);
      }
    });
    return processed;
  }, []);

  const initializePlugins = useCallback(() => {
    const newActivePlugins: IResponsiveTablePlugin<TData>[] = [];

    if (plugins) {
      newActivePlugins.push(...plugins);
    }

    if (filterProps?.showFilter) {
      if (!filterPluginRef.current) {
        filterPluginRef.current = new FilterPlugin();
      }
      if (!newActivePlugins.some(p => p.id === 'filter')) {
        newActivePlugins.push(filterPluginRef.current);
      }
    } else {
      filterPluginRef.current = null;
    }

    if (selectionProps?.onSelectionChange && !newActivePlugins.some(p => p.id === 'selection')) {
      newActivePlugins.push(new SelectionPlugin());
    }

    const isAnyColumnSortable = columnDefinitions.some(col => {
        const rawCol = getRawColumnDefinition(col);
        return rawCol.sortComparer || rawCol.getSortableValue;
    });

    if (isAnyColumnSortable && !newActivePlugins.some(p => p.id === 'sort')) {
        newActivePlugins.push(new SortPlugin(sortProps));
    }

    setActivePlugins(newActivePlugins);

    const api: IPluginAPI<TData> = {
        getData: () => data,
        forceUpdate: forceUpdatePlugins,
        getScrollableElement: getScrollableElement,
        infiniteScrollProps: infiniteScrollProps,
        filterProps: filterProps,
        selectionProps: selectionProps,
        columnDefinitions: columnDefinitions,
    };

    newActivePlugins.forEach((plugin) => {
      if (plugin.onPluginInit) {
        plugin.onPluginInit(api);
      }
    });

    return processData(data, newActivePlugins);
  }, [
    data,
    plugins,
    filterProps,
    selectionProps,
    sortProps,
    columnDefinitions,
    getScrollableElement,
    infiniteScrollProps,
    processData,
    getRawColumnDefinition,
  ]);

  const forceUpdatePlugins = useCallback(() => {
    setProcessedData(initializePlugins());
  }, [initializePlugins]);

  useEffect(() => {
    forceUpdatePlugins();
  }, [
    data,
    plugins,
    filterProps,
    selectionProps,
    sortProps,
    columnDefinitions,
    infiniteScrollProps,
    forceUpdatePlugins,
  ]);

  return { processedData, activePlugins, forceUpdatePlugins };
};
