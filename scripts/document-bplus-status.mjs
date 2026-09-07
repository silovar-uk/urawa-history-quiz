import fs from 'node:fs';

function replaceOnce(source, oldValue, newValue, label) {
  const first = source.indexOf(oldValue);
  if (first < 0) throw new Error(`Guard failed: ${label} not found.`);
  if (source.indexOf(oldValue, first + oldValue.length) >= 0) throw new Error(`Guard failed: ${label} matched more than once.`);
  return source.slice(0, first) + newValue + source.slice(first + oldValue.length);
}

const currentPath = 'docs/current-state.md';
let current = fs.readFileSync(currentPath, 'utf8');
current = replaceOnce(
  current,
  '## Quiz UX\n\n**3 / 5 — FUNCTIONAL**',
  '## Quiz UX\n\n**3.5 / 5 — FUNCTIONAL + B+ ANSWERED STATE INTEGRATED**',
  'Quiz UX status'
);
current = replaceOnce(
  current,
  '- `SOURCE CHECKED`\n\nDifficulty is intentionally not shown to the user yet.',
  '- `SOURCE CHECKED`\n- Answered State B+ production integration\n  - 01 / 02 / 03 / 04 option grammar\n  - `MEMORY ECHO`\n  - maximum 3-season local History Spine revealed only after answer\n  - Red = current quiz year / Black = preview\n  - Next Question remains Primary / Explore Year remains Secondary\n- permanent B+ UI Contract Audit in normal CI\n\nDifficulty is intentionally not shown to the user yet.\n\nB+ has passed heuristic / accessibility / automated integration gates, but empirical user validation is still pending. See `ui-bplus-production-integration.md`.',
  'Quiz UX detail'
);
current = replaceOnce(
  current,
  'Production:\n\n- Timeline\n- Season Detail\n- Player Detail\n\nExperiment:\n\n- History Spine\n- Answered Spine Reveal',
  'Production:\n\n- Timeline\n- Season Detail\n- Player Detail\n- Answered State B+ local History Spine\n\nExperiment / research reference:\n\n- History Spine\n- Answered Spine Reveal\n- A / B / C Answered State comparison',
  'History production list'
);
current = replaceOnce(
  current,
  '## Visual / Brand System\n\n**3 / 5 — PRINCIPLES STRONG, PRODUCTION APPLICATION PARTIAL**',
  '## Visual / Brand System\n\n**3.5 / 5 — NATIVE GRAMMAR PARTIALLY IN PRODUCTION**',
  'Visual status'
);
current = replaceOnce(
  current,
  '1. production JS syntax\n2. canonical JSON ↔ runtime bundle sync\n3. Data Integrity Audit\n4. Quiz Trust Audit\n5. Q2 Quality Audit\n6. Q3 Structural Difficulty Audit\n7. Q3 baseline artifact upload',
  '1. production JS syntax\n2. Answered State B+ UI Contract Audit\n3. canonical JSON ↔ runtime bundle sync\n4. Data Integrity Audit\n5. Quiz Trust Audit\n6. Q2 Quality Audit\n7. Q3 Structural Difficulty Audit\n8. Q3 baseline artifact upload',
  'Permanent QA ordered list'
);
current = replaceOnce(
  current,
  '- `scripts/quiz-difficulty-audit.mjs`\n- `.github/workflows/quiz-trust-audit.yml`',
  '- `scripts/quiz-difficulty-audit.mjs`\n- `scripts/ui-answered-state-audit.mjs`\n- `.github/workflows/quiz-trust-audit.yml`',
  'QA file list'
);
fs.writeFileSync(currentPath, current);

const roundPath = 'docs/ui-answered-state-native-round.md';
let round = fs.readFileSync(roundPath, 'utf8');
round = replaceOnce(
  round,
  'Status: **PASS — Variant B+ selected as production candidate**',
  'Status: **PASS — Variant B+ selected; subsequently integrated into production**',
  'Answered-state round status'
);
round += '\n---\n\n# 18. Subsequent Production Integration\n\nB+ was later integrated into the production prototype without expanding the redesign to Today / History / You / Desktop.\n\nProduction integration report:\n\n`docs/ui-bplus-production-integration.md`\n\nPermanent automated UI contract:\n\n`scripts/ui-answered-state-audit.mjs`\n\nImportant distinction:\n\n- design / implementation gate: **PASS**\n- empirical user-behavior validation: **PENDING**\n';
fs.writeFileSync(roundPath, round);

console.log('B+ production status synchronized into canonical UI documentation.');
