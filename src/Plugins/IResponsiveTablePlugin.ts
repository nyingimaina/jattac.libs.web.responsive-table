import { ReactNode } from 'react';

export interface IResponsiveTablePlugin<TData> {
  // A unique identifier for the plugin
  id: string;

  // Optional: Renders a UI component above the table
  renderHeader?: () => ReactNode;

  // Optional: Processes the data before it's rendered
  processData?: (data: TData[]) => TData[];

  // Optional: A callback that the table can use to provide the plugin with its own API
  onPluginInit?: (api: IPluginAPI<TData>) => void;
}

export interface IPluginAPI<TData> {
  // Function to get the current data from the table
  getData: () => TData[];

  // Function to force the table to re-render
  forceUpdate: () => void;
}
