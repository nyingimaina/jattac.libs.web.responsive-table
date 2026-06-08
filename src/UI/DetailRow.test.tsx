import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DetailRow } from './DetailRow';

function wrap(ui: React.ReactElement) {
  return render(<table><tbody>{ui}</tbody></table>);
}

describe('DetailRow', () => {
  it('renders a <tr> with the correct colSpan', () => {
    const { container } = wrap(
      <DetailRow row={{}} rowIndex={0} colSpan={4} expandRowRenderer={() => null} isExpanded={false} />
    );
    expect(container.querySelector('td')).toHaveAttribute('colspan', '4');
  });

  it('renders no toggle button (toggle bar was removed)', () => {
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => <div>Details</div>} isExpanded={true} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders content when isExpanded is true', () => {
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => <div>Secret details</div>} isExpanded={true} />);
    expect(screen.getByText('Secret details')).toBeInTheDocument();
  });

  it('does not render content when isExpanded is false', () => {
    wrap(<DetailRow row={{}} rowIndex={0} colSpan={3} expandRowRenderer={() => <div>Secret details</div>} isExpanded={false} />);
    expect(screen.queryByText('Secret details')).toBeNull();
  });

  it('passes the row and rowIndex to expandRowRenderer', () => {
    const row = { id: 42, name: 'Alice' };
    const renderer = jest.fn(() => <div>ok</div>);
    wrap(<DetailRow row={row} rowIndex={7} colSpan={2} expandRowRenderer={renderer} isExpanded={false} />);
    expect(renderer).toHaveBeenCalledWith(row, 7);
  });
});
