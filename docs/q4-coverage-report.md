# Q4 Coverage / Balance Report

Updated: 2026-09-07

Status: **PASS — DETERMINISTIC COVERAGE / EXPOSURE BASELINE IMPLEMENTED**

## 1. Question

> If a user repeatedly presses “next question” under the real current engine, what Urawa history reaches the screen, what barely appears, and why?

Q4 separates three layers:

1. **Data Availability** — facts / rows exist at all.
2. **Quiz Eligibility** — facts can safely construct a Trust-compliant question.
3. **Runtime Exposure** — the current production selection policy actually places them on screen.

These are not interchangeable metrics.

---

## 2. Implementation

Added:

- `scripts/quiz-coverage-audit.mjs`
- permanent Q4 step in `.github/workflows/quiz-trust-audit.yml`
- CI artifact `q4-coverage-baseline.json`

The audit loads the same canonical data and the same production Trust / Kit Trust / Distractor / Difficulty modules.

It also guards the current production selection contract in `prototype/app.js`:

`confirmed season pool → shuffle seasons → shuffle seven generators inside a season → first passing generator → generator-specific target selection`

If that production selection contract changes, Q4 must be reviewed rather than silently continuing with a stale model.

---

## 3. Deterministic simulation

PRNG:

- xorshift32
- fixed scenario-specific seeds derived from `q4-2026-09-07:<scenario>`

Scenarios:

- ALL — 200,000 trials
- 1990s — 50,000
- 2000s — 50,000
- 2010s — 50,000
- 2020s — 50,000
- specific season 2006 — 50,000

Total modeled requests:

**450,000**

A same-seed repeatability check is also part of the audit.

This measures **engine exposure**, not user engagement and not learning effectiveness.

---

## 4. Eligibility census

Total safe constructions:

**131**

By generator:

| Generator | Safe constructions |
|---|---:|
| PLAYER_NUMBER | 15 |
| PLAYER_POSITION | 17 |
| PLAYER_OVERLAP | 0 |
| MANAGER_SEASON | 26 |
| SEASON_RANK | 32 |
| SEASON_SUMMARY | 33 |
| KIT_DETAIL | 8 |

By category:

| Category | Safe constructions | Inventory share |
|---|---:|---:|
| PLAYER | 32 | 24.4% |
| MANAGER | 26 | 19.8% |
| SEASON | 65 | 49.6% |
| KIT | 8 | 6.1% |

Important:

**Construction share is not screen probability.**

The runtime does not choose uniformly from 131 constructions. It chooses a season first and then a passing generator inside that season.

---

## 5. ALL runtime exposure — 200,000 requests

### Era

| Era | Exposure |
|---|---:|
| 1990s | 23.597% |
| 2000s | 29.439% |
| 2010s | 29.313% |
| 2020s | 17.652% |

This is almost exactly explained by the number of seasons in each era:

- 1990s: 8 / 34
- 2000s: 10 / 34
- 2010s: 10 / 34
- 2020s: 6 / 34

Therefore the lower 2020s share is not currently evidence of an editorial down-weight. It is mainly archive-window size.

### Category

| Category | Screen exposure |
|---|---:|
| SEASON | **66.221%** |
| MANAGER | **26.319%** |
| KIT | **4.130%** |
| PLAYER | **3.330%** |

This is the central Q4 finding.

PLAYER owns **24.4% of safe constructions** but only **3.33% of runtime exposure** because those constructions are concentrated in very few seasons.

KIT has the same, smaller version of the problem.

### Generator

| Generator | Screen exposure |
|---|---:|
| SEASON_SUMMARY | 33.895% |
| SEASON_RANK | 32.327% |
| MANAGER_SEASON | 26.319% |
| KIT_DETAIL | 4.130% |
| PLAYER_POSITION | 2.154% |
| PLAYER_NUMBER | 1.177% |
| PLAYER_OVERLAP | 0% |

The engine therefore behaves much more like a **season / manager quiz with occasional player / kit questions** than the safe-construction inventory alone suggests.

---

## 6. Difficulty exposure

Q3 construction inventory was already Hard-skewed. Runtime selection makes that skew stronger.

| Structural band | Screen exposure |
|---|---:|
| HARD | **77.037%** |
| MEDIUM | 20.220% |
| EASY | **0.591%** |
| UNMODELED | 2.154% |

`UNMODELED` is currently PLAYER_POSITION; Q3 deliberately does not claim a structural difficulty estimate for it yet.

This is still a structural model, not observed psychometric difficulty.

Do not repair this by moving thresholds merely to make the distribution look balanced.

---

## 7. Season visibility

Uniform reference for one of 34 seasons:

**2.941%**

Under the Q4 low/high threshold:

- low-visibility seasons (< 0.5 × uniform): **none**
- high-visibility seasons (> 1.5 × uniform): **none**

Therefore the current engine does **not** have a strong season-selection starvation problem.

The more important invisibility is **inside each season**: which categories are capable of representing that year.

---

## 8. Famous-era test

Test group:

- 2003
- 2004
- 2005
- 2006
- 2007
- 2017
- 2022
- 2023

Expected exposure if seasons are uniform:

**23.529%**

Observed:

**23.465%**

Ratio:

**0.997**

Decision:

**No measurable famous-era overexposure at the season-selection layer.**

This does not mean famous facts are perfectly balanced inside those seasons; it means the engine is not preferentially selecting those years as years.

---

## 9. Provenance-driven blind spots

### PLAYER

**31 seasons** contain player-season rows but expose neither PLAYER_NUMBER nor PLAYER_POSITION.

This is mainly relation-level provenance / sparse roster debt, not a deliberate editorial choice.

Only a narrow set of seasons currently supports player generators safely.

### KIT

**29 seasons** have a legacy HOME kit row but no eligible KIT_DETAIL construction.

This is exactly why legacy generic season kit data must not be confused with verified competition-aware kit truth.

### MANAGER

**8 seasons** have manager-tenure data but no eligible MANAGER_SEASON question.

Affected years:

- 1997
- 1999
- 2000
- 2001
- 2008
- 2011
- 2017
- 2024

The cause is safe-tenure ambiguity / multiple-tenure handling rather than a desire to hide those managers.

### Source granularity

**31 seasons** still rely only on broad root season sources.

Open / blocked evidence debt remains:

- `ISSUE_KIT_2004`
- `ISSUE_KIT_2009_2010_2012`
- `ISSUE_MANAGER_TENURES_LEGACY`
- `ISSUE_SOURCE_GRANULARITY`

---

## 10. Entity exposure

### Most exposed players in the ALL simulation

| Player | Exposure |
|---|---:|
| 阿部 勇樹 | 0.488% |
| ラファエル・シルバ | 0.468% |
| ホセ・カンテ | 0.309% |
| 伊藤 敦樹 | 0.304% |
| マリウス・ホイブラーテン | 0.294% |
| アレクサンダー・ショルツ | 0.288% |

Even the most exposed player remains below 0.5% of all screens because the PLAYER category itself is starved.

### Most exposed managers

| Manager | Exposure |
|---|---:|
| ミハイロ・ペトロヴィッチ | 4.657% |
| マチェイ・スコルジャ | 3.462% |
| ホルガー・オジェック | 2.680% |
| 森 孝慈 | 2.429% |
| ギド・ブッフバルト | 2.247% |

This concentration is partly a consequence of managers appearing across multiple eligible seasons. It should not automatically be classified as bad repetition; Q5 must decide historical significance before editorial weighting.

---

## 11. Bias classification

### Not currently supported by evidence

- strong famous-season bias
- strong quiet-season invisibility at the season-selection layer

### Supported by evidence

- **category starvation** — PLAYER and KIT are below 5% exposure
- **generator dominance** — SEASON_SUMMARY + SEASON_RANK alone account for about two thirds of screens
- **difficulty exposure skew** — HARD reaches 77.0%
- **provenance bias** — PLAYER / KIT availability exists far more widely than safe runtime eligibility
- **entity repetition potential** — long-tenure managers naturally accumulate exposure

### Important attribution

Most current PLAYER / KIT underexposure is **data / provenance debt amplified by season-first runtime selection**.

It is not yet defensible to call it an editorial weighting mistake alone.

---

## 12. Decision

**Q4 PASS**

Pass criteria are satisfied:

- Data Availability and Quiz Eligibility are separately measured
- runtime exposure is measured separately
- deterministic seeds reproduce the simulation
- era / season / category / generator / difficulty / player / manager / KIT scope are captured in the artifact
- low-visibility season test is explicit
- provenance-driven gaps are separated from editorial policy
- Trust Gate is unchanged
- no arbitrary target distribution has been imposed

Permanent validation run:

https://github.com/silovar-uk/urawa-history-quiz/actions/runs/34129945891

Result:

**SUCCESS**

---

## 13. What Q4 should NOT do next

Do not immediately change the engine to:

- 25% per category
- equal exposure per generator
- equal exposure per era
- down-weight title seasons because they are famous
- up-weight unverified player / kit data
- manufacture EASY items

Those are editorial / learning decisions that require Q5.

---

## 14. Input to Q5

Q5 now has a sharper question than “how do we balance the quiz?”

> Which safe facts are important enough to deserve exposure, and which underrepresented histories should become more visible because they matter — rather than merely because a chart is uneven?

Q5 should define significance independently from structural difficulty and independently from provenance availability.

Recommended first Q5 artifact:

`knowledge significance model`

Minimum dimensions to investigate:

- club-history importance
- supporter cultural memory
- turning-point value
- player / manager identity value
- relation to titles and failures
- tactical / organizational transformation
- connectivity to other seasons / entities
- era-representation value
- evidence confidence as a separate gate, not an importance score

Only after significance is explicit should the project consider exposure weighting.
