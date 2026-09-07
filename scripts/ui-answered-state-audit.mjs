import fs from 'node:fs';

const app = fs.readFileSync('prototype/app.js', 'utf8');
const css = fs.readFileSync('prototype/styles.css', 'utf8');

const failures = [];
const checks = [];

function requireCheck(name, ok, detail) {
  checks.push({ name, ok, detail });
  if (!ok) failures.push(`${name}: ${detail}`);
}

requireCheck('NUMERIC_OPTION_MARKERS', app.includes("String(i + 1).padStart(2, '0')"), 'Quiz options must use 01/02/03/04 markers.');
requireCheck('NO_LIGHTBULB_MEMORY_LABEL', !app.includes('💡 記憶フック'), 'Production Answered State must not use the lightbulb memory label.');
requireCheck('MEMORY_ECHO', app.includes('memory-echo') && app.includes('MEMORY ECHO'), 'Memory Echo presentation must exist.');
requireCheck('STATUS_ANNOUNCEMENT', app.includes('role="status"') && app.includes('aria-live="polite"') && app.includes('aria-atomic="true"'), 'Dynamic answer feedback must use a polite atomic status region.');
requireCheck('THREE_YEAR_CONTEXT_HELPER', app.includes('const maxItems = Math.min(3, seasons.length);') && app.includes('return seasons.slice(start, start + maxItems);'), 'B+ context must expose at most three seasons, including timeline edges.');
requireCheck('CURRENT_YEAR_SEMANTICS', app.includes('aria-current="true"'), 'Current quiz season must preserve aria-current.');
requireCheck('PREVIEW_SEMANTICS', app.includes('data-history-preview') && app.includes("setAttribute('aria-pressed', 'true')"), 'Adjacent season preview must use aria-pressed and must not navigate automatically.');
requireCheck('NEXT_PRIMARY_FIRST', app.indexOf('data-action="next-question"') !== -1 && app.indexOf('data-action="next-question"') < app.indexOf('data-action="explore-season"'), 'Next Question must remain before Explore Year in Answered State actions.');
requireCheck('EXPLORE_SECONDARY', app.includes('<button class="secondary" data-action="explore-season"'), 'Explore Year must remain Secondary.');
requireCheck('SQUARE_QUIZ_OPTIONS', css.includes('border-radius: 5px;') && css.includes('.option {'), 'Quiz option visual grammar should remain square-ish.');
requireCheck('SPINE_GRID', css.includes('grid-template-columns:repeat(3, minmax(0,1fr));'), 'History Spine should fit three nodes without required horizontal scrolling.');
requireCheck('CURRENT_RED_PREVIEW_BLACK', css.includes('.history-node[aria-current="true"] .history-diamond') && css.includes('background:var(--brand)') && css.includes('.history-node[aria-pressed="true"]:not([aria-current="true"]) .history-diamond') && css.includes('background:var(--ink)'), 'Current and preview nodes need separate red/black semantics.');
requireCheck('NON_COLOR_PREVIEW_CUE', css.includes('text-decoration:underline'), 'Preview state needs a non-color cue.');
requireCheck('QUIET_MOTION', css.includes('animation: history-spine-reveal .2s ease both') && css.includes('@media (prefers-reduced-motion: no-preference)'), 'Reveal motion must remain short and opt out under reduced motion.');

console.log(JSON.stringify({
  audit: 'ANSWERED_STATE_BPLUS_UI_CONTRACT',
  checks,
  failures,
  status: failures.length ? 'FAIL' : 'PASS'
}, null, 2));

if (failures.length) process.exit(1);
