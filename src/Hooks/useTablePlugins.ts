import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { IResponsiveTablePlugin, IPluginAPI } from '../Plugins/IResponsiveTablePlugin';
import { FilterPlugin } from '../Plugins/FilterPlugin';
import { SelectionPlugin } from '../Plugins/SelectionPlugin';
import { SortPlugin } from '../Plugins/SortPlugin';
import { IResponsiveTableColumnDefinition, SortDirection } from '../Data/IResponsiveTableColumnDefinition';

// initializePlugins() below rebuilds its output arrays from scratch on every
// call, so a plain setState there hands React a new reference even when
// nothing actually changed. Any caller that doesn't memoize
// columnDefinitions/selectionProps/sortProps (columnDefinitions and
// selectionProps aren't memoized by ResponsiveTable.tsx either) recreates
// those props on every render, which reruns this hook's effect, which calls
// setState again — an infinite loop. Bailing out when the content is
// unchanged breaks that cycle without requiring every caller to memoize.
function isShallowArrayEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

interface UseTablePluginsProps<TData> {
  data: TData[];
  plugins?: IResponsiveTablePlugin<TData>[];
  filterProps?: {
    showFilter?: boolean;
    filterPlaceholder?: string;
    className?: string;
    mode?: 'client' | 'server';
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
  onFilterChange?: (filterText: string) => void;
}

interface UseTablePluginsReturn<TData> {
  processedData: TData[];
  activePlugins: IResponsiveTablePlugin<TData>[];
  visibleColumns: (IResponsiveTableColumnDefinition<TData> | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>))[];
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
    onFilterChange,
  } = props;

  const [processedData, setProcessedData] = useState<TData[]>(data);
  const [activePlugins, setActivePlugins] = useState<IResponsiveTablePlugin<TData>[]>([]);
  
  // Persist internal plugins using refs to prevent state loss
  const filterPluginRef = useRef<FilterPlugin<TData> | null>(null);
  const selectionPluginRef = useRef<SelectionPlugin<TData> | null>(null);
  const sortPluginRef = useRef<SortPlugin<TData> | null>(null);

  const getRawColumnDefinition = useCallback((columnDefinition: IResponsiveTableColumnDefinition<TData> | ((data: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>)): IResponsiveTableColumnDefinition<TData> => {
    if (typeof columnDefinition === 'function') {
      return columnDefinition(data[0] || {} as TData, 0); 
    }
    return columnDefinition;
  }, [data]);

  const visibleColumns = useMemo(() => {
    return columnDefinitions.filter(col => {
      const raw = getRawColumnDefinition(col);
      return raw.visible !== false;
    });
  }, [columnDefinitions, getRawColumnDefinition]);

  const initializePlugins = useCallback(() => {
    const newActivePlugins: IResponsiveTablePlugin<TData>[] = [];

    // 1. Add external plugins
    if (plugins) {
      newActivePlugins.push(...plugins);
    }

    // 2. Manage internal FilterPlugin
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

    // 3. Manage internal SelectionPlugin
    if (selectionProps?.onSelectionChange) {
      if (!selectionPluginRef.current) {
        selectionPluginRef.current = new SelectionPlugin();
      }
      if (!newActivePlugins.some(p => p.id === 'selection')) {
        newActivePlugins.push(selectionPluginRef.current);
      }
    } else {
      selectionPluginRef.current = null;
    }

    // 4. Manage internal SortPlugin
    const isAnyColumnSortable = columnDefinitions.some(col => {
        const rawCol = getRawColumnDefinition(col);
        return rawCol.sortComparer || rawCol.getSortableValue;
    });

    if (isAnyColumnSortable) {
      if (!sortPluginRef.current) {
        sortPluginRef.current = new SortPlugin(sortProps);
      }
      if (!newActivePlugins.some(p => p.id === 'sort')) {
        newActivePlugins.push(sortPluginRef.current);
      }
    } else {
      sortPluginRef.current = null;
    }

    setActivePlugins((prev) => (isShallowArrayEqual(prev, newActivePlugins) ? prev : newActivePlugins));

    const api: IPluginAPI<TData> = {
        getData: () => data,
        forceUpdate: forceUpdatePlugins,
        getScrollableElement: getScrollableElement,
        filterProps: filterProps,
        selectionProps: selectionProps,
        columnDefinitions: columnDefinitions,
        onFilterChange: onFilterChange,
    };

    // Initialize/Refresh all active plugins with the current API
    newActivePlugins.forEach((plugin) => {
      if (plugin.onPluginInit) {
        plugin.onPluginInit(api);
      }
    });

    // Run the data processing pipeline
    let currentProcessedData = [...data];
    newActivePlugins.forEach((plugin) => {
      if (plugin.processData) {
        currentProcessedData = plugin.processData(currentProcessedData);
      }
    });

    return currentProcessedData;
  }, [
    data,
    plugins,
    filterProps,
    selectionProps,
    sortProps,
    columnDefinitions,
    getScrollableElement,
    getRawColumnDefinition,
    onFilterChange,
  ]);

  const forceUpdatePlugins = useCallback(() => {
    const next = initializePlugins();
    setProcessedData((prev) => (isShallowArrayEqual(prev, next) ? prev : next));
  }, [initializePlugins]);

  // Handle re-initialization when props change
  useEffect(() => {
    const next = initializePlugins();
    setProcessedData((prev) => (isShallowArrayEqual(prev, next) ? prev : next));
  }, [initializePlugins]);

  return { processedData, activePlugins, visibleColumns, forceUpdatePlugins };
};
