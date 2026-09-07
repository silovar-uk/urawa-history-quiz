# UI Answered State Native Round

Updated: 2026-09-07

Status: **PASS — Variant B+ selected; subsequently integrated into production**

Experiment comparison:

- `prototype/experiments/answered-state-native-ui.html`
- `prototype/experiments/answered-state-native-ui-winner.html`

Production `prototype/app.js` / `prototype/styles.css` were intentionally not changed in this round.

---

# 1. Question

> Can one answer transform a generic quiz state into the feeling of arriving at a specific place in Urawa Reds history, without making the next question harder to reach?

The target experience is not “show more explanation after answering.”

It is:

`Question → Answer → Memory → Time Context → Next / Explore`

---

# 2. Research

## Urawa identity

Official reference:

https://www.urawa-reds.co.jp/club/phirosophy.php

The club explicitly values:

- authenticity / 本物志向
- harmony / 調和
- innovation and tradition / 革新と伝統
- integrity / 誠実さ

The philosophy also explains that the stadium experience deliberately avoids unnecessary elements so football, player performance, and supporter-created atmosphere remain central.

UI implication:

> Urawa identity should emerge from restraint, hierarchy, and meaningful intensity rather than decorative football imagery.

Official 2026/27 uniform reference:

https://e-shop.urawa-reds.co.jp/special/2026_2027reds_uniform

The HOME shirt keeps traditional red / white / black while translating supporter noise into an embossed lightning motif that is subtle at first glance and reveals intensity through detail.

UI implication:

> Quiet first, power second.

## Accessibility baseline

References:

- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA22.html

Rules retained:

- ordinary buttons remain ordinary buttons
- primary controls target roughly 48–50px height
- answer updates use a polite status region
- color is not the only state signal
- no drag-only interaction
- reduced motion preserves the same information hierarchy

---

# 3. Urawa Identity Definition

Working definition:

> **静かな面に、強い芯がある。**

Translated into UI:

- White = field for reading / archive
- Black = structure / strength
- Red = current place / meaningful Urawa direction
- Diamond = connection node
- Year = place
- Spine = time
- Echo = relational memory
- Pulse = temporary meaningful state change

Rejected identity shortcuts:

- “Urawa = lots of red”
- “Urawa = diamonds everywhere”
- “Urawa = stadium / supporter photo background”
- “Urawa = dramatic football graphics”

---

# 4. Fun Definition

Fun is not external gamification.

No:

- XP
- coins
- confetti
- streak-first UI
- ranking

Target fun:

**Discovery Pleasure**

> 「それとこれ、つながっていたのか。」

The reward after answering is a newly visible relationship in time.

---

# 5. Cool Definition

Cool is defined as:

- restraint
- precision
- hierarchy
- contrast
- timing
- confidence without visual noise

Principle:

**QUIET FIRST / POWER SECOND**

Before answer:

- neutral
- sparse
- question-focused

After answer:

- semantic correctness state appears
- History context appears
- Red gains meaning because it remains scarce

---

# 6. Shu / Ha / Ri

## 守 — Standard

Keep:

- one question, one screen
- obvious options
- clear answer result
- memory text
- obvious Next action
- accessible buttons / focus / status feedback

Variant A represents this control.

## 破 — Break the screen boundary

Challenge:

- Quiz and History must be separate screens
- Year is only metadata
- Timeline belongs only in History

Variant B reveals a small History Spine only after answer.

## 離 — Native grammar

Native language:

`YEAR / SPINE / DIAMOND / FIELD / ECHO / PULSE`

Variant C tests a stronger transformation where the answer state becomes “2006 as a place.”

The round concludes that the native grammar is useful, but the strongest transformation is not automatically the best UX.

---

# 7. Variants

## A — STANDARD

Structure:

`Result → Answer → Memory → Actions`

Strengths:

- clearest
- shortest
- lowest implementation risk
- strongest continuation to next question

Weaknesses:

- weak historical orientation
- little product-specific identity
- remains close to a well-designed generic quiz

Role:

Control / 守.

---

## B — SPINE REVEAL

Structure:

`Result → Answer → Memory → 3-year Spine → 1-line Echo → Actions`

Strengths:

- creates historical orientation without navigation
- keeps Next as Primary
- makes Year functional rather than decorative
- Red Diamond has a single semantic role: current quiz year
- adjacent-year preview supports discovery
- mobile cost is controlled

Risk:

- too much explanatory copy turns the reveal into another panel
- 5-year horizontal scroll is unnecessary for the first production slice

Critic revision:

Reduce to **B+**:

- 3 years only
- no explanatory headline
- no “PLACE IT IN HISTORY” paragraph
- one-line Echo
- current year = red node
- preview = black node
- Next remains first / Primary action

---

## C — DEEP REVEAL

Structure:

`Result → large Year transformation → Hero Answer → Memory → compressed temporal relation → Actions`

Strengths:

- strongest surprise
- strongest “arrived in 2006” feeling
- strongest editorial / identity expression

Weaknesses:

- answer state becomes a new scene rather than a continuation
- competes with Next
- more scroll pressure on small mobile
- stronger motion / layout dependency
- risks making every answer feel ceremonious

Decision:

Keep as future inspiration, not first production candidate.

---

# 8. Heuristic Comparison

This is not empirical user testing. It is a design / accessibility / product-principle review.

Score: 1–5.

| Criterion | A | B | C |
|---|---:|---:|---:|
| UX clarity | 5 | 5 | 4 |
| Next-question continuity | 5 | 5 | 4 |
| History comprehension | 1 | 5 | 4 |
| Memory value | 3 | 5 | 5 |
| Urawa identity | 2 | 5 | 5 |
| Fun / discovery | 2 | 4 | 5 |
| Coolness | 3 | 5 | 5 |
| Surprise | 1 | 4 | 5 |
| Mobile cost | 5 | 5 | 3 |
| Accessibility simplicity | 5 | 5 | 4 |
| Implementation risk | 5 | 4 | 3 |
| Longevity | 4 | 5 | 4 |

Interpretation:

A is safest but not native enough.

C is most expressive but over-rotates the answer state into a new destination.

B offers the strongest balance.

---

# 9. Winner

## **B+ — Minimal Spine Reveal**

Why:

> It changes the meaning of the screen without changing the user's task.

The user still understands:

1. Was I correct?
2. What is the correct answer?
3. What should I remember?
4. What happens next?

But one additional thing becomes visible:

5. Where does this answer sit in Urawa history?

This is the desired surprise.

---

# 10. B+ Specification

Before answer:

- no Spine
- no History preview
- no decorative red expansion
- question remains first visual priority

After answer:

1. Result
2. Correct answer
3. Memory Echo
4. Three-year History Spine
5. One-line selected-year Echo
6. Next Question — Primary
7. Explore Year — Secondary

Spine:

- previous / current / next only
- current quiz year: `aria-current=true`, red diamond
- adjacent preview: `aria-pressed=true`, black diamond
- changing preview does not navigate
- explicit Explore action handles navigation

Motion:

- 200ms-ish small reveal
- no bounce / spin / flash
- reduced-motion = immediate appearance

---

# 11. Mobile Audit

Target: around 390px.

B+ decisions specifically made for mobile:

- 3-year grid instead of 5-year scroll
- no required horizontal scrolling
- Next remains immediately after History context
- 50px Primary CTA
- options remain 60px minimum height
- square-ish 5px radius instead of large SaaS rounding
- numeric 01 / 02 / 03 / 04 option markers

Expected cost:

Approximately one small additional context block after answer, not a second full screen.

---

# 12. Accessibility Audit

PASS candidate:

- buttons use native button semantics
- dynamic feedback uses `role=status`, polite live announcement, atomic update
- current year and preview selection use separate ARIA semantics
- minimum-size interactive targets comfortably exceed WCAG 2.5.8 minimum
- important controls target ~48–50px
- state remains understandable without red
- no drag requirement
- reduced motion removes transform reveal without removing content

Production integration still requires keyboard / screen-reader testing inside the real app lifecycle.

---

# 13. Originality Tests

## Grayscale

PASS.

Hierarchy / timing / year relation still work.

## No Diamond

PASS.

Years and connecting line still communicate sequence.

## No Urawa Name

Partial PASS.

The experience remains more archive-native than generic quiz UI because the answer reveals a time relation. Brand specificity weakens, as expected.

## Static Screenshot

Only partial differentiation.

Important originality appears in the operation:

**History is absent before answer and emerges after curiosity is resolved.**

This is desirable.

## Three-year longevity

PASS candidate.

The proposal avoids trend-heavy glass, gradients, 3D, card stacks, and large decorative motion.

## Explanation Test

B+ removes explanatory UI copy from the winner.

PASS candidate.

---

# 14. Rejected Ideas

- History Spine always visible before answer
- full 34-season timeline inside Quiz
- 5-year horizontal scroll as mandatory context
- automatic navigation after answer
- full-screen red answer state
- confetti / trophy animation
- diamond-shaped controls everywhere
- stadium photo as answer background
- large “YOU ARE HERE” explanation block
- turning Explore into Primary
- Deep Reveal as first production integration

---

# 15. PASS / FAIL

**PASS**

Reason:

- Standard control remains available
- B/B+ creates meaningful historical context
- Next Question remains primary
- Urawa identity is explainable through restraint / time / connection, not only brand color
- surprise comes from semantic reveal rather than animation volume
- mobile and accessibility costs remain controlled

---

# 16. Production Gate

Do **not** redesign Today / History / You / Desktop yet.

Next production slice should change only:

1. Quiz option visual grammar
2. Answered State labels / emoji removal
3. Memory Hook → Memory Echo presentation
4. B+ three-year Spine Reveal
5. Explore-Year secondary action

Production implementation must preserve:

- Quiz Trust
- Q2 distractor logic
- Q3 measurement
- Q4 research instrumentation

---

# 17. Next Research Question

> When B+ is integrated into the real Quiz flow, does the extra three-year context improve historical orientation without reducing “Next Question” continuation or increasing mobile scroll friction?

Measure before expanding the grammar to History / Season / Player screens.

---

# 18. Subsequent Production Integration

B+ was later integrated into the production prototype without expanding the redesign to Today / History / You / Desktop.

Production integration report:

`docs/ui-bplus-production-integration.md`

Permanent automated UI contract:

`scripts/ui-answered-state-audit.mjs`

Important distinction:

- design / implementation gate: **PASS**
- empirical user-behavior validation: **PENDING**
