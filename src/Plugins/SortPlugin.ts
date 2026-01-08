
import { IResponsiveTablePlugin, IPluginAPI } from './IResponsiveTablePlugin';
import { IResponsiveTableColumnDefinition, SortDirection } from '../Data/IResponsiveTableColumnDefinition';

// Type-safe sort comparer helpers
const createSortComparers = <TData>() => ({
  numeric: (key: keyof TData) => (a: TData, b: TData, direction: SortDirection) => {
    const numA = parseFloat(String(a[key]));
    const numB = parseFloat(String(b[key]));
    const aIsNaN = isNaN(numA);
    const bIsNaN = isNaN(numB);

    if (aIsNaN && bIsNaN) return 0;
    if (aIsNaN) return 1; // Put non-numbers at the end
    if (bIsNaN) return -1;

    return direction === 'asc' ? numA - numB : numB - numA;
  },
  caseInsensitiveString: (key: keyof TData) => (a: TData, b: TData, direction: SortDirection) => {
    const valA = String(a[key] ?? '').toLowerCase();
    const valB = String(b[key] ?? '').toLowerCase();
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  },
  date: (key: keyof TData) => (a: TData, b: TData, direction: SortDirection) => {
    const dateA = new Date(String(a[key])).getTime();
    const dateB = new Date(String(b[key])).getTime();
    const aIsNaN = isNaN(dateA);
    const bIsNaN = isNaN(dateB);

    if (aIsNaN && bIsNaN) return 0;
    if (aIsNaN) return 1; // Put invalid dates at the end
    if (bIsNaN) return -1;

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
        if (columnDef.sortComparer.length < 3) {
          console.warn(
            `The custom sortComparer for column '${this.sortColumn}' should accept all three parameters (a, b, direction) to ensure correct sorting behavior. You provided a function with ${columnDef.sortComparer.length} parameters.`
          );
        }
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

    const onHeaderClick = (e: React.MouseEvent<HTMLElement>) => {
      const target = e.target as HTMLElement;
      console.log('SortPlugin: Header clicked. Target:', target);
      // If the click is on an interactive element, don't sort
      if (target.closest('input, button, a, [onclick]')) {
        console.log('SortPlugin: Interactive element clicked, ignoring sort.');
        return;
      }

      console.log('SortPlugin: Non-interactive element clicked, proceeding with sort.');
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
