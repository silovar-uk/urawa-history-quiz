# Data

URAWA HISTORYのHistorical DB。

現在は1992〜2025の34シーズンを扱い、prototypeのQuiz / Historyから利用されています。

重要：

`34 SEASONS COVERED ≠ ALL FACTS VERIFIED`

データ量・正確性・網羅性・Quiz Eligibilityは別々に管理します。

## Canonical Files

- `seasons.json` — シーズン情報
- `players.json` — 選手マスタ
- `player_seasons.json` — 選手×シーズン
- `managers.json` — 監督マスタ
- `manager_tenures.json` — 監督×シーズン×tenure
- `uniforms.json` — HOMEユニフォームのlegacy archive / display data
- `sources.json` — 出典台帳
- `issues.json` — 既知の誤り・未検証・coverage gap台帳
- `provenance-claims.js` — field / relationship単位のclaim provenance
- `uniform-contexts.js` — competition-awareなQuiz-safe uniform facts

## Generated Runtime File

- `data-bundle.js` — GitHub Pages / fallback用bundle

`data-bundle.js` は生成物です。

**手動編集禁止。**

Build:

```bash
node scripts/build-data-bundle.mjs
```

Sync check:

```bash
node scripts/build-data-bundle.mjs --check
```

Canonical JSONとbundleがズレるとCIがFailします。

## Data Contract

詳細な意味・verification semantics：

`docs/data-contract.md`

基本原則：

- `DATA EXISTS ≠ VERIFIED`
- `SOURCE EXISTS ≠ CLAIM VERIFIED`
- `RECORD VERIFIED ≠ EVERY FIELD VERIFIED`
- unknownを推測で埋めない

## Current Integrity State

Latest Data Integrity Audit：**PASS / ERROR 0**

Current census:

- seasons: 34
- players: 38
- player-season relations: 79
- shirt-number populated relations: 62
- claim-backed player-season entities: 17
- managers: 21
- manager tenure rows: 37
- legacy uniform records: 34
- verified competition-aware uniform contexts: 8
- seasons with verified uniform context: 5
- sources: 19
- issues: 11 total / 7 fixed / 4 open or blocked

Report:

`docs/data-integrity-report.md`

Evidence ledger:

`docs/data-repair-evidence.md`

## Known Gaps

現在も継続監査対象：

- 31 seasonsのSeason proseがbroad root source中心
- 多くの年代でplayer-season sampleが疎
- 29 seasonsにverified competition-aware uniform contextがない
- manager changeがnotesだけに残る年：1997 / 1999 / 2000 / 2001 / 2008 / 2017
- PLAYER_OVERLAPに必要なregistration interval evidence
- summary / memory_hook / key_eventsのclaim-level verification

これらはCI Warning / `issues.json` で可視化し、推測補完しません。

## Historical Repair Regression Protection

2026-09-07のData Repair Roundで修正した主要factはRegression Fixture化しています。

例：

- 1995 福田正博 = 32 goals
- 1996 岡野雅行 ≠ Rookie of the Year
- 2000 promotion decider = Tosu / 95th minute
- 2006 Washington = #21
- 2006 Tsuzuki = #23
- 2006 Okano = #30
- 2007 domestic chest = SAVAS
- 2008 domestic chest = SAVAS
- 2011 domestic chest = SAVAS

再度誤値が入るとData Integrity AuditがFailします。

## Quiz Eligibility

「データがある」だけではQuiz Eligibleにしません。

High-risk factsは：

- claim-level provenance
- competition context
- semantic uniqueness
- Trust Gate

を通過したものだけ出題します。

Current trust-safe season coverage：

- PLAYER_NUMBER: 2 / 34
- PLAYER_POSITION: 3 / 34
- PLAYER_OVERLAP: 0 / 34
- MANAGER_SEASON: 26 / 34
- SEASON_RANK: 32 / 34
- SEASON_SUMMARY: 33 / 34
- KIT_DETAIL: 5 / 34

## Current Priority

Data Content Repair / Integrity Gateは **DONE / PASS**。

現在は `docs/current-state.md` の：

**Q4 Coverage / Balance — NOW**

へ復帰しています。

次は、

- Data Availability
- Quiz Eligibility
- Runtime Exposure

を分離して、実際にどの歴史がユーザーへ届きやすいかを計測します。
