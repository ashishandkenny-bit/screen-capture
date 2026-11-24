# Screen Capture — Setup

Save a PNG screenshot of your primary monitor every second. Start from a terminal
and press **Ctrl+C** to stop. Images stay on your computer.

## 1. Install Node.js

You need **Node.js 20 or newer**, with npm installed.
If Node.js is already installed, skip installing it again.

Open Command Prompt on Windows, or Terminal on macOS/Linux, and check:

```sh
node --version
npm --version
```

If either command is unavailable, install Node.js with npm, then close and reopen
your terminal before continuing.

## 2. Open the project folder

If you received a ZIP, extract it first. The folder should contain:

```text
screen-capture/
  capture.cjs
  package.json
  package-lock.json
```

Open a terminal in that folder. On Windows, you can open the folder in File
Explorer, type `cmd` into the address bar, and press Enter.

Alternatively, use `cd` with your folder's actual path:

```bat
cd "C:\path\to\screen-capture"
```

On macOS/Linux:

```sh
cd "/path/to/screen-capture"
```

## 3. Install the dependency once

```sh
npm install
```

Internet access is needed for this step. npm downloads `node-screenshots` and
the native capture package for your operating system into `node_modules/`.
You do not need Electron, Python, or ImageMagick.

## 4. Start capturing

```sh
npm start
```

Capture starts immediately. Keep the terminal open; you can minimize it while
using other applications. Capture itself does not require internet access.

## 5. Stop capturing

Return to the terminal and press **Ctrl+C**. If Windows asks whether to terminate
the batch job, type **Y** and press Enter.

Run `npm start` again whenever you want another capture session. You do not need
to repeat `npm install` each time.

## Where the images go

The script automatically creates a **`screens` folder beside `capture.cjs`**:

```text
screen-capture/
  capture.cjs
  package.json
  package-lock.json
  node_modules/
  screens/
    screen_2026-11-24T15-00-00.123Z_12345_000001.png
    screen_2026-11-24T15-00-01.123Z_12345_000002.png
```

Each image has a unique filename. Existing files are not overwritten or deleted.
The script targets one capture per second; if capturing or saving takes longer,
it skips missed intervals. A screenshot already in progress finishes saving
before the script stops.

## Platform notes and troubleshooting

- **Windows:** Use a logged-in desktop session. If PowerShell blocks `npm.ps1`,
  use Command Prompt, or run `npm.cmd install` and `npm.cmd start` in PowerShell.
- **macOS:** Allow Screen Recording access for your terminal if requested, then
  reopen the terminal and try again.
- **Linux:** A graphical desktop and standard `libxcb`, `libXrandr`, and D-Bus
  libraries are required. Screen-access restrictions depend on the desktop and
  X11/Wayland session. This project was tested on Ubuntu X11.
- **Missing package:** Run `npm install` from the folder containing `package.json`.
- **Cannot save images:** Keep the project in a folder your account can write to,
  such as Documents or Desktop.

The capture library supports Windows, macOS, and Linux. This project has been
tested on Linux; Windows and macOS have not been verified here.

## Sharing the script

Share `capture.cjs`, `package.json`, `package-lock.json`, and this guide.
Leave out `node_modules/` and `screens/`. Each recipient runs `npm install` on
their own computer so npm selects the appropriate native capture package.
