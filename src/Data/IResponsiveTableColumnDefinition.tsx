import { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

// Base interface with common properties that all column definitions share
interface IResponsiveTableColumnDefinitionBase<TData> {
  displayLabel: ReactNode;
  /** 
   * Function to render the content of a cell. 
   * 
   * @note If the rendered content is interactive (e.g., a button or link) and 
   * the table has an `onRowClick` handler, add the `data-rt-ignore-row-click` 
   * attribute to the interactive element to prevent the row click from triggering.
   * 
   * @example
   * cellRenderer: (row) => (
   *   <button data-rt-ignore-row-click onClick={() => alert(row.id)}>
   *     Click Me
   *   </button>
   * )
   */
  cellRenderer: (data: TData) => ReactNode;
  visible?: boolean;
  dataKey?: keyof TData;
  /** Custom CSS class for the header cell. */
  headerClassName?: string;
  /** Custom styles for the header cell. */
  headerStyle?: React.CSSProperties;
  /** Custom CSS class for each body cell in this column. */
  cellClassName?: string;
  /** Custom styles for each body cell in this column. */
  cellStyle?: React.CSSProperties;
  /** Explicitly define the type of data in this column for specialized mobile formatting. */
  dataType?: 'text' | 'number' | 'date' | 'image' | 'input';
  getFilterableValue?: (data: TData) => string | number;
  interactivity?: {
    id: string;
    onHeaderClick?: (id: string) => void;
    className?: string;
  };
}

// The final type is a base definition intersected with one of three mutually exclusive cases for sorting
export type IResponsiveTableColumnDefinition<TData> = IResponsiveTableColumnDefinitionBase<TData> & (
  | {
      // Case 1: Sortable by providing a getSortableValue function. columnId is REQUIRED.
      columnId: string;
      getSortableValue: (row: TData) => string | number;
      sortComparer?: never; // Cannot be used with getSortableValue
    }
  | {
      // Case 2: Sortable by providing a custom sortComparer function. columnId is REQUIRED.
      columnId: string;
      /**
       * A custom sort function for the column.
       *
       * IMPORTANT: You must use all three parameters for the sorting to work correctly,
       * especially the `direction` parameter to handle ascending and descending sorts.
       *
       * @param a The first row data object.
       * @param b The second row data object.
       * @param direction The current sort direction ('asc' or 'desc').
       * @returns A number indicating the sort order (-1, 0, or 1).
       *
       * @example
       * sortComparer: (a, b, direction) => {
       *   const comparison = a.name.localeCompare(b.name);
       *   return direction === 'asc' ? comparison : -comparison;
       * }
       */
      sortComparer: (a: TData, b: TData, direction: SortDirection) => number;
      getSortableValue?: never; // Cannot be used with sortComparer
    }
  | {
      // Case 3: The column is not sortable. columnId is optional.
      columnId?: string;
      getSortableValue?: never;
      sortComparer?: never;
    }
);

