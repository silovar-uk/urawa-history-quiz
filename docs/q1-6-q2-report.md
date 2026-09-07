# Q1.6 + Q2 Report — Context Before Difficulty

Updated: 2026-09-07

Canonical project state: `docs/current-state.md`

Status:

- Q1.6 Uniform Model Repair — **PASS**
- Q2 Distractor Quality — **PASS (policy / invariant level)**
- Q3 Difficulty — **NEXT**

---

# 1. Why Q1.6 existed

Legacy `data/uniforms.json` stores one HOME chest sponsor per season.

That is not always semantically sufficient.

2007 official evidence distinguishes:

- domestic J.League / domestic cups
- international competitions including AFC Champions League

with different chest marks / partners.

Therefore a question such as:

`2007年のHOMEユニフォームの胸スポンサーは？`

is ambiguous without competition context.

Trust Gate must not solve that ambiguity by guessing one season-level value.

---

# 2. Q1.6 Model Decision

Quiz-safe uniform facts now use:

`season × HOME × competition_scope × chest_sponsor × provenance`

Runtime registry:

`data/uniform-contexts.js`

Trust module:

`prototype/kit-trust.js`

Legacy `data/uniforms.json` remains useful as an archive / display dataset, but its `chest_sponsor` field is **not authoritative for quiz eligibility** when competition context can differ.

---

# 3. Verified Vertical Slice

Current verified contexts:

## 2005

- domestic HOME
- chest: Vodafone
- source: `SRC_URAWA_KIT_2005_VODAFONE`

## 2007

- domestic HOME: SAVAS
- international HOME: DHL
- source: `SRC_URAWA_KIT_2007_SAVAS_DHL`

## 2013

- domestic HOME: POLUS
- AFC Champions League HOME: MITSUBISHI MOTORS
- sources:
  - `SRC_URAWA_KIT_2013_POLUS`
  - `SRC_URAWA_KIT_2013_ACL`

Result:

- 5 verified contexts
- 5 distinct sponsor / chest-mark values
- 3 seasons with competition-aware KIT eligibility

2004 remains outside the verified context registry. It is not needed to make the vertical slice pass and should not be force-confirmed from inference alone.

---

# 4. Production Quiz Change

`KIT_DETAIL` no longer reads a season-level chest sponsor from `uniforms.json`.

It now:

1. selects a verified competition-aware HOME context,
2. states that competition context in the question,
3. requires exactly one correct chest value,
4. selects three distinct verified historical sponsor values as distractors,
5. fails closed if any of those conditions cannot be met.

Example structure:

`2007年シーズンのJリーグ・国内カップ用HOMEユニフォームの胸スポンサーは？`

vs.

`2007年シーズンのAFCチャンピオンズリーグ等の国際大会用HOMEユニフォームの胸スポンサーは？`

This removes the domestic / international conflation.

---

# 5. Season Detail Change

Season Detail now separates verified kit context from legacy archive data.

When verified contexts exist, the UI can show e.g.:

`国内 SAVAS / AFC... DHL`

When no verified context exists, the chest sponsor is displayed as:

`胸スポンサー未検証`

instead of presenting the legacy value as trusted fact.

---

# 6. Q2 Distractor Policy

New policy module:

`prototype/quiz-distractors.js`

Goal:

Move from:

`correct + three random false values`

to:

`correct + three plausible, close, clearly false values`.

## PLAYER_NUMBER

Priority:

1. same-season verified players
2. same registered position when available
3. closer shirt-number distance

## PLAYER_POSITION

The fixed normalized set remains:

- GK
- DF
- MF
- FW

The historical fact itself remains provenance-gated.

## MANAGER_SEASON

Priority:

1. unique manager
2. same decade
3. closer season distance

## SEASON_RANK

Use nearest valid ranks within the actual league size.

## SEASON_SUMMARY

Prefer candidates by:

- temporal proximity
- same decade
- similar title-count profile
- same league context

## KIT_DETAIL

Priority:

1. distinct verified sponsor values
2. same competition scope when enough values exist
3. temporal proximity
4. other verified competition contexts only as fallback distractor labels

Important:

A fallback sponsor label does **not** become a claimed fact about the target competition. The question context makes it a false option; its provenance only establishes that the sponsor label is historically grounded rather than invented.

---

# 7. Automated Quality Gate

CI now runs:

1. `node --check prototype/app.js`
2. `node scripts/quiz-trust-audit.mjs`
3. `node scripts/quiz-quality-audit.mjs`

Q1.6 / Q2 audit result:

- uniform contexts: 5
- distinct sponsor values: 5
- KIT eligible seasons: 2005, 2007, 2013
- provenance failures: 0
- invariant failures: 0
- Q2 quality audit failures: 0

Representative `SEASON_SUMMARY` distractors:

- 2006 → 2005 / 2007 / 2004
- 2017 → 2018 / 2015 / 2016
- 2023 → 2022 / 2021 / 2024

This is materially closer to historical recall than arbitrary distant years.

---

# 8. What Q2 Does Not Claim

Q2 does **not** prove that every question has the right human-perceived difficulty.

It proves that distractor construction is:

- deterministic enough to audit
- domain-aware
- closer to the target
- non-random by default
- uniqueness checked

Human difficulty calibration belongs to Q3.

---

# 9. Remaining Data Debt

Known base-data contradictions remain quarantined in `data/provenance-claims.js`, including several 2006 player fields and legacy kit fields.

Do not silently repair them without source-backed migration.

Also remaining:

- `PLAYER_OVERLAP` disabled until interval evidence exists
- older seasons have sparse player relations
- `data/data-bundle.js` can drift from canonical JSON
- legacy `uniforms.json` still contains season-level sponsor values that should eventually be normalized or explicitly marked as archive-only

---

# 10. Q1.6 Decision

**PASS**

Reason:

- competition context is explicit
- correct KIT answer is source-backed and unique in stated context
- at least three verified distractor labels exist
- domestic / international conflation is removed from quiz generation
- CI passes with no provenance / invariant failures

---

# 11. Q2 Decision

**PASS — policy / invariant level**

Reason:

- PLAYER_NUMBER, MANAGER, RANK, SUMMARY and KIT use domain-aware selection rules
- arbitrary random selection is no longer the primary distractor strategy for those generators
- automated quality checks pass

Q3 is required before calling difficulty calibrated.

---

# 12. Next Gate — Q3 Difficulty

Central question:

> Can difficulty be estimated from the relationship between target and distractors, rather than from obscurity alone?

First vertical slice should define Easy / Medium / Hard using measurable features such as:

- temporal distance
- distractor similarity
- fact prominence
- clue richness
- option homogeneity

Do not introduce adaptive learning yet.
