import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { readFileSync } from 'fs';
import { join } from 'path';
import ResponsiveTable from './ResponsiveTable';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

interface TestRow {
  id: number;
  name: string;
  note: string;
}

const columns: IResponsiveTableColumnDefinition<TestRow>[] = [
  { columnId: 'id', displayLabel: 'ID', cellRenderer: (row: TestRow) => row.id, dataKey: 'id' },
  { columnId: 'name', displayLabel: 'Name', cellRenderer: (row: TestRow) => row.name, dataKey: 'name' },
  { columnId: 'note', displayLabel: 'Note', cellRenderer: (row: TestRow) => row.note, dataKey: 'note' },
];

const rows: TestRow[] = [
  { id: 1, name: 'Alice', note: 'first' },
  { id: 2, name: 'Bob', note: 'second' },
];

const renderer = (row: TestRow) => <div>{row.name}-details</div>;

function setViewport(width: number) {
  global.innerWidth = width;
  fireEvent(window, new Event('resize'));
}

const chevrons = () =>
  screen.getAllByRole('button').filter(b => b.hasAttribute('aria-expanded') && !b.hasAttribute('data-testid'));

const cards = () => Array.from(document.querySelectorAll('.card')) as HTMLElement[];

const css = readFileSync(join(__dirname, '..', 'Styles', 'ResponsiveTable.module.css'), 'utf8');
const expandRowBlock = css.match(/\.mobileExpandRow\s*\{([^}]*)\}/)![1];

describe('mobile chevron placement', () => {
  beforeEach(() => {
    setViewport(400);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('R1: renders the chevron row after every data row, as the last child of the card', () => {
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} />);
    const card = cards()[0];
    const childClasses = Array.from(card.children).map(el => el.className);
    const expandRowIndex = childClasses.findIndex(c => c.includes('mobileExpandRow'));
    const bodyIndex = childClasses.findIndex(c => c.includes('card-body'));
    expect(expandRowIndex).toBeGreaterThan(bodyIndex);
    expect(expandRowIndex).toBe(childClasses.length - 1);
    expect(card.querySelectorAll('.card-row').length).toBeGreaterThan(1);
  });

  it('R1: a card with a single data row still shows the chevron row below that row', () => {
    const single = [rows[0]];
    const singleColumns = [columns[0]];
    render(<ResponsiveTable data={single} columnDefinitions={singleColumns} expandRowRenderer={renderer} />);
    const card = cards()[0];
    const expandRow = card.querySelector('.mobileExpandRow');
    const lastDataRow = card.querySelector('.card-row');
    expect(expandRow).not.toBeNull();
    expect(lastDataRow).not.toBeNull();
    expect(lastDataRow!.compareDocumentPosition(expandRow!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('R1: a card with many tall data rows keeps the chevron row after the last row', () => {
    const manyColumns: IResponsiveTableColumnDefinition<TestRow>[] = Array.from({ length: 6 }, (_, i) => ({
      columnId: `col-${i}`,
      displayLabel: `Column ${i}`,
      cellRenderer: (row: TestRow) => `${row.name} ${i}`,
    }));
    render(
      <ResponsiveTable
        data={rows.map(r => ({ ...r, note: r.note.repeat(12) }))}
        columnDefinitions={manyColumns}
        expandRowRenderer={renderer}
      />
    );
    cards().forEach(card => {
      const expandRow = card.querySelector('.mobileExpandRow');
      const dataRows = card.querySelectorAll('.card-row');
      expect(expandRow).not.toBeNull();
      expect(dataRows.length).toBe(6);
      const lastDataRow = dataRows[dataRows.length - 1];
      expect(lastDataRow.compareDocumentPosition(expandRow!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(card.lastElementChild).toBe(expandRow);
    });
  });

  it('R1: a row without expandable content shows no chevron row', () => {
    const selectiveRenderer = (row: TestRow) => (row.id === 1 ? <div>{row.name}-details</div> : null);
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={selectiveRenderer} />);
    const [firstCard, secondCard] = cards();
    expect(firstCard.querySelector('.mobileExpandRow')).not.toBeNull();
    expect(secondCard.querySelector('.mobileExpandRow')).toBeNull();
    expect(chevrons()).toHaveLength(1);
  });

  it('R1: tapping the chevron opens the detail panel for its own card only', () => {
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} />);
    fireEvent.click(chevrons()[1]);
    expect(screen.getByText('Bob-details')).toBeInTheDocument();
    expect(screen.queryByText('Alice-details')).toBeNull();
    expect(chevrons()[1]).toHaveAttribute('aria-expanded', 'true');
    expect(chevrons()[0]).toHaveAttribute('aria-expanded', 'false');
  });

  it('R1: the chevron stays inside the card and its click does not trigger the row click', () => {
    const onRowClick = jest.fn();
    render(
      <ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} onRowClick={onRowClick} />
    );
    const card = cards()[0];
    const chevron = chevrons()[0];
    expect(card.contains(chevron)).toBe(true);
    expect(card.lastElementChild!.contains(chevron)).toBe(true);
    fireEvent.click(chevron);
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('R1: Enter and Space toggle the chevron and aria-expanded follows the panel', () => {
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} />);
    const chevron = chevrons()[0];
    expect(chevron).toHaveAttribute('tabindex', '0');
    fireEvent.keyDown(chevron, { key: 'Enter' });
    expect(chevron).toHaveAttribute('aria-expanded', 'true');
    fireEvent.keyDown(chevron, { key: ' ' });
    expect(chevron).toHaveAttribute('aria-expanded', 'false');
  });

  it('R2: no bottom border or bottom margin separates the chevron row from the card body', () => {
    expect(expandRowBlock).not.toMatch(/border-bottom/);
    expect(expandRowBlock).not.toMatch(/margin-bottom/);
  });

  it('R2: the chevron row is separated from the data above it by a top border and top margin', () => {
    expect(expandRowBlock).toMatch(/border-top:\s*1px solid var\(--table-border-color\)/);
    expect(expandRowBlock).toMatch(/margin-top:\s*0\.25rem/);
  });

  it('R2: the chevron row keeps left alignment and its flex layout', () => {
    expect(expandRowBlock).toMatch(/justify-content:\s*flex-start/);
    expect(expandRowBlock).toMatch(/display:\s*flex/);
    expect(expandRowBlock).toMatch(/align-items:\s*center/);
  });

  it('R3: a collapsed card shows no panel and an expanded card shows its panel below the card', () => {
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} />);
    expect(screen.queryByTestId('rt-mobile-detail-header')).toBeNull();
    const card = cards()[0];
    fireEvent.click(chevrons()[0]);
    expect(screen.getByText('Alice-details')).toBeInTheDocument();
    const panel = card.nextElementSibling as HTMLElement;
    expect(panel.className).toContain('mobileDetailOuter');
    expect(panel).toHaveTextContent('Alice-details');
  });

  it('R3: the chevron row sits between the card data and the panel it opens', () => {
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} />);
    const card = cards()[0];
    fireEvent.click(chevrons()[0]);
    const expandRow = card.querySelector('.mobileExpandRow')!;
    const panel = card.nextElementSibling as HTMLElement;
    expect(card.lastElementChild).toBe(expandRow);
    expect(panel.previousElementSibling).toBe(card);
    expect(panel).toHaveTextContent('Alice-details');
  });

  it('R3: with two cards expanded each chevron sits above its own panel', () => {
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} />);
    fireEvent.click(chevrons()[0]);
    fireEvent.click(chevrons()[1]);
    const [firstCard, secondCard] = cards();
    expect(firstCard.nextElementSibling).toHaveTextContent('Alice-details');
    expect(secondCard.nextElementSibling).toHaveTextContent('Bob-details');
    expect(secondCard.nextElementSibling).not.toHaveTextContent('Alice-details');
    expect(firstCard.lastElementChild!.className).toContain('mobileExpandRow');
    expect(secondCard.lastElementChild!.className).toContain('mobileExpandRow');
  });

  it('R3: collapsing from the panel chrome closes the same panel', () => {
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} />);
    const chevron = chevrons()[0];
    fireEvent.click(chevron);
    expect(chevron).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByTestId('rt-mobile-detail-footer'));
    expect(chevron).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByTestId('rt-mobile-detail-header')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByTestId('rt-mobile-detail-rail')).toHaveAttribute('aria-hidden', 'true');
  });

  it('R5: the expand-collapse docs describe the chevron row at the bottom of the card', () => {
    const docs = readFileSync(join(__dirname, '..', '..', 'docs', 'expand-collapse.md'), 'utf8');
    const docRow = docs.split('\n').find(line => line.includes('.mobileExpandRow'));
    expect(docRow).toBeDefined();
    expect(docRow).not.toMatch(/top of (the )?mobile card/i);
    expect(docRow).not.toMatch(/bottom border separator/i);
    expect(docRow).toMatch(/bottom of (the )?mobile card/i);
    expect(docRow).toMatch(/above the detail panel/i);
    expect(docRow).toMatch(/top border separator/i);
  });
});

describe('desktop chevron placement', () => {
  beforeEach(() => setViewport(1024));

  it('R4: the chevron stays in the first column of the table row and no mobile chevron row renders', () => {
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} />);
    expect(document.querySelector('.mobileExpandRow')).toBeNull();
    const table = document.querySelector('table')!;
    const firstRow = table.querySelector('tbody tr')!;
    const firstCell = firstRow.children[0] as HTMLElement;
    expect(firstCell.className).toContain('expandColumn');
    expect(firstCell.querySelector('[role="button"][aria-expanded]')).not.toBeNull();
  });

  it('R4: resizing mobile to desktop and back switches between bottom-of-card and first-column placement', () => {
    setViewport(400);
    render(<ResponsiveTable data={rows} columnDefinitions={columns} expandRowRenderer={renderer} />);
    expect(cards()[0].lastElementChild!.className).toContain('mobileExpandRow');

    setViewport(1024);
    expect(document.querySelector('.mobileExpandRow')).toBeNull();
    expect(document.querySelector('table tbody td.expandColumn')).not.toBeNull();

    setViewport(400);
    expect(cards()[0].lastElementChild!.className).toContain('mobileExpandRow');
  });
});
