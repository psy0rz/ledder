# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ledder generates animated pixel animations and streams them to LED matrix displays (and to a web-based preview). A Node.js server renders animations; a Framework7/Svelte web GUI controls it in realtime over a JSON-RPC websocket.

## Build and run

TypeScript is compiled **in-place** by `tsc` (no `outDir`): every `.ts` file gets a sibling `.js` file, and the server runs the compiled JS (`node ledder/server/server.js`). Nothing runs until you compile first.

```sh
npm install
npx tsc               # compile (use `npx tsc --watch` during development)
npm run dev           # dev server (NODE_ENV=development) at http://localhost:3000
npm run start         # production server (needs `npm run build` first for the web UI)
npm run build         # tsc + vite build (web UI -> www/) + render preset previews
npm run buildpreviews # only re-render animation preview images
```

- In dev mode the web UI is served through Vite middleware (live from `src/`); in production it is served statically from `www/`.
- The running server **hot-reloads the currently selected animation**: `AnimationManager` watches the compiled `.js` of that animation with chokidar and re-imports it (with a cache-busting query). So the typical dev loop is `npx tsc --watch` in one terminal, `npm run dev` in another, then edit animation `.ts` files and watch them reload live.
- There are no tests and no linter configured.

## Configuration

- `displayconf.js` (gitignored) defines the physical displays (`displayList`), default `animation`, and preview size. On first start it is auto-copied from `displayconf-example.js`. Displays are usually wrapped in an `OffsetMapper` that translates x/y to the hardware's LED order (zigzag, flips, multi-panel grids).
- Presets live in `presets/<AnimationPath>/<PresetName>.json` with a rendered `.png` preview next to each. They are saved from the web GUI; `buildpreviews.js` regenerates the PNGs.

## Architecture

Three layers: the core animation framework (`ledder/`), the server that renders and drives hardware (`ledder/server/`), and the web GUI (`src/`).

### Core framework (`ledder/`)

- **`Animator`** is the base class of every animation. Subclasses set `static category/title/description` and implement `async run(box: PixelBox, scheduler: Scheduler, controls: ControlGroup)`. `ledder/animations/Template.ts` is the minimal starting point.
- **Pixel model**: `PixelList` is a `Set` of pixels/sub-lists; `PixelBox` is a `PixelList` with bounds (`xMin/xMax/yMin/yMax`). Animations add `Pixel(x, y, color)` objects to the box they were given. `Color` objects are mutable and shared — effects animate a color in place and every pixel referencing it changes.
- **`Scheduler`** drives everything frame-based: `scheduler.interval(frames, callback)` runs the callback every N display frames; `intervalControlled(controlValue, cb)` ties the rate to a user control. Returning `false` from a callback cancels the interval.
- **Controls** (`ControlGroup`): factory methods `value()`, `range()`, `color()`, `input()`, `switch()`, `select()`, `group()`, `position()` create GUI-adjustable, preset-persisted parameters. Each takes a `restartOnChange` flag that re-runs the animation when the user changes it. Groups can be `switchable` (check `group.enabled`).
- **`ledder/draw/`**: `Draw*` classes are `PixelList` subclasses that fill themselves (text, lines, circles, images, ascii-art). Fonts come via `fontSelect(controls)` from `ledder/fonts.ts`.
- **`ledder/fx/`**: `Fx*` classes are effects applied to existing pixel containers or `Color` objects (move, rotate, fade, flames, twinkle, ...). They take a `Scheduler` and `ControlGroup` in the constructor and have an async `run(target, ...)`.
- **`ledder/animations/Components/`** holds reusable sub-animations (stars, pacman, vehicles) that other animations compose by calling `new Component().run(box, scheduler, controlGroup)`.

### Server (`ledder/server/`)

- `server.ts` is the entry point: loads `displayconf.js`, creates one `RenderRealtime` + `RenderControl` per configured display plus one for the web preview, and starts the `RpcServer`.
- `RpcServer` is Express + express-ws + json-rpc-2.0. RPC method names map to the `Rpc` class shared with the browser (`src/js/Rpc.ts`).
- `AnimationManager` owns the animation lifecycle. It hands each animation a *child* `PixelBox` and **revocable Proxies** of the scheduler and control group, so a stopped/reloaded animation's dangling async code is cut off cleanly. This is why unhandled-rejection errors from revoked proxies are tolerated on reload.
- `PresetStore` scans `ledder/animations/**` (compiled `.js`) and `presets/` to build the animation/preset list; `PreviewStore`/`RenderPreview` render the PNG previews.
- **Drivers** (`ledder/server/drivers/`): `Display*` classes implement one output each — QOIS over UDP/HTTP (ESP32 "ledstream"), WLED, Raspberry Pi, Pixelflut, Chromecast, HUB75 via Colorlight 5A-75B, APNG, websocket (web preview), multi-display fan-out. New hardware support = new `Display` subclass plus an entry in `displayconf.js`.

### QOIS compression (`ledder/server/DisplayQOIS.ts`)

"Quite OK Image Streamer" — a streaming adaptation of the [QOI format](https://qoiformat.org) used to feed the [ledstream](https://github.com/psy0rz/ledstream) ESP32 firmware. The encoder base class implements the standard QOI opcodes (RUN / INDEX / DIFF / LUMA / RGB; RGBA is never emitted — the stream is opaque RGB, alpha is blended away in `setPixel()`), with pixels gamma-mapped and reordered through the `OffsetMapper` before encoding. Deviations from stock QOI, all deliberate:

- **No file container.** Each frame gets a 6-byte header: frame byte-length (2B, so frames are capped at 64 KiB), pixels-per-channel (2B), display timestamp (2B ms, wraps every 65.5 s).
- **The 64-color index persists across frames** (`prevPixel` still resets to black per frame). The stream assumes a reliable transport and a decoder that starts at the beginning of the connection and keeps its index across frames. `resetEncoderState()` is called when a new HTTP client connects so encoder and decoder start from the same empty state.
- **Temporal runs**: the unused `QOI_OP_RGBA` byte (0xff) is `QOIS_OP_PREVFRAME` — "keep the next N pixels from the previous frame" (2-byte LE count). The encoder emits it when it beats the spatial alternatives; static content collapses to a few bytes per frame.
- **Decoder contract differs from stock QOI** — see the comment block at the top of `DisplayQOIS.ts`. Most importantly, the decoder's color-index must be updated only by DIFF/LUMA/RGB ops (not RUN/INDEX/PREVFRAME), or it desyncs from the encoder.
- **Deltas use 8-bit wraparound like stock QOI** (e.g. 255→0 encodes as +1); decoders reconstruct with wrapping uint8 additions.

`DisplayQOIShttp` writes the frame stream into a never-ending HTTP response. `DisplayQOISudp` (deprecated, slated for removal) packetizes the stream into UDP packets; it skips unchanged frames and tolerates packet loss, which is **incompatible** with the persistent color-index — don't use it without resetting the index per frame. Compression-ratio logging exists but is commented out in `DisplayQOIS.ts` (`statsBytes`).

### Web GUI (`src/`)

Framework7 + Svelte 5, bundled by Vite into `www/`. It talks JSON-RPC over `/ws`; `src/js/Rpc.ts` defines the call surface shared with the server. Control widgets in `src/components/Control*.svelte` mirror the `Control*` classes in `ledder/`.

## Conventions

- ESM throughout (`"type": "module"`). **Imports in `.ts` files must use the `.js` extension** (they resolve against the compiled output), e.g. `import Animator from "../Animator.js"`.
- `verbatimModuleSyntax` is enabled: use `import type {...}` for type-only imports.
- Animation file location determines its name/category path in the GUI and its preset directory (`ledder/animations/Fires/Fire.ts` ↔ `presets/Fires/Fire/*.json`).
