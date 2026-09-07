# Current State — URAWA HISTORY

Last updated: 2026-09-07

> このファイルを「現在地の正本」とする。
> Product Principlesは `product-principles.md`、長期構想は `development-plan.md`、研究履歴は各research / experiment documentを参照する。

---

# 1. Executive Summary

URAWA HISTORYは、初期MVP構築段階を終え、1992〜2025の34シーズンを扱うDB駆動prototypeとして成立している。

現在は「機能を増やす段階」ではなく、**何をproduction-qualityとして信用できるかを固める段階**。

現状の最大の特徴は次の通り。

- Product Principlesは比較的成熟している。
- 全34シーズンを扱うseasons DBと、選手・監督・ユニフォーム等の関連データが存在する。
- DBから7系統の4択Quizを動的生成できる。
- TODAY / QUIZ / HISTORY / SEASON / PLAYER / YOUが動作する。
- History Spine / Answered Spine Revealという独自UI研究がprototype段階まで進んでいる。
- 一方で、Quiz Eligibility・問題の一意性・distractor品質・source granularity・途中加入/監督交代などの品質保証は未成熟。
- Learning Modelは「正答率の表示」までは動くが、「理解度」と呼べるほどの意味設計には達していない。
- README / data README等に初期計画が残り、documentation driftが発生している。

**Current Bottleneck:**

> Quiz Trust Layer — 「生成できる問題」から「出題して安全で、学習価値のある問題」へ進むためのEligibility / Correctness / Source / Distractor QA。

History Spineのproduction統合は、このGateを通した後に再開する。

---

# 2. Product Core

Core loop:

`Question → Answer → Memory Hook → History → Next Question`

Goal:

- 年を見て、その年の人物・監督・ユニフォーム・出来事を連想できる。
- 人物や出来事を見て、その時代へ戻れる。
- Quizを点の知識で終わらせず、クラブ史の流れへ接続する。

Visual grammar:

- White = reading surface / archive
- Black = structure / typography
- Red = current / meaningful Urawa action
- Diamond = node / direction / relation

独自性は装飾ではなくinteraction grammarから作る。

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

# 4. Product Health — 15 Dimensions

## 01 Product Definition

**Maturity: 4 / 5 — VALIDATED FOR DEVELOPMENT**

Exists:
- Product Principles
- Core Loop
- Mobile First
- Year as primary visual language
- Quiz / History integration philosophy
- Urawa visual grammar
- Reduction principle

Gap:
- 実利用データによる原則の再検証は未実施。

Next gate:
- Quiz / History実装がPrinciplesと衝突したときにPrinciplesを盲目的に守らず再評価する。

---

## 02 Historical Data Coverage

**Maturity: 3 / 5 — FUNCTIONAL**

Exists:
- seasons: 1992〜2025
- players
- player_seasons
- managers
- manager_tenures
- uniforms
- sources
- data-bundle

Important distinction:
- 「34シーズンが存在する」は成立。
- 「全シーズンの全選手・全出来事が完全」は成立していない。
- Player dataはHistory / Quizに必要な主要人物中心の選択的coverageとして扱う。

Risk:
- “全34年網羅”という表現が「全データ完全収録」と誤解される可能性。

---

## 03 Data Quality / Sources

**Maturity: 2 / 5 — PROTOTYPE / RISK**

Good:
- seasonにverification_status / source_idsがある。
- players / manager tenures等にsource_idsが存在する領域もある。
- Schema specificationが存在。

Gap:
- sources.jsonは現状、J.LEAGUE Data Site / 浦和公式サイトという大きなsource単位が中心。
- record / claim単位のURL・根拠追跡が弱い。
- player_seasonsの実データにはschema例にあるsource_idsが付いていないレコードがある。
- uniformsにもsource / verification metadataが不足しているレコードがある。
- season summary / memory hook / key eventの各claimが同じsourceで十分に裏付けられているか未監査。
- 2000 seasonにはsummaryとkey_eventsで最終節対戦相手表現が揺れており、実データ内矛盾が見つかっている。

Next gate:
- Quizに使うfactについて、少なくともfact-level eligibilityを判定可能にする。

---

## 04 Quiz Engine

**Maturity: 3 / 5 — FUNCTIONAL**

Current generators:
1. PLAYER_NUMBER
2. PLAYER_POSITION
3. PLAYER_OVERLAP
4. MANAGER_SEASON
5. SEASON_RANK
6. SEASON_SUMMARY
7. KIT_DETAIL

Good:
- DB-driven generation
- Era filtering
- 4 unique visible option string check
- generator fallback
- answer validation

Gap / Risk:
- Quiz generation時にverification_statusを明示的にEligibilityへ使っていない。
- 文字列4択がuniqueでも、意味上の正解一意性は保証されない。
- PLAYER_NUMBERで同一seasonに同じ番号を複数選手が着けたケースのunique answer検査がない。
- PLAYER_OVERLAPはseason_id一致を「同時在籍」とみなし、途中加入 / 退団の実期間を見ない。
- MANAGER_SEASONはseasonに複数指揮者が存在する場合でも `find` した1件を正解として扱う構造。
- SEASON_SUMMARY distractorは全seasonからrandomで、難易度制御が弱い。
- KIT distractor候補がhard-coded。

Next gate:
- Quiz Quality Q0 / Q1を通す。

---

## 05 Quiz Content Quality

**Maturity: 2 / 5 — PROTOTYPE**

Current strengths:
- 年代・選手・監督・順位・Kitなど複数カテゴリがある。
- Memory Hookを返せる。

Not yet validated:
- answer uniqueness
- historical significance
- distractor plausibility
- difficulty
- era balance
- category balance
- repeated knowledge clusters
- trivial / expert-only ratio
- Memory Hook learning value

Important:

「生成可能問題数」と「学習価値のある問題数」を今後分離する。

---

## 06 Learning Model

**Maturity: 2 / 5 — PROTOTYPE**

Exists:
- total
- correct
- recentWrong counter
- category accuracy
- era accuracy
- localStorage

Critical issue:
- `recentWrong` は「最近間違えた問題一覧」ではない。
- 誤答で+1、別の問題を正解すると-1するcounterであり、どの問題を間違えたか保持していない。
- Era / Category masteryはraw accuracyのみで、sample size / exposure / recencyを考慮しない。

Therefore:
- 現在の表示は「Accuracy Summary」としては機能。
- 「Mastery / 理解度」という名称には意味上の過剰主張がある。

Next gate:
- Quiz qualityの後にLearning semanticsを再設計。

---

## 07 Quiz UX

**Maturity: 3 / 5 — FUNCTIONAL**

Production:
- unanswered
- answered
- correct / wrong state
- Memory Hook
- Next
- Explore Season

Research:
- History Spine always visible
- History Spine Reveal after answer

Current research decision:
- Reveal after answerをproduction candidateとする。

Blocked by:
- Quiz Quality Gate。

---

## 08 History Exploration

**Maturity: 3 / 5 — FUNCTIONAL + EXPERIMENTAL**

Functional:
- 34-year Timeline
- Season Detail
- Player Detail
- Season → Quiz

Incomplete / future:
- dedicated Manager Detail
- full Kit Archive
- richer cross-year relation navigation

Experimental:
- History Spine
- Answered Spine Reveal

Do not classify experimental grammar as production complete.

---

## 09 Visual / Urawa Identity

**Maturity: 2.5 / 5 — SYSTEM DEFINED, PARTIALLY IMPLEMENTED**

Defined:
- Archive × Editorial × Football × Urawa
- White / Black / Red / Diamond semantic grammar
- Year as anchor
- Diamond as node
- favicon derived from History Spine grammar

Gap:
- production UI still contains prototype-era styling / inline styles / card patterns.
- History Spine grammar is not production-integrated.

---

## 10 Mobile / Responsive

**Maturity: 3 / 5 — FUNCTIONAL**

Exists:
- Mobile-first base
- ~390px-oriented presentation
- responsive CSS

Gap:
- systematic 320 / 390 / tablet / desktop regression audit not complete.
- desktop still needs its own archive-reading value, not simply a centered mobile column.

---

## 11 Accessibility

**Maturity: 2 / 5 — PARTIAL**

Exists:
- buttons for major interactions
- some aria-live
- reduced-motion consideration in experiments
- focus rules in experiments

Gap:
- production app全体のkeyboard audit
- modal focus management
- screen-reader structure
- touch target audit
- color-independent state audit
- dynamic content focus behavior

---

## 12 Technical Architecture

**Maturity: 3 / 5 — FUNCTIONAL**

Exists:
- static HTML / CSS / JS
- JSON DB
- bundled DB fallback
- localStorage
- GitHub Pages-friendly architecture

Good:
- frameworkなしで現在の規模を扱えている。

Debt:
- app.jsにData / Quiz Engine / rendering / event wiringが集中。
- inline styleが多数。
- data JSONとdata-bundleの同期管理が必要。

Decision:
- 現時点でframework migrationは不要。

---

## 13 Performance / Robustness

**Maturity: 2 / 5 — PARTIAL**

Exists:
- data-bundle fallback
- JSON fetch fallback
- Quiz generation failure screen

Gap:
- corrupted localStorage recovery semantics
- data consistency failure handling
- broken image handling
- large learning history
- regression checks
- actual loading / performance budget

---

## 14 Deployment

**Maturity: 3 / 5 — FUNCTIONAL**

Exists:
- GitHub Pages structure
- root redirect to prototype
- favicon asset / links

Note:
- この監査ターンでは外部fetch制約によりLIVEの最新描画状態を自動確認できなかった。
- Repository上のdeployment構造をCurrent Truthとして扱う。

Next gate:
- production change時にLIVE smoke testを行う。

---

## 15 Documentation / Project Management

**Maturity: 2 / 5 — DRIFT**

Good:
- Product / UI / schema / experiments / plansの文書量は豊富。

Problem:
- README.mdが初期MVP段階のNextを示したまま。
- data/README.mdが「将来JSONを置く」「3シーズンから」となっている。
- UI Next Planが複数世代に分かれ、current nextを探す必要がある。

Decision:
- `docs/current-state.md` を現在地の唯一の正本とする。
- 過去plan / experimentは履歴として残す。

---

# 5. DONE

「土台として存在する」という意味でDONE：

- Product Principles
- GitHub Pages-oriented static architecture
- 1992〜2025 seasons representation
- core historical JSON entities
- DB-driven Quiz generation
- 7 quiz generator families
- TODAY / QUIZ / HISTORY / SEASON / PLAYER / YOU
- basic answer feedback
- Memory Hook concept
- localStorage accuracy tracking
- Urawa Visual Grammar definition
- favicon
- History Spine research prototype

DONEは「品質監査済み」を意味しない。

---

# 6. Functional but Unvalidated

- generated quiz correctness across all data
- distractor quality
- manager-change seasons
- player overlap semantics
- shirt number uniqueness
- source eligibility enforcement
- Memory Hook factual / learning quality
- Era / Category mastery semantics
- long-copy / extreme viewport behavior
- accessibility across production screens

---

# 7. Experiments

## History Spine

Status: PROTOTYPE

Hypothesis:
- time axisをnavigation backboneにする。

## Answered Spine Reveal

Status: PROTOTYPE / preferred candidate

Hypothesis:
- answer前はQuestion focusを守り、answer後だけHistory contextを開く。

Decision:
- 保持する。
- Quiz Quality Gate通過後にproduction integrationへ戻る。

---

# 8. Quiz Quality Roadmap

## Q0 — Inventory

Purpose:
現在どのgeneratorがどのdataを使い、何を保証していないかを一覧化。

Deliverable:
- generator matrix
- eligible / ineligible conditions
- known ambiguity cases

## Q1 — Correctness & Eligibility — NOW

Purpose:
複数正解・unverified fact・semantic ambiguityを出題前に除外。

Priority checks:
- verification status
- source existence
- shirt-number duplicate
- manager multiple-tenure
- actual player overlap definition
- duplicate semantic answer
- missing / contradictory data

Pass:
既知のambiguity classがQuiz Eligibilityで排除または明示的に処理される。

## Q2 — Distractor Quality

- same-domain
- near-era
- plausible but clearly false
- no hard-coded pool where data-derived pool is possible

## Q3 — Difficulty

Easy / Medium / Hardのルールを定義。

難易度を「マニアックな事実」だけで作らない。

## Q4 — Coverage & Balance

- era
- category
- question type
- entity
- repeated knowledge

の偏りを測る。

## Q5 — Significance / Memory Hook

- triviaを減らす。
- answer explanationではなく前後の歴史へつなぐ。

## Q6 — Repetition / Learning History

question identity / knowledge identityを保存し、recent wrong / unseen / retryを意味のある形へ。

## Q7 — Learning Selection

弱い年代・unseen・recent wrongを利用。

## Q8 — Adaptive Learning — LATER

Q0〜Q7の必要性と品質が確認されるまで実装しない。

---

# 9. Quiz Metrics to Build

Future metrics:

- total eligible questions
- eligible by era
- eligible by category
- eligible by generator
- source-verified rate
- ambiguity rejected count
- duplicate knowledge clusters
- distractor QA failures
- Memory Hook coverage
- repeat rate
- unseen coverage
- wrong-answer recovery

現時点で取れない値を推測で埋めない。

---

# 10. Dependencies

```text
Data / Source audit
        ↓
Quiz Eligibility / Correctness
        ↓
Distractor Quality
        ↓
Difficulty / Coverage
        ↓
Memory Hook Quality
        ↓
Learning History semantics
        ↓
Learning-based Selection
```

UI branch:

```text
Quiz Quality Gate
        ↓
Answered State production integration
        ↓
History Spine production test
        ↓
Node behavior decision
        ↓
History Browser redesign
```

Visual polish should not outrun Quiz Trust.

---

# 11. NOW / NEXT / THEN / LATER

## NOW

### Quiz Quality Round 0–1

- generator inventory
- eligibility definition
- ambiguity audit
- source / verification enforcement design
- known data contradiction list

Do not redesign History now.

## NEXT

### Quiz Quality Round 2–4

- distractors
- difficulty
- coverage / balance

### Data QA fixes required by Quiz

Only fix data that blocks trusted questions first.

## THEN

### Answered UX Production Integration

- Result
- Correct Answer
- Memory Hook
- contextual 5-year History Spine
- Next / Explore

Use real DB, not experiment fixtures.

### Learning semantics

- recent wrong identity
- question / knowledge history
- sample-aware mastery naming / model

## LATER

- History Browser redesign around proven History Spine grammar
- Manager Detail
- Kit Archive expansion
- richer relationship exploration
- advanced adaptive learning
- cloud sync / accounts only if need emerges

---

# 12. What Not To Build Yet

- full History redesign
- 34-year Spine inside Quiz
- graph navigation
- complex adaptive algorithm
- XP / coins / ranking
- framework migration
- cloud account system
- excessive motion
- UI polish that hides unresolved quiz ambiguity

---

# 13. First Next Batch

**Quiz Quality Gate — Q0/Q1**

One batch only.

Output required:

1. All generator matrix
2. Eligibility rule per generator
3. Known ambiguity scenarios
4. Data requirements
5. Rejection reason taxonomy
6. At least boundary cases for 1990s / 2000s / 2010s / 2020s
7. Pass / fail result

No new UI.

---

# 14. Pass Criteria for Next Gate

History Spine production work can resume only when:

- unverified / unsupported facts can be excluded
- every generated question has one semantic correct answer by construction or validation
- manager-change seasons are not falsely represented as single-manager facts
- player overlap has an explicit definition and data support
- duplicate shirt-number cases cannot produce ambiguous questions
- distractor pool does not contain equivalent answers
- invalid data fails closed rather than guessing
- rejection reasons are observable for QA

---

# 15. Next Review Gate

After Q0/Q1, answer exactly this:

> **Can we trust every question that reaches the UI, even before improving how interesting it is?**

YES → move to Distractor / Difficulty / Coverage.

NO → continue eligibility / data fixes.

Only after Quiz Trust becomes YES should the Answered Spine Reveal return to production work.
