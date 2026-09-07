# Current State — URAWA HISTORY

Last updated: 2026-09-07

> このファイルを「現在地の正本」とする。
> Product Principlesは `product-principles.md`、長期構想は `development-plan.md`、個別研究はresearch / experiment docsを参照する。

---

# 1. Executive Summary

URAWA HISTORYは、1992〜2025の34シーズンを扱うDB駆動prototypeとして成立している。

現在は「機能を増やす段階」ではなく、**production-qualityとして信用できるfact / quiz / interactionを固める段階**。

2026-09-07にQ0 / Q1 Quiz Trust Gateをproduction Quiz Engineへ導入した。

現在の最大の変化：

- 問題candidateはTrust Gateを通らない限りscreenへ出ない。
- reject reasonをmachine-readableに記録する。
- GitHub Actionsで全34season × 7 generatorを監査する。
- Q0 / Q1初回auditはSUCCESS。
- invariant failureは0。
- ただしsafe coverageはgeneratorごとに大きく異なる。

**Current Bottleneck:**

> Provenance Recovery — PLAYER / KITをTrust Gateを弱めず復活させるためのrelationship-level source整備。

History Spine production integrationはこの品質Gateの後に再開する。

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

# 3. Maturity Scale

- 0 — NOT STARTED
- 1 — CONCEPT
- 2 — PROTOTYPE
- 3 — FUNCTIONAL
- 4 — VALIDATED
- 5 — STABLE

`FUNCTIONAL ≠ DONE`

`DATA EXISTS ≠ VERIFIED`

`QUIZ GENERATED ≠ GOOD QUIZ`

---

# 4. Product Health Snapshot

## Product Definition

**4 / 5 — VALIDATED FOR DEVELOPMENT**

- Product Principles
- Mobile First
- Quiz → History philosophy
- Urawa visual grammar
- Reduce before adding

Next gate:
実利用・品質監査の結果でPrinciples自体も再評価する。

---

## Historical Data Coverage

**3 / 5 — FUNCTIONAL**

Exists:
- 34 seasons
- players
- player_seasons
- managers
- manager_tenures
- uniforms
- sources

Gap:
coverageとclaim-level provenanceを分離して管理する必要がある。

---

## Data Quality / Provenance

**2 / 5 — NOW**

Good:
- season-level `verification_status`
- source master
- entity source_ids

Current gaps:
- `player_seasons` relationship-level source不足
- `uniforms` source不足
- manager change yearのgranularity不足
- exact player registration interval不足
- source masterが粗い単位

---

## Quiz Engine

**3 / 5 — FUNCTIONAL + TRUST GATED**

7 generators:
- PLAYER_NUMBER
- PLAYER_POSITION
- PLAYER_OVERLAP
- MANAGER_SEASON
- SEASON_RANK
- SEASON_SUMMARY
- KIT_DETAIL

Q0 / Q1 Trust Gate implemented:
- `prototype/quiz-trust.js`
- fail closed
- reject reason taxonomy
- normalized option uniqueness
- source / season verification checks
- rank bounds
- manager ambiguity checks
- answer leak detection

Runtime diagnostics:

`window.URAWA_QUIZ_QA`

---

## Quiz Trust Coverage — CI result

Initial audit:

- PLAYER_NUMBER: **0 / 34 eligible**
- PLAYER_POSITION: **0 / 34 eligible**
- PLAYER_OVERLAP: **0 / 34 eligible**
- MANAGER_SEASON: **26 / 34 eligible**
- SEASON_RANK: **32 / 34 eligible**
- SEASON_SUMMARY: **33 / 34 eligible**
- KIT_DETAIL: **0 / 34 eligible**

Invariant failures: **0**

Interpretation:

Trust Gateは正常。
PLAYER / KITの0件はsource不足を正しく可視化した結果。

Report:
`docs/quiz-trust-gate-report.md`

---

## Quiz Content Quality

**2 / 5 — NEXT AFTER PROVENANCE SLICE**

Not solved yet:
- semantic distractor quality
- difficulty
- knowledge significance
- era / category balance
- repeated knowledge cluster
- freshness

Q2へ進む前にPLAYER / KITの小規模Provenance Recoveryを行う。

---

## Learning Model

**2 / 5 — FUNCTIONAL SUMMARY, NOT TRUE MASTERY**

Current:
- total
- correct
- recentWrong counter
- category accuracy
- era accuracy

Important limitation:
`recentWrong` はquestion historyではなくcounter。
Raw accuracyをそのまま理解度と呼ぶには不足。

---

## Quiz UX

**3 / 5 — FUNCTIONAL**

- unanswered
- correct / incorrect
- Memory Hook
- Next
- Explore Season

Trust wording:

`FACT VERIFIED` → `SOURCE CHECKED`

理由：source存在とclaim-by-claim完全検証を区別する。

History Spine Revealはまだproduction未統合。

---

## History Exploration

**3 / 5 — FUNCTIONAL + EXPERIMENTAL RESEARCH**

Production:
- Timeline
- Season Detail
- Player Detail

Experiment:
- History Spine
- Answered Spine Reveal

Research is preserved but queued behind Quiz Trust / Provenance / Q2.

---

## Visual / Brand System

**3 / 5 — PRINCIPLES STRONG, PRODUCTION APPLICATION PARTIAL**

- White / Black / Red
- Diamond semantic concept
- Year as primary language
- favicon
- Shu-Ha-Ri research

Do not expand decoration while Quiz Quality is upstream bottleneck.

---

## Mobile / Responsive

**3 / 5 — FUNCTIONAL, NOT FULLY VALIDATED**

Primary target: ~390px.
Desktop still requires deeper archive-specific layout work later.

---

## Accessibility

**2–3 / 5 — PARTIAL**

Existing:
- focus-visible
- reduced-motion consideration
- semantic buttons

Needs systematic screen-reader / modal / extreme-state audit.

---

## Technical Architecture

**3 / 5 — FUNCTIONAL**

Current:
- static HTML / CSS / JS
- JSON DB
- data-bundle fallback
- localStorage
- GitHub Pages

New QA:
- CLI trust audit
- GitHub Actions trust audit

Framework migration is not justified now.

---

## Deployment / CI

**4 / 5 — HEALTHY FOR CURRENT SCALE**

- GitHub Pages
- favicon
- automated Quiz Trust Audit

Workflow:
`.github/workflows/quiz-trust-audit.yml`

---

## Documentation

**3 / 5 — IMPROVED**

Canonical current state:
`docs/current-state.md`

Key current docs:
- `docs/product-principles.md`
- `docs/development-plan.md`
- `docs/quiz-quality-plan.md`
- `docs/quiz-trust-gate-report.md`
- `docs/ui-shuhari-research.md`

Older UI Next docs remain historical / research context and are not the canonical project state.

---

# 5. DONE

- Product principles
- 34-season DB structure
- DB-driven quiz engine
- core screens
- localStorage summary
- favicon
- History Spine research prototype
- Q0 generator inventory
- Q1 fail-closed eligibility
- rejection taxonomy
- runtime QA diagnostics
- CLI audit
- GitHub Actions audit

---

# 6. FUNCTIONAL BUT NOT VALIDATED

- historical DB completeness
- manager tenure completeness
- learning metrics
- mobile extreme states
- desktop layout
- accessibility
- Memory Hook quality
- distractor quality

---

# 7. INTENTIONALLY DISABLED / BLOCKED

## PLAYER_NUMBER
Blocked by missing relationship-level source metadata.

## PLAYER_POSITION
Blocked by missing relationship-level source metadata.

## PLAYER_OVERLAP
Blocked by missing exact overlap / roster completeness evidence.

## KIT_DETAIL
Blocked by missing uniform-level source metadata.

These are not bugs in Trust Gate.

---

# 8. NOW — Q1.5 Provenance Recovery Vertical Slice

Do not bulk-update all records.

## Player relation anchors

Candidate seasons:
- 1998
- 2006
- 2017
- 2023

Verify from primary / official sources:
- player-season membership
- shirt number
- registered position

Then attach relation-level source metadata.

## Kit source anchors

Verify representative sponsor eras sufficient to create at least four distinct verified sponsor values.

Do not stamp sources without checking the actual claim.

## Pass Gate

Re-run CI and achieve:

- PLAYER_NUMBER eligible > 0
- PLAYER_POSITION eligible > 0
- KIT_DETAIL eligible > 0
- invariantFailures = 0

PLAYER_OVERLAP remains disabled.

---

# 9. NEXT — Q2 Distractor Quality

After provenance slice passes:

- MANAGER: adjacent-era candidates
- RANK: close valid ranks
- SUMMARY: nearby / semantically similar seasons
- PLAYER: same-season plausible roster candidates
- KIT: nearby verified sponsor eras

Goal:

`clearly false` + `plausible enough to require recall`

---

# 10. THEN

Q3 Difficulty
→ Q4 Coverage / Balance
→ Q5 Significance / Memory Hook
→ Q6 Learning History
→ Answered Spine Production Integration
→ History Browser Research

---

# 11. LATER

- PLAYER_OVERLAP with real registration interval
- Manager Detail
- Kit Archive full experience
- adaptive learning
- account / cloud sync
- large framework migration

---

# 12. Current Bottleneck

**Provenance Recovery without weakening Trust Gate.**

The next work is not to make rejected data pass.

It is to add enough evidence that it deserves to pass.

---

# 13. Next Review Gate

Question:

> PLAYER / KITをsource-backedに復活させても、Trust GateのFail-Closed原則を維持できているか。

If yes:
Q2 Distractor Qualityへ進む。

If no:
data/source modelを先に修正する。
