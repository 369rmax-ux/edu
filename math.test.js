import test from 'node:test';
import assert from 'node:assert/strict';
import { solveLinear, updateRating, reviewCard } from './math.js';

test('exact linear solving and verification', () => {
  assert.equal(solveLinear('2x + 3 = 11').answer, 'x = 4');
  assert.equal(solveLinear('x/2 - 1 = 4').answer, 'x = 10');
  assert.equal(solveLinear('3(x + 2) = 15').answer, 'x = 3');
  assert.equal(solveLinear('2x + 1 = 0').answer, 'x = -1/2');
});

test('unsupported and ambiguous equations fail clearly', () => {
  assert.throws(() => solveLinear('x*x=4'), /not linear/);
  assert.throws(() => solveLinear('x=x'), /Every x/);
  assert.throws(() => solveLinear('x=1=2'), /one equals/);
});

test('rating responds to answers', () => {
  assert.ok(updateRating(1000, true) > 1000);
  assert.ok(updateRating(1000, false) < 1000);
});

test('spaced repetition advances and resets', () => {
  const first = reviewCard(null, 5, 0);
  assert.equal(first.interval, 1);
  const second = reviewCard(first, 5, 0);
  assert.equal(second.interval, 6);
  assert.equal(reviewCard(second, 1, 0).repetitions, 0);
});
