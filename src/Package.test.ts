/**
 * @jest-environment node
 */
import { spawnSync } from 'child_process';
import { rmSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..');
const dist = join(root, 'dist');

let buildStatus: number | null = null;
let validateStatus: number | null = null;
let validateOutput = '';

beforeAll(() => {
  rmSync(dist, { recursive: true, force: true });

  const build = spawnSync('npm', ['run', 'build'], { cwd: root, encoding: 'utf8', shell: true });
  buildStatus = build.status;

  const validate = spawnSync('npm', ['run', 'validate-package'], { cwd: root, encoding: 'utf8', shell: true });
  validateStatus = validate.status;
  validateOutput = `${validate.stdout ?? ''}\n${validate.stderr ?? ''}`;
}, 300000);

describe('R2: publishable package checks', () => {
  it('R2: validate-package exits 0 against a package built fresh from a clean state', () => {
    expect(buildStatus).toBe(0);
    expect(validateStatus).toBe(0);
  });

  it('R2: attw reports no entry masquerading as another module kind (no FalseCJS)', () => {
    expect(validateOutput).not.toMatch(/Masquerading as CJS/);
    expect(validateOutput).not.toMatch(/FalseCJS/);
  });

  it('R2: the ESM declaration fix does not regress the CommonJS entry', () => {
    expect(validateOutput).toMatch(/node16 \(from CJS\)[^\n]*🟢/);
    expect(validateOutput).toMatch(/node16 \(from ESM\)[^\n]*🟢/);
  });
});
