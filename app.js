import { solveLinear, updateRating, reviewCard } from './math.js';

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
const routes = [
  ['home', 'Home', '⌂'], ['solve', 'Solve', '∑'], ['practice', 'Practice', '✎'],
  ['progress', 'Progress', '▥'], ['more', 'More', '☷']
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
  $('content').innerHTML = ({ home: homeView, solve: solveView, practice: practiceView, progress: progressView, more: moreView })[current]();
}

document.addEventListener('submit', event => {
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

document.addEventListener('click', event => {
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
  if (button.id === 'focus-toggle') { focusRunning = !focusRunning; focusLast = Date.now(); button.textContent = focusRunning ? 'Pause' : 'Start focus'; }
  if (button.id === 'focus-reset') { focusRunning = false; focusSeconds = 25 * 60; render(); }
  if (button.id === 'export-data') {
    const file = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(file); const link = document.createElement('a'); link.href = url; link.download = 'edugod-data.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  if (button.id === 'delete-data' && confirm('Delete all EduGod data saved in this browser?')) { data = defaults(); save(); activeSolution = null; practice = null; answered = false; render(); toast('Local data deleted.'); }
});

document.addEventListener('input', event => { if (event.target.id === 'history-search') $('history-list').innerHTML = historyMarkup(event.target.value); });
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
