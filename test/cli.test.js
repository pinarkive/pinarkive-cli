import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cliPath = join(__dirname, '../dist/cli.js');
const { version } = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf8')
);

function runCli(...args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    encoding: 'utf8',
    env: process.env,
  });
}

describe('pinarkive CLI', () => {
  it('--help exits 0 and prints usage', () => {
    const result = runCli('--help');
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Usage:\s+pinarkive/i);
    assert.match(result.stdout, /login/);
    assert.match(result.stdout, /upload/);
  });

  it('-h exits 0', () => {
    const result = runCli('-h');
    assert.equal(result.status, 0);
    assert.match(result.stdout, /pinarkive/i);
  });

  it('--version exits 0 and prints package version', () => {
    const result = runCli('--version');
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), version);
  });

  it('-V exits 0 and prints package version', () => {
    const result = runCli('-V');
    assert.equal(result.status, 0);
    assert.equal(result.stdout.trim(), version);
  });

  it('unknown command exits non-zero', () => {
    const result = runCli('definitely-not-a-command');
    assert.notEqual(result.status, 0);
  });

  it('config without action exits non-zero', () => {
    const result = runCli('config');
    assert.notEqual(result.status, 0);
  });
});
