import { SortPlugin } from './SortPlugin';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';
import { IPluginAPI } from './IResponsiveTablePlugin';

interface Row {
  id: number;
  name: string;
}

const columnDefinition: IResponsiveTableColumnDefinition<Row> = {
  columnId: 'name',
  displayLabel: 'Name',
  cellRenderer: (row) => row.name,
  getSortableValue: (row) => row.name,
};

const createPlugin = (forceUpdate: () => void) => {
  const plugin = new SortPlugin<Row>();
  const api: IPluginAPI<Row> = {
    getData: () => [],
    forceUpdate,
    columnDefinitions: [columnDefinition],
  };
  plugin.onPluginInit(api);
  return plugin;
};

const click = (handler: (e: React.MouseEvent<HTMLElement>) => void, target: HTMLElement) => {
  handler({ target } as unknown as React.MouseEvent<HTMLElement>);
};

describe('R3: SortPlugin header clicks after removing debug output', () => {
  it('R3: clicking a sortable header still cycles the sort direction asc, desc, none', () => {
    const forceUpdate = jest.fn();
    const plugin = createPlugin(forceUpdate);
    const onClick = plugin.getHeaderProps(columnDefinition).onClick!;
    const plainTarget = () => document.createElement('div');

    expect(plugin.getHeaderProps(columnDefinition)['aria-sort']).toBe('none');

    click(onClick, plainTarget());
    expect(plugin.getHeaderProps(columnDefinition)['aria-sort']).toBe('ascending');

    click(onClick, plainTarget());
    expect(plugin.getHeaderProps(columnDefinition)['aria-sort']).toBe('descending');

    click(onClick, plainTarget());
    expect(plugin.getHeaderProps(columnDefinition)['aria-sort']).toBe('none');

    expect(forceUpdate).toHaveBeenCalledTimes(3);
  });

  it('R3: clicking an interactive element inside a sortable header still does not sort', () => {
    const forceUpdate = jest.fn();
    const plugin = createPlugin(forceUpdate);
    const onClick = plugin.getHeaderProps(columnDefinition).onClick!;

    click(onClick, document.createElement('button'));

    expect(plugin.getHeaderProps(columnDefinition)['aria-sort']).toBe('none');
    expect(forceUpdate).not.toHaveBeenCalled();
  });

  it('R3: the sortable header click handler emits no console output', () => {
    const forceUpdate = jest.fn();
    const plugin = createPlugin(forceUpdate);
    const onClick = plugin.getHeaderProps(columnDefinition).onClick!;

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);
    try {
      click(onClick, document.createElement('div'));
      click(onClick, document.createElement('button'));
      expect(logSpy).not.toHaveBeenCalled();
      expect(debugSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
      debugSpy.mockRestore();
    }
  });
});
