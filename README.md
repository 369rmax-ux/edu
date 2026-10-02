# EduGod

EduGod is a responsive, installable learning web app. Its current scope is **one-variable linear equations**. It works in a desktop browser and in Android and iPhone browsers; supported browsers can add it to the home screen. The older SwiftUI source is retained as an unverified iOS prototype.

## Open the website

After GitHub Pages is enabled, open `https://369rmax-ux.github.io/edu/`.

- **Android:** open the site in Chrome and choose **Install app** or **Add to Home screen**.
- **iPhone:** open the site in Safari, tap **Share**, then **Add to Home Screen**.
- **Desktop:** open the site in a current browser. It also runs offline after the first successful load.

This is a progressive web app (PWA). It is **not** an Android APK or an iOS App Store binary.

## What works now

- Exact fraction arithmetic for linear equations, with substitution verification and step-by-step reasons.
- Generated practice equations, grading, adaptive rating, hints, and mistake notebook.
- Review cards scheduled with an SM-2-style algorithm.
- Local solution history with search, progress stats, streaks, focus timer, and formula sheet.
- Document Library with built-in study guides and local import, search, preview, download, and deletion for study files. PDF, TXT, Markdown, and images have in-app previews; DOCX and PPTX can be stored and downloaded.
- JSON data export and in-app deletion of local data.
- Responsive layout, dark mode, reduced-motion support, offline caching, and optional browser speech features where supported.

All learning data is stored in the current browser's local storage. The app sends no questions or progress to a server. Voice input is supplied by the browser and may use the browser vendor's speech service; it is offered only when that browser exposes the feature.

## Run locally

Node.js 20+ is sufficient; there are no npm dependencies.

```sh
node server.js
```

Open `http://localhost:4173/`. To run automated logic tests:

```sh
node --test math.test.js
```

## Repository files

- `index.html`, `style.css`, `app.js`: web interface and learning flows.
- `math.js`, `math.test.js`: exact equation solver, adaptive rating, spaced repetition, and tests.
- `library.js`, `library.test.js`: IndexedDB document storage, validation, and search tests.
- `manifest.webmanifest`, `sw.js`, `icon.svg`: installability and offline caching.
- `server.js`: dependency-free local web server.
- `EduGod/`, `EduGodTests/`: earlier SwiftUI iOS prototype source.

## Important limitations

This is **not** the complete 25-feature AI education product from the original specification. General academic AI explanations, camera OCR, handwriting, charts, CloudKit, widgets, native Android/iOS packages, and App Store submission are not implemented. No AI API key or secure backend proxy has been configured. The SwiftUI prototype has not been built with Xcode in this Windows environment. Do not advertise unsupported features as complete.
