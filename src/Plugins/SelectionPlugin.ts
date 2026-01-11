import React from 'react';
import { IResponsiveTablePlugin, IPluginAPI } from './IResponsiveTablePlugin';
import styles from '../Styles/ResponsiveTable.module.css';

export class SelectionPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'selection';
  private api!: IPluginAPI<TData>;

  // Internal state for uncontrolled mode
  private internalSelectedIds = new Set<string | number>();

  constructor() {}

  public onPluginInit = (api: IPluginAPI<TData>) => {
    this.api = api;
    // For uncontrolled mode, initialize with selectedItems if provided on first render
    if (this.api.selectionProps?.selectedItems && this.internalSelectedIds.size === 0) {
      const { selectedItems, rowIdKey } = this.api.selectionProps;
      if (selectedItems && rowIdKey) {
        const initialIds = selectedItems.map(item => item[rowIdKey] as string | number);
        this.internalSelectedIds = new Set(initialIds);
      }
    }
  };

  private getRowId = (row: TData): string | number => {
    const { rowIdKey } = this.api.selectionProps!;
    return row[rowIdKey] as string | number;
  };

  private isControlled = (): boolean => {
    return this.api.selectionProps?.selectedItems !== undefined;
  };

  private getSelectedIds = (): Set<string | number> => {
    if (this.isControlled()) {
      const { selectedItems, rowIdKey } = this.api.selectionProps!;
      return new Set(selectedItems?.map(item => item[rowIdKey] as string | number) || []);
    }
    return this.internalSelectedIds;
  };

  private handleRowClick = (row: TData) => {
    const { onSelectionChange, mode = 'multiple', rowIdKey } = this.api.selectionProps!;
    const currentSelectedIds = this.getSelectedIds();
    const newSelectedIds = new Set(currentSelectedIds);
    const rowId = this.getRowId(row);

    if (mode === 'single') {
      if (newSelectedIds.has(rowId)) {
        newSelectedIds.clear();
      } else {
        newSelectedIds.clear();
        newSelectedIds.add(rowId);
      }
    } else { // multiple
      if (newSelectedIds.has(rowId)) {
        newSelectedIds.delete(rowId);
      } else {
        newSelectedIds.add(rowId);
      }
    }

    if (!this.isControlled()) {
      this.internalSelectedIds = newSelectedIds;
    }

    const allData = this.api.getData();
    const selectedItems = allData.filter(item => newSelectedIds.has(item[rowIdKey] as string | number));

    onSelectionChange(selectedItems);

    // In uncontrolled mode, we need to force a re-render to show the selection change
    if (!this.isControlled()) {
      this.api.forceUpdate();
    }
  };

  public getRowProps = (row: TData): React.HTMLAttributes<HTMLTableRowElement> => {
    const { selectedRowClassName } = this.api.selectionProps || {};
    const selectedIds = this.getSelectedIds();
    const rowId = this.getRowId(row);
    const isSelected = selectedIds.has(rowId);

    const combinedClassName = [
      isSelected ? styles.selectedRow : '',
      isSelected ? selectedRowClassName : ''
    ].filter(Boolean).join(' ');

    return {
      className: combinedClassName,
      onClick: () => this.handleRowClick(row),
      'aria-selected': isSelected,
    };
  };
}
