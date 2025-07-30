
import { IResponsiveTablePlugin, IPluginAPI } from './IResponsiveTablePlugin';
import { IResponsiveTableColumnDefinition, SortDirection } from '../Data/IResponsiveTableColumnDefinition';

// Type-safe sort comparer helpers
const createSortComparers = <TData>() => ({
  numeric: (key: keyof TData) => (a: TData, b: TData, direction: SortDirection) => {
    const valA = a[key] as unknown as number;
    const valB = b[key] as unknown as number;
    return direction === 'asc' ? valA - valB : valB - valA;
  },
  caseInsensitiveString: (key: keyof TData) => (a: TData, b: TData, direction: SortDirection) => {
    const valA = (a[key] as unknown as string).toLowerCase();
    const valB = (b[key] as unknown as string).toLowerCase();
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  },
  date: (key: keyof TData) => (a: TData, b: TData, direction: SortDirection) => {
    const dateA = new Date(a[key] as unknown as string).getTime();
    const dateB = new Date(b[key] as unknown as string).getTime();
    return direction === 'asc' ? dateA - dateB : dateB - dateA;
  },
});

export interface ISortPluginOptions<TData> {
  initialSortColumn?: keyof TData;
  initialSortDirection?: SortDirection;
}

export class SortPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'sort';
  private api!: IPluginAPI<TData>;
  private sortColumn: keyof TData | null;
  private sortDirection: SortDirection | null;

  public readonly comparers = createSortComparers<TData>();

  constructor(options?: ISortPluginOptions<TData>) {
    this.sortColumn = options?.initialSortColumn ?? null;
    this.sortDirection = options?.initialSortDirection ?? null;
  }

  public onPluginInit = (api: IPluginAPI<TData>) => {
    this.api = api;
  };

  public processData = (data: TData[]): TData[] => {
    if (!this.sortColumn || !this.sortDirection) {
      return data;
    }

    const columnDef = this.api.columnDefinitions.find(
      (col) => ('dataKey' in col && col.dataKey === this.sortColumn)
    ) as IResponsiveTableColumnDefinition<TData> | undefined;

    if (!columnDef || !('dataKey' in columnDef)) {
      return data;
    }

    const sortedData = [...data].sort((a, b) => {
      if ('sortComparer' in columnDef && columnDef.sortComparer) {
        return columnDef.sortComparer(a, b, this.sortDirection!);
      }

      let aValue, bValue;
      if ('getSortableValue' in columnDef && columnDef.getSortableValue) {
        aValue = columnDef.getSortableValue(a);
        bValue = columnDef.getSortableValue(b);
      } else {
        aValue = a[this.sortColumn as keyof TData];
        bValue = b[this.sortColumn as keyof TData];
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedData;
  };

  public getHeaderProps = (columnDef: IResponsiveTableColumnDefinition<TData>) => {
    // Ensure dataKey exists for sortable columns
    if (!('dataKey' in columnDef)) {
      return {};
    }

    const { dataKey } = columnDef;
    const isSortable = ('sortComparer' in columnDef && !!columnDef.sortComparer) || ('getSortableValue' in columnDef && !!columnDef.getSortableValue);

    if (!isSortable) {
      return {};
    }

    const onHeaderClick = () => {
      if (this.sortColumn === dataKey) {
        if (this.sortDirection === 'desc') {
          this.sortColumn = null;
          this.sortDirection = null;
        } else {
          this.sortDirection = 'desc';
        }
      } else {
        this.sortColumn = dataKey as keyof TData;
        this.sortDirection = 'asc';
      }
      this.api.forceUpdate();
    };

    let sortClassName = 'sortable';
    if (this.sortColumn === dataKey) {
      sortClassName = `sorted-${this.sortDirection}`;
    }

    return {
      onClick: onHeaderClick,
      className: sortClassName,
      'aria-sort': (this.sortColumn === dataKey ? (this.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none') as 'none' | 'ascending' | 'descending',
    };
  };
}
