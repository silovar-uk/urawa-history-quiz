# Current State — URAWA HISTORY

Last updated: 2026-09-07

> このファイルを「現在地の正本」とする。
> Product Principlesは `product-principles.md`、長期構想は `development-plan.md`、個別検証は各report / experiment docsを参照する。

---

# 1. Executive Summary

URAWA HISTORYは、1992〜2025の34シーズンを扱うDB駆動prototypeとして成立している。

現在は新機能追加より、**production-qualityとして信用でき、かつ学習価値のあるQuizを固める段階**。

Quiz / Data Quality current status:

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

2026-09-07のData Content Repair Roundでは、一次情報を再調査してから確定誤りのみを修正し、同時にruntime driftと再発を防ぐData Integrity Gateを常設した。

**Current Bottleneck:**

> Coverage / runtime exposure balance — データの既知誤りを修正し、Integrity / Trust / Distractor / Difficultyの各Gateが通った現在、ユーザーが「次の問題」を繰り返したときに、どの年代・カテゴリ・シーズンが実際に多く露出するのかを測る段階。

History Spine production integrationはQuiz Quality上流Gateの後に再開する。

---

# 2. Core Product

Core loop:

`Question → Answer → Memory Hook → History → Next Question`

Goal:

- 年から人物・監督・ユニフォーム・出来事を連想できる。
- 人物や出来事から時代へ戻れる。
- Quizを点の知識で終わらせずクラブ史へ接続する。

Visual grammar:

- White = reading surface / archive
- Black = structure / typography
- Red = current / meaningful Urawa action
- Diamond = node / direction / relation

---

# 3. Data Integrity Repair — DONE / PASS

Research-first repair completed.

Evidence ledger:

`docs/data-repair-evidence.md`

Data contract:

`docs/data-contract.md`

Integrity report:

`docs/data-integrity-report.md`

Issue registry:

`data/issues.json`

## Confirmed errors repaired

- 1995 福田正博得点王：27 → **32 goals**
- 1996 岡野雅行「新人王」誤記を除去
- 2000 J1復帰決定：**鳥栖戦 / 延長前半5分（95分）**へ修正
- 2006 player-season relations:
  - Washington #21
  - 都築龍太 #23
  - 岡野雅行 #30
  - 山田暢久 registered position MF（2006 official season table）
- legacy uniform archive:
  - 2007 domestic chest → SAVAS / international → DHL
  - 2008 domestic chest → SAVAS / international → DHL
  - 2011 domestic chest → SAVAS
- manager tenure structure:
  - 2011 堀孝史 tenureを追加
  - 2024 池田伸康 interim / スコルジャ復帰 tenureを追加

## Intentionally unresolved

推測修正はしていない。

- 2004 legacy chest sponsor — direct 2004 primary evidence still required
- 2009 / 2010 / 2012 legacy chest sponsor — year-specific direct primary evidence still required
- manager tenure reconstruction still needed for 1997 / 1999 / 2000 / 2001 / 2008 / 2017
- broad season prose source granularity remains incomplete

These are tracked as OPEN / BLOCKED issues rather than silently filled.

---

# 4. Canonical Data / Runtime Contract

Canonical source data:

- `data/seasons.json`
- `data/players.json`
- `data/player_seasons.json`
- `data/managers.json`
- `data/manager_tenures.json`
- `data/uniforms.json`
- `data/sources.json`
- `data/issues.json`
- `data/provenance-claims.js`
- `data/uniform-contexts.js`

Runtime fallback:

`data/data-bundle.js`

`data/data-bundle.js` is now a **generated artifact**.

Builder:

`node scripts/build-data-bundle.mjs`

Drift check:

`node scripts/build-data-bundle.mjs --check`

Manual double-editing of canonical JSON and bundle is no longer accepted.

---

# 5. Latest Data Integrity Census

Latest status:

**PASS — 0 integrity errors**

Current census:

- Seasons: **34**
- Seasons marked confirmed: **34**
- Seasons relying only on broad root sources: **31**
- Players: **38**
- Player-season relations: **79**
- Player-season relations with shirt number: **62**
- Claim-backed player-season entities: **17**
- Managers: **21**
- Manager tenure rows: **37**
- Seasons currently modeled with multiple tenure rows: **2**
- Legacy uniform rows: **34**
- Verified competition-aware uniform contexts: **8**
- Seasons with verified uniform context: **5**
- Source records: **19**
- Data issues: **11 total / 7 FIXED / 4 OPEN or BLOCKED**

Known warning categories:

1. `BROAD_SOURCE_ONLY_SEASONS`
2. `SPARSE_PLAYER_SEASONS`
3. `UNIFORM_CONTEXT_GAPS`
4. `MANAGER_CHANGE_ONLY_IN_NOTES`

Important:

`INTEGRITY PASS ≠ COMPLETE HISTORICAL VERIFICATION`

PASS means structural errors / known regression errors are absent and the current known-unknowns are explicitly tracked.

---

# 6. Product Health Snapshot

## Product Definition

**4 / 5 — VALIDATED FOR DEVELOPMENT**

思想は十分明確。大規模な再定義は現在不要。

## Historical Data Coverage

**3 / 5 — FUNCTIONAL**

34 seasonsと主要entity群は存在する。

ただしplayer coverage / uniform context / manager tenure / claim-level source coverageは不均一。

## Data Quality / Provenance

**3.5 / 5 — INTEGRITY GATED, COVERAGE PARTIAL**

Implemented:

- claim-level player-season provenance
- competition-aware uniform provenance
- evidence ledger
- issue registry
- data contract
- deterministic runtime bundle builder
- data integrity audit
- regression fixtures
- permanent CI gate

Known unknowns are warnings/issues rather than guessed values.

## Quiz Engine

**3.5 / 5 — FUNCTIONAL + TRUST GATED + QUALITY INSTRUMENTED**

Generators:

- PLAYER_NUMBER
- PLAYER_POSITION
- PLAYER_OVERLAP
- MANAGER_SEASON
- SEASON_RANK
- SEASON_SUMMARY
- KIT_DETAIL

`PLAYER_OVERLAP` remains deliberately disabled until interval evidence exists.

Runtime diagnostics:

`window.URAWA_QUIZ_QA`

---

# 7. Quiz Trust Coverage — latest aligned CI

- PLAYER_NUMBER: **2 / 34 eligible seasons**
- PLAYER_POSITION: **3 / 34**
- PLAYER_OVERLAP: **0 / 34**
- MANAGER_SEASON: **26 / 34**
- SEASON_RANK: **32 / 34**
- SEASON_SUMMARY: **33 / 34**
- KIT_DETAIL: **5 / 34 eligible seasons**

Latest trust invariants:

- invariantFailures: **0**
- provenanceFailures: **0**
- provenance claim entities: **19**
- claim-level fields: **36**
- verified uniform contexts: **8**

---

# 8. Quiz Content Quality

**4 / 5 — DIFFICULTY + COVERAGE / EXPOSURE BASELINES DONE**

Q2 introduced domain-aware distractors rather than random-first distractors.

Q3 provides a Structural Difficulty Estimate only; it is not observed psychometric difficulty.

## Latest post-repair Q3 baseline

Total modeled constructions:

**114**

Structural bands:

- EASY: **4**
- MEDIUM: **29**
- HARD: **81**

By generator:

- PLAYER_NUMBER: **15** / E4 M6 H5 / avg 57.4
- MANAGER_SEASON: **26** / E0 M13 H13 / avg 73.2
- SEASON_RANK: **32** / E0 M2 H30 / avg 80.3
- SEASON_SUMMARY: **33** / E0 M2 H31 / avg 80.0
- KIT_DETAIL: **8** / E0 M6 H2 / avg 61.6

The post-repair baseline increased because repaired player claims and new verified kit contexts create additional safe constructions.

Do not normalize away the Hard skew merely to make the chart look balanced.

Q4 now also measures deterministic runtime exposure. Under the current ALL policy, season selection is essentially uniform, while category exposure is strongly asymmetric: **SEASON 66.221% / MANAGER 26.319% / KIT 4.130% / PLAYER 3.330%**. Runtime structural exposure is **HARD 77.037%**. See `q4-coverage-report.md`.

---

# 9. Learning Model

**2 / 5 — FUNCTIONAL SUMMARY, NOT TRUE MASTERY**

Current:

- total
- correct
- recentWrong counter
- category accuracy
- era accuracy

Raw accuracy is not treated as validated mastery.

---

# 10. Quiz UX / History / Visual

## Quiz UX

**3.5 / 5 — FUNCTIONAL + B+ ANSWERED STATE INTEGRATED**

- unanswered
- correct / incorrect
- Memory Hook
- Next
- Explore Season
- `SOURCE CHECKED`
- Answered State B+ production integration
  - 01 / 02 / 03 / 04 option grammar
  - `MEMORY ECHO`
  - maximum 3-season local History Spine revealed only after answer
  - Red = current quiz year / Black = preview
  - Next Question remains Primary / Explore Year remains Secondary
- permanent B+ UI Contract Audit in normal CI

Difficulty is intentionally not shown to the user yet.

B+ has passed heuristic / accessibility / automated integration gates, but empirical user validation is still pending. See `ui-bplus-production-integration.md`.

## History Exploration

**3 / 5 — FUNCTIONAL + EXPERIMENTAL RESEARCH**

Production:

- Timeline
- Season Detail
- Player Detail
- Answered State B+ local History Spine

Experiment / research reference:

- History Spine
- Answered Spine Reveal
- A / B / C Answered State comparison

## Visual / Brand System

**3.5 / 5 — NATIVE GRAMMAR PARTIALLY IN PRODUCTION**

- White / Black / Red
- Diamond semantic grammar
- Year as primary visual language
- favicon
- Shu-Ha-Ri research

Large cosmetic work remains behind Quiz Quality gates.

---

# 11. Permanent Automated QA

Normal Quiz CI now runs:

1. production JS syntax
2. Answered State B+ UI Contract Audit
3. canonical JSON ↔ runtime bundle sync
4. Data Integrity Audit
5. Quiz Trust Audit
6. Q2 Quality Audit
7. Q3 Structural Difficulty Audit
8. Q4 deterministic Coverage / Exposure Audit
9. Q3 baseline artifact upload
10. Q4 coverage baseline artifact upload

Files:

- `scripts/build-data-bundle.mjs`
- `scripts/data-integrity-audit.mjs`
- `scripts/quiz-trust-audit.mjs`
- `scripts/quiz-quality-audit.mjs`
- `scripts/quiz-difficulty-audit.mjs`
- `scripts/quiz-coverage-audit.mjs`
- `scripts/ui-answered-state-audit.mjs`
- `.github/workflows/quiz-trust-audit.yml`

Data changes that reintroduce known repaired facts or bundle drift fail CI.

---

# 12. Q4 Coverage / Balance — DONE / PASS

Q4 now separates:

1. Data Availability
2. Quiz Eligibility
3. Runtime Exposure

Permanent audit:

`scripts/quiz-coverage-audit.mjs`

CI artifact:

`q4-coverage-baseline.json`

Latest deterministic ALL simulation: **200,000 requests**.

Key result:

- season exposure is essentially uniform across the 34-season archive
- famous-year test ratio: **0.997** versus season-uniform expectation
- category exposure: **SEASON 66.221% / MANAGER 26.319% / KIT 4.130% / PLAYER 3.330%**
- generator exposure: **SEASON_SUMMARY 33.895% / SEASON_RANK 32.327% / MANAGER_SEASON 26.319% / KIT_DETAIL 4.130% / PLAYER_POSITION 2.154% / PLAYER_NUMBER 1.177%**
- runtime structural exposure: **HARD 77.037% / MEDIUM 20.220% / UNMODELED 2.154% / EASY 0.591%**
- PLAYER blind spots: **31 seasons**
- KIT blind spots: **29 seasons**
- MANAGER blind spots: **8 seasons**

Central interpretation:

> The engine is not strongly biased toward famous years. The larger imbalance is inside seasons: sparse claim-level provenance makes PLAYER / KIT history nearly invisible, and season-first runtime selection amplifies that concentration.

This is not permission to force equal category shares. Q5 must define significance before exposure weighting.

Report:

`docs/q4-coverage-report.md`

---

# 13. NOW — Q5 Significance / Memory Hook

Q5 asks a different question from Q4:

> Which safe facts deserve repetition / prominence because they matter to Urawa history — rather than merely because a distribution is uneven?

First action:

> Define an explainable knowledge-significance model that is separate from evidence confidence, structural difficulty, and current runtime exposure.

Minimum dimensions to investigate:

- club-history importance
- supporter cultural memory
- turning-point value
- player / manager identity value
- title / failure context
- tactical / organizational transformation
- connectivity to other seasons / entities
- era-representation value

NEXT:

1. Q6 Learning History

THEN:

2. exposure weighting / adaptive-light selection only if Q5 + Q6 justify it
3. broader History Grammar / History Browser refinement after UX validation

---

# 14. Do Not Build Yet

- psychometric claims from structural scores
- user-facing EASY / MEDIUM / HARD badges
- adaptive learning
- XP / coins / rankings
- PLAYER_OVERLAP without interval evidence
- full History redesign
- large UI polish round
- framework migration
- inferred historical facts to improve coverage metrics

---

# 15. Next Review Gate

Q5 may advance to Q6 only when:

> The project can assign explainable historical / learning significance to safe knowledge units without conflating importance with structural difficulty, provenance confidence, or current exposure — and can state why a fact deserves repetition or prominence.
