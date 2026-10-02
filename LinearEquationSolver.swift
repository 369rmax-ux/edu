import Foundation

struct SolveStep: Equatable {
    let expression: String
    let reason: String
}

struct EquationSolution: Equatable {
    let answer: String
    let steps: [SolveStep]
}

enum SolverError: LocalizedError {
    case invalidEquation
    case unsupportedExpression
    case noUniqueSolution
    case unverifiedResult

    var errorDescription: String? {
        switch self {
        case .invalidEquation: "Enter an equation with one equals sign."
        case .unsupportedExpression: "This solver supports linear equations in x with integers, +, -, *, /, and parentheses."
        case .noUniqueSolution: "This equation has no unique solution."
        case .unverifiedResult: "The proposed answer did not verify."
        }
    }
}

struct Rational: Equatable, CustomStringConvertible {
    let numerator: Int
    let denominator: Int

    init(_ numerator: Int, _ denominator: Int = 1) throws {
        guard denominator != 0 else { throw SolverError.unsupportedExpression }
        let divisor = Self.gcd(numerator, denominator)
        let sign = denominator < 0 ? -1 : 1
        self.numerator = sign * numerator / divisor
        self.denominator = sign * denominator / divisor
    }

    private init(unchecked numerator: Int, denominator: Int) {
        self.numerator = numerator
        self.denominator = denominator
    }

    static let zero = Rational(unchecked: 0, denominator: 1)
    static let one = Rational(unchecked: 1, denominator: 1)

    static func + (a: Self, b: Self) throws -> Self {
        try Self(a.numerator * b.denominator + b.numerator * a.denominator, a.denominator * b.denominator)
    }
    static func - (a: Self, b: Self) throws -> Self {
        try Self(a.numerator * b.denominator - b.numerator * a.denominator, a.denominator * b.denominator)
    }
    static func * (a: Self, b: Self) throws -> Self {
        try Self(a.numerator * b.numerator, a.denominator * b.denominator)
    }
    static func / (a: Self, b: Self) throws -> Self {
        try Self(a.numerator * b.denominator, a.denominator * b.numerator)
    }

    var description: String {
        denominator == 1 ? String(numerator) : "\(numerator)/\(denominator)"
    }

    private static func gcd(_ a: Int, _ b: Int) -> Int {
        var x = abs(a)
        var y = abs(b)
        while y != 0 { (x, y) = (y, x % y) }
        return max(x, 1)
    }
}

private struct LinearForm {
    var coefficient: Rational
    var constant: Rational

    static let variable = Self(coefficient: .one, constant: .zero)
    static func number(_ n: Rational) -> Self { Self(coefficient: .zero, constant: n) }
}

struct LinearEquationSolver {
    func solve(_ input: String) throws -> EquationSolution {
        let sides = input.split(separator: "=", omittingEmptySubsequences: false)
        guard sides.count == 2 else { throw SolverError.invalidEquation }
        let left = try Parser(String(sides[0])).parse()
        let right = try Parser(String(sides[1])).parse()
        let coefficient = try left.coefficient - right.coefficient
        let constant = try right.constant - left.constant
        guard coefficient != .zero else { throw SolverError.noUniqueSolution }
        let answer = try constant / coefficient
        let leftCheck = try evaluate(left, at: answer)
        let rightCheck = try evaluate(right, at: answer)
        guard leftCheck == rightCheck else { throw SolverError.unverifiedResult }
        return EquationSolution(answer: "x = \(answer)", steps: [
            SolveStep(expression: "\(coefficient)x = \(constant)", reason: "Collect x terms on one side and constants on the other."),
            SolveStep(expression: "x = \(constant) ÷ \(coefficient)", reason: "Divide both sides by the coefficient of x."),
            SolveStep(expression: "x = \(answer)", reason: "Substitution verifies both sides equal \(leftCheck).")
        ])
    }

    private func evaluate(_ form: LinearForm, at x: Rational) throws -> Rational {
        try form.coefficient * x + form.constant
    }
}

private struct Parser {
    private let tokens: [Character]
    private var position = 0

    init(_ text: String) {
        tokens = Array(text.lowercased().filter { !$0.isWhitespace })
    }

    mutating func parse() throws -> LinearForm {
        guard !tokens.isEmpty else { throw SolverError.invalidEquation }
        let result = try expression()
        guard position == tokens.count else { throw SolverError.unsupportedExpression }
        return result
    }

    private mutating func expression() throws -> LinearForm {
        var result = try term()
        while let token = peek(), token == "+" || token == "-" {
            position += 1
            let next = try term()
            if token == "+" {
                result = LinearForm(coefficient: try result.coefficient + next.coefficient, constant: try result.constant + next.constant)
            } else {
                result = LinearForm(coefficient: try result.coefficient - next.coefficient, constant: try result.constant - next.constant)
            }
        }
        return result
    }

    private mutating func term() throws -> LinearForm {
        var result = try factor()
        while let token = peek(), token == "*" || token == "/" || token == "(" || token == "x" {
            if token == "*" || token == "/" { position += 1 }
            let next = try factor()
            if token == "/" {
                guard next.coefficient == .zero else { throw SolverError.unsupportedExpression }
                result = LinearForm(coefficient: try result.coefficient / next.constant, constant: try result.constant / next.constant)
            } else {
                guard result.coefficient == .zero || next.coefficient == .zero else { throw SolverError.unsupportedExpression }
                result = LinearForm(
                    coefficient: try result.coefficient * next.constant + next.coefficient * result.constant,
                    constant: try result.constant * next.constant
                )
            }
        }
        return result
    }

    private mutating func factor() throws -> LinearForm {
        guard let token = peek() else { throw SolverError.unsupportedExpression }
        if token == "+" || token == "-" {
            position += 1
            let value = try factor()
            if token == "+" { return value }
            return LinearForm(coefficient: try .zero - value.coefficient, constant: try .zero - value.constant)
        }
        if token == "(" {
            position += 1
            let value = try expression()
            guard peek() == ")" else { throw SolverError.unsupportedExpression }
            position += 1
            return value
        }
        if token == "x" {
            position += 1
            return .variable
        }
        guard token.isASCII && token.isNumber else { throw SolverError.unsupportedExpression }
        var digits = ""
        while let next = peek(), next.isASCII && next.isNumber {
            digits.append(next)
            position += 1
        }
        guard let number = Int(digits) else { throw SolverError.unsupportedExpression }
        return .number(try Rational(number))
    }

    private func peek() -> Character? {
        position < tokens.count ? tokens[position] : nil
    }
}
