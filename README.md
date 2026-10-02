# EduGod

EduGod is an iOS 17+ SwiftUI learning app under development. This repository currently contains a working offline foundation: an exact linear equation solver, step explanations, animated reveal, local question history, and unit tests for the solver. It does **not** yet implement the full 25-feature product specification.

## Open and run

1. On macOS, install Xcode 15 or newer.
2. Create a new iOS App project named `EduGod` with SwiftUI, Swift, and iOS 17 as the deployment target.
3. Add the files in `EduGod/` to the app target and the files in `EduGodTests/` to the test target.
4. Remove Xcode's generated `ContentView.swift` and app entry file to avoid duplicate types.
5. Run the `EduGod` scheme on an iOS 17+ simulator. Run the `EduGodTests` scheme for unit tests.

The solver accepts one-variable linear equations such as `2x + 3 = 11`, `x/2 - 1 = 4`, and `3(x + 2) = 15`. It uses rational arithmetic and independently substitutes its solution into the original equation. Unsupported expressions return a clear error instead of a fabricated solution.

## Architecture

```
SwiftUI views → SolveViewModel → LinearEquationSolver
                         ↘ SwiftData QuestionRecord
```

`LinearEquationSolver` has no UI or network dependency. The app works offline and does not request camera, microphone, speech, account, or tracking permissions. AI is deliberately not connected; an API key must be held by a secure backend proxy before such a feature is added.

## App Store preparation

- Add final app icon, screenshots, age rating, support URL, and privacy policy URL.
- Review the bundled privacy manifest and actual data collection before submission.
- Run Xcode build and tests on macOS; check VoiceOver, Dynamic Type, Dark Mode, and Reduce Motion on devices.
- Implement and review each advertised feature before claiming it in App Store metadata.

## Known limitations

- This is an early foundation, not a production-ready 25-feature tutor.
- Math support is limited to one-variable linear equations. Algebra beyond linear equations, calculus, matrices, and statistics are unsupported.
- No camera OCR, handwriting, voice, AI tutor, CloudKit, widgets, or subscriptions yet.
- Xcode build and iOS UI testing have not been run in this Windows workspace.
