import React from 'react';
import ZestTextbox from 'jattac.libs.web.zest-textbox';
import { MdClose } from 'react-icons/md';
import { IResponsiveTablePlugin, IPluginAPI } from './IResponsiveTablePlugin';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

export class FilterPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'filter';
  private filterText = '';
  private api!: IPluginAPI<TData>;
  private debounceTimeout: NodeJS.Timeout | null = null;

  constructor() {
  }

  public onPluginInit = (api: IPluginAPI<TData>) => {
    this.api = api;
  };

  public renderHeader = () => {
    if (!this.api.filterProps?.showFilter) {
      return null;
    }
    return (
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ZestTextbox
          value={this.filterText}
          placeholder={this.api.filterProps.filterPlaceholder ?? 'Search...'}
          onChange={this.handleFilterChange}
          className={this.api.filterProps.className}
          zest={{ stretch: true }}
        />
        <button
          onClick={this.handleClear}
          aria-label="Clear filter"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '2.75rem',
            minHeight: '2.75rem',
            padding: 0,
            border: 'none',
            borderRadius: '50%',
            background: 'transparent',
            cursor: 'pointer',
            color: '#666',
            opacity: this.filterText ? 1 : 0,
            pointerEvents: this.filterText ? 'auto' : 'none',
            transition: 'opacity 0.15s ease',
            flexShrink: 0,
          }}
        >
          <MdClose size={20} />
        </button>
      </div>
    );
  };

  public processData = (data: TData[]): TData[] => {
    if (this.api.filterProps?.mode === 'server') {
      return data;
    }

    if (!this.filterText || !this.api.columnDefinitions) {
      return data;
    }

    const lowercasedFilter = this.filterText.toLowerCase();

    return data.filter((row) => {
      return this.api.columnDefinitions!.some((colDef) => {
        // If colDef is a function, it won't have getFilterableValue, so skip it.
        if (typeof colDef === 'function') {
          return false;
        }

        // Now we know colDef is an object (IResponsiveTableColumnDefinition<TData>)
        const typedColDef = colDef as IResponsiveTableColumnDefinition<TData>;

        // Use a type guard to check if getFilterableValue exists on this branch of the union
        if ('getFilterableValue' in typedColDef && typedColDef.getFilterableValue) {
          const value = typedColDef.getFilterableValue(row);
          return value?.toString().toLowerCase().includes(lowercasedFilter);
        }
        return false; // If getFilterableValue is not present or not a function
      });
    });
  };

  public renderCell = (
    content: React.ReactNode,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _row: TData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _column: IResponsiveTableColumnDefinition<TData>
  ): React.ReactNode => {
    if (this.api.filterProps?.mode === 'server') {
      return content;
    }

    if (!this.filterText || typeof content !== 'string') {
      return content;
    }

    const parts = content.split(new RegExp(`(${this.filterText})`, 'gi'));

    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === this.filterText.toLowerCase() ? (
            <strong key={i}>{part}</strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  private handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const currentFilterText = e.target.value;

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    this.debounceTimeout = setTimeout(() => {
      this.filterText = currentFilterText;
      this.api.forceUpdate();
      this.api.onFilterChange?.(currentFilterText);
    }, 300);
  };

  private handleClear = () => {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.filterText = '';
    this.api.forceUpdate();
    this.api.onFilterChange?.('');
  };
}
