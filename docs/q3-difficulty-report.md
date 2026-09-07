# Q3 Difficulty Research Report

Updated: 2026-09-07

Status: **PASS — Structural Difficulty Estimate baseline**

Important limitation:

> Q3 does **not** claim psychometric / observed item difficulty. Until sufficient response data exists, URAWA HISTORY uses a deterministic Structural Difficulty Estimate based on target, clue proxies, and distractor relationships.

Canonical current state:

`docs/current-state.md`

---

# 1. Question

> What measurable properties make one trusted URAWA HISTORY question meaningfully harder than another without simply making it more obscure?

---

# 2. Research Framing

Difficulty and learning value are separate.

The project distinguishes:

1. Structural Difficulty Estimate — Q3
2. Historical / learning significance — Q5
3. Observed item difficulty from real response data — future calibration

External framing used in the original Q3 research:

- Classical item difficulty is ordinarily estimated from the proportion of examinees answering correctly.
  - https://asmepublications.onlinelibrary.wiley.com/doi/10.1111/j.1365-2923.2009.03425.x
  - https://testingservices.utexas.edu/scanning/interpreting-test-results
- Desirable difficulty is useful only when challenge supports later learning / retention.
  - https://bjorklab.psych.ucla.edu/research/
  - https://pubmed.ncbi.nlm.nih.gov/26255442/

---

# 3. Implementation

Model:

`prototype/quiz-difficulty.js`

Audit:

`scripts/quiz-difficulty-audit.mjs`

CI:

`.github/workflows/quiz-trust-audit.yml`

Every relevant CI run produces:

`q3-difficulty-baseline.json`

The artifact contains item-level structural scores, factors, bands, and representative samples.

---

# 4. Model

Modeled questions produce:

- `kind = STRUCTURAL_ESTIMATE`
- `score = 0..100`
- `band = EASY / MEDIUM / HARD`
- factor values
- reasons
- cautions where a factor is only a proxy

Current research thresholds:

- EASY: 0–39
- MEDIUM: 40–69
- HARD: 70–100

These are not user-facing labels.

---

# 5. Generator Factors

## PLAYER_NUMBER

- same-position distractor ratio
- average shirt-number distance
- number closeness

## MANAGER_SEASON

- same-decade distractor ratio
- average year distance
- temporal closeness

## SEASON_RANK

- average rank distance
- rank closeness
- title-count prominence proxy

## SEASON_SUMMARY

- temporal closeness
- same-decade ratio
- title-profile similarity
- league similarity
- title-count distinctiveness proxy

Caution:

The model does not yet measure semantic clue richness in the actual summary text well enough. Confidence is therefore lower for this generator.

## KIT_DETAIL

- same competition-scope ratio
- year distance
- same-year alternative context

PLAYER_POSITION remains intentionally unmodeled rather than inventing unsupported precision.

PLAYER_OVERLAP remains disabled because its Trust requirements are not met.

---

# 6. Initial Baseline — Before Data Content Repair

Original Q3 run:

https://github.com/silovar-uk/urawa-history-quiz/actions/runs/34120456643

This is preserved as a historical snapshot, not the current baseline.

- total: 107
- EASY: 4
- MEDIUM: 23
- HARD: 80

By generator:

- PLAYER_NUMBER: 11 / E4 M3 H4 / avg 54.9
- MANAGER_SEASON: 26 / E0 M13 H13 / avg 73.2
- SEASON_RANK: 32 / E0 M2 H30 / avg 80.3
- SEASON_SUMMARY: 33 / E0 M2 H31 / avg 80.0
- KIT_DETAIL: 5 / E0 M3 H2 / avg 65.2

---

# 7. Current Baseline — After Data Content Repair

Current aligned CI run:

https://github.com/silovar-uk/urawa-history-quiz/actions/runs/34124150650

Artifact:

https://github.com/silovar-uk/urawa-history-quiz/actions/runs/34124150650/artifacts/10019374783

Total structurally scorable constructions:

**114**

Overall bands:

- EASY: **4**
- MEDIUM: **29**
- HARD: **81**

By generator:

### PLAYER_NUMBER

- count: **15**
- E4 / M6 / H5
- range: 20–88
- average: **57.4**

### MANAGER_SEASON

- count: **26**
- E0 / M13 / H13
- range: 48–92
- average: **73.2**

### SEASON_RANK

- count: **32**
- E0 / M2 / H30
- range: 47–87
- average: **80.3**

### SEASON_SUMMARY

- count: **33**
- E0 / M2 / H31
- range: 54–89
- average: **80.0**

### KIT_DETAIL

- count: **8**
- E0 / M6 / H2
- range: 46–77
- average: **61.6**

Why the baseline changed:

- repaired 2006 player relations created additional trust-safe PLAYER_NUMBER constructions
- verified 2008 / 2011 uniform contexts created additional KIT constructions
- no Trust rule was weakened

---

# 8. Human Reasonableness Audit

Representative outputs remain directionally sensible.

Examples:

- 2023 伊藤敦樹 #3 — score 20 / EASY
- 2006 都築龍太 #23 — score 42 / MEDIUM after repaired shirt-number provenance
- 2006 final league rank 1st — score 47 / MEDIUM
- 1994 / 1995 manager questions — around 92 / HARD
- neighboring 2011–2013 summary questions — around 89 / HARD, but with lower confidence because semantic clue richness is under-modeled

The model was not tuned to manufacture a balanced-looking distribution.

---

# 9. Critical Finding — Hard Skew Is a Construction Property

Q2 generally chooses the closest plausible distractors.

Therefore many constructions are structurally Hard by design, especially:

- exact final-rank questions
- neighboring season-summary questions

Do not move thresholds merely to make the distribution look balanced.

Q4 must measure how this structural bias interacts with actual runtime exposure.

---

# 10. Limits / Research Debt

1. Observed item difficulty still requires real response data.
2. SEASON_SUMMARY needs a better semantic clue-richness model before user-facing difficulty use.
3. PLAYER_POSITION may not need a structural difficulty model unless defensible variation can be defined.
4. PLAYER_OVERLAP remains unmodeled / trust-disabled.
5. Difficulty and historical significance remain separate concepts.
6. Data repair may change the safe item bank; therefore the current CI artifact, not an older report count, is the authoritative baseline.

---

# 11. Q3 Decision

**PASS — Structural Difficulty Estimate baseline**

Confidence:

**MEDIUM**

What is proven:

- explicit deterministic scoring model exists
- trust-safe constructions can be inventoried
- different structural bands emerge
- repair-driven item-bank changes can be re-baselined automatically
- CI retains the item-level artifact

What is not proven:

- true user difficulty
- optimal band thresholds
- optimal Easy / Medium / Hard mix
- learning value
- adaptive selection policy

---

# 12. Next Gate — Q4 Coverage / Balance

Q4 now uses the **post-repair 114-construction baseline**.

Central question:

> If a user simply presses “next” repeatedly under the repaired current engine, what history is statistically likely to reach the screen, what history is nearly invisible, and which gaps are caused by data/provenance limitations rather than editorial intent?
