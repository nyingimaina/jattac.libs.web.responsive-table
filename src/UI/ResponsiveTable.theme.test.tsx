import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import '@testing-library/jest-dom';
import ResponsiveTable, { ColumnDefinition } from './ResponsiveTable';
import { DataSource } from '../Context/TableContext';
import { ResponsiveTableTheme } from '../Data/ResponsiveTableTheme';

type Row = { id: number; name: string };

const columns: ColumnDefinition<Row>[] = [{ displayLabel: 'Name', cellRenderer: (row: Row) => row.name }];
const data: Row[] = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

const root = (container: HTMLElement) => container.querySelector('[data-rt-theme]') as HTMLElement;

function setDevice(dark: boolean) {
  window.matchMedia = jest.fn().mockReturnValue({
    matches: dark,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }) as unknown as typeof window.matchMedia;
}

describe('ResponsiveTable theme', () => {
  const original = window.matchMedia;
  beforeEach(() => {
    global.innerWidth = 1024;
    fireEvent(window, new Event('resize'));
  });
  afterEach(async () => {
    await act(async () => {
      document.body.className = '';
    });
    window.matchMedia = original;
  });

  it('R1: theme="dark" shows the dark look; theme="light" the light look', () => {
    setDevice(false);
    const { container, rerender } = render(<ResponsiveTable data={data} columnDefinitions={columns} theme="dark" />);
    expect(root(container)).toHaveAttribute('data-rt-theme', 'dark');
    rerender(<ResponsiveTable data={data} columnDefinitions={columns} theme="light" />);
    expect(root(container)).toHaveAttribute('data-rt-theme', 'light');
  });

  it('R1: two tables on one page each show their own look', () => {
    const { container } = render(
      <>
        <ResponsiveTable data={data} columnDefinitions={columns} theme="dark" />
        <ResponsiveTable data={data} columnDefinitions={columns} theme="light" />
      </>
    );
    const roots = container.querySelectorAll('[data-rt-theme]');
    expect(roots[0]).toHaveAttribute('data-rt-theme', 'dark');
    expect(roots[1]).toHaveAttribute('data-rt-theme', 'light');
    expect(document.body.className).toBe('');
  });

  it('R1: theme="system" follows the device preference', () => {
    setDevice(true);
    const { container } = render(<ResponsiveTable data={data} columnDefinitions={columns} theme="system" />);
    expect(root(container)).toHaveAttribute('data-rt-theme', 'dark');
  });

  it('R1: changing theme on a mounted table keeps rows (no remount) and does not refetch', async () => {
    const dataSource: DataSource<Row> = jest.fn().mockResolvedValue({ items: data, totalCount: 2 });
    const { rerender, container } = render(
      <ResponsiveTable data={[]} dataSource={dataSource} columnDefinitions={columns} theme="light" />
    );
    const cell = await screen.findByText('Alice');
    const calls = (dataSource as jest.Mock).mock.calls.length;
    rerender(<ResponsiveTable data={[]} dataSource={dataSource} columnDefinitions={columns} theme="dark" />);
    expect(root(container)).toHaveAttribute('data-rt-theme', 'dark');
    expect(screen.getByText('Alice')).toBe(cell);
    expect((dataSource as jest.Mock).mock.calls.length).toBe(calls);
  });

  it('R1: unrecognised theme behaves as if not given', () => {
    const { container } = render(
      <ResponsiveTable data={data} columnDefinitions={columns} theme={'neon' as unknown as ResponsiveTableTheme} />
    );
    expect(root(container)).toHaveAttribute('data-rt-theme', 'light');
  });

  it('R1: the table does not store the theme', () => {
    const setItem = jest.spyOn(Storage.prototype, 'setItem');
    render(<ResponsiveTable data={data} columnDefinitions={columns} theme="dark" />);
    expect(setItem).not.toHaveBeenCalled();
    expect(document.cookie).toBe('');
    setItem.mockRestore();
  });

  it('R2: no theme and no body.dark is light, even when device prefers dark', () => {
    setDevice(true);
    const { container } = render(<ResponsiveTable data={data} columnDefinitions={columns} />);
    expect(root(container)).toHaveAttribute('data-rt-theme', 'light');
  });

  it('R2: no theme follows body.dark live; explicit prop wins over body.dark', async () => {
    const { container, rerender } = render(<ResponsiveTable data={data} columnDefinitions={columns} />);
    await act(async () => {
      document.body.classList.add('dark');
    });
    expect(root(container)).toHaveAttribute('data-rt-theme', 'dark');
    rerender(<ResponsiveTable data={data} columnDefinitions={columns} theme="light" />);
    expect(root(container)).toHaveAttribute('data-rt-theme', 'light');
    expect(document.body.className).toBe('dark');
  });

  it('R2: after unmount, body class changes cause no update warnings', async () => {
    const err = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const { unmount } = render(<ResponsiveTable data={data} columnDefinitions={columns} />);
    unmount();
    await act(async () => {
      document.body.classList.add('dark');
    });
    expect(err).not.toHaveBeenCalled();
    err.mockRestore();
  });

  it('R3: skeleton and error states are wrapped in the theme root', async () => {
    const pending: DataSource<Row> = () => new Promise(() => undefined);
    const { container } = render(
      <ResponsiveTable data={[]} dataSource={pending} columnDefinitions={columns} theme="dark" />
    );
    expect(root(container)).toHaveAttribute('data-rt-theme', 'dark');

    const failing: DataSource<Row> = jest.fn().mockRejectedValue(new Error('boom'));
    const failed = render(<ResponsiveTable data={[]} dataSource={failing} columnDefinitions={columns} theme="dark" />);
    expect(await screen.findByText('Failed to load data')).toBeInTheDocument();
    expect(root(failed.container)).toHaveAttribute('data-rt-theme', 'dark');
  });

  it('R3: detail rows, no-data and mobile cards sit inside the theme root', () => {
    const { container } = render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        theme="dark"
        expandRowRenderer={() => <span>detail</span>}
        defaultExpandedIds={[1]}
      />
    );
    expect(root(container).querySelector('table')).not.toBeNull();
    expect(screen.getAllByText('detail').length).toBeGreaterThan(0);

    const empty = render(<ResponsiveTable data={[]} columnDefinitions={columns} theme="dark" />);
    expect(root(empty.container).textContent).toContain('No data');

    global.innerWidth = 400;
    fireEvent(window, new Event('resize'));
    const mobile = render(<ResponsiveTable data={data} columnDefinitions={columns} theme="dark" />);
    expect(root(mobile.container).querySelector('.card')).not.toBeNull();
  });

  it('R3: the theme root uses CSS variables for default colour and background', () => {
    const { container } = render(<ResponsiveTable data={data} columnDefinitions={columns} theme="dark" />);
    expect(root(container).style.colorScheme).toBe('dark');
  });

  describe('theme stylesheet', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path') as typeof import('path');
    const read = (f: string) => fs.readFileSync(path.join(__dirname, '../Styles', f), 'utf8');
    const themeCss = read('Theme.module.css').replace(/\/\*[\s\S]*?\*\//g, '');

    const blocks = () => {
      const out: { selector: string; vars: Record<string, string> }[] = [];
      for (const m of themeCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        const vars: Record<string, string> = {};
        for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[d[1]] = d[2].replace(/\s+/g, ' ').trim();
        out.push({ selector: m[1].trim(), vars });
      }
      return out;
    };
    const light = () => blocks().find((b) => b.selector === ':where(:root)')!.vars;
    const dark = () => blocks().find((b) => b.selector === ':where(.themeDark)')!.vars;

    it('R3: every colour variable has a light and a different dark value', () => {
      const l = light();
      const d = dark();
      const colourVars = Object.keys(l).filter((k) => k !== '--rt-mobile-card-radius');
      expect(colourVars.length).toBeGreaterThan(20);
      for (const k of colourVars) {
        expect(d[k]).toBeDefined();
        expect(d[k]).not.toBe(l[k]);
      }
      expect(Object.keys(d).filter((k) => !(k in l))).toEqual([]);
    });

    it('R3: every variable the table styles read is defined in both looks (skeleton, spinner, detail rows included)', () => {
      const defined = new Set(Object.keys(light()));
      const files = ['ResponsiveTable.module.css', 'LoadingSpinner.module.css', 'NoMoreDataMessage.module.css'];
      const themed = /^--(rt-|table-|card-|text-color|interactive-color|primary-color)/;
      for (const f of files) {
        for (const m of read(f).matchAll(/var\((--[\w-]+)/g)) {
          if (themed.test(m[1])) expect({ f, v: m[1], ok: defined.has(m[1]) }).toEqual({ f, v: m[1], ok: true });
        }
      }
      for (const v of ['--rt-skeleton-bg', '--rt-spinner-track', '--rt-detail-bg']) {
        expect(dark()[v]).toBeDefined();
      }
    });

    it('R3: no hard-coded light colours remain in the table styles outside var() fallbacks, shadows and keyframes', () => {
      for (const f of ['ResponsiveTable.module.css', 'LoadingSpinner.module.css', 'NoMoreDataMessage.module.css']) {
        const css = read(f)
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '')
          .replace(/box-shadow:[^;]+;/g, '')
          .replace(/var\((?:[^()]|\([^()]*\))*\)/g, 'var()');
        expect({ f, hits: css.match(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g) ?? [] }).toEqual({ f, hits: [] });
      }
    });

    it('R3: the wrapper adds no layout box (display: contents) and declares no colour variables', () => {
      const wrapper = blocks().find((b) => b.selector === '.themeRoot')!;
      expect(themeCss).toMatch(/\.themeRoot\s*\{\s*display:\s*contents;\s*\}/);
      expect(Object.keys(wrapper.vars)).toEqual([]);
    });

    it('R2: app overrides on :root or [data-rt-theme] (e.g. --table-header-bg) are not shadowed by the wrapper', () => {
      // Light defaults sit at zero specificity on :root; dark ones at zero specificity on the wrapper.
      for (const b of blocks()) {
        if (Object.keys(b.vars).length) expect([':where(:root)', ':where(.themeDark)']).toContain(b.selector);
      }
      expect(light()['--table-header-bg']).toBeDefined();
      const { container } = render(<ResponsiveTable data={data} columnDefinitions={columns} theme="light" />);
      const w = root(container);
      expect(w.style.getPropertyValue('--table-header-bg')).toBe('');
      expect(w.className).not.toMatch(/themeDark/);
    });
  });

  it('R4: ResponsiveTableTheme type is exported from the package entry', () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const entry = require('../index');
    expect(entry.default).toBeDefined();
    const t: import('../index').ResponsiveTableTheme[] = ['light', 'dark', 'system'];
    expect(t).toHaveLength(3);
  });

  it('NFR reliability: server render with no window/matchMedia is light and warns nothing', () => {
    const err = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const html = renderToString(<ResponsiveTable data={data} columnDefinitions={columns} theme="system" />);
    expect(html).toContain('data-rt-theme="light"');
    expect(err).not.toHaveBeenCalled();
    err.mockRestore();
  });
});
