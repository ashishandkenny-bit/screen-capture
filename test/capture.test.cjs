const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, readdir, readFile, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { runCapture, OUTPUT_DIR } = require('../capture.cjs');

const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jVQAAAABJRU5ErkJggg==', 'base64');
async function directory(t) {
  const dir = await mkdtemp(path.join(tmpdir(), 'screen-capture-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return path.join(dir, 'screens');
}

test('saves distinct PNGs, targets one-second ticks and skips slow captures', async t => {
  const outputDir = await directory(t);
  const controller = new AbortController();
  const started = [];
  let now = 0;
  const count = await runCapture({ outputDir, signal: controller.signal, log() {},
    clock: () => now,
    wait: async ms => { now += ms; },
    capture: async options => {
      assert.deepEqual(options, { format: 'png' });
      started.push(now);
      now += [120, 2400, 100][started.length - 1];
      if (started.length === 3) controller.abort();
      return png;
    },
  });
  assert.deepEqual(started, [0, 1000, 4000]);
  assert.equal(count, 3);
  const files = await readdir(outputDir);
  assert.equal(files.length, 3);
  for (const file of files) {
    assert.match(file, /^screen_.*Z_\d+_\d{6}\.png$/);
    assert.deepEqual(await readFile(path.join(outputDir, file)), png);
  }
});

test('stop while waiting exits without another capture', async t => {
  const controller = new AbortController();
  let calls = 0;
  const count = await runCapture({ outputDir: await directory(t), signal: controller.signal,
    log() {}, capture: async () => { calls++; return png; },
    wait: async () => {
      controller.abort();
      const error = new Error('Stopped'); error.name = 'AbortError'; throw error;
    },
  });
  assert.equal(count, 1); assert.equal(calls, 1);
});

test('capture failure is surfaced and does not create a fake image', async t => {
  const outputDir = await directory(t);
  await assert.rejects(runCapture({ outputDir, signal: new AbortController().signal, log() {},
    capture: async () => { throw new Error('Screen permission denied'); },
  }), /Screen permission denied/);
  assert.deepEqual(await readdir(outputDir), []);
});

test('output stays beside the script when launched from another directory', async t => {
  const elsewhere = path.dirname(await directory(t));
  const script = path.resolve(__dirname, '../capture.cjs');
  assert.equal(OUTPUT_DIR, path.join(path.dirname(script), 'screens'));
  const help = execFileSync(process.execPath, [script, '--help'], { cwd: elsewhere, encoding: 'utf8' });
  assert.ok(help.includes(OUTPUT_DIR));
});
