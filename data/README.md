# Data

URAWA HISTORYのHistorical DB。

現在は1992〜2025の34シーズンを扱うデータが入り、prototypeのQuiz / Historyから利用されています。

## Files

- `seasons.json` — シーズン情報
- `players.json` — 選手マスタ
- `player_seasons.json` — 選手×シーズン
- `managers.json` — 監督マスタ
- `manager_tenures.json` — 監督×シーズン
- `uniforms.json` — HOMEユニフォーム情報
- `sources.json` — 出典台帳
- `data-bundle.js` — GitHub Pages / fallback用bundle

## Important distinction

このDBは「34シーズンを扱える」状態ですが、全領域が同じ品質で完成しているわけではありません。

特に以下は継続監査対象です。

- fact / record単位のsource traceability
- `verification_status` のQuiz Eligibilityへの反映
- player_seasonsのsource metadata
- 途中加入 / 退団を含む在籍期間
- 監督交代年の複数tenure表現
- 同一背番号の一意性
- uniformsのsource / verification metadata
- summary / memory_hook / key_eventsのclaim verification
- data-bundleとJSONの同期

## Current rule

`DATA EXISTS ≠ VERIFIED`

「データがある」ことだけではQuiz Eligibleにしない方針へ移行します。

現在の最優先は `docs/current-state.md` の **Quiz Quality Round 0–1**。

Schemaの設計意図は `docs/schema-specification.md` を参照してください。
