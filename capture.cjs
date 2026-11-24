const path = require('node:path');
const { mkdir, writeFile } = require('node:fs/promises');
const { performance } = require('node:perf_hooks');
const { setTimeout: sleep } = require('node:timers/promises');

const OUTPUT_DIR = path.join(__dirname, 'screens');
const INTERVAL_MS = 1000;

async function runCapture({
  capture,
  signal,
  outputDir = OUTPUT_DIR,
  log = console.log,
  clock = () => performance.now(),
  wait = ms => sleep(ms, undefined, { signal }),
}) {
  await mkdir(outputDir, { recursive: true });
  log(`Saving screenshots to: ${outputDir}`);
  log('Capturing every second. Press Ctrl+C to stop.');
  let count = 0;
  let nextCapture = clock();

  while (!signal.aborted) {
    const timestamp = new Date().toISOString().replaceAll(':', '-');
    // Await each capture/write so slow screenshots never overlap.
    const image = await capture({ format: 'png' });
    const filename = `screen_${timestamp}_${process.pid}_${String(++count).padStart(6, '0')}.png`;
    await writeFile(path.join(outputDir, filename), image, { flag: 'wx' });
    log(`Saved ${filename}`);
    if (signal.aborted) break;

    nextCapture += INTERVAL_MS;
    const now = clock();
    // Skip missed ticks instead of building a queue or capturing in a burst.
    if (nextCapture < now) {
      nextCapture += Math.ceil((now - nextCapture) / INTERVAL_MS) * INTERVAL_MS;
    }
    try {
      await wait(Math.max(0, nextCapture - now));
    } catch (error) {
      if (error.name !== 'AbortError' || !signal.aborted) throw error;
    }
  }
  log(`Stopped. Saved ${count} screenshot(s).`);
  return count;
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log(`Run: npm start\nStop: Ctrl+C\nOutput: ${OUTPUT_DIR}`);
    return;
  }
  const { Monitor } = require('node-screenshots');
  const monitors = Monitor.all();
  const monitor = monitors.find(screen => screen.isPrimary()) || monitors[0];
  if (!monitor) throw new Error('No screen found. Run this in a logged-in desktop session.');

  const controller = new AbortController();
  const stop = () => controller.abort();
  process.once('SIGINT', stop);
  process.once('SIGTERM', stop);
  try {
    console.log(`Screen: ${monitor.name()} (${monitor.width()} × ${monitor.height()})`);
    await runCapture({
      signal: controller.signal,
      capture: async () => (await monitor.captureImage()).toPng(),
    });
  } finally {
    process.removeListener('SIGINT', stop);
    process.removeListener('SIGTERM', stop);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error(`Screen capture stopped: ${error.message}`);
    console.error('Check screen-recording permission and the platform notes in README.md.');
    process.exitCode = 1;
  });
}

module.exports = { runCapture, OUTPUT_DIR };
