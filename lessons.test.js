import test from 'node:test';
import assert from 'node:assert/strict';
import { lessons } from './lessons.js';

test('every lesson has readable content and a valid understanding check', () => {
  assert.ok(lessons.length >= 8);
  assert.equal(new Set(lessons.map(lesson => lesson.id)).size, lessons.length);
  for (const lesson of lessons) {
    assert.ok(lesson.text.length > 300, `${lesson.id} needs substantive content`);
    assert.ok(lesson.options.length >= 3, `${lesson.id} needs choices`);
    assert.ok(lesson.correct >= 0 && lesson.correct < lesson.options.length);
    assert.ok(lesson.explanation.length > 15);
  }
});
