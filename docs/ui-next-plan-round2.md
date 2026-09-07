# UI Next Plan — Round 2

Updated: 2026-09-07

## Current decision

守破離Researchの第1実験では、History Spineを「常時表示するUI」より、**Quiz回答後にRevealするUI**を本番統合候補とする。

理由：
- 回答前のQuestion focusを守れる
- Answer → Memory Hook → Historyという認知順序に意味がある
- Diamondを装飾ではなくcurrent nodeとして使える
- Mobileで必要になるまでnavigationの高さを増やさない

Control：
`prototype/experiments/history-spine.html`

Candidate：
`prototype/experiments/history-spine-reveal.html`

Research note：
`docs/ui-history-spine-reveal-experiment.md`

---

# NEXT — Production Integration Batch

## Goal

実験用固定データではなく、現在のQuiz Engine / 全34シーズンDBからContextual History Spineを生成する。

ただしHistory画面そのものはまだ全面変更しない。

---

## Change budget

主要変更は最大3つ。

1. Answered State hierarchy
2. Contextual History Spine
3. Explore Season behavior

その他のUI改善はDesign Debtへ送る。

---

## Step 1 — Local context generator

現在のQuiz yearを中心に、最大5シーズンを返すpure functionを設計する。

例：

2006の場合：
`2004 / 2005 / 2006 / 2007 / 2008`

1992の場合：
`1992 / 1993 / 1994 / 1995 / 1996`

2025の場合：
`2021 / 2022 / 2023 / 2024 / 2025`

Requirements：
- DBの実在seasonだけ使う
- sort orderを固定
- currentを必ず含む
- 5件未満でも壊れない

---

## Step 2 — Answered State integration

回答前：

`Question → Choice`

回答後：

`Result → Correct Answer → Memory Hook → History Spine → Actions`

Spineは回答前DOMへ見えている必要はない。

回答後だけ生成 / revealする。

---

## Step 3 — Semantic state

- Red Diamond = Quizのcurrent year
- Neutral Diamond = other years
- Black Diamond = selected preview year

currentとpreviewを混同しない。

Colorだけで区別しない。

Recommended semantics：
- current：`aria-current="true"`
- preview selection：`aria-pressed="true"` または同等の明示状態

---

## Step 4 — Preview first

最初のproduction版ではAdjacent Year tapで即Season Detailへ遷移させない。

Year tap：
`Memory Echo / one-line context preview`

Explicit CTA：
`この年を見る`

とする。

誤タップによるQuiz context lossを避ける。

---

## Step 5 — Memory Echo data

固定コピーを大量に新規作成しない。

優先候補：
1. season.memory_hook
2. season.summaryの短縮
3. title / rankなど既存factから生成可能な短文

不十分な場合はEchoを出さない。

UIのために未検証factを増やさない。

---

# Audit

## Question focus
回答前の見た目が現行より複雑になっていないか。

## Reading order
Result → Answer → Memory → Spine の順に自然か。

## Action hierarchy
Next QuestionとHistory explorationが競合していないか。

## Brand
Red / Diamondを増やしただけになっていないか。

## Accessibility
keyboard / focus-visible / reduced-motion / color-independent state。

## Extreme years
1992 / 2025。

## Extreme copy
長いMemory Hook / 長いyear context。

---

# Pass criteria

- 390pxで回答前のQuestion focusが維持
- Spineは回答後だけ出現
- current yearは常に一意
- preview selectionとcurrent yearが別state
- 1992 / 2025でも5年contextが破綻しない
- Memory HookがSpineより先に読まれる
- Next QuestionがPrimary action
- ExploreはSecondary action
- History contextを開かなくてもQuizを継続できる
- keyboardでyear preview可能
- reduced-motionで情報欠落なし
- Red / Diamondがsemantic

---

# Reject / rollback conditions

以下なら実験へ戻す。

- Answered Stateが長すぎてNext Questionが遠くなる
- Spineを見ない人にもscroll costが発生しすぎる
- Adjacent year previewの意味が説明なしで伝わらない
- Memory HookとMemory Echoが内容重複する
- current / selectedの違いが分かりにくい
- Mobileで横scrollが主要操作を邪魔する

---

# After this passes

次の研究対象はHistory全体ではなく、まずnode behavior。

## NEXT RESEARCH QUESTION

**History Spineのyear nodeは、Previewを挟むべきか、Season Detailへ直接遷移すべきか。**

### A — Preview first
Year → Echo → explicit Explore

### B — Direct
Year → Season Detail

### Evaluation
- 誤操作
- context loss
- steps
- clarity
- repeated-use speed

この問いが決まってから、Timeline / Season DetailへHistory Spine grammarを拡張する。

---

# Not yet

- History画面全面改修
- 34年すべてをQuizに表示
- Relation graph
- Timeline animation
- Diamond component大量展開
- Desktop専用複雑navigation

まずAnswered Stateの1バッチを通す。
