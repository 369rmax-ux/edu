import SwiftUI
import SwiftData

@main
struct EduGodApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
        .modelContainer(for: QuestionRecord.self)
    }
}
