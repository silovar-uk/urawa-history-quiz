# Development Plan

Updated: 2026-09-07

## 0. Goal

浦和レッズの歴史を「読む」だけではなく、クイズを入口に繰り返し思い出しながら学べるGitHub Pagesアプリを作る。

基本ループ：

`Question → Answer → Memory Hook → History → Next Question`

単発の雑学クイズではなく、歴史DBを中心に、選手・監督・シーズン・ユニフォームを相互に行き来しながら覚えられる学習ツールを目指す。

現在は「MVPを作る段階」から、**全34シーズン入りprototypeのExperience Refinement段階**へ移行した。

---

# 1. Product Principles

詳細は `docs/product-principles.md` を正とする。

開発判断の中心：

1. Facts first, questions second
2. Mobile is the product
3. Quiz and History are one experience
4. Year is the primary visual language
5. Archive × Editorial × Football
6. Urawa identity is a system, not decoration
7. No fake gamification
8. One question, one screen
9. History before interface chrome
10. Reduce before adding

---

# 2. Urawa Visual Identity

UIのブランド文法は以下。

- White：読む面、資料性、余白
- Black：構造、文字、強さ、骨格
- Red：浦和を示す現在地、重要アクション、アクセント
- Diamond：History node、current state、direction

## Brand rule

浦和らしさを「赤を増やすこと」と定義しない。

Red / Diamondは、意味のある状態に限定して使う。

Diamondの主な用途：
- Timeline node
- Active navigation marker
- Selected state
- Section marker
- Historyへのdirection cue

禁止：
- 赤背景だらけ
- 全面diamond pattern
- 全ボタンdiamond化
- 正誤stateとbrand redの混同
- 公式サイト / 公式エンブレムの模倣

詳細：`docs/ui-05-visual-system.md`

---

# 3. Overall Architecture

```text
Historical Data
      ↓
Data Validation
      ↓
Quiz Eligibility
      ↓
Quiz Engine
      ↓
Learning History
      ↓
Experience / UI
```

Technical baseline：
- GitHub Pages
- HTML / CSS / JavaScript
- JSON historical DB
- localStorage learning history

大規模frameworkは必要性が明確になるまで導入しない。

---

# 4. Current State

## DONE / implemented foundation

- Repository / GitHub Pages
- Product Principles
- 1992〜2025 全34シーズン
- seasons / players / player_seasons / managers / manager_tenures / uniforms / sources
- DB-driven Quiz Engine
- PLAYER系Quiz
- MANAGER系Quiz
- SEASON系Quiz
- KIT系Quiz
- TODAY
- QUIZ unanswered / answered
- Memory Hook
- HISTORY Timeline
- Season Detail
- Player Detail
- YOU / Learning History
- Era mastery
- Category mastery
- localStorage
- basic mobile responsive

## SUPERSEDED

以下は初期計画として役割を終えた。

- 2006のみを使うVertical Slice
- 3シーズンだけでのUI検証
- UI改善前にHistorical DB Expansionを進める工程
- 「まずprototypeをGitHub Pagesへ公開する」というNext Action

過去の計画は履歴として有効だが、現在の実行順には使わない。

---

# 5. Current Development Priority

現在の最優先は機能追加ではない。

**Experience Refinement → Visual System → Stress Audit**

を先に行う。

詳細ロードマップ：`docs/ui-next-plan.md`

---

# 6. UI Refinement Roadmap

すべてのStageを以下のサイクルで進める。

`Design → Prototype → Audit → Fix / Reject → Pass`

Pass Criteria未達のまま次Stageへ進まない。

---

## Stage 0 — Baseline Freeze

### Purpose
現状を固定し、改善前後を比較できる状態にする。

### Target
- TODAY
- QUIZ / unanswered
- QUIZ / correct
- QUIZ / incorrect
- HISTORY
- SEASON DETAIL
- PLAYER DETAIL
- YOU
- Bottom Navigation
- Error / Empty / Loading

### Tasks
- 各画面のJob定義
- Primary / Secondary Action分類
- 現在のjourney map
- 320 / 390 / tablet / desktop確認
- inline style / duplicated pattern棚卸し
- current screenshots / state inventory

### Pass
全主要画面について「目的・第一視線・第一操作」が明文化されている。

---

## Stage 1 — Experience Architecture

### Purpose
見た目より先に、迷い・行き止まり・CTA競合をなくす。

### Primary journey

```text
TODAY
→ QUIZ
→ ANSWER
→ MEMORY HOOK
→ NEXT / HISTORY
```

### History journey

```text
HISTORY
→ SEASON
→ PLAYER / MANAGER / KIT
→ RELATED QUIZ
```

### Audit
- CTA competition
- Bottom Navigation competition
- context loss
- back navigation dependency
- unnecessary modal
- information overload

### Rejection
見た目だけ変更し、理解速度・操作数・導線が変わらない案。

### Pass
次の行動が主要画面で1〜2候補以内に絞られている。

---

## Stage 2 — Quiz Experience

### Purpose
最頻出体験である「1問を解く」流れを最初に完成させる。

### Sequence

`Question → Choice → Feedback → Correct Answer → Memory Hook → Next / Explore`

### Tasks
- question hierarchy
- option scan speed
- tap target
- answered state
- correct / wrong semantics
- Memory Hook hierarchy
- Next / Explore priority
- Bottom Navigation relation
- keyboard
- reduced motion

### Urawa identity
- 回答前にRedで正解を予告しない
- RedはHistoryへの入口・現在地へ使う
- Diamondはselected state補助として小さく検証

### Pass
390pxでQuestionからMemory Hookまで文脈が途切れず、次アクションに迷わない。

---

## Stage 3 — History Exploration

### Purpose
HistoryをDB一覧ではなく「年代を辿る体験」にする。

### Core rule

**Year is the anchor. Diamond is the node.**

### Tasks
- 34年Timelineの情報密度
- selected year
- historical milestone
- title year hierarchy
- Season間移動
- Player → Season context
- Related Quiz

### Diamond experiment
- neutral diamond：通常node
- red diamond：current / selected
- milestone treatment：重要節点

全34年を赤いdiamondにしない。

### Pass
Timelineを検索リストではなく、次の年代へ進みたくなる歴史導線として使える。

---

## Stage 4 — Visual Language

### Purpose
個別CSSを一貫したUI grammarへ整理する。

### Define
- Typography scale
- Year role
- Font roles
- Spacing scale
- Content width
- Grid
- White / Black / Red tokens
- Semantic colors
- Border hierarchy
- Radius hierarchy
- Button hierarchy
- Interaction states
- Diamond rules
- Motion principles

### Visual test
1. grayscaleで情報階層が成立
2. Red追加で浦和らしい方向性が増す
3. Diamond追加で固有のリズムが増す

### Pass
主要CSS判断をtoken / ruleで説明できる。

---

## Stage 5 — Responsive Experience

### Purpose
Mobile Firstを維持し、Desktopにも固有の価値を持たせる。

### Widths
- 320px extreme
- 390px primary
- tablet
- desktop

### Desktop candidates
- Timeline + Detail relation
- limited 2-column
- oversized Year
- archive browsing

Desktop専用機能を増やさず、同じ情報構造を画面幅に合わせて最適化する。

### Pass
390pxが主体験として最も完成され、Desktopも「中央にスマホを置いただけ」ではない。

---

## Stage 6 — Accessibility & Stress

### Extreme states
- 長い選手名
- 外国籍選手名
- 同姓同名
- 長期在籍
- 複数回在籍
- 途中加入 / 退団
- 監督交代
- 長いsummary
- title複数
- missing data
- missing image
- answer history 0
- answer history 1000+
- accuracy 0%
- accuracy 100%
- keyboard only
- focus-visible
- reduced motion
- low speed
- JS error

### Pass
極端値でもレイアウト、操作、情報階層、正答の一意性が壊れない。

---

## Stage 7 — Reduction Round

### Purpose
完成案から不要なUIを削る。

全要素を分類：
- KEEP
- REMOVE
- MERGE
- DE-EMPHASIZE

対象：
- Card
- Divider
- Badge
- Label
- Button
- Copy
- Icon
- Diamond
- Navigation
- Decoration

### Pass
要素を減らした方が理解が速くなっている。

---

## Stage 8 — Final Polish

### Tasks
- optical alignment
- typography rhythm
- vertical spacing
- copy length
- focus state
- tap feedback
- micro motion
- empty state
- error state

### Pass
主要画面から「prototypeだから許される違和感」が消えている。

---

# 7. First Implementation Batch

UI実装は全画面同時に行わない。

最初のbatch：

1. QUIZ unanswered
2. QUIZ answered
3. Memory Hook
4. Next / Explore
5. Bottom Navigation relation

理由：
- Product loopの中心
- 使用頻度が高い
- 小さい範囲でVisual Systemを試せる
- 成功したruleをTODAY / HISTORYへ横展開できる

このbatchがPassするまでHistory全面改修へ進まない。

---

# 8. Data Quality — Ongoing Track

UI Refinementと並行して、データ品質は保守する。

Required statuses：
- confirmed
- needs_review
- disputed

Checks：
- duplicate player
- duplicate relationship
- impossible tenure
- missing source
- broken image
- quiz ambiguity
- duplicate options
- incorrect overlap
- inconsistent position

`needs_review` / `disputed` は原則Quiz Eligibilityから除外する。

UI改善を理由にfact qualityを下げない。

---

# 9. Quiz Engine Quality — Ongoing Track

Requirements：
- 正解は1つ
- option重複禁止
- 意味的重複禁止
- data不足時は出題しない
- verified data優先
- distractorは完全randomではなく意味的に近い候補

将来的にAdaptive Learningを検討しても、まずQuiz qualityを優先する。

---

# 10. Testing Strategy

## Functional
- question generation
- one correct answer
- validation
- next
- History navigation
- localStorage

## UX
- 320
- 390
- desktop
- long names
- empty state
- large history

## Accessibility
- keyboard
- focus
- color-independent state
- touch target
- reduced motion

## Visual
- grayscale hierarchy
- Red meaning
- Diamond meaning
- card count
- typography hierarchy
- spacing rhythm

---

# 11. Definition of Current UI Pass

次の完成判定は「機能があるか」ではなく以下。

- TODAYから1タップ以内でQuizへ入れる
- 1問1画面が390pxで成立
- 回答後にMemory Hookが読まれる構造
- Next / Historyの優先順位が明確
- Historyが一覧ではなく年代探索として機能
- White / Black / Redの役割が明確
- Diamondに意味がある
- Brand Redとsemantic stateが混同しない
- DesktopにDesktopらしい情報配置がある
- major extreme stateで壊れない
- generic quiz appに見えない

---

# 12. Do Not Build Yet

UI Refinement完了前は以下を後回しにする。

- login
- cloud sync
- SNS ranking
- XP / coin
- loot box演出
- advanced AI quiz
- complex adaptive algorithm
- large SPA migration
- admin dashboard
- excessive animation
- dark mode（必要性が確認されるまで）

---

# 13. NOW / NEXT / LATER

## NOW
Stage 0 — Baseline Freeze

## NEXT
Stage 1 — Experience Architecture
Stage 2 — Quiz Experience

## THEN
Stage 3 — History Exploration
Stage 4 — Visual Language
Stage 5 — Responsive

## LATER
Stage 6 — Stress
Stage 7 — Reduction
Stage 8 — Final Polish
Manager Detail / Kit Archive等の機能拡張

---

# 14. Next Planning Round

次の計画では、**Stage 0 → Stage 2を実装可能な粒度へ落とす。**

具体化対象：

### A. Screen State Inventory
- 現状画面一覧
- state一覧
- UI element一覧
- duplicated pattern
- inline style inventory

### B. Quiz Experience Spec
- unanswered wireframe
- answered wireframe
- hierarchy
- CTA order
- Memory Hook
- Bottom Navigation behavior

### C. Urawa Visual Prototype
3つ程度のvisual intensityを比較する。

1. Minimal Urawa
   - White / Black中心
   - Red極少
   - Diamond極少

2. Balanced Urawa
   - Redをcurrent / directionへ
   - DiamondをTimeline / markerへ

3. Strong Urawa
   - より強いRed / geometric language

最終的には最も派手な案ではなく、**歴史が主役のまま浦和らしさが残る案**を採用する。

### D. First Implementation Batch
QUIZ画面だけ実装。
History全面改修はその後。

---

# 15. Immediate Next Action

**Stage 0 — Baseline Freezeを実行し、QUIZ unanswered / answeredの現状構造を監査する。**

この監査結果を使って、最初のUI実装batchを決める。

---

# 16. Success Condition

最終的な成功状態は問題数の多さではない。

ユーザーが繰り返し使うことで、

- 年を見ると、その年の選手・監督・ユニフォームを連想できる
- 選手を見ると、その選手がいた時代を連想できる
- ユニフォームを見ると、そのシーズンの出来事を思い出せる
- 各年代が孤立した知識ではなく、一本の浦和レッズ史としてつながる

状態を目指す。

そしてUIそのものも、ロゴを大きく掲げなくても、

**White / Black / Red / Diamondの使い方と、Yearを中心とした編集構造からURAWA HISTORYだと感じられること。**
