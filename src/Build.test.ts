/**
 * @jest-environment node
 */
import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..');
const dist = join(root, 'dist');

const runBuild = () => execSync('npm run build', { cwd: root, stdio: 'pipe' });

describe('R1: library build', () => {
  jest.setTimeout(180000);

  it('R1: npm run build exits 0 from a clean state (dist deleted) and emits index.js and index.mjs', () => {
    rmSync(dist, { recursive: true, force: true });
    expect(() => runBuild()).not.toThrow();
    expect(existsSync(join(dist, 'index.js'))).toBe(true);
    expect(existsSync(join(dist, 'index.mjs'))).toBe(true);
  });

  it('R1: npm run build gives the same result when run a second time in a row', () => {
    expect(() => runBuild()).not.toThrow();
    expect(existsSync(join(dist, 'index.js'))).toBe(true);
    expect(existsSync(join(dist, 'index.mjs'))).toBe(true);
  });
});
