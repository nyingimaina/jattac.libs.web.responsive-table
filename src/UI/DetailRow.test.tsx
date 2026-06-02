import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DetailRow } from './DetailRow';

const noop = () => {};

describe('DetailRow', () => {
  it('renders a <tr> with the correct colSpan', () => {
    const { container } = render(
      <table><tbody>
        <DetailRow row={{}} colSpan={4} expandRowRenderer={() => null} isExpanded={false} onToggle={noop} />
      </tbody></table>
    );
    const td = container.querySelector('td');
    expect(td).toHaveAttribute('colspan', '4');
  });

  it('shows no toggle button when expandRowRenderer returns null', () => {
    render(
      <table><tbody>
        <DetailRow row={{}} colSpan={3} expandRowRenderer={() => null} isExpanded={false} onToggle={noop} />
      </tbody></table>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows no toggle button when expandRowRenderer returns undefined', () => {
    render(
      <table><tbody>
        <DetailRow row={{}} colSpan={3} expandRowRenderer={() => undefined} isExpanded={false} onToggle={noop} />
      </tbody></table>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows a toggle button when expandRowRenderer returns content', () => {
    render(
      <table><tbody>
        <DetailRow row={{}} colSpan={3} expandRowRenderer={() => <div>Details</div>} isExpanded={false} onToggle={noop} />
      </tbody></table>
    );
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('toggle button shows + when collapsed', () => {
    render(
      <table><tbody>
        <DetailRow row={{}} colSpan={3} expandRowRenderer={() => <div>Details</div>} isExpanded={false} onToggle={noop} />
      </tbody></table>
    );
    expect(screen.getByRole('button')).toHaveTextContent('+');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggle button shows − when expanded', () => {
    render(
      <table><tbody>
        <DetailRow row={{}} colSpan={3} expandRowRenderer={() => <div>Details</div>} isExpanded={true} onToggle={noop} />
      </tbody></table>
    );
    expect(screen.getByRole('button')).toHaveTextContent('−');
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onToggle when button is clicked', () => {
    const onToggle = jest.fn();
    render(
      <table><tbody>
        <DetailRow row={{}} colSpan={3} expandRowRenderer={() => <div>Details</div>} isExpanded={false} onToggle={onToggle} />
      </tbody></table>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders content when isExpanded is true', () => {
    render(
      <table><tbody>
        <DetailRow row={{}} colSpan={3} expandRowRenderer={() => <div>Secret details</div>} isExpanded={true} onToggle={noop} />
      </tbody></table>
    );
    expect(screen.getByText('Secret details')).toBeInTheDocument();
  });

  it('passes the row to expandRowRenderer', () => {
    const row = { id: 42, name: 'Alice' };
    const renderer = jest.fn(() => <div>ok</div>);
    render(
      <table><tbody>
        <DetailRow row={row} colSpan={2} expandRowRenderer={renderer} isExpanded={false} onToggle={noop} />
      </tbody></table>
    );
    expect(renderer).toHaveBeenCalledWith(row);
  });
});
