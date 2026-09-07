# UI Next Plan — Refinement Roadmap

Updated: 2026-09-07

## Current position

URAWA HISTORYは、すでに以下を備えた実データ入りprototypeまで到達している。

- 1992〜2025の全34シーズン
- DBからのQuiz生成
- TODAY
- QUIZ / answer state
- HISTORY Timeline
- Season Detail
- Player Detail
- YOU / Learning History
- localStorage
- GitHub Pages公開

したがって、旧計画の「3シーズンだけでstress testする」「2006 Vertical Sliceを作る」は現在地としては完了 / superseded。

次の主戦場は機能追加ではなく、**Experience Refinement**。

---

# Design Direction

`Archive × Editorial × Football × Urawa Identity`

ブランド表現は以下を基本文法とする。

- White：読む面
- Black：構造・文字・骨格
- Red：浦和を示す現在地・重要アクション
- Diamond：History node / current state / direction

目標は「赤いファンサイト」ではなく、色やロゴを減らしても浦和らしいUI。

---

# DONE

## Foundation
- Product Principles
- Mobile First方針
- Quiz → Memory Hook → History loop
- 全34シーズンDB
- Quiz Engine MVP
- Timeline
- Season Detail
- Player Detail
- Learning History MVP
- basic responsive CSS
- semantic correct / wrong colors

## Superseded
- 3シーズンだけを使った初期Stress Test
- 2006のみのVertical Slice
- Historical DB expansionをUI改善より先に行う計画

---

# NOW — UI Refinement

UI改善は一度に行わず、以下のStageを順番に通す。

各Stage共通：

`Design → Prototype → Audit → Fix / Reject → Pass`

次Stageへ進む前にPass Criteriaを満たす。

---

# Stage 0 — Baseline Freeze

## Purpose
現在の主要画面・state・導線を固定し、比較基準を作る。

## Target
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

## Tasks
- 各画面のJobを1文で定義
- Primary Action / Secondary Actionを分類
- 320 / 390 / desktopの現状を記録
- inline style / duplicated UI patternを棚卸し
- 現在の導線図を作る

## Pass
各画面を3秒見れば目的と第一操作を説明できる比較基準が揃う。

---

# Stage 1 — Experience Architecture

## Purpose
画面装飾より先に、ユーザーが迷わない体験構造へ整える。

## Primary journey

`TODAY → QUIZ → ANSWER → MEMORY HOOK → NEXT / HISTORY`

Secondary journey

`HISTORY → SEASON → PLAYER / MANAGER / KIT → RELATED QUIZ`

## Audit
- CTA競合
- Bottom Navigation競合
- 戻る操作過多
- Context loss
- モード選択の先回り
- 情報過多

## Rejection
見た目だけ変わり、操作数・理解速度が変わらない案。

## Pass
主要journeyに行き止まりがなく、次の行動が常に1〜2候補以内。

---

# Stage 2 — Quiz Experience

## Purpose
1問を解くリズムを、このアプリの最も完成度が高い体験にする。

## Sequence
Question
→ Choice
→ Feedback
→ Correct Answer
→ Memory Hook
→ Next / Explore

## Tasks
- 問題文と選択肢の距離
- 4択のscan speed
- tap target
- answered stateの再配置
- 正誤演出よりMemory Hookを強くする
- NextとExploreの優先順位
- Bottom Navとの競合回避
- keyboard state
- reduced motion

## Brand integration
- 問題回答前はRedを正誤予告に使わない
- RedはHistoryへの入口や現在地へ
- Diamondは選択状態の補助に限定して検証

## Pass
390pxでQuestion → Answer → Memory Hookまで文脈が途切れない。

---

# Stage 3 — History Exploration

## Purpose
HistoryをDB一覧ではなく「年代を辿る体験」にする。

## Targets
- Timeline
- Season Detail
- Player Detail
- Manager Detail future slot
- Kit Archive future slot

## Key idea
**Year is the anchor. Diamond is the node.**

## Tasks
- 全34年を俯瞰したときの情報密度
- 年代の強弱
- タイトル獲得年などの節点
- Season間の移動
- PlayerからSeasonへ戻るcontext
- Related Quizへの自然な入口

## Diamond experiments
- neutral diamond = timeline node
- red diamond = selected/current node
- milestone diamond = 特別な歴史節点

全34年を赤いdiamondにしない。

## Pass
「情報を検索する」より「次の年も見たくなる」導線になっている。

---

# Stage 4 — Visual Language

## Purpose
個別CSS調整をDesign Systemへ昇格させる。

## Define
- Typography scale
- Font roles
- Spacing scale
- Content width
- Grid
- Red / White / Black tokens
- Semantic colors
- Border hierarchy
- Radius hierarchy
- Button hierarchy
- Interaction states
- Diamond rules
- Motion principles

## Required test
1. Grayscaleで成立するか
2. Redを戻すと浦和らしい方向性が増すか
3. Diamondを戻すと固有のリズムが増すか

Red / Diamondがないと成立しない案は禁止。

## Pass
主要画面のCSS判断をtoken / ruleで説明できる。

---

# Stage 5 — Responsive Experience

## Purpose
Mobile Firstを維持しつつ、Desktopを「中央にスマホを置いただけ」から脱却する。

## Widths
- 320px extreme
- 390px primary
- tablet
- desktop

## Desktop experiments
- Timeline + detail relation
- 2-column limited layout
- large year typography
- archive browsing

Desktop専用機能を増やさず、同じ情報構造の見せ方を変える。

## Pass
390pxが最良の主体験であり、desktopにもdesktopを使う理由がある。

---

# Stage 6 — Accessibility & Stress

## Test states
- 長い選手名
- 外国籍選手名
- 同姓同名
- 長期在籍
- 複数回在籍
- 途中加入 / 退団
- 監督交代
- 長いsummary
- title複数
- 画像なし
- data missing
- answer history 0
- answer history 1000+
- accuracy 0%
- accuracy 100%
- keyboard only
- focus-visible
- reduced motion
- low speed
- JS error

## Pass
極端値でも情報階層・操作・正答の一意性が壊れない。

---

# Stage 7 — Reduction Round

## Purpose
完成案から不要なUIを削る。

全要素を以下へ分類：

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

## Pass
要素数を減らしても意味が失われず、むしろ理解が速くなっている。

---

# Stage 8 — Final Polish

## Targets
- 1px alignment
- typography rhythm
- vertical spacing
- optical balance
- copy length
- focus state
- tap feedback
- micro motion
- empty state
- error state

## Pass
「prototypeだから許される違和感」が主要画面から消えている。

---

# Visual Rejection Conditions

以下は却下する。

- 赤背景だらけ
- Diamond patternだらけ
- 何でもcard
- 何でも角丸
- shadowで階層を作る
- generic SaaS
- generic quiz app
- sports news dashboard
- 公式サイトの模倣
- 正誤とブランド色の混同
- Yearより装飾が目立つ
- HistoryよりUI chromeが目立つ

---

# First Implementation Batch

Stage 0監査後、最初の実装batchはQUIZに限定する。

対象：
1. QUIZ unanswered
2. QUIZ answered
3. Memory Hook
4. Next / Explore
5. Bottom Navigationとの関係

理由：
- Product loopの中心
- 使用頻度が最も高い
- Visual Systemを小さい範囲で検証できる
- 成功したruleをTODAY / HISTORYへ展開できる

この段階ではHistory全面改修を同時に行わない。

---

# NEXT

Stage 0 — Baseline Freeze
↓
Stage 1 — Experience Architecture
↓
Stage 2 — Quiz Experience prototype

---

# LATER

- Manager Detail
- Kit Archiveの本格化
- adaptive quiz
- cloud sync
- account
- advanced learning model

UIが安定する前に追加しない。

---

# Next Review Gate

最初のレビューではコード量ではなく以下だけを見る。

- 1問を解く速度
- 回答後に何を読むか
- 次の行動が迷わないか
- Redが意味を持っているか
- Diamondが意味を持っているか
- 390pxで成立しているか

この6点が通ってからHistoryへ進む。
