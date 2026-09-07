# Q5 Significance / Memory Hook — Head Start Plan

Updated: 2026-09-07

Status: **NOW / DESIGN HEAD START ONLY**

Q4 baseline:

- season selection itself is essentially uniform
- famous-year selection ratio is 0.997 against uniform expectation
- runtime category exposure is SEASON 66.221% / MANAGER 26.319% / KIT 4.130% / PLAYER 3.330%
- much of PLAYER / KIT invisibility comes from provenance concentration amplified by season-first selection

Q5 must not respond by forcing category equality.

---

# 1. Central Question

> Which safe facts deserve repetition or prominence because they matter to Urawa history — not merely because they are easy to generate, difficult to answer, famous, or currently underexposed?

Q5 defines **editorial / learning significance**.

It does not yet change runtime weighting.

---

# 2. Keep Four Axes Separate

Never collapse these into one score without an explicit later decision.

## A. Evidence Confidence

Question gate only.

Examples:

- verified provenance
- safe relation / context
- no ambiguity

A fact with weak evidence must not receive exposure simply because it is historically important.

## B. Structural Difficulty

Already modeled by Q3.

Difficulty answers:

> How hard does the option structure appear before response data exists?

It does not answer whether the fact matters.

## C. Historical / Learning Significance

New Q5 layer.

Significance answers:

> Why is this fact worth carrying into the supporter’s mental map of Urawa history?

## D. Runtime Exposure / Session Variety

Measured by Q4.

Later selection policy may combine significance with unseen/recent/repetition logic, but Q5 itself must not implement that weighting.

---

# 3. Proposed Knowledge Unit

Before scoring significance, define a stable knowledge unit separate from a rendered multiple-choice question.

Candidate shape:

```text
knowledge_id
fact_type
season_id
category
entity_ids[]
claim_reference / source-backed fact reference
memory_hook
significance
```

One knowledge unit may later support more than one question rendering.

Do not equate `question_id` with `knowledge_id` automatically.

---

# 4. Candidate Significance Dimensions

Use a small explainable rubric. Avoid fake precision.

Recommended dimensions for research:

## Club History Importance

Does the fact materially explain the club’s historical trajectory?

## Turning-Point Value

Does it mark a beginning, ending, promotion, relegation, title, recovery, collapse, regime change, or other meaningful transition?

## Identity Value

Does it help explain people, teams, symbols, or practices strongly associated with Urawa identity?

## Supporter Cultural Memory

Is the fact likely to function as a shared reference point across supporters rather than a disconnected statistic?

This requires careful editorial evidence and should not be reduced to social popularity.

## Transformation Value

Does it explain tactical, organizational, competitive, commercial, stadium, or structural change?

## Connectivity Value

Does understanding this fact unlock relationships to multiple other seasons, people, managers, kits, competitions, or events?

## Era Representation Value

Does the fact help represent an era or phase that would otherwise lack a meaningful anchor?

This is not an automatic bonus for an underexposed year.

---

# 5. Suggested Rating Form

Prefer ordinal levels over an apparently scientific 0–100 score in the first round.

Candidate:

- 0 — incidental
- 1 — useful context
- 2 — meaningful
- 3 — defining

Every non-zero dimension should carry a short reason.

Example data concept:

```json
{
  "knowledge_id": "...",
  "significance": {
    "club_history": 3,
    "turning_point": 2,
    "identity": 2,
    "supporter_memory": 1,
    "transformation": 1,
    "connectivity": 3,
    "era_representation": 2,
    "reasons": ["..."]
  }
}
```

Do not implement this schema until representative cases show that the dimensions are separable and useful.

---

# 6. First Research Slice

Do not score all 131 safe constructions immediately.

Select a deliberately varied sample across:

- early J.League years
- J2 / return years
- first major title era
- league-title / ACL era
- transition / difficult seasons
- later ACL / modern era
- PLAYER / MANAGER / SEASON / KIT
- currently highly exposed and currently starved categories
- EASY / MEDIUM / HARD / UNMODELED structural states

The slice should contain enough contrasts to expose weaknesses in the rubric, not enough rows to look comprehensive.

Recommended size:

**12–20 knowledge candidates**

---

# 7. Critic Questions

A separate review pass must challenge every high-significance assignment:

1. Is this genuinely important, or merely famous?
2. Is it important to club history, or only easy to narrate?
3. Is “supporter memory” being guessed without evidence?
4. Are titles automatically crowding out failure / transition / recovery?
5. Are recent seasons receiving an availability advantage?
6. Is an underrepresented era being promoted solely to make a chart balanced?
7. Does the fact connect to other knowledge, or is it trivia with a dramatic label?
8. Would the reason remain persuasive if the current Q4 exposure percentages were hidden?

If the answer to 8 is no, significance is contaminated by exposure balancing.

---

# 8. Memory Hook Relationship

Q5 should distinguish:

- **Significance** — why the fact deserves attention
- **Memory Hook** — how to make the fact retrievable after attention

A high-significance fact can still have a weak Memory Hook.

A vivid Memory Hook does not make a low-significance fact historically important.

Future Memory Hook quality criteria may include:

- compactness
- relational cue
- concrete image / event
- contrast with adjacent years
- connection to person / place / competition
- no answer leakage before response

Do not optimize prose before significance is stable.

---

# 9. Q5 First Artifacts

Recommended implementation order:

1. `docs/q5-significance-model.md` — final rubric after representative review
2. a small reviewed significance fixture / registry
3. `scripts/quiz-significance-audit.mjs` — schema / explanation invariants
4. Q5 baseline artifact
5. only then consider a runtime selection experiment

Do not create permanent runtime weighting in the first Q5 batch.

---

# 10. Q5 Pass Gate

Q5 may advance when:

- significance is represented separately from evidence confidence, difficulty, and exposure
- representative cases can be scored with explainable reasons
- critic review can reject weak / fame-only assignments
- title seasons do not automatically monopolize significance
- quiet / failure / transition seasons can earn significance for defensible reasons
- supporter-memory claims are not invented
- the model can explain why a fact deserves repetition or prominence
- no Trust Gate relaxation is introduced

---

# 11. What Q5 Must Not Do

- force PLAYER / KIT to a target percentage
- use Q4 underexposure itself as significance evidence
- make “famous” synonymous with “important”
- use structural difficulty as importance
- use source quantity as importance
- score all 131 constructions before testing the rubric
- call editorial judgment objective truth
- implement adaptive learning
- redesign the UI

---

# 12. First Action

IF WE DO ONLY ONE THING NEXT:

> Build and critic-test a significance rubric on 12–20 deliberately contrasting, source-safe knowledge candidates, while hiding current exposure percentages during the scoring pass. Then compare the finished significance judgments back against Q4 exposure to discover where editorial importance and engine exposure genuinely diverge.
