import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveTable from './ResponsiveTable';

type Row = { name: string };

const columns = [
  { displayLabel: 'Name', cellRenderer: (row: Row) => row.name, dataKey: 'name' as const },
];
const data: Row[] = [{ name: 'Alice' }, { name: 'Bob' }];
const renderer = (row: Row) => <div>{row.name}-details</div>;

function setViewport(width: number) {
  global.innerWidth = width;
  fireEvent(window, new Event('resize'));
}

const chevrons = () => screen.getAllByRole('button').filter(b => b.hasAttribute('aria-expanded') && !b.hasAttribute('data-testid'));

describe('mobile expanded-section chrome', () => {
  beforeEach(() => {
    setViewport(400);
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  it('renders no chrome while rows are collapsed', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} />);
    expect(screen.queryByTestId('rt-mobile-detail-header')).toBeNull();
    expect(screen.queryByTestId('rt-mobile-detail-footer')).toBeNull();
    expect(screen.queryByTestId('rt-mobile-detail-rail')).toBeNull();
  });

  it('renders rail, breadcrumb header and footer once a row is expanded', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} />);
    fireEvent.click(chevrons()[0]);
    expect(screen.getByTestId('rt-mobile-detail-rail')).toBeInTheDocument();
    expect(screen.getByTestId('rt-mobile-detail-header')).toBeInTheDocument();
    expect(screen.getByTestId('rt-mobile-detail-footer')).toBeInTheDocument();
    expect(screen.getByText('Alice-details')).toBeInTheDocument();
  });

  it('shows the first column value as the breadcrumb title by default', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} />);
    fireEvent.click(chevrons()[1]);
    const header = screen.getByTestId('rt-mobile-detail-header');
    expect(header).toHaveTextContent('Bob');
    expect(header).toHaveTextContent('Details');
  });

  it('uses mobileExpandTitle for the breadcrumb title when provided', () => {
    render(
      <ResponsiveTable
        data={data}
        columnDefinitions={columns}
        expandRowRenderer={renderer}
        mobileExpandTitle={row => `Order for ${row.name}`}
      />
    );
    fireEvent.click(chevrons()[0]);
    expect(screen.getByTestId('rt-mobile-detail-header')).toHaveTextContent('Order for Alice');
  });

  it.each(['rt-mobile-detail-header', 'rt-mobile-detail-footer', 'rt-mobile-detail-rail'])(
    'collapses the row when %s is tapped',
    testId => {
      render(<ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} />);
      const chevron = chevrons()[0];
      fireEvent.click(chevron);
      expect(chevron).toHaveAttribute('aria-expanded', 'true');
      fireEvent.click(screen.getByTestId(testId));
      expect(chevron).toHaveAttribute('aria-expanded', 'false');
    }
  );

  it('scrolls the card back into view when collapsing from the chrome', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} />);
    fireEvent.click(chevrons()[0]);
    fireEvent.click(screen.getByTestId('rt-mobile-detail-footer'));
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({ block: 'nearest' });
  });

  it('does not fire onRowClick when collapsing from the chrome', () => {
    const onRowClick = jest.fn();
    render(
      <ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} onRowClick={onRowClick} />
    );
    fireEvent.click(chevrons()[0]);
    fireEvent.click(screen.getByTestId('rt-mobile-detail-header'));
    fireEvent.click(screen.getByTestId('rt-mobile-detail-footer'));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('exposes only the header as the expanded control; rail is aria-hidden', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} />);
    fireEvent.click(chevrons()[0]);
    expect(screen.getByTestId('rt-mobile-detail-rail')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('rt-mobile-detail-header')).toHaveAttribute('aria-expanded', 'true');
  });

  it('removes chrome controls from the tab order after collapsing', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} />);
    const chevron = chevrons()[0];
    fireEvent.click(chevron);
    expect(screen.getByTestId('rt-mobile-detail-header')).toHaveAttribute('tabindex', '0');
    fireEvent.click(chevron);
    expect(screen.getByTestId('rt-mobile-detail-header')).toHaveAttribute('tabindex', '-1');
    expect(screen.getByTestId('rt-mobile-detail-footer')).toHaveAttribute('tabindex', '-1');
  });
});

describe('desktop has no mobile chrome', () => {
  beforeEach(() => setViewport(1024));

  it('does not render the rail, header or footer', () => {
    render(<ResponsiveTable data={data} columnDefinitions={columns} expandRowRenderer={renderer} firstRowDefaultOpen />);
    expect(screen.queryByTestId('rt-mobile-detail-header')).toBeNull();
    expect(screen.queryByTestId('rt-mobile-detail-footer')).toBeNull();
    expect(screen.queryByTestId('rt-mobile-detail-rail')).toBeNull();
  });
});
