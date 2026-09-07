# URAWA HISTORY QUIZ

浦和レッズの歴史を、クイズを入口に学ぶための静的Webアプリ構想。

## Core loop

Question → Answer → Memory Hook → History → Next Question

## Product principles

- 問題より「記憶のつながり」を主役にする
- スマホを本体として設計する
- DBは事実を持ち、問題はDBから生成する
- 赤を装飾ではなく意味のあるアクセントとして使う
- 正答率ではなく「どの年代・カテゴリを理解しているか」を可視化する
- QuizとHistoryを分断しない

## Structure

- `docs/` — product / UI / audit
- `prototype/` — clickable static prototype
- `data/` — future JSON database

## Next

1. GitHub Pagesを有効化
2. prototypeの5画面を実機確認
3. Prototype DBを3シーズン分だけ作成
4. Quiz Engineを最小実装
5. History ↔ Quizの往復を完成
