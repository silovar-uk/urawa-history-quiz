# UI 06 — Mobile

## Base viewport
390px前後を基準に設計。

## Bottom navigation
TODAY / QUIZ / HISTORY / YOU

## Thumb-friendly
主要回答領域を画面中央〜下部へ。
ただし最下部固定しすぎて誤タップを増やさない。

## Scrolling
Questionは可能な限り1 viewport。
Season Detailなど読む画面では自然な縦スクロール。

## No hover dependency
hoverは補助のみ。

## Image handling
Kit画像:
- aspect ratio固定
- loading placeholder
- broken image fallback
- source linkは詳細に分離

## Resilience
外部画像が欠けても、問題文・年・説明・次の問題が壊れない構造にする。
