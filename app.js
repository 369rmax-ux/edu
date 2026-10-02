import { solveLinear, updateRating, reviewCard } from './math.js';
import { addDocument, deleteAllDocuments, deleteDocument, filterDocuments, getDocument, listDocuments } from './library.js';

const STORE = 'edugod-web-v1';
const defaults = () => ({ history: [], attempts: [], cards: [], rating: 1000, focusMinutes: 0 });
let data;
try { data = { ...defaults(), ...JSON.parse(localStorage.getItem(STORE) || '{}') }; }
catch { data = defaults(); }
let activeSolution = null;
let revealed = 0;
let practice = null;
let answered = false;
let focusSeconds = 25 * 60;
let focusRunning = false;
let focusLast = Date.now();
let documents = [];
let previewUrl = null;
const routes = [
  ['home', 'Home', '⌂'], ['solve', 'Solve', '∑'], ['practice', 'Practice', '✎'],
  ['library', 'Library', '▤'], ['progress', 'Progress', '▥'], ['more', 'More', '☷']
];
const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const save = () => { try { localStorage.setItem(STORE, JSON.stringify(data)); } catch { toast('Storage is unavailable in this browser.'); } };
const dateKey = timestamp => new Date(timestamp).toLocaleDateString('en-CA');
const today = () => dateKey(Date.now());
const formatDate = timestamp => new Date(timestamp).toLocaleDateString(undefined, { day:'numeric', month:'short' });
const progressCount = () => data.attempts.filter(item => item.correct).length;
const streak = () => {
  const days = new Set([...data.history, ...data.attempts].map(item => dateKey(item.at)));
  let count = 0;
  let cursor = new Date();
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dateKey(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
  return count;
};
const toast = message => { const node = $('toast'); node.textContent = message; node.classList.add('show'); clearTimeout(node.timer); node.timer = setTimeout(() => node.classList.remove('show'), 3000); };
const route = () => (location.hash.slice(1).split('?')[0] || 'home').toLowerCase();
const card = (content, extra = '') => `<section class="card ${extra}">${content}</section>`;
const stat = (icon, value, label) => card(`<span class="stat-icon" aria-hidden="true">${icon}</span><div class="stat-number">${escape(value)}</div><div class="stat-label">${escape(label)}</div>`);
const empty = (title, description) => `<div class="empty"><strong>${escape(title)}</strong>${escape(description)}</div>`;
const notice = '<p class="notice">EduGod currently verifies one-variable linear equations. It is not an AI tutor and does not answer every academic question.</p>';

function homeView() {
  const recent = data.history.slice(0, 4);
  return `<div class="hero"><div><span class="eyebrow" style="color:#bcd4ff">A BETTER WAY TO PRACTICE</span><h2>Small steps. Stronger understanding.</h2><p>Solve an equation, see why each step works, then practice at your own pace.</p><a class="button light" href="#solve">Start solving →</a></div><div class="hero-art" aria-hidden="true">✦</div></div>
  <div class="section-head"><div><h2>Your learning today</h2><p>Your progress stays on this device.</p></div></div>
  <div class="grid cols-3">${stat('⚡', streak(), 'Day streak')}${stat('✓', progressCount(), 'Correct practice answers')}${stat('◈', data.rating, 'Math rating')}</div>
  <div class="section-head"><div><h2>Pick up where you left off</h2><p>Recently solved equations</p></div><a class="button ghost" href="#solve">New question</a></div>
  ${recent.length ? `<div class="list">${recent.map(item => `<button class="list-item history-item" data-question="${escape(item.question)}"><span><strong>${escape(item.question)}</strong><small>${escape(item.answer)} · ${formatDate(item.at)}</small></span><span class="tag">Open</span></button>`).join('')}</div>` : empty('Nothing solved yet', 'Try 2x + 3 = 11 to begin.')}
  <div class="section-head"><h2>How it works</h2></div><div class="grid cols-3">${card('<h3>1. Ask</h3><p>Enter a one-variable linear equation.</p>')}${card('<h3>2. Understand</h3><p>Reveal each exact step and its reason.</p>')}${card('<h3>3. Practice</h3><p>Answer generated questions and learn from mistakes.</p>')}</div>`;
}

function solutionMarkup() {
  if (!activeSolution) return '';
  return `<div class="result" aria-live="polite"><span class="answer">${escape(activeSolution.answer)}</span><div style="margin-top:17px">${activeSolution.steps.slice(0, revealed).map((step, index) => `<div class="step"><span class="step-count">${index + 1}</span><div><strong>${escape(step.expression)}</strong><p>${escape(step.reason)}</p></div></div>`).join('')}</div>${revealed < activeSolution.steps.length ? '<button class="button secondary" id="next-step">Show next step</button>' : '<button class="button ghost" id="read-solution">Read explanation aloud</button>'}</div>`;
}

function solveView() {
  return `<div class="solve-box">${card(`<h3>Ask a math question</h3><p class="muted">Enter a linear equation in x. Spaces are optional.</p><form id="solve-form" style="margin-top:20px"><label class="form-label" for="equation">Your equation</label><input class="input" id="equation" name="equation" autocomplete="off" inputmode="text" placeholder="2x + 3 = 11" required maxlength="180"><div class="row" style="margin-top:12px"><button class="button" type="submit">Solve equation</button><button class="button secondary" type="button" id="voice-input">🎙 Speak</button></div></form><div id="solve-error" role="alert"></div><div id="solution">${solutionMarkup()}</div><div class="example-list"><button class="chip example" data-example="2x + 3 = 11">2x + 3 = 11</button><button class="chip example" data-example="x/2 - 1 = 4">x/2 - 1 = 4</button><button class="chip example" data-example="3(x + 2) = 15">3(x + 2) = 15</button></div>`)}`+
  card('<h3>Learn the reasoning</h3><p>Each answer uses exact fractions and is checked by substitution into the original equation.</p><div style="height:18px"></div><h3>What is supported?</h3><p>Integers, x, parentheses and the four basic operations in linear equations.</p><div style="height:18px"></div>' + notice) + '</div>';
}

function makePractice() {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const level = data.rating < 950 ? 1 : data.rating < 1080 ? 2 : 3;
  const x = random(-9, 9);
  const a = random(2, level === 3 ? 12 : 7) * (random(0, 1) ? 1 : -1);
  const b = level === 1 ? 0 : random(-12, 12);
  const c = a * x + b;
  return { question: b ? `${a}x ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${c}` : `${a}x = ${c}`, answer: x, level };
}

function practiceView() {
  if (!practice) practice = makePractice();
  const total = data.attempts.length;
  const accuracy = total ? Math.round(progressCount() * 100 / total) : 0;
  return `${card(`<div class="row" style="justify-content:space-between"><span class="tag">LEVEL ${practice.level}</span><span class="muted">${total} questions answered · ${accuracy}% correct</span></div><h3 style="margin-top:20px">Find the value of x</h3><div class="question">${escape(practice.question)}</div><form id="practice-form"><label class="form-label" for="practice-answer">Your answer</label><div class="row"><input class="input" id="practice-answer" type="number" step="any" style="max-width:230px" required ${answered ? 'disabled' : ''}><button class="button" ${answered ? 'disabled' : ''}>Check answer</button></div></form><div id="practice-feedback" role="status" aria-live="polite"></div><div class="row" style="margin-top:18px"><button class="button secondary" id="practice-hint">Show hint</button><button class="button ghost" id="new-practice">New question</button></div>`)}`+
  `<div class="section-head"><div><h2>How practice adapts</h2><p>Your math rating changes after each answer.</p></div></div><div class="grid cols-2">${stat('◈', data.rating, 'Current rating')}${stat('↗', accuracy + '%', 'Accuracy')}</div>`;
}

function progressView() {
  const total = data.attempts.length;
  const correct = progressCount();
  const accuracy = total ? Math.round(correct * 100 / total) : 0;
  const mistakes = data.attempts.filter(item => !item.correct).slice(0, 8);
  return `<div class="grid cols-3">${stat('✓', `${correct}/${total}`, 'Practice correct')}${stat('◈', data.rating, 'Math rating')}${stat('⚡', streak(), 'Day streak')}</div><div class="section-head"><div><h2>Accuracy</h2><p>Across your saved practice attempts</p></div><strong>${accuracy}%</strong></div><div class="progress-track" role="progressbar" aria-label="Practice accuracy" aria-valuenow="${accuracy}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill" style="width:${accuracy}%"></div></div>
  <div class="section-head"><div><h2>Mistake notebook</h2><p>Review the questions that need another look.</p></div></div>${mistakes.length ? `<div class="list">${mistakes.map(item => `<div class="list-item"><span><strong>${escape(item.question)}</strong><small>Your answer: ${escape(item.given)} · Correct answer: ${escape(item.answer)}</small></span><span class="tag">Review</span></div>`).join('')}</div>` : empty('No mistakes saved', 'Practice a few equations to see your learning history.')}
  <div class="section-head"><div><h2>Review cards</h2><p>Cards from mistakes are scheduled using spaced repetition.</p></div></div>${data.cards.length ? `<div class="list">${data.cards.map((item,index) => `<div class="list-item"><span><strong>${escape(item.question)}</strong><small>Due ${formatDate(item.due || Date.now())} · Answer: ${escape(item.answer)}</small></span><div class="row"><button class="chip review-card" data-index="${index}" data-quality="2">Again</button><button class="chip review-card" data-index="${index}" data-quality="5">Got it</button></div></div>`).join('')}</div>` : empty('No cards yet', 'A missed practice question creates a review card.')}`;
}

const builtInGuides = [
  { id: 'linear', title: 'Linear equations: quick guide', subject: 'Mathematics', text: 'A linear equation has x to the first power only. To solve ax + b = c, subtract b from both sides, then divide by a. For example, 2x + 3 = 11 becomes 2x = 8, then x = 4. Check by substituting: 2(4) + 3 = 11. If a is zero, the equation may have no solution or infinitely many solutions.' },
  { id: 'practice', title: 'How to practice effectively', subject: 'Study skills', text: 'Try to solve each question before looking at a hint. After an error, write down the exact step where your reasoning changed. Solve a similar problem soon afterward. Review missed questions again over the following days rather than repeating only easy questions.' },
  { id: 'exam', title: 'Checking answers under time pressure', subject: 'Exam preparation', text: 'Read the question carefully. Keep signs visible when moving terms. Estimate whether the answer is reasonable. If time permits, substitute the result back into the original equation. For a timed paper, leave a difficult question temporarily and return after easier marks are secured.' }
];

function libraryListMarkup(query) {
  const matches = filterDocuments(documents, query);
  return matches.length ? `<div class="list">${matches.map(item => `<div class="list-item"><span><strong>${escape(item.name)}</strong><small>${escape(item.subject || 'General')} · ${Math.max(1, Math.round(item.size / 1024))} KB · ${formatDate(item.addedAt)}</small>${item.notes ? `<small>${escape(item.notes)}</small>` : ''}</span><div class="row"><button class="chip open-document" data-id="${escape(item.id)}">Open</button><button class="chip download-document" data-id="${escape(item.id)}">Download</button><button class="chip delete-document" data-id="${escape(item.id)}">Delete</button></div></div>`).join('')}</div>` : empty('No matching documents', 'Import your study files to keep them available on this device.');
}

function libraryView() {
  return `${card(`<h3>Your document library</h3><p>Keep study files on this device for quick access. Files are stored in this browser, not uploaded to a server.</p><form id="document-form" class="library-form"><label class="form-label" for="document-files">Choose documents</label><input class="input" id="document-files" type="file" multiple accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.webp,.docx,.pptx" required><div class="grid cols-2" style="margin-top:12px"><div><label class="form-label" for="document-subject">Subject</label><input class="input" id="document-subject" maxlength="60" placeholder="Math, Science, History..."></div><div><label class="form-label" for="document-notes">Notes</label><input class="input" id="document-notes" maxlength="400" placeholder="Chapter or exam details"></div></div><button class="button" type="submit" style="margin-top:14px">Import documents</button></form><div id="document-status" role="status" aria-live="polite"></div><p class="muted" style="margin-top:12px">PDF, text, Markdown, images, Word and PowerPoint are supported up to 25 MB each. Word and PowerPoint files can be downloaded; in-app preview is available for PDF, text and images.</p>`)}`+
  `<div class="section-head"><div><h2>Study guides</h2><p>Short guides included with EduGod.</p></div></div><div class="grid cols-3">${builtInGuides.map(guide => card(`<span class="tag">${escape(guide.subject)}</span><h3 style="margin-top:14px">${escape(guide.title)}</h3><button class="button secondary open-guide" data-id="${guide.id}" style="margin-top:12px">Read guide</button>`)).join('')}</div>`+
  `<div class="section-head"><div><h2>My documents</h2><p>Search by filename, subject or notes.</p></div></div><label class="form-label" for="library-search">Search library</label><input class="input" id="library-search" placeholder="Search documents"><div id="library-list" style="margin-top:14px">${libraryListMarkup('')}</div><section id="document-viewer" class="card document-viewer" hidden></section>`;
}

async function loadLibrary() {
  try {
    documents = await listDocuments();
    if ($('library-list')) $('library-list').innerHTML = libraryListMarkup($('library-search')?.value || '');
  } catch (error) { if ($('document-status')) $('document-status').innerHTML = `<div class="error">${escape(error.message)}</div>`; }
}

async function showDocument(id) {
  const item = await getDocument(id);
  if (!item) throw new Error('Document was not found.');
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(item.blob);
  const viewer = $('document-viewer');
  if (!viewer) return;
  const actions = `<div class="row"><button class="button secondary" id="close-document">Close</button><button class="button ghost download-document" data-id="${escape(item.id)}">Download</button></div>`;
  let content;
  if (['txt', 'md'].includes(item.extension)) content = `<pre class="document-text">${escape((await item.blob.text()).slice(0, 250000))}</pre>`;
  else if (['png', 'jpg', 'jpeg', 'webp'].includes(item.extension)) content = `<img class="document-image" src="${previewUrl}" alt="${escape(item.name)}">`;
  else if (item.extension === 'pdf') content = `<iframe class="document-frame" src="${previewUrl}" title="${escape(item.name)}"></iframe><p class="muted">If the PDF does not display here, use Download to open it in your device's PDF viewer.</p>`;
  else content = '<p class="muted">Preview is not available for this format. Download the document to open it in a compatible app.</p>';
  viewer.innerHTML = `<h3>${escape(item.name)}</h3>${actions}${content}`;
  viewer.hidden = false; viewer.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}

function moreView() {
  return `<div class="tool-grid">${card(`<h3>Focus timer</h3><p>Take a calm 25-minute study session.</p><div class="focus-time" id="focus-time">${clock(focusSeconds)}</div><div class="row"><button class="button" id="focus-toggle">${focusRunning ? 'Pause' : 'Start focus'}</button><button class="button secondary" id="focus-reset">Reset</button></div><p class="muted" style="margin-top:12px">Completed focus minutes: ${data.focusMinutes}</p>`)}
  ${card(`<h3>Formula sheet</h3><p>Useful facts for linear equations.</p><div class="step"><span class="step-count">1</span><div><strong>ax + b = c</strong><p>x = (c − b) / a, when a ≠ 0.</p></div></div><div class="step"><span class="step-count">2</span><div><strong>Check your result</strong><p>Substitute x back into both sides of the original equation.</p></div></div>`)}</div>
  <div class="section-head"><div><h2>Saved solutions</h2><p>Search your offline question history.</p></div></div>${card(`<label class="form-label" for="history-search">Search equations</label><input class="input" id="history-search" placeholder="Search by equation or answer"><div id="history-list" style="margin-top:14px">${historyMarkup('')}</div>`)}`+
  `<div class="section-head"><h2>Your data</h2></div>${card(`<p>Your questions and progress stay in this browser's local storage. Clearing browser data also removes them.</p><div class="row" style="margin-top:15px"><button class="button secondary" id="export-data">Export JSON</button><button class="button danger" id="delete-data">Delete local data</button></div><p class="muted" style="margin-top:14px">Install on Android with your browser's “Install app” option. On iPhone, use Safari → Share → Add to Home Screen.</p>${notice}`)}`;
}

function historyMarkup(query) {
  const matches = data.history.filter(item => `${item.question} ${item.answer}`.toLowerCase().includes(query.toLowerCase())).slice(0, 30);
  return matches.length ? `<div class="list">${matches.map(item => `<button class="list-item history-item" data-question="${escape(item.question)}"><span><strong>${escape(item.question)}</strong><small>${escape(item.answer)} · ${formatDate(item.at)}</small></span><span class="tag">Open</span></button>`).join('')}</div>` : empty('No matching questions', 'Solved equations will appear here.');
}

function clock(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}`; }

function render() {
  const current = routes.some(([name]) => name === route()) ? route() : 'home';
  const nav = routes.map(([name,label,icon]) => `<a class="nav-link ${current === name ? 'active' : ''}" href="#${name}" ${current === name ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span><span>${label}</span></a>`).join('');
  $('desktop-nav').innerHTML = nav;
  $('mobile-nav').innerHTML = nav;
  $('page-title').textContent = routes.find(([name]) => name === current)[1];
  document.title = `EduGod • ${$('page-title').textContent}`;
  $('today-date').textContent = new Date().toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
  if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
  $('content').innerHTML = ({ home: homeView, solve: solveView, practice: practiceView, library: libraryView, progress: progressView, more: moreView })[current]();
  if (current === 'library') loadLibrary();
}

document.addEventListener('submit', event => {
  if (event.target.id === 'document-form') {
    event.preventDefault();
    const files = Array.from($('document-files').files || []);
    const subject = $('document-subject').value;
    const notes = $('document-notes').value;
    if (!files.length) return;
    const submit = event.target.querySelector('button[type="submit"]'); submit.disabled = true;
    (async () => {
      let success = 0; const errors = [];
      for (const file of files) {
        try { await addDocument(file, subject, notes); success++; }
        catch (error) { errors.push(`${file.name}: ${error.message}`); }
      }
      submit.disabled = false;
      $('document-status').innerHTML = `<div class="${errors.length ? 'error' : 'success'}">${success} document${success === 1 ? '' : 's'} imported.${errors.length ? `<br>${escape(errors.join(' | '))}` : ''}</div>`;
      $('document-files').value = '';
      await loadLibrary();
    })();
  }
  if (event.target.id === 'solve-form') {
    event.preventDefault();
    const question = $('equation').value.trim();
    $('solve-error').innerHTML = '';
    try {
      activeSolution = solveLinear(question); revealed = 1;
      data.history.unshift({ question, answer: activeSolution.answer, at: Date.now() });
      data.history = data.history.slice(0, 200); save();
      $('solution').innerHTML = solutionMarkup();
    } catch (error) { activeSolution = null; $('solution').innerHTML = ''; $('solve-error').innerHTML = `<div class="error">${escape(error.message)}</div>`; }
  }
  if (event.target.id === 'practice-form') {
    event.preventDefault(); if (answered || !practice) return;
    const given = Number($('practice-answer').value);
    const correct = Number.isFinite(given) && given === practice.answer;
    data.attempts.unshift({ question: practice.question, answer: practice.answer, given, correct, at: Date.now() });
    data.attempts = data.attempts.slice(0, 500);
    data.rating = updateRating(data.rating, correct);
    if (!correct) {
      const existing = data.cards.find(item => item.question === practice.question);
      if (!existing) data.cards.unshift({ question: practice.question, answer: practice.answer, ...reviewCard(null, 0) });
    }
    save(); answered = true;
    $('practice-answer').disabled = true;
    event.target.querySelector('button').disabled = true;
    $('practice-feedback').innerHTML = `<div class="${correct ? 'success' : 'error'}">${correct ? 'Correct! Well done.' : `The answer is x = ${practice.answer}. ${escape(solveLinear(practice.question).steps[0].reason)}`}</div>`;
  }
});

document.addEventListener('click', async event => {
  const button = event.target.closest('button'); if (!button) return;
  if (button.classList.contains('example')) { $('equation').value = button.dataset.example; $('equation').focus(); }
  if (button.classList.contains('history-item')) { location.hash = '#solve'; setTimeout(() => { const field = $('equation'); if (field) { field.value = button.dataset.question; field.focus(); } }, 0); }
  if (button.id === 'next-step' && activeSolution) { revealed++; $('solution').innerHTML = solutionMarkup(); }
  if (button.id === 'read-solution') {
    if (!('speechSynthesis' in window)) { toast('Speech is not available in this browser.'); return; }
    speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(activeSolution.steps.map(step => `${step.expression}. ${step.reason}`).join(' ')));
  }
  if (button.id === 'voice-input') {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { toast('Voice input is not available in this browser.'); return; }
    const recognition = new Recognition(); recognition.lang = navigator.language || 'en-US'; recognition.onresult = result => { $('equation').value = result.results[0][0].transcript; }; recognition.onerror = () => toast('Voice input failed. Try typing your equation.'); recognition.start();
  }
  if (button.id === 'practice-hint' && practice) { $('practice-feedback').innerHTML = `<div class="notice">${escape(solveLinear(practice.question).steps[0].reason)} Try moving the constant, then divide by the coefficient of x.</div>`; }
  if (button.id === 'new-practice') { practice = makePractice(); answered = false; render(); }
  if (button.classList.contains('review-card')) {
    const item = data.cards[Number(button.dataset.index)]; if (!item) return;
    Object.assign(item, reviewCard(item, Number(button.dataset.quality))); save(); render(); toast('Review schedule updated.');
  }
  if (button.classList.contains('open-guide')) {
    const guide = builtInGuides.find(item => item.id === button.dataset.id);
    const viewer = $('document-viewer');
    if (guide && viewer) { viewer.hidden = false; viewer.innerHTML = `<h3>${escape(guide.title)}</h3><p class="guide-text">${escape(guide.text)}</p><button class="button secondary" id="close-document">Close</button>`; viewer.scrollIntoView({ block: 'start' }); }
  }
  if (button.classList.contains('open-document')) {
    try { await showDocument(button.dataset.id); } catch (error) { toast(error.message); }
  }
  if (button.classList.contains('download-document')) {
    try {
      const item = await getDocument(button.dataset.id); if (!item) throw new Error('Document was not found.');
      const url = URL.createObjectURL(item.blob); const link = document.createElement('a'); link.href = url; link.download = item.name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (error) { toast(error.message); }
  }
  if (button.classList.contains('delete-document')) {
    if (!confirm('Delete this document from this browser?')) return;
    try { await deleteDocument(button.dataset.id); await loadLibrary(); toast('Document deleted.'); }
    catch (error) { toast(error.message); }
  }
  if (button.id === 'close-document') { const viewer = $('document-viewer'); if (viewer) { viewer.hidden = true; viewer.innerHTML = ''; } if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; } }
  if (button.id === 'focus-toggle') { focusRunning = !focusRunning; focusLast = Date.now(); button.textContent = focusRunning ? 'Pause' : 'Start focus'; }
  if (button.id === 'focus-reset') { focusRunning = false; focusSeconds = 25 * 60; render(); }
  if (button.id === 'export-data') {
    const file = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = 'edugod-data.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (button.id === 'delete-data' && confirm('Delete all EduGod progress and library documents saved in this browser?')) { try { await deleteAllDocuments(); documents = []; data = defaults(); save(); activeSolution = null; practice = null; answered = false; render(); toast('Local data deleted.'); } catch (error) { toast(error.message); } }
});

document.addEventListener('input', event => { if (event.target.id === 'history-search') $('history-list').innerHTML = historyMarkup(event.target.value); if (event.target.id === 'library-search') $('library-list').innerHTML = libraryListMarkup(event.target.value); });
window.addEventListener('hashchange', render);
setInterval(() => {
  if (!focusRunning) return;
  const now = Date.now(); const elapsed = Math.max(0, Math.floor((now - focusLast) / 1000));
  if (!elapsed) return; focusLast += elapsed * 1000;
  focusSeconds = Math.max(0, focusSeconds - elapsed);
  if ($('focus-time')) $('focus-time').textContent = clock(focusSeconds);
  if (focusSeconds === 0) { focusRunning = false; data.focusMinutes += 25; save(); toast('Focus session complete!'); if ($('focus-toggle')) $('focus-toggle').textContent = 'Start focus'; }
}, 1000);

render();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('./sw.js').catch(() => {});
