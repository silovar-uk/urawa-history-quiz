# Q3 Difficulty Research Report

Updated: 2026-09-07

Status: **PASS — structural estimate baseline**

Important limitation:

> Q3 does **not** claim psychometric / observed item difficulty. In classical test theory, item difficulty is observed from the proportion of users who answer an item correctly. Until URAWA HISTORY has sufficient response data, this project uses a deterministic **Structural Difficulty Estimate** based on target, clue proxies, and distractor relationships.

---

# 1. Question

> What measurable properties make one trusted URAWA HISTORY question meaningfully harder than another without simply making it more obscure?

---

# 2. Why Now

Q0–Q2 established:

- source-backed eligibility
- fail-closed correctness
- competition-aware KIT facts
- plausible / domain-aware distractors

That makes it possible to study the structure of difficulty without first guessing what a question will look like.

---

# 3. Research Framing

Difficulty and learning value are separate concepts.

A difficult question is not automatically a good learning question.

The project therefore distinguishes:

1. **Structural Difficulty Estimate** — Q3
2. **Historical / learning significance** — Q5
3. **Observed item difficulty from real response data** — future calibration after a meaningful learning-history dataset exists

External research used for framing:

- Classical item difficulty is ordinarily estimated from the proportion of examinees answering correctly. This means the current structural model must not be presented as observed difficulty.
  - https://asmepublications.onlinelibrary.wiley.com/doi/10.1111/j.1365-2923.2009.03425.x
  - https://testingservices.utexas.edu/scanning/interpreting-test-results
- "Desirable difficulty" is only desirable when added challenge supports later learning / retention; difficulty by itself is not the goal.
  - https://bjorklab.psych.ucla.edu/research/
  - https://pubmed.ncbi.nlm.nih.gov/26255442/

---

# 4. Implementation

Model:

`prototype/quiz-difficulty.js`

Baseline generator / audit:

`scripts/quiz-difficulty-audit.mjs`

CI:

`.github/workflows/quiz-trust-audit.yml`

Every relevant CI run now generates a full baseline artifact:

`q3-difficulty-baseline.json`

The artifact contains the scored item inventory, factors, bands, and representative samples.

---

# 5. Model

All modeled questions produce:

- `kind = STRUCTURAL_ESTIMATE`
- `score = 0..100`
- `band = EASY / MEDIUM / HARD`
- factor values
- human-readable reasons
- cautions where a factor is only a proxy

Current provisional fixed thresholds:

- EASY: 0–39
- MEDIUM: 40–69
- HARD: 70–100

The thresholds are deterministic and do not change when the item bank changes.

They are research bands, not user-facing labels.

---

# 6. Generator-specific Factors

## PLAYER_NUMBER

Factors:

- same-position distractor ratio
- average shirt-number distance
- number closeness

Interpretation:

A question becomes structurally harder when the alternatives are players from the same role and the competing shirt numbers are closer to the target.

## MANAGER_SEASON

Factors:

- same-decade distractor ratio
- average year distance
- temporal closeness

Interpretation:

Managers from the same period create stronger historical interference than managers from distant eras.

## SEASON_RANK

Factors:

- average rank distance
- rank closeness
- objective title-count prominence proxy

Interpretation:

`4位 / 5位 / 6位 / 7位` is structurally harder than widely separated numeric alternatives.

A title-rich season receives an ease adjustment because the final result can be historically distinctive.

Caution:

The title-count adjustment is only a proxy for prominence, not observed user knowledge.

## SEASON_SUMMARY

Factors:

- temporal closeness
- same-decade ratio
- title-profile similarity
- league similarity
- title-count distinctiveness proxy

Interpretation:

Neighboring seasons with similar competitive context produce stronger interference.

Caution:

The current model does not yet measure the semantic uniqueness / clue richness of the actual summary text well enough. Confidence for this generator is therefore lower than for pure numeric / temporal generators.

## KIT_DETAIL

Factors:

- same competition-scope ratio
- year distance
- same-year alternative context

Interpretation:

A sponsor from the same competition scope or a different competition in the same season is a more plausible alternative than a distant unrelated sponsor.

---

# 7. Baseline Result

CI run:

https://github.com/silovar-uk/urawa-history-quiz/actions/runs/34120456643

Total structurally scorable items:

**107**

Overall provisional bands:

- EASY: **4**
- MEDIUM: **23**
- HARD: **80**

This is a finding, not a target distribution.

## By generator

### PLAYER_NUMBER

- items: 11
- EASY: 4
- MEDIUM: 3
- HARD: 4
- range: 20–88
- average: 54.9

### MANAGER_SEASON

- items: 26
- EASY: 0
- MEDIUM: 13
- HARD: 13
- range: 48–92
- average: 73.2

### SEASON_RANK

- items: 32
- EASY: 0
- MEDIUM: 2
- HARD: 30
- range: 47–87
- average: 80.3

### SEASON_SUMMARY

- items: 33
- EASY: 0
- MEDIUM: 2
- HARD: 31
- range: 54–89
- average: 80.0

### KIT_DETAIL

- items: 5
- EASY: 0
- MEDIUM: 3
- HARD: 2
- range: 58–77
- average: 65.2

---

# 8. Human Reasonableness Audit

The first model was not tuned to manufacture a balanced-looking distribution.

Instead, representative outputs were inspected for whether the direction of the score made sense.

## Reasonable EASY examples

### 2023 伊藤敦樹 #3 — score 20

Why low:

- selected distractors were not same-position
- average shirt-number distance was large

The answer alternatives provide relatively weak retrieval competition.

### 2023 ホセ・カンテ #11 — score 24

Same pattern: low role similarity and large number distance.

## Reasonable MEDIUM example

### 2006 final league rank = 1st — score 47

The distractor ranks are numerically close, which makes exact-rank recall harder.

However, the season is title-rich and historically distinctive, so the prominence proxy lowers the estimate.

This is directionally sensible and demonstrates why `famous season = always easy` and `near options = always hard` are both too simplistic.

## Reasonable HARD examples

### 1994 / 1995 manager questions — score 92

The competing managers come from the same decade and neighboring seasons.

This is strong historical interference and is a sensible structural Hard pattern.

### 2011–2013 season-summary group — score about 89

The Q2 policy intentionally selects neighboring seasons with the same league and similar title profile.

Structurally these options are extremely close.

However, the actual summary text may contain unique clues not represented in the current score, so this result has lower confidence than the manager example.

---

# 9. Critical Finding — Current Quiz Is Hard-skewed by Construction

The main Q3 discovery is not the exact threshold.

It is this:

> Q2 currently selects the **closest plausible distractors** almost every time. Therefore many generators are structurally biased toward Hard questions.

This is especially visible in:

- SEASON_RANK: 30 / 32 Hard
- SEASON_SUMMARY: 31 / 33 Hard

Do **not** fix this by changing score thresholds until the distribution looks pretty.

The score is revealing a construction policy decision.

Future question selection should be able to choose among candidate distractor sets with different structural distances rather than always taking the nearest three.

That is a later construction / selection problem, not a reason to falsify Q3.

---

# 10. Misclassification / Model Risk

## SEASON_SUMMARY — Confidence MEDIUM-LOW

Missing factor:

- semantic clue richness / uniqueness in the actual stem

The summary may mention a uniquely identifying player, final, relegation, trophy, or manager even if its three year options are temporally close.

Q3 therefore keeps the score but records this limitation explicitly.

Do not expose Summary difficulty bands to users yet.

## SEASON_RANK — Confidence MEDIUM

The high Hard rate may be real for exact-rank questions because Q2 deliberately uses adjacent numeric options.

But this also raises a Q5 significance question:

> Is exact final rank in a routine season worth asking at all?

Do not answer that inside Q3.

## PLAYER_POSITION — UNMODELED

The four options are always GK / DF / MF / FW.

Current data does not provide enough defensible structural variation to produce a useful estimate without introducing unsupported assumptions about role rarity or player familiarity.

Keep it unmodeled rather than inventing precision.

## PLAYER_OVERLAP — UNMODELED / DISABLED

Trust-disabled until registration interval evidence exists.

---

# 11. Q3 Decision

**PASS — structural estimate baseline**

Confidence:

**MEDIUM**

Why Pass:

- scoring rule is explicit and machine-readable
- same inputs produce deterministic outputs
- 107 trusted item constructions are observable
- multiple bands exist
- PLAYER_NUMBER spans all three bands
- no Trust / provenance rule was weakened
- the system distinguishes structural prediction from observed difficulty
- CI generates a reusable baseline artifact
- model limitations are explicitly recorded instead of hidden

What Q3 does not claim:

- true user difficulty
- optimal Easy / Medium / Hard thresholds
- optimal distribution
- learning value
- adaptive selection

---

# 12. Research Debt

1. Observe true item difficulty after sufficient response histories exist.
2. Develop a better semantic clue-richness measure for SEASON_SUMMARY before user-facing difficulty labels.
3. Decide whether PLAYER_POSITION needs a structural difficulty model at all.
4. Do not use current bands as a gamification badge.
5. Keep Q5 significance separate from difficulty.

---

# 13. Next Gate — Q4 Coverage / Balance

Q4 should not merely count questions.

It must measure:

`availability × generation policy × era × category × generator × difficulty`

The first Q4 question is:

> If a user simply presses “next” repeatedly today, what history are they statistically likely to see — and what history is nearly invisible?

Q4 should use the Q3 baseline rather than inventing a new disconnected dataset.
