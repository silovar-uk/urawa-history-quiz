# Quiz Quality Plan — Trust Before Polish

Updated: 2026-09-07

Canonical project state: `docs/current-state.md`

Current status:

- Q0 Inventory — **DONE**
- Q1 Correctness / Eligibility — **DONE**
- Q1.5 Provenance Recovery — **PARTIAL PASS**
- Q1.6 Uniform Model Repair — **NOW**
- Q2 Distractor Quality — **NEXT**
- Q3 Difficulty — LATER
- Q4 Coverage / Balance — LATER
- Q5 Significance / Memory Hook — LATER
- Q6 Learning History — LATER

Reports:

- `docs/quiz-trust-gate-report.md`
- `docs/provenance-recovery-report.md`

---

# 0. Goal

Quiz Engineを：

`question can be generated`

から：

`question is safe to show`

さらに：

`question is worth learning`

へ進める。

順序を逆にしない。

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

# 2. Q1.5 — Provenance Recovery — PARTIAL PASS

## What changed

Introduced claim-level provenance:

`data/provenance-claims.js`

Why:

An entity-level source does not necessarily prove:

`player × season × shirt_number`

or:

`player × season × registered position`.

Claim registry connects exact current values to exact sources.

CI validates:

- source ID exists in `data/sources.json`
- claim value matches base data

## Before → After

- PLAYER_NUMBER: **0 → 2 / 34**
- PLAYER_POSITION: **0 → 3 / 34**
- KIT_DETAIL: **0 → 0 / 34**

Other generators unchanged:

- PLAYER_OVERLAP: 0 / 34
- MANAGER_SEASON: 26 / 34
- SEASON_RANK: 32 / 34
- SEASON_SUMMARY: 33 / 34

Quality invariants:

- invariantFailures: 0
- provenanceFailures: 0

## Why only PARTIAL PASS

PLAYER recovery model works.

KIT research exposed that current `uniforms.json` uses one chest sponsor per season even when sponsor differs by competition.

2007 official evidence:

- domestic competitions = SAVAS
- ACL / international = DHL

Current base data has 2007 = DHL without competition context.

Therefore KIT should remain fail-closed.

---

# 3. Q1.6 — Uniform Model Repair — NOW

## Purpose

Make kit sponsor facts semantically precise before restoring KIT_DETAIL.

## Central question

Is this sufficient?

`season × HOME × chest_sponsor`

Or do we need:

`season × HOME × competition_scope × chest_sponsor`

Current evidence strongly supports the latter.

## First slice

Audit and normalize:

- 2004
- 2005
- 2007
- 2013

Known facts already established:

- 2005 domestic chest = Vodafone
- 2007 domestic chest = SAVAS
- 2007 international chest = DHL
- 2013 domestic chest = POLUS

2004 requires final normalization / source decision before use.

## Required output

- competition-aware uniform schema decision
- corrected / superseded ambiguous base values
- claim-level provenance
- exact domestic wording for KIT_DETAIL
- minimum four distinct safe sponsor values if evidence permits

## Pass

Q1.6 passes only when:

- no domestic / international conflation remains in quiz-eligible records
- correct KIT answer is unique in stated context
- at least 3 safe distractors exist
- invariantFailures = 0
- provenanceFailures = 0

If four distinct domestic values cannot be adequately sourced, keep KIT disabled.

---

# 4. PLAYER_OVERLAP remains disabled

Do not equate same season_id with actual simultaneous registration.

Future evidence requirement:

- registration_start
- registration_end
- or equivalent interval evidence
- roster completeness for distractor proof

---

# 5. Known base-data repair backlog

Q1.5 surfaced at least:

- Washington 2006 shirt number 30 → official 21
- Nobuhisa Yamada 2006 position DF → official R-File MF
- Ryota Tsuzuki 2006 shirt number 21 → official 23
- Masayuki Okano 2006 shirt number 32 → official 30
- 2007 domestic chest DHL → SAVAS
- 2004 chest sponsor requires normalization

Do not mark these erroneous current values as trusted claims.

---

# 6. Q2 — Distractor Quality — NEXT

Start only after Q1.6 decision.

Principles:

- same domain
- plausible
- close enough to require recall
- clearly false
- data-derived
- source-backed when the option itself implies a historical fact
- no absurd option
- no equivalent answer

Generator examples:

## PLAYER_NUMBER

Prefer same-season verified players and, where useful, same-position candidates.

## PLAYER_POSITION

Fixed GK / DF / MF / FW remains acceptable if the registered-position fact is source-backed.

## MANAGER

Prefer adjacent-era managers rather than random historical managers.

## SEASON_RANK

Prefer valid nearby ranks within league size.

## SEASON_SUMMARY

Prefer nearby years or historically similar seasons rather than arbitrary distant years.

## KIT

Use verified sponsor values from comparable competition context only.

---

# 7. Q3 — Difficulty — LATER

Difficulty dimensions:

- distractor similarity
- temporal distance
- fact prominence
- clue richness
- user exposure

Do not equate obscurity with good difficulty.

---

# 8. Q4 — Coverage / Balance — LATER

Measure:

- era
- category
- generator
- season
- player
- knowledge cluster

Avoid over-concentration in famous 2000s seasons / famous players.

---

# 9. Q5 — Significance / Memory Hook — LATER

A correct fact is not automatically worth learning.

Memory Hook should connect:

- player ↔ era
- event ↔ season
- kit ↔ historical period
- manager ↔ result / transformation

Avoid unsupported dramatic copy and isolated trivia.

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

---

# 11. Technical data pipeline note

`data/data-bundle.js` can drift from canonical JSON.

Q1.5 avoided manual bundle duplication by loading claim provenance separately.

After the uniform model stabilizes, add deterministic bundle generation or remove the fallback if unnecessary.

---

# 12. Sequence

```text
Q0 Inventory                         DONE
↓
Q1 Correctness / Eligibility         DONE
↓
Q1.5 Claim Provenance               PARTIAL PASS
↓
Q1.6 Uniform Model Repair            NOW
↓
Q2 Distractor Quality               NEXT
↓
Q3 Difficulty
↓
Q4 Coverage / Balance
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

# 13. Immediate Next Question

> Can domestic and international kit sponsor facts be represented without ambiguity, while preserving a simple quiz wording and fail-closed provenance?
