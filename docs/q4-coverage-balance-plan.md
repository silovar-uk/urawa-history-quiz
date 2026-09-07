# Q4 Coverage / Balance Research Plan

Updated: 2026-09-07

Status: **NEXT / HEAD START ONLY**

Q3 result:

- structural difficulty baseline exists
- 107 modeled item constructions
- current construction is strongly Hard-skewed

Q4 must answer what users are actually likely to see, not just what exists in the database.

---

# 1. Central Question

> If a user repeatedly asks for the next question under the current engine, which parts of Urawa history dominate the experience and which parts are almost invisible?

---

# 2. Distinguish Three Different Distributions

Do not merge these:

## A. Data Availability

What facts exist at all?

## B. Quiz Eligibility

What facts pass Trust / provenance rules?

## C. Generation Exposure

What questions are likely to reach the screen under the real generator-selection algorithm?

Q4 is mainly about C while explaining gaps from A and B.

---

# 3. Measurement Dimensions

Every generated / eligible item should be classifiable by:

- era: 1990s / 2000s / 2010s / 2020s
- season
- category: PLAYER / MANAGER / SEASON / KIT
- generator
- difficulty band / structural score
- player where applicable
- manager where applicable
- competition scope for KIT
- future knowledge cluster ID where definable without inventing taxonomy

---

# 4. First Measurement Pass

Build a deterministic simulation of the current generation policy.

Two views are required:

## View 1 — Eligibility Census

Count every trust-safe construction by:

- era
- season
- category
- generator
- difficulty

## View 2 — Runtime Exposure Simulation

Simulate repeated “next question” use with fixed seeds or a deterministic pseudo-random strategy.

Minimum scenarios:

- all eras
- 1990s filter
- 2000s filter
- 2010s filter
- 2020s filter
- one specific season

Run enough trials to reveal the generation policy rather than random noise.

Do not claim user behavior from this simulation. It measures engine exposure, not engagement.

---

# 5. Biases To Test

## Famous-era bias

Check concentration around:

- 2003–2007
- 2017
- 2022–2023

Do not assume this bias exists; measure it.

## Provenance bias

Recent eras may have richer PLAYER sources and therefore more eligible player questions.

Separate source availability from editorial importance.

## Generator bias

A generator with 33 eligible seasons can dominate one with 3 even if generator selection appears uniform at a higher level.

Measure actual screen probability.

## Difficulty bias

Q3 showed a structural Hard skew.

Measure whether specific eras / categories are disproportionately Hard.

## Quiet-season invisibility

Check whether non-title seasons, transition years, J2, or low-profile years disappear from the experience.

---

# 6. Do Not Force Equal Distribution

Do not set 25% per era or category as a default goal.

Balance must later consider:

- historical significance
- evidence confidence
- learning value
- data availability
- session variety

Q4 identifies accidental imbalance before Q5 defines editorial weighting.

---

# 7. Proposed Q4 Outputs

Create:

- `scripts/quiz-coverage-audit.mjs`
- CI artifact: `q4-coverage-baseline.json`
- `docs/q4-coverage-report.md`

Recommended report sections:

1. Eligibility census
2. Runtime exposure simulation
3. Era distribution
4. Category distribution
5. Generator distribution
6. Difficulty distribution
7. Season visibility
8. Provenance-driven blind spots
9. Accidental vs intentional bias
10. Risks
11. Decision
12. Input required from Q5

---

# 8. Q4 Pass Criteria

Q4 may pass when:

- eligible inventory and runtime exposure are measured separately
- current exposure can be reproduced deterministically
- era / category / generator / difficulty bias is visible
- low-visibility seasons are identified
- provenance-driven gaps are separated from editorial choices
- no arbitrary target distribution is imposed yet
- the output directly informs Q5 Significance

---

# 9. Q4 Failure Conditions

Do not pass if:

- only database row counts are reported
- random simulation cannot be reproduced
- all imbalance is called bad automatically
- famous seasons are down-weighted simply to look balanced
- unverified data is admitted to improve coverage
- difficulty and historical importance are conflated

---

# 10. First Action

IF WE DO ONLY ONE THING NEXT:

> Build one deterministic eligibility-and-exposure census that answers, for every season from 1992–2025, how many safe question constructions exist and how often that season would reach the screen under the current generator policy.
