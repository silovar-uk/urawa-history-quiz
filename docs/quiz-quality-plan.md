# Quiz Quality Plan — Trust Before Polish

Updated: 2026-09-07

Canonical project state: `docs/current-state.md`

Current status:

- Q0 Inventory — **DONE**
- Q1 Correctness / Eligibility — **DONE**
- Q1.5 Provenance Recovery — **NOW**
- Q2 Distractor Quality — **NEXT**
- Q3 Difficulty — LATER
- Q4 Coverage / Balance — LATER
- Q5 Significance / Memory Hook — LATER
- Q6 Learning History — LATER

Detailed Q0/Q1 result:
`docs/quiz-trust-gate-report.md`

---

# 0. Goal

Quiz Engineを：

`question can be generated`

から：

`question is safe to show`

へ進め、さらに：

`question is worth learning`

へ進める。

順序を逆にしない。

---

# 1. Q0 — Inventory — DONE

7 generatorの成立条件をmachine-checkableにした。

- PLAYER_NUMBER
- PLAYER_POSITION
- PLAYER_OVERLAP
- MANAGER_SEASON
- SEASON_RANK
- SEASON_SUMMARY
- KIT_DETAIL

Rules live in:

`prototype/quiz-trust.js`

Each rule defines:
- required evidence
- fail-closed behavior
- eligibility expectation

---

# 2. Q1 — Correctness / Eligibility — DONE

Implemented principles:

## Fail closed

成立を証明できないquestionは出さない。

## Relationship evidence

Entityにsourceがあっても、relationship factは別に確認する。

Example:

`player exists`

≠

`player wore #17 in 2006`

## Semantic uniqueness

4文字列が違うだけでは足りない。

Normalized option uniquenessとcorrect occurrenceを検査する。

## Safe wording

Data certaintyより強い表現を使わない。

## Observable rejection

Runtime:

`window.URAWA_QUIZ_QA`

CI:

`node scripts/quiz-trust-audit.mjs`

Workflow:

`.github/workflows/quiz-trust-audit.yml`

---

# 3. Q0/Q1 Audit Result

Initial CI:

- PLAYER_NUMBER: 0 / 34 eligible
- PLAYER_POSITION: 0 / 34 eligible
- PLAYER_OVERLAP: 0 / 34 eligible
- MANAGER_SEASON: 26 / 34 eligible
- SEASON_RANK: 32 / 34 eligible
- SEASON_SUMMARY: 33 / 34 eligible
- KIT_DETAIL: 0 / 34 eligible

Invariant failures: 0

Interpretation:

Trust layer works.
Coverage不足はdata provenance不足を示している。

---

# 4. Q1.5 — Provenance Recovery — NOW

## Purpose

PLAYER / KITをTrust Gateを弱めず復活させる。

一括source付与は禁止。

まずVertical Sliceでsource model自体を検証する。

---

## 4.1 Player relation slice

Candidate anchor seasons:

- 1998
- 2006
- 2017
- 2023

Verify:

- player-season membership
- shirt number
- registered position

Prefer:

- club official
- league official
- competition official
- official annual records

Add relationship-level provenance only after checking the exact claim.

Schema candidate:

```json
{
  "player_id": "...",
  "season_id": "2006",
  "shirt_number": 17,
  "position": "MF",
  "verification_status": "confirmed",
  "source_ids": ["..."]
}
```

Do not infer source from Player master.

---

## 4.2 Kit provenance slice

Goal:

At least four distinct verified sponsor values available for safe distractor generation.

Representative sponsor eras:

- MITSUBISHI MOTORS
- Vodafone
- DHL
- POLUS

Verify actual HOME kit claims and attach source metadata.

Schema candidate:

```json
{
  "uniform_id": "...",
  "season_id": "...",
  "type": "HOME",
  "chest_sponsor": "...",
  "verification_status": "confirmed",
  "source_ids": ["..."]
}
```

---

## 4.3 PLAYER_OVERLAP remains disabled

Current data does not prove actual overlap interval or roster completeness.

Do not weaken the wording to make the existing generator appear safe.

Future requirements:

- registration_start
- registration_end
- or equivalent official interval evidence
- roster completeness rule

---

## 4.4 Manager ambiguity remains fail-closed

Current gate rejects seasons whose notes suggest:

- mid-season replacement
- dismissal
- interim control
- handover

Do not restore those questions until manager tenure records represent changes explicitly.

---

# 5. Q1.5 Pass Gate

Re-run Trust Audit.

Required:

- PLAYER_NUMBER eligible > 0
- PLAYER_POSITION eligible > 0
- KIT_DETAIL eligible > 0
- invariantFailures = 0
- no bulk unsupported source stamping

If failed:
source / schema modelを修正する。

Q2へ急がない。

---

# 6. Q2 — Distractor Quality — NEXT

Correctnessの次に「もっともらしい誤答」を改善する。

Principle:

`plausible enough to require recall`

AND

`clearly false from supported data`

---

## MANAGER

Current safe poolをglobal randomにせず：

1. adjacent era
2. nearby tenure
3. same broad historical period

を優先。

---

## SEASON_RANK

Current:
valid league range内に限定済み。

Next:
correct rank近傍をdifficulty-awareに選ぶ。

Example:

correct 6th

better distractors:
4th / 5th / 7th

rather than:
1st / 14th / 18th

---

## SEASON_SUMMARY

Random distant yearをやめる。

Candidate similarity:

- nearby year
- similar title profile
- similar league rank
- same manager era
- similar historical phase

---

## PLAYER_NUMBER

After provenance recovery:

- same season
- same / nearby position
- actual roster member
- different verified shirt number

を優先。

---

## KIT

After provenance recovery:

- nearby sponsor era
- actual verified sponsor values

を使う。

---

# 7. Q2 Pass Gate

Each eligible generator must satisfy:

- all distractors source-defensible as false
- no absurd option
- no semantic duplicate
- no obvious era giveaway where avoidable
- correct answer not conspicuously more specific
- minimum 4-option quality holds across representative seasons

---

# 8. Q3 — Difficulty

After Q2 only.

Difficulty dimensions:

- temporal distance
- option similarity
- fact prominence
- historical context clues
- exposure count later

Initial labels:

- EASY
- MEDIUM
- HARD

Do not define difficulty only by obscurity.

---

# 9. Q4 — Coverage / Balance

Measure:

- era
- category
- generator
- season
- player
- knowledge cluster

Avoid:

- 2000s golden-era overload
- famous-player overload
- PLAYER overload
- same knowledge paraphrase repetition

---

# 10. Q5 — Significance / Memory Hook

Question must be both:

1. true
2. worth remembering

Memory Hook should connect:

- season ↔ adjacent season
- player ↔ era
- kit ↔ season memory
- manager ↔ historical phase

Avoid answer paraphrase only.

---

# 11. Q6 — Learning History

Current aggregate stats are not enough for true mastery.

Future question history minimum:

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
- recovery
- exposure

Do not call raw accuracy mastery without sample context.

---

# 12. Production sequence

```text
Q0 Inventory — DONE
↓
Q1 Correctness / Eligibility — DONE
↓
Q1.5 Provenance Recovery — NOW
↓
Q2 Distractor Quality — NEXT
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

History Spine research remains preserved.

---

# 13. Immediate Next Action

**Run a provenance vertical slice instead of broad data expansion.**

Start with representative player-season and kit claims.

Next review question:

> Can PLAYER / KIT become eligible because their evidence improved, rather than because the Trust Gate became looser?
