# History Spine Reveal Experiment

Updated: 2026-09-07

## Research question

**History SpineはQuizの常設navigationにするべきか、それともAnswered Stateだけに出すべきか。**

---

# Variants

## A — Always visible / Control

Prototype:

`prototype/experiments/history-spine.html`

History SpineをQuestionより前から表示する。

意図：
- Yearを常時navigation backboneにする
- QuizとHistoryを最初から同じ空間に置く

Risk：
- QuestionよりTimelineが先に視界へ入りやすい
- 回答前に別年代へ意識が飛ぶ
- Mobileの縦方向スペースを消費する

---

## B — Answered-state Reveal / Candidate

Prototype:

`prototype/experiments/history-spine-reveal.html`

回答前：

`Year → Question → Choice`

回答後：

`Result → Correct Answer → Memory Hook → History Spine → Next / Explore`

History Spineは回答後に初めて現れる。

---

# Why B is the current preferred direction

## 1. Question focus is protected

独自navigationをQuestionより前に置かないため、回答前のPrimary Interactionが4択のまま維持される。

## 2. Reveal has semantic timing

Spineが出現するタイミング自体に意味がある。

回答する前：
「この問題を解く」

回答した後：
「この答えは歴史のどこにあるか」

となり、UI追加ではなく認知フェーズの切替として成立する。

## 3. Memory Hookとの役割がつながる

Memory Hookが単なる解説文ではなく、Spineへ進むための橋になる。

`Answer → Memory → Time context`

という順序が作れる。

## 4. Diamond gains a stronger meaning

Red Diamondを常に見せるのではなく、History contextが開いた瞬間にcurrent nodeとして現すことで、brand decorationよりsemantic markerとして理解しやすい。

## 5. Mobile cost is delayed until it becomes useful

回答前の画面高を増やさず、History contextが必要になった時だけ横方向navigationを追加できる。

---

# Current verdict

**B — Answered-state Reveal を provisional winner とする。**

これは実ユーザーテストによる確定ではなく、現時点のInteraction / hierarchy監査による採用候補。

Aは削除しない。
Controlとして残し、本番統合後も「常時表示の方が良かった可能性」を比較できるようにする。

---

# What changed in Experiment B

- 回答前からHistory Spineを完全に除外
- Answered StateでのみReveal
- Memory Hookの後にHistory Spineを配置
- 2004〜2008のlocal contextのみ表示
- Current Year = Red Diamond
- Adjacent Year = neutral Diamond
- 年を選ぶと1行のMemory Echoが切り替わる
- Next QuestionをPrimary
- Explore SeasonをSecondary
- `prefers-reduced-motion` 時はsmooth scrollを抑制
- standard button / focus behaviorを維持

---

# Critical audit

## PASS candidate

- GrayscaleでもQuestion hierarchyは成立する
- DiamondなしでもYear + lineでHistory contextは理解可能
- Redを正誤stateに使用していない
- Spineが回答前のattentionを奪わない
- Noveltyが形だけでなく「出現タイミング」にある
- 390pxでの利用を前提に横scrollへ閉じ込められる

## Remaining risks

- Answered Stateが長くなりすぎる可能性
- Memory HookとSpineの両方を読むと情報量が多い問題がある
- Adjacent Yearを押す意味が、Season Detail移動なのかMemory Echo閲覧なのか本番ではまだ曖昧
- Next QuestionとExplore Historyの優先度は実データで再検証が必要
- 全34シーズンの端（1992 / 2025）でlocal context生成ルールが必要
- Quiz categoryによってYear contextの有用性が異なる可能性

---

# Rejected for production right now

- Spineを回答前から常時表示
- 34年全部をQuiz画面に表示
- 選択した隣接年へ即座にQuizを切り替える
- Diamondを全optionや全CTAへ展開
- Reveal時の大きなanimation
- Timeline専用modal

---

# Production integration gate

次の本番batchでは、独自UIをさらに増やさない。

変更概念は最大3つ：

1. Answered State hierarchy
2. Contextual History Spine
3. Explore Season action

## Production data rule

`activeQuiz.seasonId` / `activeQuiz.year` を中心にlocal contextを生成する。

初期案：

- current year
- previous 2 seasons
- next 2 seasons

端の年代では存在する5シーズンへshiftする。

全34年は表示しない。

## First production version

Adjacent Yearのbuttonは、最初から複雑なnavigationにしない。

推奨：
- Current Year = `aria-current`
- Adjacent Year tap = short Memory Echo / context preview
- explicit `この年を見る` でSeason Detailへ移動

「nodeを押した瞬間に画面遷移」は初期版では避ける。

---

# Pass criteria for production

- 回答前のQuestion hierarchyが現行より悪化しない
- Spineは回答後だけ表示
- Memory Hookより先にSpineを置かない
- current yearが色以外でも識別できる
- Next Questionが最短操作として維持される
- Explore Seasonが明確にSecondary
- local contextが1992 / 2025でも壊れない
- long Memory HookでもCTAへ到達可能
- keyboardで全操作可能
- reduced motionで意味が失われない
- DiamondがHistory node以外へ増殖しない

---

# Next research question

## QUESTION

**History Spineの隣接年は「見るためのpreview」に留めるべきか、それとも直接その年へ移動できるnavigationにするべきか。**

## WHY

Spineを単なる図ではなくnavigationにするなら、nodeを押した時の意味を一意にする必要がある。

一方、即遷移するとAnswer contextを失いやすい。

## EXPERIMENT

Production integration前後で2案を比較する。

A — Preview first
- year tap → Memory Echo
- explicit CTA → Season Detail

B — Direct navigation
- year tap → Season Detail

## PASS

説明なしでもnodeの意味が理解でき、Answer → Historyのcontextが切れない。

## FAIL

誤タップでQuiz contextを失う、またはpreviewが余計な1stepになる。

---

# Recommended next action

**まずB案（Answered-state Reveal）を実データ駆動の本番QUIZへ最小統合する。**

ただし隣接YearはPreview firstで開始する。

本番統合後に、History画面そのものを変更するかを判断する。
