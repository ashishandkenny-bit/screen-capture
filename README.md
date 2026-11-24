# Screen capture every second

Install Node.js 20 or newer, open this folder in a terminal, and run:

```sh
npm install
npm start
```

Capture starts immediately. Press **Ctrl+C** to stop.

A PNG is saved every second in **`screens/` beside `capture.cjs`**:

```text
screen-capture/
  capture.cjs
  package.json
  package-lock.json
  screens/
    screen_2026-11-24T15-00-00.123Z_12345_000001.png
```

The folder is created automatically. It stays next to the script even if you
launch the script from another directory. Existing images are never overwritten
or deleted. A screenshot already in progress finishes saving before stopping.
Slow captures skip missed ticks instead of overlapping or building a queue.

The primary monitor is captured (or the first available monitor if the OS does
not identify a primary one). Nothing is uploaded.

## Operating systems

The same script uses [node-screenshots](https://github.com/nashaofu/node-screenshots)
on Windows, macOS, and Linux. `npm install` selects the native binary for that
computer. Electron, Python, and ImageMagick are not used.

- **Windows:** Run in a logged-in desktop session.
- **macOS:** Allow Screen Recording access for your terminal if prompted.
- **Linux:** Requires a graphical desktop and the standard `libxcb`, `libXrandr`,
  and D-Bus libraries listed by the capture library. These are commonly already
  installed on desktop Linux. Screen-access restrictions vary by desktop and
  X11/Wayland session; this project was tested on Ubuntu X11.

Windows and macOS support is provided by the library; those platforms have not
been tested here. A headless server or SSH session without screen access cannot
capture a desktop. OS screen-recording permissions still apply.

## Share

Share `capture.cjs`, `package.json`, and `package-lock.json` (plus this README).
Do not share `node_modules/` or `screens/`. Each recipient runs `npm install` on
their own computer, then `npm start`.

## Check

`npm test` checks saving, scheduling, stopping, errors, and the output location
with simulated screenshots. It does not establish compatibility on every OS.
