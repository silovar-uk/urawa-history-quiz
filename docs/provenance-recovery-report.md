# Provenance Recovery Report — Q1.5

Updated: 2026-09-07

Status: **PARTIAL PASS**

Canonical project state: `docs/current-state.md`

---

# 1. Question

Trust Gateを弱めず、relationship / claim levelの根拠を追加することでPLAYER / KIT quizを安全に復活させられるか。

---

# 2. Model Decision

## Adopted: claim-level provenance registry

New runtime data:

`data/provenance-claims.js`

Reason:

`player_season` という1 record全体をsource-backedとみなすと、

- shirt_numberは確認できる
- positionは同じsourceでは確認できない

というケースを表現できない。

そのため、entityではなくfield claim単位で：

- current value
- sourceIds

を結び付ける。

Quiz Trust Gateはclaim valueとbase data valueが一致する場合だけsource-backedとして扱う。

CIはさらに：

- claim source IDが `data/sources.json` に存在すること
- claim valueがbase dataと一致すること

を検査する。

---

# 3. Sources Added

Specific official pages were added to `data/sources.json` rather than relying only on site-root sources.

Player / squad evidence:

- 1998 official match record
- 2006 official J1 R-File
- 2006 official shirt-number announcement
- 2017 official squad number / position announcement
- 2023 official squad number / position announcement

Kit evidence:

- 2005 Vodafone chest-partner announcement
- 2007 domestic SAVAS / international DHL announcement
- 2013 POLUS chest-partner announcement

---

# 4. Player Slice

## 2006

The official season R-File provides shirt number + position in the same season-level table.

Claim-backed current records:

- Tulio #4 / DF
- Makoto Hasebe #17 / MF
- Shinji Ono #18 / MF
- Ponte #10 / MF
- Tatsuya Tanaka #11 / FW
- Keita Suzuki #13 / MF
- Keisuke Tsuboi #2 / DF

These are enough for both PLAYER_NUMBER and PLAYER_POSITION to form safe questions.

## 2017

The current sampled DB contains only two matching relations:

- Rafael Silva #8 / FW
- Yuki Abe #22 / MF

Both are claim-backed.

Result:

- PLAYER_POSITION can be eligible because its distractors are position labels.
- PLAYER_NUMBER remains ineligible because three distinct safe player distractors are unavailable in the current sampled DB.

## 2023

Claim-backed current records:

- Alexander Scholz #28 / DF
- Marius Hoibraten #5 / DF
- Atsuki Ito #3 / MF
- Jose Kante #11 / FW

Enough for both player generators.

## 1998

Official match records can verify shirt numbers in match context, but the current sampled DB contains only two 1998 player relations and the available source does not justify treating match position as season registered position.

No forced recovery was performed.

---

# 5. Data Contradictions Discovered

Provenance research exposed existing base-data errors / ambiguities.

They are recorded in `data/provenance-claims.js` under `issues` and intentionally NOT marked as trusted claims.

## 2006 player data

- `ps_2006_washington.shirt_number`: current 30 → official evidence 21
- `ps_2006_yamada.position`: current DF → official season R-File MF
- `ps_2006_tsuzuki.shirt_number`: current 21 → official evidence 23
- `ps_2006_okano.shirt_number`: current 32 → official evidence 30

The Trust Gate therefore excludes those relations instead of inheriting the bad base value.

---

# 6. Kit Slice

## Confirmed claims matching current base data

- 2005 domestic chest: Vodafone
- 2013 domestic chest: POLUS

These now pass claim-level source validation.

## Critical model problem discovered

The current `uniforms.json` has a single `chest_sponsor` value per season, but historical reality can differ by competition.

Example: 2007 official announcement explicitly distinguishes:

- J.League / domestic cups: SAVAS
- ACL / international competitions: DHL

Current base data stores 2007 as `DHL`, so a generic question:

`2007年のHOMEユニフォームの胸スポンサーは？`

is not safely answerable from the current model.

Another contradiction:

- current 2004 base value = Vodafone
- official 2005 announcement describes Vodafone as the new 2005 chest partner and Mitsubishi Motors moving to the back

This requires base-data repair / stronger historical confirmation before 2004 is admitted.

---

# 7. Audit — Before / After

## Before Q1.5

- PLAYER_NUMBER: 0 / 34
- PLAYER_POSITION: 0 / 34
- PLAYER_OVERLAP: 0 / 34
- MANAGER_SEASON: 26 / 34
- SEASON_RANK: 32 / 34
- SEASON_SUMMARY: 33 / 34
- KIT_DETAIL: 0 / 34

## After Q1.5

- PLAYER_NUMBER: **2 / 34**
- PLAYER_POSITION: **3 / 34**
- PLAYER_OVERLAP: 0 / 34
- MANAGER_SEASON: 26 / 34
- SEASON_RANK: 32 / 34
- SEASON_SUMMARY: 33 / 34
- KIT_DETAIL: **0 / 34**

KIT_DETAIL now has two source-backed records, but still cannot form three distinct safe distractors.

CI:

- Trust Audit: **SUCCESS**
- invariantFailures: **0**
- provenanceFailures: **0**
- provenanceClaims: 15
- knownDataIssues: 6

Run:
https://github.com/silovar-uk/urawa-history-quiz/actions/runs/34117692993

---

# 8. Bundle Sync Decision

The existing prototype loads `data/data-bundle.js` before the Trust Gate.

Q1.5 did not mutate the large base player/uniform JSON data, so no manual duplicate edit of `data-bundle.js` was performed.

The claim registry is loaded as a separate runtime input before `quiz-trust.js`.

CI validates its source IDs against canonical `data/sources.json`.

This is acceptable for the vertical slice, but not the preferred final architecture.

Technical debt:

> Make JSON the single canonical data source and generate `data-bundle.js` deterministically (or remove the bundle if a robust fallback is unnecessary).

Do not continue hand-editing JSON and bundle independently.

---

# 9. Q1.5 Decision

**PARTIAL PASS**

PASS:

- claim-level provenance model works
- PLAYER_NUMBER safely revived
- PLAYER_POSITION safely revived
- Trust Gate not weakened
- invariant failures remain zero
- provenance registry itself is CI-validated

NOT PASSED:

- KIT_DETAIL not yet eligible
- uniform model conflates competition-specific chest sponsors
- known base-data contradictions remain unresolved
- 1998 / 2017 player sample coverage is too sparse for PLAYER_NUMBER

---

# 10. Next Gate

## Q1.6 — Uniform Model Repair

Before Q2 Distractor Quality, fix the data semantics of kits.

Primary question:

> Is `season × HOME kit × chest sponsor` sufficient, or must sponsor facts be modeled by competition context?

Recommended minimum model:

- season_id
- kit_type
- competition_scope (`domestic`, `ACL`, etc.)
- chest_sponsor
- source claim

First vertical slice:

- 2004
- 2005
- 2007
- 2013

Pass only when at least four distinct, source-backed domestic chest sponsor values exist without competition ambiguity.

After Q1.6 passes:

`Q2 — Distractor Quality`

can begin.
