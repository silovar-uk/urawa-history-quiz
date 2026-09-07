#!/usr/bin/env node
import fs from 'node:fs';

function replaceOnce(file, from, to) {
  const before = fs.readFileSync(file, 'utf8');
  const count = before.split(from).length - 1;
  if (count !== 1) {
    throw new Error(`${file}: expected exactly one occurrence, found ${count}: ${from.slice(0, 100)}`);
  }
  fs.writeFileSync(file, before.replace(from, to));
}

// current-state.md — product health headline.
replaceOnce(
  'docs/current-state.md',
  '**3.5 / 5 — DISTRACTOR + STRUCTURAL DIFFICULTY BASELINE DONE**',
  '**4 / 5 — DIFFICULTY + COVERAGE / EXPOSURE BASELINES DONE**'
);

replaceOnce(
  'docs/current-state.md',
  'Do not normalize away the Hard skew merely to make the chart look balanced.\n',
  'Do not normalize away the Hard skew merely to make the chart look balanced.\n\nQ4 now also measures deterministic runtime exposure. Under the current ALL policy, season selection is essentially uniform, while category exposure is strongly asymmetric: **SEASON 66.221% / MANAGER 26.319% / KIT 4.130% / PLAYER 3.330%**. Runtime structural exposure is **HARD 77.037%**. See `q4-coverage-report.md`.\n'
);

// Permanent CI list.
replaceOnce(
  'docs/current-state.md',
  '7. Q3 Structural Difficulty Audit\n8. Q3 baseline artifact upload',
  '7. Q3 Structural Difficulty Audit\n8. Q4 deterministic Coverage / Exposure Audit\n9. Q3 baseline artifact upload\n10. Q4 coverage baseline artifact upload'
);

replaceOnce(
  'docs/current-state.md',
  '- `scripts/quiz-difficulty-audit.mjs`\n- `scripts/ui-answered-state-audit.mjs`',
  '- `scripts/quiz-difficulty-audit.mjs`\n- `scripts/quiz-coverage-audit.mjs`\n- `scripts/ui-answered-state-audit.mjs`'
);

// Replace Q4 NOW + NEXT/THEN block up to Do Not Build Yet.
const currentState = fs.readFileSync('docs/current-state.md', 'utf8');
const start = currentState.indexOf('# 12. NOW — Q4 Coverage / Balance');
const end = currentState.indexOf('# 14. Do Not Build Yet');
if (start < 0 || end < 0 || end <= start) throw new Error('docs/current-state.md: Q4/Q13 block markers not found');
const replacement = `# 12. Q4 Coverage / Balance — DONE / PASS\n\nQ4 now separates:\n\n1. Data Availability\n2. Quiz Eligibility\n3. Runtime Exposure\n\nPermanent audit:\n\n\`scripts/quiz-coverage-audit.mjs\`\n\nCI artifact:\n\n\`q4-coverage-baseline.json\`\n\nLatest deterministic ALL simulation: **200,000 requests**.\n\nKey result:\n\n- season exposure is essentially uniform across the 34-season archive\n- famous-year test ratio: **0.997** versus season-uniform expectation\n- category exposure: **SEASON 66.221% / MANAGER 26.319% / KIT 4.130% / PLAYER 3.330%**\n- generator exposure: **SEASON_SUMMARY 33.895% / SEASON_RANK 32.327% / MANAGER_SEASON 26.319% / KIT_DETAIL 4.130% / PLAYER_POSITION 2.154% / PLAYER_NUMBER 1.177%**\n- runtime structural exposure: **HARD 77.037% / MEDIUM 20.220% / UNMODELED 2.154% / EASY 0.591%**\n- PLAYER blind spots: **31 seasons**\n- KIT blind spots: **29 seasons**\n- MANAGER blind spots: **8 seasons**\n\nCentral interpretation:\n\n> The engine is not strongly biased toward famous years. The larger imbalance is inside seasons: sparse claim-level provenance makes PLAYER / KIT history nearly invisible, and season-first runtime selection amplifies that concentration.\n\nThis is not permission to force equal category shares. Q5 must define significance before exposure weighting.\n\nReport:\n\n\`docs/q4-coverage-report.md\`\n\n---\n\n# 13. NOW — Q5 Significance / Memory Hook\n\nQ5 asks a different question from Q4:\n\n> Which safe facts deserve repetition / prominence because they matter to Urawa history — rather than merely because a distribution is uneven?\n\nFirst action:\n\n> Define an explainable knowledge-significance model that is separate from evidence confidence, structural difficulty, and current runtime exposure.\n\nMinimum dimensions to investigate:\n\n- club-history importance\n- supporter cultural memory\n- turning-point value\n- player / manager identity value\n- title / failure context\n- tactical / organizational transformation\n- connectivity to other seasons / entities\n- era-representation value\n\nNEXT:\n\n1. Q6 Learning History\n\nTHEN:\n\n2. exposure weighting / adaptive-light selection only if Q5 + Q6 justify it\n3. broader History Grammar / History Browser refinement after UX validation\n\n---\n\n`;
fs.writeFileSync('docs/current-state.md', currentState.slice(0, start) + replacement + currentState.slice(end));

// Next review gate.
const cs2 = fs.readFileSync('docs/current-state.md', 'utf8');
const gateStart = cs2.indexOf('# 15. Next Review Gate');
if (gateStart < 0) throw new Error('docs/current-state.md: Next Review Gate marker missing');
fs.writeFileSync('docs/current-state.md', cs2.slice(0, gateStart) + `# 15. Next Review Gate\n\nQ5 may advance to Q6 only when:\n\n> The project can assign explainable historical / learning significance to safe knowledge units without conflating importance with structural difficulty, provenance confidence, or current exposure — and can state why a fact deserves repetition or prominence.\n`);

// quiz-quality-plan.md status + report list.
replaceOnce(
  'docs/quiz-quality-plan.md',
  '- Q4 Coverage / Balance — **NOW**\n- Q5 Significance / Memory Hook — **NEXT**',
  '- Q4 Coverage / Balance — **DONE / PASS**\n- Q5 Significance / Memory Hook — **NOW**'
);
replaceOnce(
  'docs/quiz-quality-plan.md',
  '- `docs/q4-coverage-balance-plan.md`',
  '- `docs/q4-coverage-balance-plan.md`\n- `docs/q4-coverage-report.md`'
);
replaceOnce(
  'docs/quiz-quality-plan.md',
  '7. Q3 Structural Difficulty Audit\n7. Q3 artifact upload',
  '7. Q3 Structural Difficulty Audit\n8. Q4 deterministic Coverage / Exposure Audit\n9. Q3 artifact upload\n10. Q4 coverage artifact upload'
);

// Section 8 to section 9 heading.
const qp = fs.readFileSync('docs/quiz-quality-plan.md', 'utf8');
const q4Start = qp.indexOf('# 8. Q4 — Coverage / Balance — NOW');
const q5Start = qp.indexOf('# 9. Q5 — Significance / Memory Hook — NEXT');
if (q4Start < 0 || q5Start < 0 || q5Start <= q4Start) throw new Error('docs/quiz-quality-plan.md: Q4/Q5 markers not found');
const q4Text = `# 8. Q4 — Coverage / Balance — DONE / PASS\n\nPermanent audit:\n\n\`scripts/quiz-coverage-audit.mjs\`\n\nCI artifact:\n\n\`q4-coverage-baseline.json\`\n\nReport:\n\n\`docs/q4-coverage-report.md\`\n\nLatest safe construction census:\n\n- total **131**\n- PLAYER_NUMBER **15**\n- PLAYER_POSITION **17**\n- PLAYER_OVERLAP **0**\n- MANAGER_SEASON **26**\n- SEASON_RANK **32**\n- SEASON_SUMMARY **33**\n- KIT_DETAIL **8**\n\nLatest ALL runtime exposure, 200,000 deterministic requests:\n\n- SEASON **66.221%**\n- MANAGER **26.319%**\n- KIT **4.130%**\n- PLAYER **3.330%**\n\nStructural difficulty exposure:\n\n- HARD **77.037%**\n- MEDIUM **20.220%**\n- UNMODELED **2.154%**\n- EASY **0.591%**\n\nThe season-selection layer itself is close to uniform. Famous-year test ratio is **0.997** against the season-uniform expectation.\n\nThe major imbalance is category / generator representation inside seasons, driven heavily by provenance concentration and amplified by season-first selection.\n\nKnown blind spots:\n\n- 31 seasons with player rows but no eligible player generator\n- 29 seasons with legacy HOME kit data but no eligible KIT_DETAIL\n- 8 seasons with manager tenure data but no eligible MANAGER_SEASON\n\nDecision:\n\n**Do not force equal distribution yet.** Q5 defines significance before editorial exposure weighting.\n\n---\n\n`;
let qp2 = qp.slice(0, q4Start) + q4Text + qp.slice(q5Start);
qp2 = qp2.replace('# 9. Q5 — Significance / Memory Hook — NEXT', '# 9. Q5 — Significance / Memory Hook — NOW');
qp2 = qp2.replace('Q4 Coverage / Balance                NOW\n↓\nQ5 Significance / Memory Hook        NEXT', 'Q4 Coverage / Balance                DONE / PASS\n↓\nQ5 Significance / Memory Hook        NOW');
const immediateMarker = '# 12. Immediate Next Question';
const immediate = qp2.indexOf(immediateMarker);
if (immediate < 0) throw new Error('docs/quiz-quality-plan.md: Immediate Next Question marker missing');
qp2 = qp2.slice(0, immediate) + `${immediateMarker}\n\n> Which safe facts deserve prominence / repetition because they matter to Urawa history, and how should significance be represented separately from structural difficulty, provenance confidence, and current exposure?\n`;
fs.writeFileSync('docs/quiz-quality-plan.md', qp2);

// q4 plan becomes historical record rather than NEXT.
replaceOnce(
  'docs/q4-coverage-balance-plan.md',
  'Status: **NEXT / HEAD START ONLY**',
  'Status: **DONE / BASELINE PASS**\n\nImplemented result: `docs/q4-coverage-report.md`\n\nPermanent audit: `scripts/quiz-coverage-audit.mjs`'
);
replaceOnce(
  'docs/q4-coverage-balance-plan.md',
  '- 107 modeled item constructions',
  '- 114 modeled item constructions'
);

console.log('Q4 canonical documentation synchronized.');
