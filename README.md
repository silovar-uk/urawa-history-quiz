# URAWA HISTORY QUIZ

浦和レッズの歴史を、クイズを入口に学ぶための静的Webアプリ。

Live:
https://silovar-uk.github.io/urawa-history-quiz/

## Core loop

`Question → Answer → Memory Hook → History → Next Question`

単発の4択クイズではなく、年・選手・監督・ユニフォーム・出来事を相互に結び、浦和レッズの歴史を「点」ではなく「流れ」として覚えることを目指します。

## Current state

現在は初期MVP構築を終え、1992〜2025の34シーズンを扱うDB駆動prototypeとして動作しています。

主な実装済み基盤：

- 1992〜2025 seasons data
- players / player_seasons
- managers / manager_tenures
- uniforms / sources
- DB-driven Quiz Engine
- TODAY / QUIZ / HISTORY / SEASON / PLAYER / YOU
- Memory Hook
- Era / Category accuracy
- localStorage learning history
- GitHub Pages
- favicon

UI研究としてHistory Spine / Answered Spine Revealをprototype中です。

ただし現在の最優先はUI追加ではなく、**Quiz Quality / Trust**です。

問題生成が動くことと、すべての出題が一意・検証済み・学習価値を持つことは分けて扱います。

## Current source of truth

現在地：

`docs/current-state.md`

長期思想：

`docs/product-principles.md`

長期ロードマップ：

`docs/development-plan.md`

UI研究：

`docs/ui-shuhari-research.md`

## Current priority

### NOW

Quiz Quality Round 0–1

- generator inventory
- Quiz Eligibility
- answer uniqueness
- source / verification enforcement
- ambiguity audit

### NEXT

- distractor quality
- difficulty
- era / category coverage
- Memory Hook quality

### THEN

Quiz Quality Gate通過後、Answered StateへHistory Spine Revealを実DBで統合します。

## Product principles

- QuizはHistoryへの入口
- Mobile is the product
- Year is the primary visual language
- Facts first, questions second
- QuizとHistoryを分断しない
- White / Black / Red / Diamondを意味のあるUI文法として使う
- Redを正誤stateと混同しない
- fake gamificationを使わない
- Reduce before adding

## Structure

- `docs/` — product / current state / plans / audits / UI research
- `prototype/` — current static application and UI experiments
- `data/` — historical JSON database and bundle
- `assets/` — favicon and shared assets

## Important

`FUNCTIONAL ≠ DONE`

`DATA EXISTS ≠ VERIFIED`

`QUIZ GENERATED ≠ GOOD QUIZ`

開発再開時は、まず `docs/current-state.md` を確認してください。
