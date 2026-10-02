import SwiftUI
import SwiftData

@MainActor
@Observable
final class SolveViewModel {
    var question = ""
    var solution: EquationSolution?
    var errorMessage: String?
    var visibleSteps = 0

    private let solver = LinearEquationSolver()

    func solve(in context: ModelContext) {
        errorMessage = nil
        solution = nil
        visibleSteps = 0
        do {
            let result = try solver.solve(question)
            solution = result
            context.insert(QuestionRecord(question: question.trimmingCharacters(in: .whitespacesAndNewlines), answer: result.answer))
            try context.save()
        } catch {
            errorMessage = (error as? LocalizedError)?.errorDescription ?? "The equation could not be solved."
        }
    }
}

struct SolveView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var model = SolveViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: EduStyle.spacing) {
                    Text("Enter a linear equation")
                        .font(.title2.bold())
                    TextField("Example: 2x + 3 = 11", text: $model.question, axis: .vertical)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .padding()
                        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: EduStyle.cornerRadius))
                        .accessibilityLabel("Equation")
                    Button("Solve") {
                        model.solve(in: modelContext)
                    }
                    .buttonStyle(.borderedProminent)
                    .frame(minHeight: 44)
                    .disabled(model.question.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)

                    if let error = model.errorMessage {
                        Text(error).foregroundStyle(.red).accessibilityAddTraits(.updatesFrequently)
                    }
                    if let solution = model.solution {
                        Text(solution.answer).font(.title.bold()).accessibilityAddTraits(.isHeader)
                        ForEach(Array(solution.steps.prefix(model.visibleSteps).enumerated()), id: \.offset) { index, step in
                            VStack(alignment: .leading, spacing: 6) {
                                Text("Step \(index + 1): \(step.expression)").font(.headline)
                                Text(step.reason).foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding()
                            .background(.regularMaterial, in: RoundedRectangle(cornerRadius: EduStyle.cornerRadius))
                            .transition(reduceMotion ? .identity : .opacity.combined(with: .move(edge: .bottom)))
                        }
                        if model.visibleSteps < solution.steps.count {
                            Button("Show next step") {
                                withAnimation(reduceMotion ? nil : .spring()) {
                                    model.visibleSteps += 1
                                }
                            }
                            .frame(minHeight: 44)
                        }
                        Text("Always check important answers independently.")
                            .font(.footnote)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding()
            }
            .navigationTitle("Solve")
        }
    }
}
