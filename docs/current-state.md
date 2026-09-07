# Current State — URAWA HISTORY

Last updated: 2026-09-07

> このファイルを「現在地の正本」とする。
> Product Principlesは `product-principles.md`、長期構想は `development-plan.md`、個別検証は各report / experiment docsを参照する。

---

# 1. Executive Summary

URAWA HISTORYは、1992〜2025の34シーズンを扱うDB駆動prototypeとして成立している。

現在は新機能追加より、**production-qualityとして信用でき、かつ学習価値のあるQuizを固める段階**。

Quiz Quality current status:

- Q0 Inventory — **DONE**
- Q1 Correctness / Eligibility — **DONE**
- Q1.5 Provenance Recovery — **PARTIAL PASS / FOUNDATION DONE**
- Q1.6 Uniform Model Repair — **DONE**
- Q2 Distractor Quality — **DONE**
- Q3 Difficulty — **DONE (structural estimate baseline)**
- Q4 Coverage / Balance — **NOW**
- Q5 Significance / Memory Hook — NEXT
- Q6 Learning History — LATER

Q1.6でKITを `season × HOME` の単一値から、`season × HOME × competition_scope` の文脈付きfactへ分離した。

Q2で主要generatorのdistractorをrandom-firstからdomain-aware policyへ変更した。

Q3では107件のtrust-safeな問題構成を観測可能にし、target / distractor関係から **Structural Difficulty Estimate** を決定的に算出できるようにした。

重要：これは実ユーザー正答率から求めるObserved Item Difficultyではない。

**Current Bottleneck:**

> Coverage / exposure balance — 安全で難易度構造も観測できるようになったが、現在のgenerator policyで「どの年代・カテゴリ・シーズンが実際に画面へ出やすいか」はまだ測定していない。

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

# 3. Product Health Snapshot

## Product Definition

**4 / 5 — VALIDATED FOR DEVELOPMENT**

思想は十分明確。大規模な再定義は現在不要。

## Historical Data Coverage

**3 / 5 — FUNCTIONAL**

34 seasonsと主要entity群は存在する。

ただし：

`DATA EXISTS ≠ VERIFIED`

を維持する。

## Data Quality / Provenance

**3 / 5 — FUNCTIONAL FOUNDATION, COVERAGE PARTIAL**

Implemented:

- `data/provenance-claims.js`
- specific official source records in `data/sources.json`
- claim value / source ID CI validation
- `data/uniform-contexts.js`
- competition-aware uniform context provenance

Known base-data issues remain quarantined, including several 2006 player fields and legacy kit sponsor values.

They remain fail-closed until repaired from evidence.

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

Trust Gate:

- fail closed
- reject reason taxonomy
- source / claim checks
- normalized option uniqueness
- rank bounds
- manager ambiguity exclusion
- answer leak detection
- competition-aware KIT context

Runtime diagnostics:

`window.URAWA_QUIZ_QA`

## Quiz Trust Coverage — latest aligned CI

- PLAYER_NUMBER: **2 / 34 eligible seasons**
- PLAYER_POSITION: **3 / 34 eligible seasons**
- PLAYER_OVERLAP: **0 / 34**
- MANAGER_SEASON: **26 / 34**
- SEASON_RANK: **32 / 34**
- SEASON_SUMMARY: **33 / 34**
- KIT_DETAIL: **3 / 34 eligible seasons**

Latest trust invariants:

- invariantFailures: **0**
- provenanceFailures: **0**
- uniformContexts: **5**

## Quiz Content Quality

**3.5 / 5 — DISTRACTOR + STRUCTURAL DIFFICULTY BASELINE DONE**

Q2 introduced:

- PLAYER_NUMBER: same position / close number preference
- MANAGER: same decade / close season preference
- SEASON_RANK: nearest valid rank
- SEASON_SUMMARY: temporal / era / title / league similarity
- KIT_DETAIL: verified historical sponsor values, same competition scope preferred

Q3 introduced:

- `prototype/quiz-difficulty.js`
- `scripts/quiz-difficulty-audit.mjs`
- CI artifact `q3-difficulty-baseline.json`

Q3 does **not** expose difficulty labels in UI.

### Q3 baseline

Total modeled constructions:

**107**

Provisional structural bands:

- EASY: **4**
- MEDIUM: **23**
- HARD: **80**

By generator:

- PLAYER_NUMBER: 11 items / E4 M3 H4 / avg 54.9
- MANAGER_SEASON: 26 / E0 M13 H13 / avg 73.2
- SEASON_RANK: 32 / E0 M2 H30 / avg 80.3
- SEASON_SUMMARY: 33 / E0 M2 H31 / avg 80.0
- KIT_DETAIL: 5 / E0 M3 H2 / avg 65.2

Interpretation:

The Hard skew is not normalized away. It reveals that Q2 currently selects the closest plausible distractors almost every time.

Q4 must measure how this construction bias interacts with era / category / season exposure.

### Q3 limitations

- Observed item difficulty still requires real user response data.
- SEASON_SUMMARY semantic clue richness is under-modeled; confidence is lower.
- PLAYER_POSITION remains unmodeled for structural difficulty rather than inventing fake precision.
- PLAYER_OVERLAP remains trust-disabled.

Detailed report:

`docs/q3-difficulty-report.md`

## Learning Model

**2 / 5 — FUNCTIONAL SUMMARY, NOT TRUE MASTERY**

Current:

- total
- correct
- recentWrong counter
- category accuracy
- era accuracy

Raw accuracy is not treated as validated mastery.

## Quiz UX

**3 / 5 — FUNCTIONAL**

- unanswered
- correct / incorrect
- Memory Hook
- Next
- Explore Season
- `SOURCE CHECKED`

Difficulty is intentionally not shown to the user yet.

History Spine Reveal remains experiment-only.

## History Exploration

**3 / 5 — FUNCTIONAL + EXPERIMENTAL RESEARCH**

Production:

- Timeline
- Season Detail
- Player Detail

Experiment:

- History Spine
- Answered Spine Reveal

## Visual / Brand System

**3 / 5 — PRINCIPLES STRONG, PRODUCTION APPLICATION PARTIAL**

- White / Black / Red
- Diamond semantic grammar
- Year as primary visual language
- favicon
- Shu-Ha-Ri research

Do not expand cosmetic work while Quiz Quality remains upstream bottleneck.

---

# 4. Uniform Semantics — Q1.6 DONE

Quiz-safe chest sponsor facts no longer depend on the one-value-per-season legacy field.

Authoritative quiz context:

`data/uniform-contexts.js`

Logical key:

`season_id × type × competition_scope`

Verified vertical slice:

- 2005 domestic HOME → Vodafone
- 2007 domestic HOME → SAVAS
- 2007 international HOME → DHL
- 2013 domestic HOME → POLUS
- 2013 ACL HOME → MITSUBISHI MOTORS

---

# 5. Q2 Distractor Quality — DONE

Policy module:

`prototype/quiz-distractors.js`

Quality audit:

`scripts/quiz-quality-audit.mjs`

Latest aligned result:

- invariantFailures: 0
- provenanceFailures: 0
- Q2 failures: 0

---

# 6. Q3 Difficulty — DONE

Status:

**PASS — structural estimate baseline**

Model:

`prototype/quiz-difficulty.js`

Audit:

`scripts/quiz-difficulty-audit.mjs`

Baseline CI:

https://github.com/silovar-uk/urawa-history-quiz/actions/runs/34120456643

The CI stores the full item-level baseline as an artifact.

Core decision:

> Structural Difficulty is useful as a pre-calibration feature, but it must never be represented as observed user difficulty until response data exists.

Research confidence:

**MEDIUM**

---

# 7. NOW — Q4 Coverage / Balance

Central question:

> If a user simply presses “next” repeatedly today, what Urawa history are they statistically likely to see, and what history is nearly invisible?

Q4 must distinguish:

1. Data Availability
2. Quiz Eligibility
3. Runtime Exposure

Measure at minimum:

- era
- season
- category
- generator
- structural difficulty
- player / manager where applicable

Do not impose an arbitrary equal distribution yet.

Plan:

`docs/q4-coverage-balance-plan.md`

First action:

> Build a deterministic eligibility-and-exposure census for every season from 1992–2025 under the current generator policy.

---

# 8. NEXT / THEN

NEXT:

1. Q5 Significance / Memory Hook

THEN:

2. Q6 Learning History
3. Question Selection / adaptive-light logic only if justified
4. Answered History Spine production integration
5. History Browser refinement

---

# 9. Do Not Build Yet

- psychometric claims from structural scores
- user-facing EASY / MEDIUM / HARD badges
- adaptive learning
- XP / coins / rankings
- PLAYER_OVERLAP without interval evidence
- full History redesign
- large UI polish round
- framework migration

---

# 10. Technical / Research Debt

## Data runtime

`data/data-bundle.js` remains a legacy runtime fallback and can drift from canonical source data.

## Difficulty

- SEASON_SUMMARY needs a better clue-richness model before user-facing use.
- observed item difficulty requires later response data.
- PLAYER_POSITION is intentionally unmodeled in Q3.

## One-time migration

The Q1.6/Q2 migration script / workflow can be archived or removed after its historical value is no longer needed.

---

# 11. Documentation / QA State

Canonical:

- `docs/current-state.md`
- `docs/product-principles.md`
- `docs/development-plan.md`
- `docs/quiz-quality-plan.md`

Reports / plans:

- `docs/quiz-trust-gate-report.md`
- `docs/provenance-recovery-report.md`
- `docs/q1-6-q2-report.md`
- `docs/uniform-context-schema.md`
- `docs/q3-difficulty-report.md`
- `docs/q4-coverage-balance-plan.md`

Automated QA:

- `scripts/quiz-trust-audit.mjs`
- `scripts/quiz-quality-audit.mjs`
- `scripts/quiz-difficulty-audit.mjs`
- `.github/workflows/quiz-trust-audit.yml`

---

# 12. Next Review Gate

Q4 may advance to Q5 only when:

> The project can separately explain what facts exist, what questions are safe, and what history the current engine actually exposes to a user over repeated sessions — broken down by era, season, category, generator, and structural difficulty.
