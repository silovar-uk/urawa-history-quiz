# Quiz Quality Plan — Trust Before Polish

Updated: 2026-09-07

Status: **NOW**

Canonical project state: `docs/current-state.md`

---

# 0. Goal

Quiz Engineを、

`question can be generated`

から、

`question is safe to show`

へ進める。

その後に、

`question is worth learning`

へ進める。

順序を逆にしない。

---

# 1. Current Generator Matrix

## PLAYER_NUMBER

Question:
「YEAR年の浦和レッズで背番号Nを背負った選手は？」

Current data:
- player_seasons
- players

Current distractor:
- same position in same season優先
- 不足時は他player_seasonsまで拡張

Risks:
- 同一seasonで同じ背番号を複数選手が使用したケース
- season途中の登録変更
- source / verificationをgenerator側で確認しない
- distractor pool内で同じplayerが複数season由来で重複し得る

Eligibility requirement:
- season + shirt numberでplayerが一意
- target relationship verified
- distractors are unique players

---

## PLAYER_POSITION

Question:
「YEAR年シーズンのPLAYERの登録ポジションは？」

Current options:
GK / DF / MF / FW

Risks:
- raw positionと4-group normalizationの意味差
- season内でposition変更 / 複数登録がある場合
- source verification未確認

Eligibility requirement:
- normalized positionが一意
- definitionを「登録ポジション」等に固定

---

## PLAYER_OVERLAP

Question:
「YEAR年にPLAYERとチームメイトとして在籍していた選手は？」

Current logic:
- same season_id = overlap

Critical risk:
- シーズン途中加入 / 退団で実在籍期間が重ならない可能性

Decision required:

A. overlap = 同一season rosterに登録されたこと

or

B. overlap = calendar / registration periodが実際に重なること

現状dataではBを保証できない。

Until decided:
- `同時在籍` の強い表現はQuiz Quality Gate上のriskとして扱う。

---

## MANAGER_SEASON

Question:
「YEAR年に浦和レッズを率いた監督は？」

Current logic:
- `managerTenures.find(season_id)` の最初の1件をcorrectにする

Critical risk:
- 途中交代年
- 総監督 / 代行 / 監督のrole差
- 1 seasonに複数correct answerが成立

Known examples in data notes:
- 1997
- 1999
- 2000
- 2001
- 2008
- 2011
- 2017
- 2018
- 2024

Eligibility requirement:
- one-manager seasonのみ現在形式で出題

or
- question wordingをtenure period / role込みに変更

---

## SEASON_RANK

Question:
「YEAR年シーズンの浦和レッズのJ1/J2最終順位は？」

Current distractor:
fixed rank listからrandom

Risks:
- league format / stage制 / pre-J.League context
- total teamsを無視したimpossible rankがdistractorになり得る
- J1/J2という表現が全seasonへ普遍的ではない

Eligibility requirement:
- league_rank exists
- wording uses actual league_name
- distractors are valid ranks within total_teams

---

## SEASON_SUMMARY

Question:
summary → year

Current distractor:
other seasonsからrandom year

Strength:
- History理解と相性がよい

Risks:
- summary中にyear answer cueが入る可能性
- random distant-year distractorで簡単すぎる
- summary claim自体のsource verification

Eligibility requirement:
- summary contains no direct answer leak
- summary verified
- distractors preferably near era / semantically similar seasons

---

## KIT_DETAIL

Question:
「YEAR年の公式ユニフォームの胸スポンサーは？」

Current distractor:
`MITSUBISHI MOTORS / Vodafone / DHL / POLUS` hard-coded

Risks:
- data-derivedでない
- uniform source metadataが弱い
- sponsor表記揺れ
- season / competition / kit variantによる例外

Eligibility requirement:
- HOME kit fact verified
- exact sponsor naming normalized
- distractors generated from verified uniform records

---

# 2. Q0 — Inventory

## Purpose

Quizの全generatorと、その成立条件をmachine-checkableな形へ落とす。

## Deliverable

各generatorに：

- required fields
- eligibility
- rejection reason
- correct-answer uniqueness rule
- distractor rule

を定義。

## Rejection reason taxonomy candidate

- UNVERIFIED_FACT
- MISSING_SOURCE
- MISSING_REQUIRED_FIELD
- AMBIGUOUS_CORRECT_ANSWER
- DUPLICATE_OPTION
- SEMANTIC_DUPLICATE
- MULTIPLE_MANAGER_SEASON
- OVERLAP_UNVERIFIED
- SHIRT_NUMBER_NOT_UNIQUE
- INVALID_RANK_RANGE
- ANSWER_LEAK_IN_STEM
- INSUFFICIENT_DISTRACTORS

---

# 3. Q1 — Correctness / Eligibility

## Rule 1 — Fail closed

成立を証明できないquestionは出さない。

fallbackで推測しない。

## Rule 2 — Verify relationships, not only entities

player自体にsourceがあっても、

`player × season × number`

がverifiedとは限らない。

relationship-level verificationを考える。

## Rule 3 — Semantic uniqueness

`new Set(options).size === 4`

だけでは不十分。

4つの文字列が違っても、正解が複数成立すればFAIL。

## Rule 4 — Wording follows data certainty

Dataがseason-level rosterしか保証しないなら、
「同時期に在籍」など期間を強く主張しない。

## Rule 5 — No generic VERIFIED badge without proof

UIの `FACT VERIFIED` は、generatorがEligibility Gateを通ったfactだけに使う。

Gate導入前は表示自体を再検討対象とする。

---

# 4. Q2 — Distractor Quality

Correctness Gate通過後に着手。

Principles:

- same domain
- plausible
- close enough to require recall
- clearly false
- data-derived where possible
- no absurd option
- no equivalent answer

Examples:

YEAR question:
nearby years / similar achievement years

MANAGER:
adjacent-era managers

KIT:
verified sponsor values from nearby seasons

RANK:
valid ranks near correct within league size

---

# 5. Q3 — Difficulty

Difficultyを「事実のマニアックさ」だけで決めない。

Candidate dimensions:

- temporal distance between distractors
- similarity of candidates
- prominence of fact
- number of connecting clues
- recency / exposure

Initial levels:

EASY
代表的タイトル / prominent season / broad distinction

MEDIUM
near-era discrimination / notable players / managers

HARD
similar seasons / close distractors / less salient but meaningful facts

---

# 6. Q4 — Coverage / Balance

Measure:

- era
- category
- generator
- season
- player
- knowledge cluster

Avoid:
- 2000s黄金期だけ大量
- famous playerだけ大量
- PLAYER category偏重
- same fact paraphrase repetition

---

# 7. Q5 — Significance / Memory Hook

Question quality has two layers:

1. Is it true?
2. Is it worth remembering?

Memory Hook should:

- connect to previous / next season
- connect player to era
- connect kit to season memory
- connect manager to tactical / result era

Avoid:
- correct answerの言い換えだけ
- unsupported dramatic copy
- trivia without historical connection

---

# 8. Q6 — Learning History

Current storage tracks aggregate counts only.

Future minimum question history:

- knowledge_id
- question_type
- season_id
- category
- answered_at
- correct
- attempts

Then derive:

- recently_wrong
- unseen
- retry
- recovery
- exposure count

Do not call raw accuracy “mastery” without sample context.

---

# 9. Test Cases Before Production Integration

At least test:

## Era boundaries
- 1992
- 1999 / 2000
- 2009 / 2010
- 2019 / 2020
- 2025

## Manager changes
- seasons with mid-season change / interim management

## Player relations
- partial season registration
- repeated player spell
- same shirt number candidates

## Data failure
- missing source
- missing player relation
- missing kit
- duplicate option
- contradictory fact

---

# 10. Pass Gate

Q0/Q1 passes only when:

- eligibility is explicit per generator
- unverified facts fail closed
- correct answer uniqueness is checked semantically
- known manager-change ambiguity is handled
- player overlap definition is documented
- rank distractors obey league bounds
- kit distractors come from verified data or are otherwise explicitly justified
- source / verification state reaches the UI question object
- invalid question rejection is observable in QA

---

# 11. Production Sequence After Trust Gate

```text
Q0 Inventory
↓
Q1 Correctness / Eligibility
↓
Q2 Distractor Quality
↓
Q3 Difficulty
↓
Q4 Coverage
↓
Q5 Memory Hook
↓
Q6 Learning History
↓
Answered Spine Production Integration
↓
History Browser Research
```

History Spine research is preserved, not cancelled.

It is deliberately queued behind Quiz Trust.

---

# 12. Immediate Next Action

**Build the Q0/Q1 audit layer before changing production UI.**

First implementation batch should be small:

1. Define `isQuizEligible(...)`-style rules or equivalent validation layer.
2. Give every rejected candidate a reason code.
3. Run generators against representative seasons.
4. List every ambiguity / rejection discovered.
5. Do not change visual design in the same batch.

Next review question:

> Can every question that reaches the screen be trusted to have exactly one defensible answer from adequately supported data?
