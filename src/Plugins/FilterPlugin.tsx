import React from 'react';
import { IResponsiveTablePlugin, IPluginAPI } from './IResponsiveTablePlugin';
import IResponsiveTableColumnDefinition from '../Data/IResponsiveTableColumnDefinition';

export class FilterPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'filter';
  private filterText = '';
  private api!: IPluginAPI<TData>;
  private columnDefinitions: IResponsiveTableColumnDefinition<TData>[];

  constructor(columnDefinitions: IResponsiveTableColumnDefinition<TData>[]) {
    this.columnDefinitions = columnDefinitions;
  }

  public onPluginInit = (api: IPluginAPI<TData>) => {
    this.api = api;
  };

  public renderHeader = () => {
    return (
      <div style={{ float: 'right', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search..."
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
    if (!this.filterText) {
      return data;
    }

    const lowercasedFilter = this.filterText.toLowerCase();

    return data.filter((row) => {
      return this.columnDefinitions.some((colDef) => {
        if (colDef.getFilterableValue) {
          const value = colDef.getFilterableValue(row);
          return value?.toString().toLowerCase().includes(lowercasedFilter);
        }
        return false;
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
