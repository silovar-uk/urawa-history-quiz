# Data Contract — URAWA HISTORY

Updated: 2026-09-07

This document defines what each historical data file means, what `confirmed` means, and what is allowed to reach the Quiz Trust Gate.

---

# 1. Core Rule

`DATA EXISTS ≠ VERIFIED`

`SOURCE EXISTS ≠ CLAIM VERIFIED`

`RECORD VERIFIED ≠ EVERY FIELD VERIFIED`

Unknown is a valid state. Do not replace unknown with a guess.

---

# 2. Canonical Runtime Flow

Canonical source:

`data/*.json`

plus explicit claim/context registries:

- `data/provenance-claims.js`
- `data/uniform-contexts.js`
- `data/issues.json`

Generated runtime fallback:

- `data/data-bundle.js`

`data/data-bundle.js` is generated and must not be edited manually.

Build:

`node scripts/build-data-bundle.mjs`

Check:

`node scripts/build-data-bundle.mjs --check`

---

# 3. Season

File: `data/seasons.json`

Primary key:

`season_id`

Required for a normal season record:

- season_id
- year
- league_name
- matches
- wins
- draws
- losses
- goals_for
- goals_against
- goal_difference
- titles
- summary
- memory_hook
- key_events
- verification_status
- source_ids

Rules:

- `wins + draws + losses = matches`
- `goals_for - goals_against = goal_difference`
- when league_rank exists, `1 <= league_rank <= total_teams`
- `verification_status: confirmed` does not mean every sentence in summary / memory_hook / key_events has claim-level provenance
- important textual claims should progressively receive specific evidence

---

# 4. Player

File: `data/players.json`

Primary key:

`player_id`

Entity-level sources may establish identity, but do not automatically prove:

- a season membership
- a season shirt number
- a season registered position

Those belong to Player Season provenance.

---

# 5. Player Season

File: `data/player_seasons.json`

Primary key:

`id`

Logical relation:

`player × season`

Fields may include:

- player_id
- season_id
- shirt_number
- position
- memory_hook

Quiz eligibility for shirt number / registered position requires exact field-level evidence through `data/provenance-claims.js`.

A player master source is not sufficient evidence for a player-season claim.

`PLAYER_OVERLAP` remains ineligible without registration interval / equivalent overlap evidence.

---

# 6. Manager

File: `data/managers.json`

Primary key:

`manager_id`

Stores manager identity, not a season claim.

---

# 7. Manager Tenure

File: `data/manager_tenures.json`

Primary key:

`tenure_id`

Logical relation:

`manager × season × tenure`

One season may contain multiple tenure rows.

Use separate rows for:

- permanent manager change
- interim / caretaker manager
- manager return during the same season

Do not hide known manager changes only inside a single row's notes.

`role` must distinguish values such as:

- 監督
- 暫定監督
- 総監督

Quiz eligibility remains fail-closed when a season contains multiple relevant tenures or ambiguous roles unless the question wording explicitly resolves the context.

---

# 8. Uniform Archive

File: `data/uniforms.json`

Purpose:

Archive / display convenience.

It must not be treated as the sole source of Quiz truth when sponsor values differ by competition.

For years with competition-specific chest sponsors, the legacy `chest_sponsor` should represent the verified domestic HOME context when such a value is confirmed, while descriptions should disclose important competition variation.

---

# 9. Uniform Context

File: `data/uniform-contexts.js`

Logical key:

`season_id × type × competition_scope`

Required fields:

- context_id
- season_id
- year
- type
- competition_scope
- competition_label
- chest_sponsor
- verification_status
- source_ids

This is the authoritative Quiz source for chest-sponsor questions.

Do not merge domestic and international values into one generic answer.

---

# 10. Source

File: `data/sources.json`

Primary key:

`source_id`

Preferred order:

1. Urawa Reds official
2. J.League official / official data
3. Competition official
4. Official publication / record
5. High-trust secondary source

A site-root source can establish general provenance but should not be treated as proof of every textual claim.

Specific claim pages are preferred.

---

# 11. Claim Provenance

File: `data/provenance-claims.js`

Purpose:

Bind an exact base-data field value to one or more sources.

Example logical claim:

`player-season ps_2006_washington -> shirt_number = 21 -> official source`

A claim is valid only if:

- entity exists
- field exists
- base value matches claim value
- every source ID exists

Trust Gate must fail closed when any condition is missing.

---

# 12. Issue Registry

File: `data/issues.json`

Classifications:

- CONFIRMED_ERROR
- MODEL_ERROR
- UNVERIFIED
- COVERAGE_GAP

Statuses:

- OPEN
- BLOCKED
- FIXED
- ACCEPTED_UNKNOWN

Fixed issues remain in the registry as historical regression evidence.

Do not delete an issue merely because it was fixed.

---

# 13. Verification Semantics

`confirmed`

Means the record is admitted into the current data system with known source support appropriate to its current use.

It does **not** mean:

- every prose clause has been independently verified
- every related entity is complete
- the database is exhaustive

For high-risk Quiz facts, claim-level / context-level provenance overrides broad record status.

---

# 14. Null Semantics

`null` means unknown / not represented / not applicable depending on the field contract.

Never silently convert unknown to zero, empty-string fact, or guessed historical value.

---

# 15. QA Gates

Required automated gates:

- Data Integrity Audit
- Runtime bundle sync check
- Quiz Trust Audit
- Quiz Quality Audit
- Structural Difficulty Audit

Data Integrity ERROR blocks release.

WARNING records known incompleteness and does not authorize guessing.

---

# 16. Change Procedure

For historical data changes:

1. Research primary sources
2. Record evidence
3. Classify issue
4. Change canonical data
5. Update claim/context provenance where applicable
6. Rebuild runtime bundle
7. Run integrity + Quiz audits
8. Manually review affected season surfaces
9. Update issue status / current state

Do not start at step 4.
