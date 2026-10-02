import XCTest
@testable import EduGod

final class LinearEquationSolverTests: XCTestCase {
    private let solver = LinearEquationSolver()

    func testSimpleEquation() throws {
        XCTAssertEqual(try solver.solve("2x + 3 = 11").answer, "x = 4")
    }

    func testFractionAndParentheses() throws {
        XCTAssertEqual(try solver.solve("x/2 - 1 = 4").answer, "x = 10")
        XCTAssertEqual(try solver.solve("3(x + 2) = 15").answer, "x = 3")
    }

    func testRejectsNonlinearEquation() {
        XCTAssertThrowsError(try solver.solve("x*x = 4"))
    }

    func testRejectsEquationWithoutUniqueSolution() {
        XCTAssertThrowsError(try solver.solve("x = x"))
    }
}
