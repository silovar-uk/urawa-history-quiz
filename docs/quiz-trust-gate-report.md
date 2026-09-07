# Quiz Trust Gate Report — Q0 / Q1

Updated: 2026-09-07

Status: **Q0 / Q1 IMPLEMENTED**

Canonical state: `docs/current-state.md`

---

# 1. What changed

Quiz Engineの前段にFail-ClosedなTrust Gateを追加した。

新規：
- `prototype/quiz-trust.js`
- `scripts/quiz-trust-audit.mjs`
- `.github/workflows/quiz-trust-audit.yml`

更新：
- `prototype/index.html`
- `prototype/app.js`

Production rule:

> 証明できない問題は出さない。

安全性を満たさないgeneratorは推測で成立させず、Reject理由を記録して別generator / 別seasonへ進む。

Runtime diagnostics:

`window.URAWA_QUIZ_QA`

で、Reject件数・理由・直近Rejectを確認できる。

---

# 2. Implemented rejection taxonomy

- `UNVERIFIED_FACT`
- `MISSING_SOURCE`
- `MISSING_RELATION_SOURCE`
- `MISSING_REQUIRED_FIELD`
- `AMBIGUOUS_CORRECT_ANSWER`
- `DUPLICATE_OPTION`
- `SEMANTIC_DUPLICATE`
- `MULTIPLE_MANAGER_SEASON`
- `OVERLAP_UNVERIFIED`
- `SHIRT_NUMBER_NOT_UNIQUE`
- `INVALID_RANK_RANGE`
- `ANSWER_LEAK_IN_STEM`
- `INSUFFICIENT_DISTRACTORS`
- `NO_ELIGIBLE_TARGET`

---

# 3. CI Audit Result

GitHub Actions run:

https://github.com/silovar-uk/urawa-history-quiz/actions/runs/34115720536

Result: **SUCCESS**

Important:

SUCCESS means「Trust invariantを破る候補がscreenへ通る構造上の失敗を検出しなかった」という意味。

全generatorが十分なcoverageを持つという意味ではない。

## Generator coverage

### PLAYER_NUMBER

- Eligible seasons: **0 / 34**
- Rejected: 34
- Main reason: `MISSING_RELATION_SOURCE`

Interpretation:

`player_seasons` にrelationship-levelの `source_ids` が存在しないため、背番号factを安全に出題できると証明できない。

### PLAYER_POSITION

- Eligible seasons: **0 / 34**
- Rejected: 34
- Main reason: `MISSING_RELATION_SOURCE`

Interpretation:

PLAYER_NUMBERと同じ。Player masterにsourceがあっても、`player × season × position` のsourceではない。

### PLAYER_OVERLAP

- Eligible seasons: **0 / 34**
- Rejected: 34
- Reason: `OVERLAP_UNVERIFIED`

Interpretation:

現在のdataにはregistration interval / roster completenessがなく、「同じseason_id」を実際の同時在籍と断定できない。

このgeneratorは意図的にdisabled。

### MANAGER_SEASON

- Eligible seasons: **26 / 34**
- Rejected: 8
- Reason: `MULTIPLE_MANAGER_SEASON`

Interpretation:

notesから途中交代・解任・引継ぎ等が示唆されるseasonを現在形式の問題から除外した。

### SEASON_RANK

- Eligible seasons: **32 / 34**
- Rejected: 2
- Reason: `INVALID_RANK_RANGE`

Changes:
- actual `league_name` をquestionへ使用
- `total_teams` の範囲内からのみdistractor生成
- impossible rankを禁止

### SEASON_SUMMARY

- Eligible seasons: **33 / 34**
- Rejected: 1
- Reason: `ANSWER_LEAK_IN_STEM`

summary内に正答yearが直接含まれる場合は出題しない。

### KIT_DETAIL

- Eligible seasons: **0 / 34**
- Rejected: 34
- Reason: `MISSING_SOURCE`

Interpretation:

`uniforms` にuniform-levelの `source_ids` がないため、胸スポンサーfactをsource-backedとして扱わない。

---

# 4. Invariant result

`invariantFailures: []`

今回のauditでは、Gateを通過したcandidateについて：

- option count = 4
- normalized option unique
- correct appears exactly once

のbase invariant failureは検出されなかった。

ただしこれはsemantic historical truthの最終保証ではない。

Source granularityとdata completenessを今後も改善する。

---

# 5. UI wording decision

従来：

`FACT VERIFIED`

現在：

`SOURCE CHECKED`

理由：

source referenceが存在することと、長いsummary内の全claimがclaim-by-claimで完全検証済みであることを区別するため。

過剰な保証表現を避ける。

---

# 6. What Q0 / Q1 solved

DONE:

- generatorごとのmachine-checkable eligibility
- fail closed
- reject reason code
- season confirmation gate
- source existence gate
- option normalization / uniqueness
- manager ambiguity exclusion
- valid rank range
- year-answer leak detection
- PLAYER_OVERLAP intentional disable
- runtime rejection diagnostics
- repeatable CLI audit
- GitHub Actions QA

---

# 7. What Q0 / Q1 intentionally did NOT solve

NOT DONE:

- player relation provenance
- uniform provenance
- exact registration overlap
- manager change date normalization
- sophisticated distractor quality
- difficulty
- coverage balancing
- question repetition
- learning history redesign
- History Spine production integration

---

# 8. Current interpretation

Trust Gate導入により、現在の実質的なsafe generatorは：

- `MANAGER_SEASON`
- `SEASON_RANK`
- `SEASON_SUMMARY`

の3系統が中心。

これは機能退化ではなく、以前から存在していた不確実性を可視化した状態。

ただしこのままではQuiz varietyが不足するため、次にProvenance Recoveryが必要。

---

# 9. NEXT — Q1.5 Provenance Recovery Vertical Slice

## Goal

PLAYER / KITを安全に復活させるため、relationship-level source modelを小規模に実証する。

一括で全recordにsourceを貼らない。

## Player anchors

4年代を代表するseasonを候補にする：

- 1998
- 2006
- 2017
- 2023

各seasonについて、公式・一次情報から：

- player × season
- shirt number
- registered position

を確認し、対象 `player_seasons` へsourceを紐付ける。

必要ならrelation-level `verification_status` もschemaへ追加する。

## Kit anchors

胸スポンサーのverified distractor poolを成立させるため、最低4種類のverified sponsor valueを用意する。

代表候補：

- MITSUBISHI MOTORS era
- Vodafone era
- DHL era
- POLUS era

各HOME kit recordへsourceを紐付ける。

## Do not do

- 全recordへ同じsource_idを機械的に付与
- source pageを確認せずconfirmed化
- PLAYER_OVERLAPを同時に復活

## Pass

Audit再実行で：

- `PLAYER_NUMBER` eligible > 0
- `PLAYER_POSITION` eligible > 0
- `KIT_DETAIL` eligible > 0
- invariantFailures = 0

となる。

---

# 10. THEN — Q2 Distractor Quality

Provenance Vertical Sliceが通ったあと、distractorを改善する。

## MANAGER

random global managerではなく、前後年代・近いtenureから優先。

## SEASON_RANK

valid rankの中でもcorrect近傍を中心にし、easyすぎる差を抑える。

## SEASON_SUMMARY

random distant yearではなく：

- nearby year
- similar title profile
- similar rank / era

を候補化。

## PLAYER_NUMBER

same season / same position / plausible roster candidates。

## KIT

nearby sponsor eraを中心にする。

---

# 11. Next review question

> Trust Gateを弱めずに、PLAYER / KITをsource-backedな形でどこまで復活できるか。

History Spine production integrationは、このdata / Quiz Quality trackが安定するまで保留する。
