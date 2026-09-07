import fs from 'node:fs';

const appPath = 'prototype/app.js';
const stylesPath = 'prototype/styles.css';

let app = fs.readFileSync(appPath, 'utf8');
let styles = fs.readFileSync(stylesPath, 'utf8');

function replaceOnce(source, oldValue, newValue, label) {
  const first = source.indexOf(oldValue);
  if (first === -1) throw new Error(`Migration guard failed: ${label} not found.`);
  if (source.indexOf(oldValue, first + oldValue.length) !== -1) {
    throw new Error(`Migration guard failed: ${label} matched more than once.`);
  }
  return source.slice(0, first) + newValue + source.slice(first + oldValue.length);
}

// 1) Option visual grammar: A/B/C/D -> 01/02/03/04.
app = replaceOnce(
  app,
  '<span class="key">${String.fromCharCode(65 + i)}</span>',
  '<span class="key">${String(i + 1).padStart(2, \'0\')}</span>',
  'quiz option marker'
);

// 2) Add production-safe B+ helpers before event binding.
const helperAnchor = '  function bindEvents() {\n';
const helpers = [
  '  function getAnswerSpineContext(question) {',
  '    if (!db || !question) return [];',
  '    const seasons = [...db.seasons].sort((a, b) => a.year - b.year);',
  '    const index = seasons.findIndex(s => s.season_id === question.seasonId);',
  '    if (index < 0) return [];',
  '    return seasons.slice(Math.max(0, index - 1), Math.min(seasons.length, index + 2));',
  '  }',
  '',
  '  function getHistoryEchoText(season) {',
  '    if (!season) return \'\';',
  '    if (Array.isArray(season.titles) && season.titles.length) return season.titles.join(\' / \');',
  '    if (season.league_rank && season.league_name) return season.league_name + \' \' + season.league_rank + \'位\';',
  '    const text = season.summary || \'シーズン記録\';',
  '    return text.length > 72 ? text.slice(0, 72) + \'…\' : text;',
  '  }',
  '',
  '  function renderAnswerSpine(question) {',
  '    const context = getAnswerSpineContext(question);',
  '    if (!context.length) return \'\';',
  '    const current = context.find(s => s.season_id === question.seasonId) || context[0];',
  '    const nodes = context.map(season => {',
  '      const isCurrent = season.season_id === question.seasonId;',
  '      return \'<button class="history-node" type="button" data-history-preview data-season="\' + season.season_id + \'" aria-pressed="\' + (isCurrent ? \'true\' : \'false\') + \'"\' + (isCurrent ? \' aria-current="true"\' : \'\') + \'>\' +',
  '        \'<span class="history-diamond" aria-hidden="true"></span><span class="history-year">\' + season.year + \'</span></button>\';',
  '    }).join(\'\');',
  '    return \'<section class="history-spine-reveal" aria-label="回答した年の前後の歴史">\' +',
  '      \'<div class="history-spine">\' + nodes + \'</div>\' +',
  '      \'<div class="history-echo" id="history-echo">\' + current.year + \' — \' + getHistoryEchoText(current) + \'</div>\' +',
  '      \'</section>\';',
  '  }',
  '',
  helperAnchor.trimEnd()
].join('\n') + '\n';
app = replaceOnce(app, helperAnchor, helpers, 'bindEvents anchor');

// 3) Split live announcement from interactive content and add Memory Echo + minimal Spine.
app = replaceOnce(
  app,
  '        const feedbackEl = document.querySelector(\'#feedback\');\n        feedbackEl.innerHTML = `',
  '        const feedbackEl = document.querySelector(\'#feedback\');\n        const spineMarkup = renderAnswerSpine(activeQuiz);\n        feedbackEl.innerHTML = `',
  'feedback prelude'
);

const oldFeedbackStart = [
  '          <section class="feedback" aria-live="polite">',
  '            <div class="feedback-state ${isCorrect ? \'good\' : \'bad\'}">',
  '              ${isCorrect ? \'CORRECT\' : \'NOT THIS TIME\'}',
  '            </div>',
  '            <h2 class="answer-title">${activeQuiz.correct}</h2>',
  '            <div class="memory-hook">',
  '              <strong>💡 記憶フック:</strong><br>',
  '              ${activeQuiz.memoryHook}',
  '            </div>',
  '            <div class="actions">'
].join('\n');

const newFeedbackStart = [
  '          <section class="feedback">',
  '            <div class="feedback-announcement" role="status" aria-live="polite" aria-atomic="true">',
  '              <div class="feedback-state ${isCorrect ? \'good\' : \'bad\'}">',
  '                ${isCorrect ? \'CORRECT\' : \'NOT THIS TIME\'}',
  '              </div>',
  '              <h2 class="answer-title">${activeQuiz.correct}</h2>',
  '            </div>',
  '            <div class="memory-echo">',
  '              <span class="memory-echo-label">MEMORY ECHO</span>',
  '              <span>${activeQuiz.memoryHook}</span>',
  '            </div>',
  '            ${spineMarkup}',
  '            <div class="actions">'
].join('\n');

app = replaceOnce(app, oldFeedbackStart, newFeedbackStart, 'answered feedback block');

app = replaceOnce(
  app,
  '<button class="secondary" data-action="explore-season" data-season="${activeQuiz.seasonId}">このシーズンを見る (${activeQuiz.year}年)</button>',
  '<button class="secondary" data-action="explore-season" data-season="${activeQuiz.seasonId}">${activeQuiz.year}年を見る</button>',
  'explore CTA label'
);

const exploreListener = [
  '        feedbackEl.querySelector(\'[data-action="explore-season"]\').addEventListener(\'click\', (e) => {',
  '          selectedSeasonId = e.currentTarget.dataset.season;',
  '          render(\'season\');',
  '        });'
].join('\n');

const extendedExploreListener = [
  exploreListener,
  '',
  '        const historyEchoEl = feedbackEl.querySelector(\'#history-echo\');',
  '        const exploreButton = feedbackEl.querySelector(\'[data-action="explore-season"]\');',
  '        feedbackEl.querySelectorAll(\'[data-history-preview]\').forEach(btn => {',
  '          btn.addEventListener(\'click\', () => {',
  '            const previewSeason = db.seasons.find(s => s.season_id === btn.dataset.season);',
  '            if (!previewSeason) return;',
  '            feedbackEl.querySelectorAll(\'[data-history-preview]\').forEach(node => node.setAttribute(\'aria-pressed\', \'false\'));',
  '            btn.setAttribute(\'aria-pressed\', \'true\');',
  '            if (historyEchoEl) historyEchoEl.textContent = previewSeason.year + \' — \' + getHistoryEchoText(previewSeason);',
  '            if (exploreButton) {',
  '              exploreButton.dataset.season = previewSeason.season_id;',
  '              exploreButton.textContent = previewSeason.year + \'年を見る\';',
  '            }',
  '          });',
  '        });'
].join('\n');

app = replaceOnce(app, exploreListener, extendedExploreListener, 'explore listener');

// 4) Visual grammar: square-ish answer options and numeric markers.
styles = replaceOnce(
  styles,
  '  border-radius: var(--radius);\n  border: 1px solid #bdb8b0;',
  '  border-radius: 5px;\n  border: 1px solid #bdb8b0;',
  'option radius'
);
styles = replaceOnce(
  styles,
  '  width: 28px; height: 28px; display:grid; place-items:center;\n  border:1px solid var(--line); border-radius: 50%;\n  flex: 0 0 auto; font-size: 12px; font-weight: 800;',
  '  width: 30px; display:block;\n  border:0; border-radius:0;\n  flex: 0 0 auto; font-size: 11px; font-weight: 900; letter-spacing:.08em; color:var(--muted); font-variant-numeric:tabular-nums;',
  'option key style'
);

// 5) Replace the old memory styling with B+ Memory Echo + History Spine styles.
const oldMemoryStyle = [
  '.memory-hook {',
  '  margin: 18px 0;',
  '  padding-left: 14px;',
  '  border-left: 3px solid var(--brand);',
  '  font-size: 16px;',
  '  line-height: 1.65;',
  '}'
].join('\n');

const newMemoryStyle = [
  '.memory-echo {',
  '  margin: 18px 0 20px;',
  '  padding: 2px 0 2px 14px;',
  '  border-left: 3px solid var(--ink);',
  '  font-size: 16px;',
  '  line-height: 1.65;',
  '}',
  '.memory-echo-label {',
  '  display:block;',
  '  margin-bottom:5px;',
  '  color:var(--muted);',
  '  font-size:10px;',
  '  font-weight:900;',
  '  letter-spacing:.12em;',
  '}',
  '.history-spine-reveal {',
  '  margin-top: 18px;',
  '  padding-top: 16px;',
  '  border-top: 1px solid var(--line);',
  '}',
  '.history-spine {',
  '  position:relative;',
  '  display:grid;',
  '  grid-template-columns:repeat(3, minmax(0,1fr));',
  '  align-items:start;',
  '}',
  '.history-spine::before {',
  '  content:"";',
  '  position:absolute;',
  '  left:16.666%; right:16.666%; top:13px;',
  '  height:1px;',
  '  background:var(--line);',
  '}',
  '.history-node {',
  '  position:relative;',
  '  z-index:1;',
  '  min-height:48px;',
  '  border:0;',
  '  background:transparent;',
  '  color:var(--muted);',
  '  cursor:pointer;',
  '  display:grid;',
  '  justify-items:center;',
  '  align-content:start;',
  '  gap:8px;',
  '  padding:7px 6px 5px;',
  '}',
  '.history-diamond {',
  '  width:12px; height:12px;',
  '  border:2px solid var(--ink);',
  '  background:var(--paper);',
  '  transform:rotate(45deg);',
  '}',
  '.history-year { font-size:13px; font-weight:850; letter-spacing:-.02em; }',
  '.history-node[aria-current="true"] { color:var(--ink); }',
  '.history-node[aria-current="true"] .history-diamond { background:var(--brand); border-color:var(--brand); transform:rotate(45deg) scale(1.22); }',
  '.history-node[aria-current="true"] .history-year { font-weight:950; }',
  '.history-node[aria-pressed="true"]:not([aria-current="true"]) { color:var(--ink); }',
  '.history-node[aria-pressed="true"]:not([aria-current="true"]) .history-diamond { background:var(--ink); border-color:var(--ink); }',
  '.history-node[aria-pressed="true"]:not([aria-current="true"]) .history-year { text-decoration:underline; text-underline-offset:4px; }',
  '.history-echo {',
  '  min-height:46px;',
  '  padding-top:10px;',
  '  border-top:1px solid var(--line);',
  '  color:#46433e;',
  '  font-size:13px;',
  '  line-height:1.55;',
  '}'
].join('\n');
styles = replaceOnce(styles, oldMemoryStyle, newMemoryStyle, 'memory / spine styles');

// 6) B+ should reveal quietly; reduced motion keeps the same structure instantly.
const motionAnchor = '@media (prefers-reduced-motion: no-preference) {\n  .option, .primary, .secondary { transition: transform .16s ease, border-color .16s ease, background .16s ease; }';
const motionReplacement = '@media (prefers-reduced-motion: no-preference) {\n  .history-spine-reveal { animation: history-spine-reveal .2s ease both; }\n  @keyframes history-spine-reveal { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }\n  .option, .primary, .secondary { transition: transform .16s ease, border-color .16s ease, background .16s ease; }';
styles = replaceOnce(styles, motionAnchor, motionReplacement, 'motion block');

fs.writeFileSync(appPath, app);
fs.writeFileSync(stylesPath, styles);
console.log('Answered State B+ migration applied successfully.');
