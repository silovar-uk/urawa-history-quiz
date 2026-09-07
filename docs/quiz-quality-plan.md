# Quiz Quality Plan — Trust Before Polish

Updated: 2026-09-07

Canonical project state: `docs/current-state.md`

Current status:

- Q0 Inventory — **DONE**
- Q1 Correctness / Eligibility — **DONE**
- Q1.5 Provenance Recovery — **FOUNDATION DONE / COVERAGE PARTIAL**
- Q1.6 Uniform Model Repair — **DONE**
- Q2 Distractor Quality — **DONE**
- Q3 Difficulty — **DONE (structural estimate baseline)**
- Data Content Repair / Integrity Gate — **DONE / PASS**
- Q4 Coverage / Balance — **NOW**
- Q5 Significance / Memory Hook — **NEXT**
- Q6 Learning History — **LATER**

Reports / plans:

- `docs/quiz-trust-gate-report.md`
- `docs/provenance-recovery-report.md`
- `docs/q1-6-q2-report.md`
- `docs/uniform-context-schema.md`
- `docs/q3-difficulty-report.md`
- `docs/data-repair-evidence.md`
- `docs/data-integrity-report.md`
- `docs/data-contract.md`
- `docs/q4-coverage-balance-plan.md`

---

# 0. Goal

Move the Quiz Engine through distinct states:

`question can be generated`

→

`question is safe to show`

→

`underlying data is internally consistent and runtime-safe`

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

**FOUNDATION DONE / COVERAGE PARTIAL**

Claim-level provenance:

`data/provenance-claims.js`

Current safe player recovery:

- PLAYER_NUMBER: **2 / 34 eligible seasons**
- PLAYER_POSITION: **3 / 34 eligible seasons**

The 2026-09-07 Data Repair Round corrected additional 2006 base relations and promoted them into positive claim provenance.

PLAYER_OVERLAP remains disabled until interval evidence exists.

---

# 3. Q1.6 — Uniform Model Repair — DONE

Quiz truth uses:

`season × HOME × competition_scope × chest_sponsor × provenance`

Registry:

`data/uniform-contexts.js`

Latest verified context coverage:

- 2005 domestic → Vodafone
- 2007 domestic → SAVAS
- 2007 international → DHL
- 2008 domestic → SAVAS
- 2008 international → DHL
- 2011 domestic → SAVAS
- 2013 domestic → POLUS
- 2013 ACL → MITSUBISHI MOTORS

Current result:

- verified contexts: **8**
- distinct sponsors: **5**
- KIT_DETAIL eligible seasons: **5 / 34**
- invariantFailures: **0**
- provenanceFailures: **0**

Unverified legacy kit years are not guessed into eligibility.

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

**PASS — Structural Difficulty Estimate baseline**

Model:

`prototype/quiz-difficulty.js`

Audit / inventory:

`scripts/quiz-difficulty-audit.mjs`

## Terminology

Do not call this pre-response model “observed item difficulty”.

Observed item difficulty must later come from actual response data.

## Latest post-repair baseline

**114 modeled constructions**

- EASY: **4**
- MEDIUM: **29**
- HARD: **81**

By generator:

- PLAYER_NUMBER: **15** / E4 M6 H5 / avg 57.4
- MANAGER_SEASON: **26** / E0 M13 H13 / avg 73.2
- SEASON_RANK: **32** / E0 M2 H30 / avg 80.3
- SEASON_SUMMARY: **33** / E0 M2 H31 / avg 80.0
- KIT_DETAIL: **8** / E0 M6 H2 / avg 61.6

The baseline changed from the earlier 107-item census because repaired player relations and additional verified uniform contexts created new safe constructions.

Do not shift thresholds merely to make the distribution look balanced.

Limitations remain:

- true difficulty needs user response data
- SEASON_SUMMARY clue richness is under-modeled
- PLAYER_POSITION remains intentionally unmodeled
- PLAYER_OVERLAP remains disabled

---

# 6. Data Content Repair / Integrity Gate — DONE

A historical correctness audit found concrete base-data errors after Q3, so Q4 was temporarily paused.

The repair sequence was:

`Primary-source Research → Evidence Ledger → Classification → Canonical Repair → Runtime Rebuild → Integrity Audit → Quiz Revalidation`

Confirmed repairs included:

- 1995 福田正博 32 goals
- 1996 岡野雅行 award correction
- 2000 Tosu / 95-minute promotion V-goal context
- 2006 player relation corrections
- 2007 / 2008 / 2011 legacy domestic kit sponsor corrections
- 2011 and 2024 manager-tenure structural recovery

Infrastructure added:

- `data/issues.json`
- `docs/data-repair-evidence.md`
- `docs/data-contract.md`
- `scripts/build-data-bundle.mjs`
- `scripts/data-integrity-audit.mjs`

`data/data-bundle.js` is now generated from canonical JSON and CI rejects drift.

Latest Integrity status:

**PASS / ERROR 0**

Census:

- seasons 34
- players 38
- player-season relations 79
- managers 21
- manager tenures 37
- verified uniform contexts 8
- sources 19
- issues 11 total / 7 fixed / 4 open or blocked

Warnings remain visible rather than guessed away:

- 31 seasons rely only on broad root sources
- many player-season samples are sparse
- 29 seasons lack verified competition-aware uniform context
- manager change reconstruction remains incomplete for 1997 / 1999 / 2000 / 2001 / 2008 / 2017

These are Research / Coverage Debt, not permission to weaken Trust.

---

# 7. Permanent CI Order

Every relevant data / quiz change now runs:

1. syntax
2. canonical JSON ↔ generated runtime bundle sync
3. historical Data Integrity Audit
4. Quiz Trust Audit
5. Q2 Quality Audit
6. Q3 Structural Difficulty Audit
7. Q3 artifact upload

A known repaired historical fact cannot silently regress without failing CI.

---

# 8. Q4 — Coverage / Balance — NOW

Q4 resumes after Data Integrity PASS.

Central question:

> If a user repeatedly requests the next question under the current real engine, what Urawa history dominates and what history barely appears?

Q4 must distinguish:

1. **Data Availability**
2. **Quiz Eligibility**
3. **Runtime Exposure**

Do not treat these as the same metric.

Required dimensions:

- era
- season
- category
- generator
- structural difficulty
- player / manager where applicable
- KIT competition scope where applicable

First implementation:

- deterministic eligibility-and-exposure census
- recommended `scripts/quiz-coverage-audit.mjs`
- CI artifact `q4-coverage-baseline.json`
- `docs/q4-coverage-report.md`

Measure both:

### Eligibility census

How many safe constructions exist?

### Runtime exposure simulation

Under the real selection algorithm, how often does each construction / season / category reach the screen?

Simulation must be reproducible.

It measures engine exposure, not user engagement.

Biases to test:

- famous-era bias
- provenance bias toward better-sourced seasons
- generator bias
- difficulty bias
- quiet-season invisibility
- category starvation

Do not force equal distribution yet.

Q4 must label whether low exposure comes from:

- historical/editorial policy
- missing data
- missing provenance
- Trust rejection
- generator selection policy

Pass:

- eligibility and runtime exposure are separately measurable
- exposure simulation is deterministic
- era / season / category / generator / difficulty bias is visible
- data-quality debt is separated from editorial balance
- low-visibility seasons are identified
- Trust Gate remains unchanged

---

# 9. Q5 — Significance / Memory Hook — NEXT

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

# 10. Q6 — Learning History — LATER

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

Observed item difficulty can eventually be calibrated once sufficient response data exists.

---

# 11. Sequence

```text
Q0 Inventory                         DONE
↓
Q1 Correctness / Eligibility         DONE
↓
Q1.5 Claim Provenance                FOUNDATION DONE / PARTIAL COVERAGE
↓
Q1.6 Uniform Model Repair            DONE
↓
Q2 Distractor Quality                DONE
↓
Q3 Structural Difficulty             DONE
↓
Data Content Repair / Integrity      DONE / PASS
↓
Q4 Coverage / Balance                NOW
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

# 12. Immediate Next Question

> Under the repaired current generator-selection logic, what probability does each era, season, category, generator, and structural difficulty band have of reaching the user’s screen — and how much of that imbalance comes from data/provenance gaps rather than editorial intent?
