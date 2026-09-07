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
- Q2 Distractor Quality — **DONE (policy / invariant level)**
- Q3 Difficulty — **NOW**
- Q4 Coverage / Balance — NEXT
- Q5 Significance / Memory Hook — LATER
- Q6 Learning History — LATER

Q1.6でKITを `season × HOME` の単一値から、`season × HOME × competition_scope` の文脈付きfactへ分離した。

Q2で主要generatorのdistractorをrandom-firstからdomain-aware policyへ変更した。

**Current Bottleneck:**

> Difficulty calibration — 「近い誤答」を作れるようになったが、その近さがEasy / Medium / Hardとしてどう作用するかはまだ定義・検証していない。

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

**3.5 / 5 — FUNCTIONAL + TRUST GATED + DISTRACTOR POLICY**

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

- PLAYER_NUMBER: **2 / 34 eligible**
- PLAYER_POSITION: **3 / 34 eligible**
- PLAYER_OVERLAP: **0 / 34**
- MANAGER_SEASON: **26 / 34**
- SEASON_RANK: **32 / 34**
- SEASON_SUMMARY: **33 / 34**
- KIT_DETAIL: **3 / 34 eligible**

Latest trust invariants:

- invariantFailures: **0**
- provenanceFailures: **0**
- uniformContexts: **5**

KIT eligible seasons:

- 2005
- 2007
- 2013

Detailed Q1.6 / Q2 report:

`docs/q1-6-q2-report.md`

Uniform schema addendum:

`docs/uniform-context-schema.md`

## Quiz Content Quality

**3 / 5 — DISTRACTOR POLICY DONE, DIFFICULTY NEXT**

Q2 introduced:

- PLAYER_NUMBER: same position / close number preference
- MANAGER: same decade / close season preference
- SEASON_RANK: nearest valid rank
- SEASON_SUMMARY: temporal / era / title / league similarity
- KIT_DETAIL: verified historical sponsor values, same competition scope preferred

Q2 quality audit:

- failures: **0**

Representative summary distractors:

- 2006 → 2005 / 2007 / 2004
- 2017 → 2018 / 2015 / 2016
- 2023 → 2022 / 2021 / 2024

This does not yet mean difficulty is calibrated.

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

Season Detail now labels unverified legacy chest sponsor data instead of presenting it as trusted truth.

---

# 5. Q2 Distractor Quality — DONE

Policy module:

`prototype/quiz-distractors.js`

Quality audit:

`scripts/quiz-quality-audit.mjs`

CI now checks:

1. prototype syntax
2. Q0/Q1/Q1.5/Q1.6 trust eligibility
3. Q2 distractor policy invariants

Latest aligned CI result:

**SUCCESS**

- KIT_DETAIL: 3 / 34 eligible
- invariantFailures: 0
- provenanceFailures: 0
- Q2 failures: 0

---

# 6. NOW — Q3 Difficulty

Central question:

> Can Easy / Medium / Hard be defined from measurable relationships between target, clue, and distractors instead of simply using obscure facts?

Candidate dimensions:

- temporal distance
- distractor similarity
- same-era density
- same-position / same-role similarity
- fact prominence
- clue richness
- option homogeneity

First Q3 vertical slice should score existing trusted questions; it should not create new facts.

Pass condition:

- difficulty has an explicit scoring rule
- representative questions can be classified consistently
- no category is automatically always Easy or always Hard
- difficulty does not reward obscure / low-value trivia by default
- Trust Gate remains unchanged

---

# 7. NEXT / THEN

NEXT:

1. Q4 Coverage / Balance

THEN:

2. Q5 Significance / Memory Hook
3. Q6 Learning History
4. Answered History Spine production integration
5. History Browser refinement

---

# 8. Do Not Build Yet

- adaptive learning
- XP / coins / rankings
- PLAYER_OVERLAP without interval evidence
- full History redesign
- large UI polish round
- framework migration

---

# 9. Technical Debt

`data/data-bundle.js` remains a legacy runtime fallback and can drift from canonical JSON.

New provenance and uniform-context registries are loaded separately to avoid manual double-editing.

Recommended cleanup after Q3 / before broad data expansion:

> make canonical JSON / registries generate runtime data deterministically, or remove the fallback if it is unnecessary.

The one-time Q1.6/Q2 migration script / workflow should also be archived or removed after the current implementation history no longer needs it.

---

# 10. Documentation / QA State

Canonical:

- `docs/current-state.md`
- `docs/product-principles.md`
- `docs/development-plan.md`
- `docs/quiz-quality-plan.md`

Reports / schema:

- `docs/quiz-trust-gate-report.md`
- `docs/provenance-recovery-report.md`
- `docs/q1-6-q2-report.md`
- `docs/uniform-context-schema.md`

Automated QA:

- `scripts/quiz-trust-audit.mjs`
- `scripts/quiz-quality-audit.mjs`
- `.github/workflows/quiz-trust-audit.yml`

---

# 11. Next Review Gate

Q3 may advance to Q4 only when:

> Difficulty is explainable from measurable features, produces sensible differences across representative Quiz types, and does not weaken correctness or historical significance.
