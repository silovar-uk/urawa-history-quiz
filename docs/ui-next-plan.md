# UI Next Plan — Shu-Ha-Ri Refinement Roadmap

Updated: 2026-09-07

## Current position

URAWA HISTORYは、全34シーズンの実データ、DB-driven Quiz、Timeline、Season / Player Detail、Learning Historyまで実装済み。

現在地はMVP開発ではなく、**Experience Refinement + Native UI Research**。

今回、守破離によるUI研究Round 01を完了した。

研究記録：
`docs/ui-shuhari-research.md`

実験：
`prototype/experiments/history-spine.html`

---

# Product direction

`Archive × Editorial × Football × Urawa Identity`

Visual Grammar：

- White = reading surface / archive
- Black = structure / typography / spine
- Red = current / meaningful action / Urawa
- Diamond = node / connection / direction

独自性は色・shapeだけで作らない。

**他では必要ないが、URAWA HISTORYでは自然なinteraction**を優先する。

---

# DONE

## Foundation
- 1992〜2025 全34シーズンDB
- Quiz Engine
- TODAY
- QUIZ answered / unanswered
- Memory Hook
- HISTORY Timeline
- Season Detail
- Player Detail
- YOU / Learning History
- responsive baseline
- Product Principles
- Visual System

## Shu-Ha-Ri Research Round 01

### 守
Standard UX / accessibility / feedback / hierarchyをbaselineとして確認。

### 破
以下の前提をchallengeした。

- QuizとHistoryは完全に別画面
- Yearはmetadata
- TimelineはHistory tab専用
- Diamondはbrand decoration

### 離
Native UI候補を比較し、**History Spine**を第一候補として選択。

History Spine：

`Year = place`

`Line = time`

`Diamond = node`

`Red Diamond = current place`

### Prototype

`prototype/experiments/history-spine.html`

- mobile = horizontal spine
- desktop = vertical spine
- 2003〜2007 local context
- keyboard arrow focus
- reduced motion配慮

### Favicon

`assets/favicon.svg`

Diamond Timeline Nodeを採用。

`index.html` / `prototype/index.html` に設定済み。

---

# IMPORTANT DECISION

History Spineを本番UIへ全面採用したとはまだ判断しない。

今回分かったのは、

**「Timelineを別画面だけに置く必要はない」可能性が高い**

というところまで。

次は「どこまでQuizへ持ち込むか」を検証する。

---

# NOW — Research Round 02

## Research Question

**History SpineはQuizの常設navigationにするべきか、Answered Stateだけに出すべきか。**

## Why

回答前はQuestionへの集中が最優先。

一方、回答直後は歴史への興味が最も高い。

History Spineの独自性を残しながら、Questionの主役性を壊さない境界を決める。

---

# Experiment 02 — Always vs Reveal

同一Quiz Experienceで2variantを比較する。

## Variant A — Always Visible

Question表示時からHistory Spineを見せる。

### Hypothesis
Year contextを常に理解できる。

### Risk
QuestionよりTimelineが先に目に入る。

---

## Variant B — Reveal After Answer

回答前：Yearは通常metadataのみ。

回答後：Memory Hookとともにlocal History Spineを展開。

### Hypothesis
Questionへの集中を維持しながら、回答直後だけHistory探索へ自然に誘導できる。

### Risk
UI変化が大きすぎると「新しい機能が出た」感が強くなる。

---

# Measurement

定量分析基盤はまだ不要。

まずheuristic / manual testで以下を見る。

1. First visual focus
2. Answerまでの視線移動
3. Scroll amount
4. Memory Hook read order
5. Next / Explore competition
6. History Spineの発見性
7. perceived clutter
8. keyboard sequence
9. 320 / 390pxでの高さ

---

# Decision rule

## PASS

- Questionが第一視線のまま
- 回答後にMemory Hook → Historyの順序が自然
- Spineを説明しなくてもYear navigationとして理解できる
- 390pxで過剰なscrollを生まない
- Diamondがselected/current nodeとして機能
- Redなしでもnavigation structureを理解可能

## FAIL

- 回答前にSpineへ注意が奪われる
- 単なるdecorative timelineになる
- Next Questionとの競合が増える
- Bottom Navigationとの二重navigation感が強い
- 34年へ拡張した時の密度問題を解消できない

---

# Recommendation before Experiment 02

第一候補は **Variant B — Reveal After Answer**。

理由：

- One question, one screenを守りやすい
- Questionの認知負荷を増やさない
- Memory Hookの直後がHistory explorationへ入る自然なmoment
- History Spineを「常設chrome」ではなく「知識がつながる瞬間」として使える

ただし実装前にA / Bを同じcontentで比較し、Bを自動採用しない。

---

# Production Batch 01 — after Research Pass

Research Round 02がPassした場合のみ、実アプリへ小さく統合する。

対象：

`QUIZ answered → Memory Hook → History Spine → Explore Season`

Change Budget：最大3概念。

1. Answered-state hierarchy
2. Contextual History Spine
3. Explore action

対象外：

- TODAY全面変更
- HISTORY全面変更
- Season Detail全面変更
- Bottom Nav redesign
- Full 34-year spine
- Relation graph
- New gamification

---

# Production integration idea

最初の本番版では34年全部を出さない。

Current yearを中心にlocal rangeを出す。

例：

`2004 — 2005 — ◆2006 — 2007 — 2008`

選択したyear：Red Diamond。

前後year：neutral node。

Milestone表現はこの段階では追加しない。

---

# Stage 3 — History Exploration

Production Batch 01がPassした後に着手。

## Question

History画面にも同じSpine Grammarを展開すると、Timelineはより自然になるか。

## Candidates

- local → full timeline transition
- selected year persistence
- Season Detailとのcontext維持
- Player → Seasonへの戻り
- title year / milestone density
- desktop side spine

## Do not assume

Quizで成功したinteractionをそのままHistoryへコピーしない。

Historyではbrowse量が違うため再検証する。

---

# Stage 4 — Visual Language

History Spine検証後にDesign Systemへ昇格。

Define：

- Year typography
- Spine line
- neutral node
- current node
- Diamond size
- Red use
- Typography scale
- Spacing scale
- Button hierarchy
- Motion

Required test：

1. grayscale
2. black / white
3. red
4. diamond

の順。

Red / Diamondがないと成立しないUIは禁止。

---

# Stage 5 — Responsive Experience

Primary：390px。

Stress：320px。

Desktopでは同じSpine Grammarをvertical orientationへ変換する可能性を検証。

Desktopをmobile拡大版にしないが、別productにもしてはいけない。

---

# Stage 6 — Accessibility & Stress

Minimum：

- keyboard
- focus-visible
- color-independent state
- reduced motion
- WCAG 2.2 target sizing

Stress：

- long question
- long player name
- long memory hook
- 1000+ answer history
- error
- missing data
- 320px
- 390px
- desktop

---

# Stage 7 — Reduction

History Spine採用後も、以下を必ず削る。

- unnecessary diamonds
- decorative red
- labels
- lines
- badges
- card containers
- duplicated navigation

削って意味が同じなら削除。

---

# Rejected / Parked

現時点では実装しない。

- Season Strataをprimary navigationにする
- Player relation graph
- Archive Drawer metaphor
- 3D timeline
- drag-only timeline
- 全34年diamond常時表示
- red-dominant layout

Memory EchoはHistory Spine補助として保留。

---

# NEXT ACTION

**Experiment 02：同じQuiz Answered Stateで「Spine常設」と「回答後Reveal」を比較する。**

実装前に比較。

比較後、勝った1案だけをproduction Quizへ統合する。

---

# Next Review Gate

次回レビューで見るのは6点だけ。

1. Questionへ第一視線が向くか
2. Memory Hookが読まれるか
3. History Spineが説明なしで理解できるか
4. NextとExploreが競合しないか
5. 390pxで成立するか
6. 独自性がshapeではなくinteractionとして残るか

この6点が通るまでHistory本体へ進まない。
