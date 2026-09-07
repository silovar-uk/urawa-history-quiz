# UI 03 — Quiz Flow

## Question state

表示:
- progress
- category
- optional year clue
- question
- 4 choices

原則:
- 1問1画面
- 選択肢は十分なタップ領域を取る
- 回答前に余計な解説を置かない
- 長い問題でも選択肢が見失われない

## Answered state

表示:
- 結果
- 正答
- 1つのMemory Hook
- Explore link
- Next

正解演出は短くする。
主役は「なぜ覚える価値があるか」。

## Wrong state

- 不正解を責めない
- 正答をすぐ提示
- 混同ポイントを短く示す
- Wrong Again対象へ保存

## Accessibility

- 主要タップターゲットは44px以上を設計基準にする
- keyboard focusを可視化
- 色だけで正誤を伝えない
- prefers-reduced-motionを考慮
