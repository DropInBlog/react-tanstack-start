import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { installTemplates } from '../cli/installer';

let root: string;
let log: ReturnType<typeof vi.spyOn>;

beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'dib-install-'));
  log = vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(async () => {
  log.mockRestore();
  await fs.remove(root);
});

async function fakeReactStart(dir: string, version: string) {
  const pkgDir = path.join(dir, 'node_modules', '@tanstack', 'react-start');
  await fs.ensureDir(pkgDir);
  await fs.writeJson(path.join(pkgDir, 'package.json'), { name: '@tanstack/react-start', version });
}

async function serverFnMethods(project: string, routePath = 'blog') {
  const contents = await fs.readFile(path.join(project, 'src/routes', routePath, '-data.ts'), 'utf8');
  // Only chained calls, not the explanatory comment.
  return [...contents.matchAll(/^\s*\.(\w+)\(/gm)].map((m) => m[1]);
}

const output = () => log.mock.calls.map((args) => args.join(' ')).join('\n');

describe('installTemplates validator variant', () => {
  it('uses .inputValidator for @tanstack/react-start 1.168.x', async () => {
    await fakeReactStart(root, '1.168.61');
    await installTemplates(root);
    expect(await serverFnMethods(root)).toEqual(['inputValidator', 'handler']);
    expect(output()).toContain('Using .inputValidator() for @tanstack/react-start 1.168.61');
  });

  it('uses .validator from 1.169.0 on', async () => {
    for (const version of ['1.169.0', '1.169.5', '1.200.0']) {
      const project = path.join(root, version);
      await fakeReactStart(project, version);
      await installTemplates(project);
      expect(await serverFnMethods(project)).toEqual(['validator', 'handler']);
      expect(output()).toContain(`Using .validator() for @tanstack/react-start ${version}`);
    }
  });

  it('finds a hoisted install in a parent node_modules and works with --path', async () => {
    await fakeReactStart(root, '1.168.0');
    const project = path.join(root, 'apps', 'web');
    await installTemplates(project, 'news');
    expect(await serverFnMethods(project, 'news')).toEqual(['inputValidator', 'handler']);
  });

  it('defaults to .validator with a note when the package is missing', async () => {
    await installTemplates(root);
    expect(await serverFnMethods(root)).toEqual(['validator', 'handler']);
    expect(output()).toContain('@tanstack/react-start not found');
  });
});
