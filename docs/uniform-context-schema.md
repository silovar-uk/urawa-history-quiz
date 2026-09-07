# Uniform Context Schema

Updated: 2026-09-07

This document is the quiz-eligibility addendum for uniform sponsor facts.

---

# 1. Why this exists

`data/uniforms.json` is a season-level archive record.

A season can use different chest partners / marks depending on competition.
Therefore `season_id + HOME + chest_sponsor` is not always enough to form an unambiguous quiz fact.

For quiz eligibility, use the competition-aware registry:

`data/uniform-contexts.js`

---

# 2. Logical Key

A quiz-safe uniform context is identified by:

`season_id + type + competition_scope`

Current `type` support:

- `HOME`

Current `competition_scope` examples:

- `domestic`
- `international`

The human-readable wording belongs in `competition_label`.

---

# 3. Record Shape

```js
{
  context_id: 'uc_2007_domestic_home',
  season_id: '2007',
  year: 2007,
  type: 'HOME',
  competition_scope: 'domestic',
  competition_label: 'Jリーグ・国内カップ',
  chest_sponsor: 'SAVAS',
  verification_status: 'confirmed',
  source_ids: ['SRC_URAWA_KIT_2007_SAVAS_DHL']
}
```

Required for quiz eligibility:

- `context_id`
- `season_id`
- `type`
- `competition_scope`
- `competition_label`
- `chest_sponsor`
- `verification_status = confirmed`
- at least one `source_id`

---

# 4. Source Rule

A context is not eligible merely because a legacy uniform row exists.

The source must support the stated competition context and chest value.

Prefer:

1. club official announcement
2. league / competition official record
3. official archived material

Do not infer international sponsor from domestic kit or vice versa.

---

# 5. Relationship to uniforms.json

`uniforms.json` remains useful for:

- supplier
- color
- visual description
- archive browsing
- placeholder image state

For quiz questions about chest sponsor / chest mark:

`uniform-contexts.js` is authoritative.

If there is no eligible context:

- do not trust the legacy `chest_sponsor` value for quiz generation
- fail closed
- display it only if explicitly labelled unverified / archive-only

---

# 6. Quiz Wording Rule

Bad:

`2007年のHOMEユニフォームの胸スポンサーは？`

Good:

`2007年シーズンのJリーグ・国内カップ用HOMEユニフォームの胸スポンサーは？`

Good:

`2007年シーズンのAFCチャンピオンズリーグ等の国際大会用HOMEユニフォームの胸スポンサーは？`

The competition label is part of the correctness contract.

---

# 7. Current Verified Slice

- 2005 domestic → Vodafone
- 2007 domestic → SAVAS
- 2007 international → DHL
- 2013 domestic → POLUS
- 2013 international / ACL → MITSUBISHI MOTORS

This is a vertical slice, not a claim of full historical kit completeness.

---

# 8. Future Migration

Once enough historical contexts are verified:

1. consider moving this JS registry into canonical JSON,
2. generate runtime bundle deterministically,
3. normalize or deprecate ambiguous season-level `chest_sponsor` in `uniforms.json`,
4. preserve source-backed competition context as the quiz truth.
