# Quiz Quality Plan — Trust Before Polish

Updated: 2026-09-07

Canonical project state: `docs/current-state.md`

Current status:

- Q0 Inventory — **DONE**
- Q1 Correctness / Eligibility — **DONE**
- Q1.5 Provenance Recovery — **PARTIAL PASS / FOUNDATION DONE**
- Q1.6 Uniform Model Repair — **DONE**
- Q2 Distractor Quality — **DONE (policy / invariant level)**
- Q3 Difficulty — **NOW**
- Q4 Coverage / Balance — NEXT
- Q5 Significance / Memory Hook — LATER
- Q6 Learning History — LATER

Reports:

- `docs/quiz-trust-gate-report.md`
- `docs/provenance-recovery-report.md`
- `docs/q1-6-q2-report.md`
- `docs/uniform-context-schema.md`

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

- PLAYER_NUMBER: 2 / 34 seasons
- PLAYER_POSITION: 3 / 34 seasons

Known source/data contradictions remain quarantined and fail closed.

PLAYER_OVERLAP remains disabled until interval evidence exists.

---

# 3. Q1.6 — Uniform Model Repair — DONE

## Decision

Season-level:

`season × HOME × chest_sponsor`

is insufficient for quiz correctness.

Quiz truth now uses:

`season × HOME × competition_scope × chest_sponsor × provenance`

Registry:

`data/uniform-contexts.js`

Trust module:

`prototype/kit-trust.js`

Schema addendum:

`docs/uniform-context-schema.md`

## Verified slice

- 2005 domestic → Vodafone
- 2007 domestic → SAVAS
- 2007 international → DHL
- 2013 domestic → POLUS
- 2013 ACL → MITSUBISHI MOTORS

## Result

- contexts: 5
- distinct sponsor values: 5
- KIT_DETAIL eligible seasons: **3 / 34**
- invariantFailures: 0
- provenanceFailures: 0

Q1.6 therefore passes.

Important:

`uniforms.json` remains archive/display data. Competition-aware context is authoritative for chest-sponsor Quiz eligibility.

---

# 4. Q2 — Distractor Quality — DONE

Policy module:

`prototype/quiz-distractors.js`

Automated audit:

`scripts/quiz-quality-audit.mjs`

## Principle

Do not choose distractors merely because they are false.

Prefer answers that are:

- plausible
- close to the target
- domain-consistent
- clearly false
- data-derived
- auditable

## PLAYER_NUMBER

Prioritize:

1. verified same-season player
2. same registered position when available
3. closer shirt number

## PLAYER_POSITION

Use normalized:

- GK
- DF
- MF
- FW

Historical correctness remains provenance-gated.

## MANAGER_SEASON

Prioritize:

1. unique manager
2. same decade
3. smaller temporal distance

## SEASON_RANK

Use nearest valid ranks inside the actual league size.

## SEASON_SUMMARY

Prioritize using:

- year distance
- same decade
- title-count similarity
- league similarity

Representative results:

- 2006 → 2005 / 2007 / 2004
- 2017 → 2018 / 2015 / 2016
- 2023 → 2022 / 2021 / 2024

## KIT_DETAIL

Prioritize:

1. distinct verified historical sponsor values
2. same competition scope when enough values exist
3. temporal proximity
4. other verified competition contexts as fallback distractor labels

A fallback label is not asserted to belong to the target competition. It is a historically grounded but false option for the explicitly stated target context.

## Q2 Pass

Latest automated result:

- Q2 failures: 0
- all KIT contexts can form four unique options
- player policy prefers same-position candidate when one exists
- rank distractors are ordered by proximity
- summary candidates remain temporally relevant

Q2 therefore passes at **policy / invariant level**.

It does not claim human difficulty calibration. That is Q3.

---

# 5. Q3 — Difficulty — NOW

## Central question

> Can Easy / Medium / Hard be defined from measurable relationships between target, clue and distractors, instead of treating obscure trivia as Hard?

## Why now

Q2 gives us structured distractor relationships.

Difficulty can now be modeled from those relationships rather than guessed before question construction stabilizes.

## Candidate dimensions

### Temporal Distance

Examples:

- neighboring seasons are harder for a year-identification question
- decades-apart seasons are easier

### Distractor Similarity

Examples:

- same position + nearby shirt number
- same-era manager
- neighboring league rank

More similarity can increase difficulty.

### Fact Prominence

A title-winning season or iconic event may be easier than a routine fact even when distractors are close.

Do not use unsupported subjective labels directly in production; first define a small auditable prominence scale.

### Clue Richness

A stem containing several unique historical clues is easier than one containing a single generic clue.

### Option Homogeneity

Options from the same semantic class and era can increase difficulty.

## First vertical slice

Do not create new facts.

Use already-trusted questions from:

- PLAYER_NUMBER
- MANAGER_SEASON
- SEASON_RANK
- SEASON_SUMMARY
- KIT_DETAIL

Build a scoring prototype that annotates candidate questions with:

- feature values
- raw score
- proposed Easy / Medium / Hard
- explanation

## Pass condition

Q3 passes when:

- the scoring rule is explicit and machine-readable
- the same inputs always produce the same difficulty
- representative generators occupy more than one difficulty band
- obscure facts are not automatically labeled Hard
- easy questions remain useful, not absurd
- no correctness / provenance Gate is weakened
- difficulty can be audited in CI

## Reject

Reject a difficulty system if:

- it is manually assigned per question without rules
- it only measures temporal distance
- it equates rarity with quality
- all KIT questions become Hard simply because they are kit questions
- every famous season becomes Easy regardless of distractor construction
- it depends on user performance before a baseline question model exists

---

# 6. Q4 — Coverage / Balance — NEXT

After Q3, measure:

- era
- category
- generator
- season
- player
- difficulty
- knowledge cluster

Goal:

Avoid a high-quality engine that mostly asks about famous 2000s seasons and a small set of players.

---

# 7. Q5 — Significance / Memory Hook — LATER

A correct fact is not automatically worth learning.

Memory Hook should connect:

- player ↔ era
- event ↔ season
- kit ↔ historical period
- manager ↔ result / transformation

Avoid unsupported dramatic copy and isolated trivia.

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

---

# 9. Technical Debt Track

`data/data-bundle.js` can drift from canonical source data.

New provenance / uniform contexts are loaded separately to avoid manual duplicate edits.

Recommended before broad data expansion:

- deterministically generate runtime data from canonical source files, or
- remove the bundle fallback if unnecessary.

Also archive/remove the one-time Q1.6/Q2 migration workflow after it no longer provides historical value.

This is a parallel maintenance track, not a reason to mix framework migration into Q3.

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
Q3 Difficulty                       NOW
↓
Q4 Coverage / Balance               NEXT
↓
Q5 Significance / Memory Hook
↓
Q6 Learning History
↓
Answered History Spine Integration
↓
History Browser Refinement
```

---

# 11. Immediate Next Question

> What measurable properties make one trusted URAWA HISTORY question meaningfully harder than another without simply making it more obscure?
