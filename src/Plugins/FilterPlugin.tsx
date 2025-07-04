import React from 'react';
import { IResponsiveTablePlugin, IPluginAPI } from './IResponsiveTablePlugin';
import IResponsiveTableColumnDefinition from '../Data/IResponsiveTableColumnDefinition';

export class FilterPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'filter';
  private filterText = '';
  private api!: IPluginAPI<TData>;

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
      <div style={{ float: 'right', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder={this.api.filterProps.filterPlaceholder || "Search..."}
          onChange={this.handleFilterChange}
          style={{
            padding: '0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>
    );
  };

  public processData = (data: TData[]): TData[] => {
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

        // Check if getFilterableValue exists and is a function
        if (typedColDef.getFilterableValue && typeof typedColDef.getFilterableValue === 'function') {
          const value = typedColDef.getFilterableValue(row);
          return value?.toString().toLowerCase().includes(lowercasedFilter);
        }
        return false; // If getFilterableValue is not present or not a function
      });
    });
  };

  private handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Debounce the filter change
    setTimeout(() => {
      this.filterText = e.target.value;
      this.api.forceUpdate();
    }, 300);
  };
}
