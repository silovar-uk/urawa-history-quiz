# UI Shuhari Research

Updated: 2026-09-07

## Question

URAWA HISTORYにしか存在しないUIは、どう作るべきか。

結論から独自性を足さず、以下で考える。

`守 — standardを理解する → 破 — 前提を疑う → 離 — product固有の文法を作る`

目的は「珍しい画面」ではない。

**浦和レッズの歴史を、年を起点に連想・移動・記憶するために自然なUI**を作る。

---

# 1. 守 — What must remain conventional

## Baseline principles

成熟したUI原則から、URAWA HISTORYでも守るもの。

### Visibility / Feedback
操作後に状態と結果が分かる。

### Consistency
同じ意味の操作・色・形を同じように扱う。

### Recognition over recall
操作方法を覚えさせない。見れば次の行動が分かる。

### Minimal interface chrome
UIそのものより歴史コンテンツを主役にする。

### Clear hierarchy
Question / Answer / Memory Hook / Historyの順序を視覚的に説明できる。

### Accessible targets
WCAG 2.2 AAのTarget Size Minimumを下限とし、主要操作は余裕を持ったtouch targetを維持する。

### Keyboard / focus / reduced motion
独自UIを理由に標準入力を壊さない。

## Sources

- Nielsen Norman Group — 10 Usability Heuristics
  https://www.nngroup.com/articles/ten-usability-heuristics/
- Apple Human Interface Guidelines
  https://developer.apple.com/design/human-interface-guidelines/
- WCAG 2.2
  https://www.w3.org/TR/WCAG22/
- WCAG 2.5.8 Target Size Minimum
  https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

## Baseline UI

普通に作るなら：

`TODAY → QUIZ → ANSWER → EXPLANATION → NEXT`

Historyは別タブに置き、TimelineからSeason Detailへ入る。

これは分かりやすく、安全。

**独自案はこのBaselineより使いにくければ採用しない。**

---

# 2. Reference Principles — copyではなく原理

## MARCHIVUM Timeline

Reference:
https://rulesrulesrules.studio/project/marchivum-timeline

Extracted principle:

**Timeline can be the connective structure, not just a destination page.**

歴史展示の各章を3D timelineが接続し、イベントを時間軸上でcontextualizeしている。

URAWA HISTORYへの示唆：
「History画面へ行ってから年表を見る」以外に、時間軸そのものを常時navigationとして扱える。

---

## National Archives of Australia — Interactive Wall

Reference:
https://www.collider.com.au/studio/naa-interactive-wall

Extracted principle:

**Archive objects should become launch points into branching stories.**

資料を検索結果として終わらせず、ユーザーがnodeから別の物語へ潜る。

URAWA HISTORYへの示唆：
選手・監督・ユニフォームはdetail pageの終点ではなく、別年代への入口にできる。

---

## Netherlands Film Academy Archive

Reference:
https://rulesrulesrules.studio/project/netherlands-film-academy

Extracted principle:

**One archive can have multiple spatial entry points.**

Category / keyword / geography / chronologyが同じarchiveへの異なる入口になっている。

URAWA HISTORYへの示唆：
Yearを主軸に保ちながら、Player / Kit / Managerを別の入口として共存させられる。

---

## One Year Life Strata

Reference:
https://rulesrulesrules.studio/project/one-year-life-strata

Extracted principle:

**Time does not need to be rendered only as a list.**

Chronological dataをlayer / strataとして扱う。

URAWA HISTORYへの示唆：
34シーズンを「34行のリスト」とせず、密度・節点・積層として視覚化できる可能性がある。

---

## Keir Foundation Archive

Reference:
https://www.collider.com.au/studio/the-keir-foundation-website

Extracted principle:

**Show the archive and the relationships at the same time.**

Timelineで全体を見せながら、人物タグから関連projectへ移動できる。

URAWA HISTORYへの示唆：
俯瞰とdetailを別モードにしすぎない。

---

# 3. Urawa identity research

Official references:

- Club profile / club-name origin
  https://www.urawa-reds.co.jp/club/
- 2025 uniform
  https://e-shop.urawa-reds.co.jp/special/2025reds_uniform
- 2026/27 uniform
  https://e-shop.urawa-reds.co.jp/special/2026_2027reds_uniform

クラブ公式説明では「レッドダイヤモンズ」に、ダイヤモンドの輝き・強さ・固い結束力という意味が込められている。

またRedはclub colorで、近年のuniformでも赤 / 白 / 黒のtraditional combinationが継承されている。

## UIへの翻訳

これをそのままgraphicへコピーしない。

- White = reading surface / archive
- Black = structure / text / spine
- Red = current / meaningful action / Urawa
- Diamond = node / connection / direction

Diamondを「柄」ではなく、**関係が接続する点**として扱う方がproduct purposeとclub identityの両方に意味がある。

---

# 4. 破 — Assumptions challenged

## Assumption A
QuizとHistoryは別画面。

### Why challenge it
Quizで知った瞬間がHistoryへの関心が最大になるため。

### Experiment
Quiz contextの中に小さなtime navigationを残す。

---

## Assumption B
Yearはmetadata。

### Why challenge it
URAWA HISTORYではYearが主記憶anchorだから。

### Experiment
Year自体をnavigation controlへ昇格させる。

---

## Assumption C
TimelineはHistory tabで見る。

### Why challenge it
時間軸を別画面へ隔離すると、Questionと歴史の前後関係が切れるため。

### Experiment
Timelineを縮約した「Spine」をQuizにも持ち込む。

---

## Assumption D
Diamondはbrand decoration。

### Why challenge it
装飾として使うと量を増やすほど意味が弱くなるため。

### Experiment
selected/current/history nodeというsemantic roleだけ与える。

---

# 5. 離 — Native concepts considered

## A. History Spine — SELECTED

Yearを常時navigation backboneにする。

Mobile：horizontal spine
Desktop：vertical spine

Current yearのみRed Diamond。

Strength:
- Year is the primary visual languageをinteractionまで拡張
- QuizとHistoryの分断を弱める
- Diamondにsemantic meaningを持たせられる
- mobile / desktopでorientationだけ変え、意味を保持できる

Risk:
- 常時表示するとQuestionを邪魔する可能性
- 34年を全部出すとnavigation densityが高すぎる

Therefore:
最初は5年前後のlocal contextだけでexperimentする。

---

## B. Season Strata

各年を地層のlayerとして積み重ねる。

Strength:
時間の蓄積感が強い。

Reject for now:
Quiz操作との接続が弱く、visualizationが主役になりやすい。

---

## C. Relation Mesh

Player / Manager / Kit / Seasonをnode graph化。

Strength:
関係発見には強い。

Reject for now:
Mobile操作とaccessibility costが高い。

---

## D. Archive Drawer

Seasonを資料箱 / drawerのように開く。

Strength:
Archive感が分かりやすい。

Reject for now:
Metaphorが強く、長期利用でinteraction costになりうる。

---

## E. Memory Echo

正解後に前後年代の関連事実を1行ずつecho表示。

Strength:
記憶の接続に直接効く。

Keep as future complement:
History Spineと組み合わせる余地あり。

---

# 6. Selected Grammar

## History Spine

`Year = place`

`Line = time`

`Diamond = node`

`Red Diamond = current place`

`Movement along the spine = historical navigation`

この関係を一貫させる。

Diamondを追加する前に、line / year / hierarchyだけで意味が通じること。

---

# 7. Prototype implemented

Experiment:

`prototype/experiments/history-spine.html`

GitHub Pages:

https://silovar-uk.github.io/urawa-history-quiz/prototype/experiments/history-spine.html

Test scope:
- 2003〜2007のlocal timeline
- quiz state
- answer state
- memory hook
- current-year diamond
- horizontal mobile spine
- vertical desktop spine
- keyboard arrow focus movement
- reduced-motion consideration

これは本番UIへの採用ではなく、interaction hypothesisの検証用。

---

# 8. Favicon decision

Asset:

`assets/favicon.svg`

Concept name:

**Diamond Timeline Node**

Structure:
- Black field
- Red diamond
- White core
- Black vertical spine

Meaning:
URAWA HISTORYのVisual Grammarを16pxへ縮約したもの。

公式emblemを縮小・模倣せず、History Spineのinteraction grammarからsymbolを作る。

設定先：
- `/index.html`
- `/prototype/index.html`
- experiment page

---

# 9. Originality test

## Grayscale
History Spineの構造自体は残る。

PASS.

## Diamond removed
Year + lineでnavigationは理解できる。

PASS.

## Urawa name hidden
Timeline-as-navigationという特徴は残る。

PASS, but brand specificity becomes weaker as expected.

## Operation rather than screenshot
Mobile horizontal / desktop verticalというinteraction continuityが残る。

PASS candidate.

## No explanation
Year buttonsとして操作可能。

PASS candidate; production integrationで再検証。

## Three-year longevity
Specific visual trendへの依存は比較的小さい。

PASS candidate.

---

# 10. Critical audit

## Good
- noveltyがshapeだけではない
- Yearというproduct固有概念から生まれている
- Diamondの意味が明確
- standard button semanticsを保てる
- 34年全体を常時見せなくてもlocal contextとして成立する

## Risks
- Quiz回答前に常時見せると認知負荷増加
- 画面上部で高さを取りすぎる可能性
- 年を移動した時に「問題変更」と「History移動」の意味が混ざる可能性
- 本番ではlocalStorage / current quiz stateとの関係を設計する必要あり

## Decision

**本番へ即全面採用しない。**

次はAnswered Stateに限定し、History Spineをcontextual navigationとして試す。

---

# 11. Rejected ideas

- 全画面red background
- 34年分のdiamond常時表示
- diamond-shaped buttons everywhere
- hoverで歴史が開くUI
- drag only timeline
- animated 3D timeline
- graph visualizationを主navigationにする

理由：
mobile / accessibility / long-term usability / content priorityのいずれかを損なう。

---

# 12. Next Research Question

## QUESTION

**History SpineはQuizの常設navigationにするべきか、それともAnswered Stateだけに出すべきか。**

## WHY

独自性を残しつつ、回答前のQuestion集中を壊さない境界を決めるため。

## EXPERIMENT

同じQuizを2variantで比較する。

A — Spine always visible

B — Spine appears after answer

比較：
- first visual focus
- answer speed
- scroll amount
- Memory Hook read order
- Explore History rate
- perceived clutter

## PASS

Questionの主役性を維持し、回答後のHistory遷移が自然に増える。

## FAIL

Spineが回答前のattentionを奪う、または単なるdecorative timelineになる。

---

# 13. Next implementation gate

次のproduction batchでは、History全体を変更しない。

対象：

`QUIZ answered → Memory Hook → contextual History Spine → Season exploration`

最大変更概念：
1. Answered state hierarchy
2. History Spine
3. Explore action

ここがPassして初めてTimeline / Season Detail側へgrammarを展開する。
