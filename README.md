# EduGod

EduGod is a responsive, installable learning web app. Its current scope is **one-variable linear equations**. It works in desktop, Android, and iPhone browsers. Supported browsers can add it to the home screen. The older SwiftUI source remains an unverified iOS prototype.

## Open the website

After GitHub Pages is enabled, open https://369rmax-ux.github.io/edu/.

- **Android:** open the site in Chrome and choose **Install app** or **Add to Home screen**.
- **iPhone:** open the site in Safari, tap **Share**, then **Add to Home Screen**.
- **Desktop:** open the site in a current browser. It can work offline after the first successful load.

This is a progressive web app (PWA), **not** an Android APK or an iOS App Store binary.

## What works now

- Exact fraction arithmetic for linear equations, with substitution verification and step-by-step reasons.
- Generated practice equations, grading, adaptive rating, hints, and mistake notebook.
- Review cards scheduled with a spaced repetition algorithm.
- Local solution history with search, progress stats, streaks, focus timer, and formula sheet.
- JSON data export and in-app deletion of local data.
- Responsive layout, dark mode, reduced-motion support, offline caching, and optional browser speech features where supported.

Learning data is stored in this browser's local storage. The app sends no questions or progress to a server. Voice input is supplied by the browser and may use the browser vendor's speech service.

## Run locally

Node.js 20+ is sufficient; there are no npm dependencies.

```sh
node server.js
node --test math.test.js
```

Open http://localhost:4173/.

## Important limitations

This is **not** the complete 25-feature AI education product from the original specification. General academic AI explanations, camera OCR, handwriting, charts, CloudKit, widgets, native Android/iOS packages, and App Store submission are not implemented. No AI API key or secure backend proxy has been configured. The SwiftUI prototype has not been built with Xcode in this Windows environment. Do not advertise unsupported features as complete.
