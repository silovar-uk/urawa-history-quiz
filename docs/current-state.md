# Current State — URAWA HISTORY

Last updated: 2026-09-07

> このファイルを「現在地の正本」とする。
> Product Principlesは `product-principles.md`、長期構想は `development-plan.md`、個別検証は各report / experiment docsを参照する。

---

# 1. Executive Summary

URAWA HISTORYは、1992〜2025の34シーズンを扱うDB駆動prototypeとして成立している。

現在は新機能追加より、**production-qualityとして信用できるfact / quiz / interactionを固める段階**。

Quiz Qualityは以下まで進行した。

- Q0 Inventory — DONE
- Q1 Correctness / Eligibility — DONE
- Q1.5 Provenance Recovery — **PARTIAL PASS**
- Q1.6 Uniform Model Repair — **NOW**
- Q2 Distractor Quality — NEXT

Q1.5でclaim-level provenance registryを導入し、Trust Gateを弱めずPLAYER系の一部を復活させた。

**Current Bottleneck:**

> Uniform semantics — 国内大会と国際大会で異なる胸スポンサーを、season単位1値の現在modelでは安全に表現できない。

History Spine production integrationはQuiz Trust / Quiz Quality上流Gateの後に再開する。

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

**2.5 / 5 — NOW**

Q1.5で追加：

- `data/provenance-claims.js`
- specific official source records in `data/sources.json`
- claim value / source ID CI validation

Current issues discovered:

- 2006 Washington shirt number: current 30 / official 21
- 2006 Nobuhisa Yamada position: current DF / official R-File MF
- 2006 Ryota Tsuzuki shirt number: current 21 / official 23
- 2006 Masayuki Okano shirt number: current 32 / official 30
- 2007 domestic chest sponsor: current DHL / official domestic SAVAS; DHL is international context
- 2004 chest sponsor value also needs repair / stronger historical normalization

These contradictions remain fail-closed.

## Quiz Engine

**3 / 5 — FUNCTIONAL + TRUST GATED**

7 generators remain defined:

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

Runtime diagnostics:

`window.URAWA_QUIZ_QA`

## Quiz Trust Coverage — Q1.5 CI

Before → After:

- PLAYER_NUMBER: **0 → 2 / 34**
- PLAYER_POSITION: **0 → 3 / 34**
- PLAYER_OVERLAP: 0 / 34
- MANAGER_SEASON: 26 / 34
- SEASON_RANK: 32 / 34
- SEASON_SUMMARY: 33 / 34
- KIT_DETAIL: 0 / 34

Q1.5 CI:

- invariantFailures: **0**
- provenanceFailures: **0**
- provenanceClaims: 15
- knownDataIssues: 6

Detailed report:
`docs/provenance-recovery-report.md`

Interpretation:

PLAYER recovery succeeded as a vertical slice.
KIT did not fail because the Gate is too strict; it exposed a real data-model ambiguity.

## Quiz Content Quality

**2 / 5 — QUEUED**

Not yet solved:

- distractor plausibility
- difficulty
- knowledge significance
- era / category balance
- repeated knowledge clusters
- question freshness

Do not start Q2 before Q1.6 is decided.

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
- `SOURCE CHECKED` trust wording

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

# 4. Documentation / QA State

Current canonical files:

- `docs/current-state.md` — current truth
- `docs/product-principles.md` — product principles
- `docs/development-plan.md` — long-term roadmap
- `docs/quiz-quality-plan.md` — quiz quality sequence
- `docs/quiz-trust-gate-report.md` — Q0/Q1 result
- `docs/provenance-recovery-report.md` — Q1.5 result

Automated QA:

- `scripts/quiz-trust-audit.mjs`
- `.github/workflows/quiz-trust-audit.yml`

Latest Q1.5 audit run:
https://github.com/silovar-uk/urawa-history-quiz/actions/runs/34117692993

---

# 5. NOW — Q1.6 Uniform Model Repair

Central question:

> 胸スポンサーfactは `season × HOME` の1値で十分か、それともcompetition scopeを持つ必要があるか？

Evidence already shows competition-specific variation in 2007.

Minimum investigation slice:

- 2004
- 2005
- 2007
- 2013

Candidate model:

`season_id × kit_type × competition_scope × chest_sponsor × provenance`

Examples of `competition_scope`:

- domestic
- ACL / international

Pass condition:

- existing wrong / ambiguous base values are repaired or safely superseded
- domestic question wording becomes unambiguous
- at least four distinct source-backed domestic chest sponsor values can support KIT_DETAIL
- invariantFailures = 0
- provenanceFailures = 0

---

# 6. NEXT — Q2 Distractor Quality

Only after Q1.6 passes.

Move from:

`correct + three technically false values`

to:

`correct + three plausible but defensibly false values`

Generator-specific strategies should then be designed and measured.

---

# 7. THEN

1. Q3 Difficulty
2. Q4 Coverage / Balance
3. Q5 Significance / Memory Hook
4. Q6 Learning History
5. Answered History Spine production integration
6. History Browser refinement

---

# 8. Do Not Build Yet

- adaptive learning
- XP / coins / rankings
- PLAYER_OVERLAP without interval evidence
- full History redesign
- large UI polish round
- framework migration
- manual dual-edit workflow for JSON + data-bundle

---

# 9. Technical Debt

`data/data-bundle.js` is a legacy runtime fallback and can drift from canonical JSON.

Q1.5 avoided manually duplicating claim edits into the bundle by loading claim provenance separately.

Next technical cleanup after the data model stabilizes:

> generate `data-bundle.js` deterministically from JSON, or remove it if the fallback is unnecessary.

---

# 10. Next Review Gate

Q1.6 passes only when:

> A KIT question can state its competition context precisely enough that the screen has exactly one source-backed answer, with three source-backed alternative sponsor values available for distractors.
