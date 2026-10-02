const DATABASE = 'edugod-document-library';
const STORE = 'documents';
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;
export const SUPPORTED_EXTENSIONS = ['pdf', 'txt', 'md', 'png', 'jpg', 'jpeg', 'webp', 'docx', 'pptx'];

export function fileExtension(name) {
  return String(name).split('.').pop()?.toLowerCase() || '';
}

export function validateDocument(file) {
  if (!file || typeof file.name !== 'string' || !Number.isFinite(file.size)) throw new Error('Choose a document to import.');
  if (!SUPPORTED_EXTENSIONS.includes(fileExtension(file.name))) throw new Error('Use PDF, TXT, MD, PNG, JPG, WebP, DOCX, or PPTX.');
  if (file.size === 0) throw new Error('This file is empty.');
  if (file.size > MAX_DOCUMENT_BYTES) throw new Error('Choose a file smaller than 25 MB.');
  return true;
}

export function filterDocuments(documents, query) {
  const needle = String(query || '').trim().toLocaleLowerCase();
  if (!needle) return documents;
  return documents.filter(document => `${document.name} ${document.subject || ''} ${document.notes || ''}`.toLocaleLowerCase().includes(needle));
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('Document storage is unavailable in this browser.')); return; }
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open document storage.'));
    request.onblocked = () => reject(new Error('Close other EduGod tabs and try again.'));
  });
}

async function transact(mode, operation) {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, mode);
    const request = operation(transaction.objectStore(STORE));
    let result;
    request.onsuccess = () => { result = request.result; };
    transaction.oncomplete = () => { database.close(); resolve(result); };
    transaction.onerror = () => { database.close(); reject(transaction.error || new Error('Document storage failed.')); };
    transaction.onabort = () => { database.close(); reject(transaction.error || new Error('Document storage was cancelled.')); };
  });
}

export async function listDocuments() {
  const items = await transact('readonly', store => store.getAll());
  return items.map(({ blob, ...metadata }) => metadata).sort((a, b) => b.addedAt - a.addedAt);
}

export async function getDocument(id) {
  return transact('readonly', store => store.get(id));
}

export async function addDocument(file, subject = '', notes = '') {
  validateDocument(file);
  const document = {
    id: crypto.randomUUID(),
    name: file.name.slice(0, 180),
    subject: String(subject).trim().slice(0, 60),
    notes: String(notes).trim().slice(0, 400),
    type: file.type || '',
    extension: fileExtension(file.name),
    size: file.size,
    addedAt: Date.now(),
    blob: file
  };
  await transact('readwrite', store => store.put(document));
  return document.id;
}

export async function deleteDocument(id) {
  await transact('readwrite', store => store.delete(id));
}

export async function deleteAllDocuments() {
  await transact('readwrite', store => store.clear());
}
