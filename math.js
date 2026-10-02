// Exact arithmetic for one-variable linear equations. No network or AI is involved.
export class MathError extends Error {}

export class Fraction {
  constructor(n, d = 1n) {
    n = BigInt(n); d = BigInt(d);
    if (d === 0n) throw new MathError('Division by zero is not allowed.');
    const sign = d < 0n ? -1n : 1n;
    const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a || 1n; };
    const g = gcd(n, d);
    this.n = sign * n / g; this.d = sign * d / g;
  }
  add(v) { return new Fraction(this.n * v.d + v.n * this.d, this.d * v.d); }
  sub(v) { return new Fraction(this.n * v.d - v.n * this.d, this.d * v.d); }
  mul(v) { return new Fraction(this.n * v.n, this.d * v.d); }
  div(v) { return new Fraction(this.n * v.d, this.d * v.n); }
  equals(v) { return this.n === v.n && this.d === v.d; }
  toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
  toNumber() { return Number(this.n) / Number(this.d); }
}

const ZERO = new Fraction(0n);
const ONE = new Fraction(1n);
const form = (a, b) => ({ a, b });

class Parser {
  constructor(input) {
    this.tokens = input.toLowerCase().replace(/\s+/g, '');
    this.i = 0;
    if (!this.tokens || this.tokens.length > 180) throw new MathError('Enter a shorter linear equation.');
  }
  peek() { return this.tokens[this.i]; }
  parse() {
    const result = this.expression();
    if (this.i !== this.tokens.length) throw new MathError('Only linear equations in x are supported.');
    return result;
  }
  expression() {
    let value = this.term();
    while (this.peek() === '+' || this.peek() === '-') {
      const op = this.tokens[this.i++]; const next = this.term();
      value = op === '+' ? form(value.a.add(next.a), value.b.add(next.b)) : form(value.a.sub(next.a), value.b.sub(next.b));
    }
    return value;
  }
  term() {
    let value = this.factor();
    while (['*', '/', 'x', '('].includes(this.peek())) {
      const op = this.peek();
      if (op === '*' || op === '/') this.i++;
      const next = this.factor();
      if (op === '/') {
        if (!next.a.equals(ZERO)) throw new MathError('Division by an expression containing x is not linear.');
        value = form(value.a.div(next.b), value.b.div(next.b));
      } else {
        if (!value.a.equals(ZERO) && !next.a.equals(ZERO)) throw new MathError('This equation is not linear.');
        value = form(value.a.mul(next.b).add(next.a.mul(value.b)), value.b.mul(next.b));
      }
    }
    return value;
  }
  factor() {
    const c = this.peek();
    if (c === '+' || c === '-') {
      this.i++; const v = this.factor();
      return c === '+' ? v : form(ZERO.sub(v.a), ZERO.sub(v.b));
    }
    if (c === '(') {
      this.i++; const v = this.expression();
      if (this.peek() !== ')') throw new MathError('Check the parentheses.');
      this.i++; return v;
    }
    if (c === 'x') { this.i++; return form(ONE, ZERO); }
    if (!/[0-9]/.test(c ?? '')) throw new MathError('Use numbers, x, +, -, *, /, and parentheses.');
    let digits = '';
    while (/[0-9]/.test(this.peek() ?? '')) digits += this.tokens[this.i++];
    return form(ZERO, new Fraction(BigInt(digits)));
  }
}

export function solveLinear(input) {
  const sides = input.split('=');
  if (sides.length !== 2) throw new MathError('Enter exactly one equals sign.');
  const left = new Parser(sides[0]).parse();
  const right = new Parser(sides[1]).parse();
  const coefficient = left.a.sub(right.a);
  const constant = right.b.sub(left.b);
  if (coefficient.equals(ZERO)) {
    throw new MathError(constant.equals(ZERO) ? 'Every x is a solution.' : 'This equation has no solution.');
  }
  const answer = constant.div(coefficient);
  const evaluate = side => side.a.mul(answer).add(side.b);
  if (!evaluate(left).equals(evaluate(right))) throw new MathError('Verification failed.');
  return {
    answer: `x = ${answer}`,
    value: answer.toNumber(),
    steps: [
      { expression: `${coefficient}x = ${constant}`, reason: 'Collect x terms on one side and constants on the other.' },
      { expression: `x = ${constant} ÷ ${coefficient}`, reason: 'Divide both sides by the coefficient of x.' },
      { expression: `x = ${answer}`, reason: `Substitution makes both sides equal ${evaluate(left)}.` }
    ]
  };
}

export function updateRating(rating, correct, difficulty = 1000) {
  const expected = 1 / (1 + 10 ** ((difficulty - rating) / 400));
  return Math.max(100, Math.round(rating + 32 * ((correct ? 1 : 0) - expected)));
}

export function reviewCard(card, quality, now = Date.now()) {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5) throw new RangeError('Quality must be 0–5.');
  const old = card ?? { repetitions: 0, interval: 0, ease: 2.5 };
  const repetitions = quality < 3 ? 0 : old.repetitions + 1;
  const interval = quality < 3 ? 1 : repetitions === 1 ? 1 : repetitions === 2 ? 6 : Math.max(1, Math.round(old.interval * old.ease));
  const ease = Math.max(1.3, old.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  return { repetitions, interval, ease, due: now + interval * 86400000 };
}
