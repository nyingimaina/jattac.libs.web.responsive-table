import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DetailRow } from './DetailRow';

const noop = () => {};

function wrap(ui: React.ReactElement) {
  return render(<table><tbody>{ui}</tbody></table>);
}

describe('DetailRow', () => {
  it('renders a <tr> with the correct colSpan', () => {
    const { container } = wrap(
      <DetailRow row={{}} rowIndex={0} colSpan={4} expandRowRenderer={() => null} isExpanded={false} onToggle={noop} />
    );
    expect(container.querySelector('td')).toHaveAttribute('colspan', '4');
  });

  it('shows no toggle when expandRowRenderer returns null', () => {
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => null} isExpanded={false} onToggle={noop} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows no toggle when expandRowRenderer returns undefined', () => {
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => undefined} isExpanded={false} onToggle={noop} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders no toggle when collapsed', () => {
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => <div>Details</div>} isExpanded={false} onToggle={noop} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('toggle has aria-expanded=true when expanded', () => {
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => <div>Details</div>} isExpanded={true} onToggle={noop} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onToggle when toggle is clicked', () => {
    const onToggle = jest.fn();
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => <div>Details</div>} isExpanded={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('calls onToggle on Enter key', () => {
    const onToggle = jest.fn();
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => <div>Details</div>} isExpanded={true} onToggle={onToggle} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders content when isExpanded is true', () => {
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => <div>Secret details</div>} isExpanded={true} onToggle={noop} />);
    expect(screen.getByText('Secret details')).toBeInTheDocument();
  });

  it('passes the row and rowIndex to expandRowRenderer', () => {
    const row = { id: 42, name: 'Alice' };
    const renderer = jest.fn(() => <div>ok</div>);
    wrap(<DetailRow row={row} rowIndex={7} colSpan={2} expandRowRenderer={renderer} isExpanded={false} onToggle={noop} />);
    expect(renderer).toHaveBeenCalledWith(row, 7);
  });
});
