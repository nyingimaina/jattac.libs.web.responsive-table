
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

export interface ISortPluginOptions {
  initialSortColumn?: string; // Changed to string to accept columnId
  initialSortDirection?: SortDirection;
}

export class SortPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'sort';
  private api!: IPluginAPI<TData>;
  private sortColumn: string | null; // Changed to string to store columnId
  private sortDirection: SortDirection | null;

  public readonly comparers = createSortComparers<TData>();

  constructor(options?: ISortPluginOptions) {
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
      (col) => (typeof col === 'object' && col.columnId === this.sortColumn)
    ) as IResponsiveTableColumnDefinition<TData> | undefined;

    if (!columnDef) {
      return data;
    }

    const sortedData = [...data].sort((a, b) => {
      if ('sortComparer' in columnDef && columnDef.sortComparer) {
        return columnDef.sortComparer(a, b, this.sortDirection!);
      }

      if ('getSortableValue' in columnDef && columnDef.getSortableValue) {
        const aValue = columnDef.getSortableValue(a);
        const bValue = columnDef.getSortableValue(b);
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      // Fallback to dataKey if it exists and no other sorter is provided
      if ('dataKey' in columnDef && columnDef.dataKey) {
        const key = columnDef.dataKey as keyof TData;
        const aValue = a[key];
        const bValue = b[key];
        if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      return 0;
    });

    return sortedData;
  };

  public getHeaderProps = (columnDef: IResponsiveTableColumnDefinition<TData>) => {
    const { columnId } = columnDef;
    const isSortable = ('sortComparer' in columnDef && !!columnDef.sortComparer) || ('getSortableValue' in columnDef && !!columnDef.getSortableValue);

    // A column must have a columnId and a sort function to be sortable
    if (!isSortable || !columnId) {
      return {};
    }

    const onHeaderClick = () => {
      if (this.sortColumn === columnId) {
        if (this.sortDirection === 'desc') {
          this.sortColumn = null;
          this.sortDirection = null;
        } else {
          this.sortDirection = 'desc';
        }
      } else {
        this.sortColumn = columnId;
        this.sortDirection = 'asc';
      }
      this.api.forceUpdate();
    };

    let sortClassName = 'sortable';
    if (this.sortColumn === columnId) {
      sortClassName = `sorted-${this.sortDirection}`;
    }

    return {
      onClick: onHeaderClick,
      className: sortClassName,
      'aria-sort': (this.sortColumn === columnId ? (this.sortDirection === 'asc' ? 'ascending' : 'descending') : 'none') as 'none' | 'ascending' | 'descending',
    };
  };
}
