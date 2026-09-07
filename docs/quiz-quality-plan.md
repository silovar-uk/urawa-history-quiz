# Quiz Quality Plan — Trust Before Polish

Updated: 2026-09-07

Canonical project state: `docs/current-state.md`

Current status:

- Q0 Inventory — **DONE**
- Q1 Correctness / Eligibility — **DONE**
- Q1.5 Provenance Recovery — **PARTIAL PASS / FOUNDATION DONE**
- Q1.6 Uniform Model Repair — **DONE**
- Q2 Distractor Quality — **DONE**
- Q3 Difficulty — **DONE (structural estimate baseline)**
- Q4 Coverage / Balance — **NOW**
- Q5 Significance / Memory Hook — NEXT
- Q6 Learning History — LATER

Reports / plans:

- `docs/quiz-trust-gate-report.md`
- `docs/provenance-recovery-report.md`
- `docs/q1-6-q2-report.md`
- `docs/uniform-context-schema.md`
- `docs/q3-difficulty-report.md`
- `docs/q4-coverage-balance-plan.md`

---

# 0. Goal

Move the Quiz Engine through three distinct states:

`question can be generated`

→

`question is safe to show`

→

`question is worth learning`.

Do not reverse this order.

---

# 1. Q0 / Q1 — DONE

Implemented:

- fail closed
- generator eligibility
- reject reason taxonomy
- semantic option uniqueness
- manager ambiguity exclusion
- league-rank bounds
- answer leak detection
- runtime QA diagnostics
- repeatable CI audit

Trust Gate:

`prototype/quiz-trust.js`

Runtime QA:

`window.URAWA_QUIZ_QA`

---

# 2. Q1.5 — Provenance Recovery

Status:

**PARTIAL PASS / FOUNDATION DONE**

Claim-level provenance:

`data/provenance-claims.js`

It proves exact relationship values rather than treating entity-level sources as evidence for every field.

Current safe player recovery:

- PLAYER_NUMBER: 2 / 34 eligible seasons
- PLAYER_POSITION: 3 / 34 eligible seasons

Known source/data contradictions remain quarantined and fail closed.

PLAYER_OVERLAP remains disabled until interval evidence exists.

---

# 3. Q1.6 — Uniform Model Repair — DONE

Quiz truth now uses:

`season × HOME × competition_scope × chest_sponsor × provenance`

Registry:

`data/uniform-contexts.js`

Trust module:

`prototype/kit-trust.js`

Verified slice:

- 2005 domestic → Vodafone
- 2007 domestic → SAVAS
- 2007 international → DHL
- 2013 domestic → POLUS
- 2013 ACL → MITSUBISHI MOTORS

Result:

- contexts: 5
- distinct sponsors: 5
- KIT_DETAIL eligible seasons: 3 / 34
- invariantFailures: 0
- provenanceFailures: 0

---

# 4. Q2 — Distractor Quality — DONE

Policy:

`prototype/quiz-distractors.js`

Audit:

`scripts/quiz-quality-audit.mjs`

Principle:

Do not choose distractors merely because they are false.

Prefer:

- plausible
- close to target
- domain-consistent
- clearly false
- data-derived
- auditable

Current strategies:

## PLAYER_NUMBER

- same-season verified players
- same position preferred
- smaller shirt-number distance preferred

## PLAYER_POSITION

- normalized GK / DF / MF / FW

## MANAGER_SEASON

- same decade preferred
- smaller temporal distance preferred

## SEASON_RANK

- nearest valid ranks inside actual league size

## SEASON_SUMMARY

- year distance
- same decade
- title-profile similarity
- league similarity

## KIT_DETAIL

- verified historical sponsors
- same competition scope preferred
- temporal proximity

Latest Q2 failures:

**0**

---

# 5. Q3 — Difficulty — DONE

Status:

**PASS — structural estimate baseline**

Model:

`prototype/quiz-difficulty.js`

Audit / inventory:

`scripts/quiz-difficulty-audit.mjs`

CI artifact:

`q3-difficulty-baseline.json`

## Terminology decision

Do not call the pre-response model “observed item difficulty”.

Q3 produces:

**Structural Difficulty Estimate**

Observed item difficulty must later come from actual response data.

## Current factors

### PLAYER_NUMBER

- same-position ratio
- average shirt-number distance
- number closeness

### MANAGER_SEASON

- same-decade ratio
- average year distance
- temporal closeness

### SEASON_RANK

- average rank distance
- rank closeness
- title-count prominence proxy

### SEASON_SUMMARY

- temporal closeness
- same-decade ratio
- title-profile similarity
- league similarity
- title-count distinctiveness proxy

### KIT_DETAIL

- same competition-scope ratio
- temporal distance
- same-year alternative context

## Baseline

107 modeled item constructions:

- EASY: 4
- MEDIUM: 23
- HARD: 80

By generator:

- PLAYER_NUMBER: 11 / E4 M3 H4 / avg 54.9
- MANAGER_SEASON: 26 / E0 M13 H13 / avg 73.2
- SEASON_RANK: 32 / E0 M2 H30 / avg 80.3
- SEASON_SUMMARY: 33 / E0 M2 H31 / avg 80.0
- KIT_DETAIL: 5 / E0 M3 H2 / avg 65.2

## Core finding

The engine is structurally Hard-skewed because Q2 currently chooses the closest plausible distractors almost every time.

Do not “fix” this by shifting thresholds until the chart looks balanced.

Q4 must measure how that construction policy affects actual historical exposure.

## Confidence / limits

Overall Q3 confidence:

**MEDIUM**

Limitations:

- true difficulty still needs user response data
- SEASON_SUMMARY clue richness is under-modeled
- PLAYER_POSITION remains intentionally unmodeled
- PLAYER_OVERLAP remains trust-disabled
- bands are not user-facing

Detailed reasoning:

`docs/q3-difficulty-report.md`

---

# 6. Q4 — Coverage / Balance — NOW

Central question:

> If a user repeatedly requests the next question under the current engine, what history dominates and what history barely appears?

Q4 must distinguish:

1. **Data Availability**
2. **Quiz Eligibility**
3. **Runtime Exposure**

Do not treat these as the same metric.

## Required dimensions

- era
- season
- category
- generator
- structural difficulty
- player / manager where applicable
- KIT competition scope where applicable

## First implementation

Create a deterministic eligibility-and-exposure census.

Recommended:

- `scripts/quiz-coverage-audit.mjs`
- CI artifact `q4-coverage-baseline.json`
- `docs/q4-coverage-report.md`

Measure both:

### Eligibility census

How many safe constructions exist?

### Runtime exposure simulation

Under the real selection algorithm, how often does each construction / season / category reach the screen?

Simulation must be reproducible.

It measures engine exposure, not user engagement.

## Biases to test

- famous-era bias
- provenance bias toward newer seasons
- generator bias
- difficulty bias
- quiet-season invisibility
- category starvation

## Do not impose equal balance yet

Do not force 25% per era or category.

Q5 Significance must inform later editorial weighting.

## Pass

Q4 passes when:

- eligibility and runtime exposure are separately measurable
- exposure is deterministic / reproducible
- era / season / category / generator / difficulty bias is visible
- provenance-driven gaps are separated from editorial choices
- low-visibility seasons are identified
- no Trust Gate is weakened to improve coverage

Plan:

`docs/q4-coverage-balance-plan.md`

---

# 7. Q5 — Significance / Memory Hook — NEXT

A correct fact is not automatically worth learning.

Q5 should define which facts deserve repetition / prominence based on:

- club history
- era representation
- player identity
- transformation / tactical or organizational relevance
- supporter cultural memory
- connectivity to other years / people / events

Do not use Q4 imbalance as a reason to equalize everything before Q5.

---

# 8. Q6 — Learning History — LATER

Future minimum history model:

- knowledge_id
- question_type
- season_id
- category
- answered_at
- correct
- attempts

Then derive:

- recently_wrong
- unseen
- retry
- recovery
- exposure count

Raw accuracy alone should not be called mastery.

Observed item difficulty can eventually be calibrated here once enough response data exists.

---

# 9. Technical / Research Debt Track

## Runtime data

`data/data-bundle.js` can drift from canonical source data.

Recommended before broad data expansion:

- deterministically generate runtime data from canonical source files, or
- remove the fallback if unnecessary.

## Q3 research debt

- semantic clue-richness for SEASON_SUMMARY
- observed difficulty calibration from future response data
- PLAYER_POSITION difficulty model only if a defensible factor set emerges

## Migration cleanup

Archive/remove the one-time Q1.6/Q2 migration workflow after it no longer provides historical value.

---

# 10. Sequence

```text
Q0 Inventory                         DONE
↓
Q1 Correctness / Eligibility         DONE
↓
Q1.5 Claim Provenance               FOUNDATION DONE / PARTIAL COVERAGE
↓
Q1.6 Uniform Model Repair            DONE
↓
Q2 Distractor Quality               DONE
↓
Q3 Structural Difficulty            DONE
↓
Q4 Coverage / Balance               NOW
↓
Q5 Significance / Memory Hook        NEXT
↓
Q6 Learning History
↓
Answered History Spine Integration
↓
History Browser Refinement
```

---

# 11. Immediate Next Question

> Under the current real generator-selection logic, what probability does each era, season, category, generator, and structural difficulty band have of reaching the user’s screen?
