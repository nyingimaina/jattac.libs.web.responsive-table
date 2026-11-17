import * as fs from 'fs';
import * as path from 'path';

const css = fs.readFileSync(path.join(__dirname, '..', 'Styles', 'ResponsiveTable.module.css'), 'utf8');

const rule = (selector: string): string => {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  return match ? match[1] : '';
};

// The sort icon is painted with a background colour and a mask. The mask only exists on sortable columns, so
// on any other column the icon box used to show as a solid grey square in every header.
describe('sort icon in the header', () => {
  it('draws nothing by default, so a column that cannot be sorted has no grey square', () => {
    expect(rule('.sortIcon')).toMatch(/display:\s*none/);
  });

  it('is only drawn for a column that can be sorted, or is sorted', () => {
    expect(css).toMatch(/\.sortable\s+\.sortIcon[^{]*\{[^}]*display:\s*block/);
    expect(css).toMatch(/\.sorted-asc\s+\.sortIcon[^{]*\{[^}]*display:\s*block/);
    expect(css).toMatch(/\.sorted-desc\s+\.sortIcon[^{]*\{[^}]*display:\s*block/);
  });

  it('still paints the icon with its mask for sortable columns', () => {
    expect(css).toMatch(/\.sortable\s+\.sortIcon[^{]*\{[^}]*mask-image/);
  });
});
