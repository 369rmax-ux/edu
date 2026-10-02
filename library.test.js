import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDocument, filterDocuments, fileExtension, MAX_DOCUMENT_BYTES } from './library.js';

test('document validation accepts supported study files', () => {
  assert.equal(validateDocument({ name: 'Notes.PDF', size: 100 }), true);
  assert.equal(fileExtension('Review.DOCX'), 'docx');
  assert.throws(() => validateDocument({ name: 'program.exe', size: 100 }), /Use PDF/);
  assert.throws(() => validateDocument({ name: 'huge.pdf', size: MAX_DOCUMENT_BYTES + 1 }), /25 MB/);
});

test('library search covers name, subject and notes', () => {
  const items = [{ name: 'Algebra.pdf', subject: 'Math', notes: '' }, { name: 'Cells.pdf', subject: 'Biology', notes: 'Exam revision' }];
  assert.deepEqual(filterDocuments(items, 'biology'), [items[1]]);
  assert.deepEqual(filterDocuments(items, 'exam'), [items[1]]);
  assert.deepEqual(filterDocuments(items, ''), items);
});
