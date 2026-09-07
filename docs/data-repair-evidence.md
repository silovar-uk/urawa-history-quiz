# Data Repair Evidence Ledger

Updated: 2026-09-07

Purpose: Data Content Repair Gateで使った一次情報・判断・未解決項目を記録する。

Rule:

> Research before repair. Evidence before confidence. Unknown before guess.

---

## E-1995-FUKUDA-GOALS

- Entity: season `1995` / `ps_1995_fukuda`
- Current claim before repair: 福田正博 27得点で得点王
- Finding: **32得点 / 50試合、日本人初のJリーグ得点王**
- Classification: CONFIRMED ERROR
- Confidence: HIGH
- Official source:
  - Jリーグ公式 — https://www.jleague.jp/news/article/23628/
- What it proves:
  - 1995シーズンに福田正博が32得点
  - 日本人初のJリーグ得点王
- Repair scope:
  - `seasons.json` summary / key_events
  - `player_seasons.json` memory_hook
  - generated `data-bundle.js`

---

## E-1996-OKANO-AWARD

- Entity: season `1996` / `ps_1996_okano` / `kit_1996`
- Current claim before repair: 岡野雅行が新人王
- Finding:
  - 1996新人王 = **斉藤俊秀（清水）**
  - 岡野雅行 = **ベストイレブン / フェアプレー個人賞**
- Classification: CONFIRMED ERROR
- Confidence: HIGH
- Official source:
  - Jリーグ公式 大会の歴史 — https://www.jleague.jp/corporate/about_competitions/tournament_history/
- Repair scope:
  - `seasons.json` key_events
  - `player_seasons.json` memory_hook
  - `uniforms.json` description
  - generated `data-bundle.js`

---

## E-2000-PROMOTION

- Entity: season `2000` / `ps_2000_tsuchihashi`
- Current claim before repair:
  - key_eventに「水戸戦（鳥栖戦）」
  - Vゴールを「延長後半」と記述
- Finding:
  - 2000-11-19 J2第44節 **浦和 vs 鳥栖**
  - 土橋正樹のVゴールは**延長前半95分**
- Classification: CONFIRMED ERROR
- Confidence: HIGH
- Official source:
  - Jリーグ公式 — https://www.jleague.jp/news/article/15590/?mode=pc
- Repair scope:
  - `seasons.json` summary / key_events
  - `player_seasons.json` memory_hook
  - generated `data-bundle.js`

---

## E-2006-SQUAD

- Entity: 2006 player-season relationships
- Findings:
  - Washington = **#21**
  - 都築龍太 = **#23**
  - 岡野雅行 = **#30**
  - 山田暢久 = official 2006 season R-File registration table **MF**
- Classification: CONFIRMED ERROR
- Confidence: HIGH
- Official sources:
  - 浦和レッズ 2006背番号 — https://www.urawa-reds.co.jp/topteamtopics/31946/
  - 浦和レッズ R-File 2006 — https://www.urawa-reds.co.jp/archive/Results/Rising2006/2006j.htm.html
- Repair scope:
  - `player_seasons.json`
  - `provenance-claims.js`
  - generated `data-bundle.js`

---

## E-KIT-2007

- Entity: `kit_2007` and uniform contexts
- Finding:
  - Jリーグ / ナビスコ / 天皇杯 = **SAVAS**
  - ACL / A3 / Bull's Cup = **DHL**
- Classification: MODEL ERROR + CONFIRMED LEGACY ERROR
- Confidence: HIGH
- Official source:
  - 浦和レッズ — https://www.urawa-reds.co.jp/clubinfo/35045/
- Decision:
  - legacy `uniforms.json` は国内値SAVASへ修正
  - Quiz truthはcompetition-aware `uniform-contexts.js`を継続

---

## E-KIT-2008

- Entity: `kit_2008`
- Finding:
  - 2008リーグ戦用1st = **SAVAS**
  - 国際試合用 = **DHL**
- Classification: MODEL ERROR + CONFIRMED LEGACY ERROR
- Confidence: HIGH
- Official source:
  - 浦和レッズ — https://www.urawa-reds.co.jp/clubinfo/33173/
- Decision:
  - legacy domestic valueをSAVASへ修正
  - domestic / international contextsを追加

---

## E-KIT-2011

- Entity: `kit_2011`
- Finding:
  - 2011レプリカ1st / authentic 1st = **SAVAS**
- Classification: CONFIRMED ERROR
- Confidence: HIGH
- Official source:
  - 浦和レッズ — https://www.urawa-reds.co.jp/clubinfo/24257/
- Decision:
  - legacy domestic chestをSAVASへ修正
  - domestic contextを追加

---

## E-MANAGER-2011

- Entity: manager tenures 2011
- Finding:
  - ゼリコ・ペトロヴィッチ監督の契約解除
  - **2011-10-20 堀孝史監督就任**
  - 第30節から堀監督で臨む
- Classification: COVERAGE / MODEL GAP
- Confidence: HIGH
- Official sources:
  - https://www.urawa-reds.co.jp/topteamtopics/7734/
  - https://www.urawa-reds.co.jp/topteamtopics/7735/
- Decision:
  - 1season 1rowをやめ、堀 tenureを追加

---

## E-MANAGER-2024

- Entity: manager tenures 2024
- Finding:
  - 2024-08-27 ヘグモ監督職解除
  - 池田伸康コーチが暫定監督
  - マチェイ・スコルジャ氏と監督就任合意
- Classification: COVERAGE / MODEL GAP
- Confidence: HIGH
- Official sources:
  - https://www.urawa-reds.co.jp/topteamtopics/216250/
  - https://www.urawa-reds.co.jp/topteamtopics/216248/
- Decision:
  - Ikeda interim / Skorza tenureを追加
  - `managers.json` にIkedaを追加

---

# Intentionally Not Repaired

## U-KIT-2004

- Current: Vodafone
- Concern: 2005公式発表はVodafoneを2005シーズンの新しい胸パートナーとして扱う
- Classification: UNVERIFIED
- Confidence on replacement value: LOW
- Decision: **変更しない**
- Needed next: 2004ユニフォームを直接示す浦和公式 / 公式記録

## U-KIT-2009 / 2010 / 2012

- Current legacy data: DHL
- Research found SAVAS / 明治製菓のトップパートナー継続を示す公式記事はある
- But this round did not secure a direct, year-specific primary page that explicitly proves each domestic 1st chest logo
- Classification: UNVERIFIED
- Decision: **変更しない**

## U-MANAGER-LEGACY

Years still requiring tenure-level primary-source reconstruction:

- 1997
- 1999
- 2000
- 2001
- 2008
- 2017
- 2018
- 2019

Classification: COVERAGE GAP

Decision: notesから推測して日付を作らない。`data/issues.json`へ残す。

---

# Repair Gate Principle

今回の成功条件は「unknownをゼロにする」ことではない。

- CONFIRMED ERRORは直す
- MODEL ERRORは構造で表現する
- UNVERIFIEDは変更しない
- COVERAGE GAPはIssueとして残す

この区別を維持する。
