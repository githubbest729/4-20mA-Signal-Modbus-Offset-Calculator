# 4-20mA Signal & Modbus Offset Calculator

A 100% client-side, installable PWA for SCADA, PLC, and instrumentation
engineers. No backend, no accounts, no analytics — every calculation runs in
the browser, and the app keeps working with zero internet connection once
it's loaded once.

**Live demo:** deploy it yourself (see below) — this repo ships ready for
GitHub Pages or Render.

## Features

- **Linear scaling calculator** — convert raw analog values (4-20mA, 0-20mA,
  1-5V, 0-10V, or raw ADC counts like 0-32767) to scaled engineering units,
  bidirectionally, with span validation and an out-of-range warning.
- **16-bit bit-stripping tool** — paste a raw PLC integer (decimal, `0x` hex,
  or `0b` binary) and see every bit from 15 (MSB) to 0 (LSB) decoded, with
  editable, persistent labels for your own alarm/status bit map.
- **Modbus addressing converter** — convert between zero-based wire offsets
  and base-1 addressing (40001-style holding registers, 30001 input
  registers, 10001 discrete inputs, and 1-based coils), with a reference
  table.
- **Native sharing** — a `navigator.share()` button so engineers can send the
  tool straight to Messenger, WhatsApp, Slack, or wherever, with a
  clipboard-copy fallback on desktop browsers that don't support Web Share.
- **Installable PWA** — full manifest + service worker, so it can be added to
  a home screen or kiosk and used entirely offline in a cabinet or panel shop
  with no signal.

## Tech stack

- [Vite](https://vitejs.dev/) + React 18
- [Tailwind CSS](https://tailwindcss.com/) (dark-mode, mobile-first)
- [lucide-react](https://lucide.dev/) icons
- A hand-written, dependency-free service worker (`public/sw.js`) — no
  build-time PWA plugin required, so the caching behavior is easy to read
  and modify.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL. Production build:

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

## Deploying

### GitHub Pages (included workflow)

1. Push this repo to GitHub.
2. In **Settings → Pages**, set the source to **GitHub Actions**.
3. Edit `vite.config.js` and set `base` to `/<your-repo-name>/` (it currently
   assumes the repo is named `signal-modbus-calc`). Update the same path in
   `public/manifest.json` (`start_url`, `scope`).
4. Push to `main` — `.github/workflows/deploy.yml` builds and deploys
   automatically.

Or deploy manually with `npm run deploy` (uses `gh-pages`, pushing `dist/` to
the `gh-pages` branch) once you've set a `homepage` field or configured the
remote.

### Render (or any static host)

1. Build command: `npm run build`
2. Publish directory: `dist`
3. If deploying to a custom domain or the root of a host, set `base: '/'` in
   `vite.config.js` and `start_url`/`scope` to `'/'` in
   `public/manifest.json`.

## Before you publish: replace the placeholder URLs and images

This repo ships with real, working icons and an Open Graph banner
(`public/icon.svg`, `public/icon-192.png`, `public/icon-512.png`,
`public/icon-maskable-512.png`, `public/og-image.png` and its
`public/og-image.svg` source), but `index.html` and
`public/manifest.json` reference `https://example.com/signal-modbus-calc/`
as a placeholder domain. Before sharing the link:

1. Replace every `https://example.com/signal-modbus-calc/...` URL in
   `index.html` (canonical, Open Graph, Twitter Card, JSON-LD) with your
   real deployed URL.
2. Regenerate `og-image.png` from `og-image.svg` if you want to customize the
   social preview artwork (any SVG-to-PNG tool works, e.g. `npx cairosvg` or
   an online converter, at 1200×630).
3. Optionally add a real `sitemap.xml` referenced from `public/robots.txt`.

## Project structure

```
├── index.html                # SEO + Open Graph + Twitter Card + JSON-LD
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # offline-first service worker
│   ├── robots.txt
│   ├── icon.svg / icon-*.png  # app icons (incl. maskable variant)
│   └── og-image.svg / .png    # social share preview image
├── src/
│   ├── main.jsx               # entry point + SW registration
│   ├── App.jsx                # tab shell / layout
│   ├── index.css              # Tailwind entry + base styles
│   └── components/
│       ├── ScalingCalculator.jsx
│       ├── BitStripper.jsx
│       ├── ModbusAddressing.jsx
│       └── ShareButton.jsx
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── .github/workflows/deploy.yml
```

## Notes on data & privacy

Nothing in this app makes a network request for its core functionality.
The only external requests are the Google Fonts stylesheet linked in
`index.html` (optional — remove it and set local `font-family` fallbacks for
a fully offline build with no third-party requests at all) and whatever the
share target you pick does with the shared link. Bit-stripper labels persist
in `localStorage` on the device only.

## License

MIT — use it, fork it, put your company's logo on it.
