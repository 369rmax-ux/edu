import SwiftUI
import SwiftData

struct RootView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Home", systemImage: "house") }
            SolveView()
                .tabItem { Label("Solve", systemImage: "function") }
            InformationView(title: "Practice", description: "Practice sessions are being built.", symbol: "pencil.line")
                .tabItem { Label("Practice", systemImage: "pencil.line") }
            InformationView(title: "Progress", description: "Progress analytics are being built.", symbol: "chart.bar")
                .tabItem { Label("Progress", systemImage: "chart.bar") }
            InformationView(title: "Profile", description: "No account is needed for offline solving.", symbol: "person.crop.circle")
                .tabItem { Label("Profile", systemImage: "person.crop.circle") }
        }
        .tint(EduStyle.accent)
    }
}

private struct HomeView: View {
    @Query(sort: \QuestionRecord.createdAt, order: .reverse) private var records: [QuestionRecord]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: EduStyle.spacing) {
                    Text("Learn one step at a time")
                        .font(.largeTitle.bold())
                    Text("Solve a linear equation and see why each step works.")
                        .foregroundStyle(.secondary)
                    if records.isEmpty {
                        ContentUnavailableView("No saved questions", systemImage: "clock", description: Text("Your solved equations appear here."))
                    } else {
                        ForEach(records) { record in
                            VStack(alignment: .leading, spacing: 4) {
                                Text(record.question).font(.headline)
                                Text(record.answer).foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: EduStyle.cornerRadius))
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("EduGod")
        }
    }
}

private struct InformationView: View {
    let title: String
    let description: String
    let symbol: String

    var body: some View {
        NavigationStack {
            ContentUnavailableView(title, systemImage: symbol, description: Text(description))
                .navigationTitle(title)
        }
    }
}
