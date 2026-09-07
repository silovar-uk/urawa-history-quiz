# Development Plan

## 0. Goal

浦和レッズの歴史を「読む」だけではなく、クイズを入口に繰り返し思い出しながら学べるGitHub Pagesアプリを作る。

このプロダクトの基本ループは以下。

`Question → Answer → Memory Hook → History → Next Question`

単発の雑学クイズではなく、歴史DBを中心に、選手・監督・シーズン・ユニフォームを相互に行き来しながら覚えられる学習ツールを目指す。

---

# 1. Development Principles

## 1.1 Facts first, questions second

問題文を大量に手入力しない。

まず歴史的事実を構造化DBとして保存し、クイズはDBとQuiz Templateから生成する。

## 1.2 Mobile first

PC版を縮小するのではなく、スマートフォンを主利用環境として設計する。

想定利用シーン：

- 電車
- 待ち時間
- 試合前
- スタジアムへの移動中
- 就寝前

1〜5問だけでも成立することを重視する。

## 1.3 Build narrow, then expand

最初から浦和レッズ全史を完成させない。

まず少数シーズンでDB・Quiz Engine・UIの弱点を発見し、構造が安定してから対象年代を拡大する。

## 1.4 Quiz and History are one experience

QuizとHistoryを別機能として分断しない。

回答後にその選手・監督・シーズンへ移動でき、History閲覧中から関連Quizへ戻れる構造を作る。

## 1.5 Source traceability

事実データには必ず出典を紐付ける。

情報の修正・確認・再検証ができることを、データ量より優先する。

---

# 2. Overall Architecture

```text
Historical Data
      ↓
Data Validation
      ↓
Quiz Eligibility
      ↓
Quiz Engine
      ↓
Learning History
      ↓
UI
```

GitHub Pages上で静的サイトとして動作させる。

初期構成：

- HTML / CSS / JavaScript
- JSONによる歴史DB
- localStorageによる学習履歴
- 外部画像URLによるユニフォーム表示

フレームワークは、必要性が明確になるまでは導入を固定しない。

---

# 3. Milestones

## M0 — Repository & Product Definition

### Purpose

開発前にプロダクト思想とUI思想を固定する。

### Tasks

- README整備
- Product Principles
- Information Architecture
- Quiz Flow
- History Browser
- Visual System
- Mobile Rules
- UI Audit
- Development Plan

### Done when

- 別のAI・開発者がRepositoryを見るだけで思想と優先順位を理解できる
- 「普通の4択クイズアプリ」に戻る余地が少ない

### Status

進行済み。

---

## M1 — Clickable UI Prototype

### Purpose

実データ投入前に、中心となる学習ループを触って確認する。

### Screens

- TODAY
- QUIZ / unanswered
- QUIZ / answered
- HISTORY Timeline
- Season Detail
- YOU

### Core flow

```text
TODAY
↓
QUESTION
↓
ANSWER
↓
MEMORY HOOK
├─ NEXT QUESTION
└─ EXPLORE SEASON
      ↓
    HISTORY
      ↓
  QUIZ THIS TOPIC
```

### Audit

- 390px前後で使いやすいか
- 1問1画面に近いか
- CTAが競合していないか
- 回答後の説明が長すぎないか
- Bottom Navigationが邪魔にならないか

### Done when

主要5画面について、3秒以内に「何をする画面か」が分かる。

### Status

初期prototype作成済み。

---

# 4. Phase 1 — Data Schema

## Purpose

全シーズンへ拡張しても破綻しない歴史DB構造を決める。

## Initial entities

### seasons.json

候補フィールド：

- season_id
- year
- league_name
- league_rank
- points
- wins
- draws
- losses
- goals_for
- goals_against
- summary
- verification_status
- source_ids

### players.json

- player_id
- name
- name_kana
- nationality
- birth_date
- position_raw
- position_group
- source_ids

### player_seasons.json

- player_id
- season_id
- shirt_number
- position
- registration_start
- registration_end

### managers.json

- manager_id
- name
- nationality
- source_ids

### manager_tenures.json

- manager_id
- season_id
- start_date
- end_date
- notes

### uniforms.json

- uniform_id
- season_id
- type
- image_url
- source_page_url
- image_status
- rights_note
- source_ids

### sources.json

- source_id
- title
- publisher
- url
- accessed_at
- source_type

## Decisions required

- 在籍の定義
- 同時在籍の定義
- シーズン途中加入・退団
- 再加入
- 途中監督交代
- ポジション表記揺れ
- 年度とシーズン表記
- 大会名称変更
- 同姓同名
- 出典競合

## Done when

3シーズン分の実データを入れても、スキーマ変更なしで表現できる。

---

# 5. Phase 2 — 2006 Complete Season

## Purpose

最初の「完全に遊べる1シーズン」を作る。

2006年を最初の基準シーズン候補とする。

## Collect

- シーズン情報
- リーグ順位
- 勝点・勝敗
- 監督
- 全選手
- 背番号
- ポジション
- 選手在籍期間
- 各大会結果
- シーズン説明
- HOMEユニフォーム
- AWAYユニフォーム
- 主要な出来事
- 出典

## Important

データ収集と確定を同一工程にしない。

```text
Collect
↓
Normalize
↓
Source check
↓
Human / AI audit
↓
Confirmed
```

## Done when

2006年だけなら、以下の問題タイプが成立する。

- PLAYER_TENURE
- PLAYER_POSITION
- PLAYER_OVERLAP
- UNIFORM_SEASON
- SEASON_DESCRIPTION
- SEASON_RANK
- MANAGER_TENURE

---

# 6. Phase 3 — Quiz Engine MVP

## Purpose

問題そのものを保存せず、DBから問題を生成する。

## Quiz templates

### PLAYER_TENURE

「この選手が浦和に在籍したのはいつ？」

### PLAYER_POSITION

「この選手のポジションは？」

### PLAYER_OVERLAP

「この選手と同時期に在籍していた選手は？」

### UNIFORM_SEASON

「これは何年のユニフォーム？」

### SEASON_DESCRIPTION

「この説明は何年のシーズン？」

### SEASON_RANK

「このシーズンの順位は？」

### MANAGER_TENURE

「この監督が浦和を率いたのはいつ？」

## Requirements

- 正解は必ず1つ
- 誤答は同カテゴリから生成
- 近い年代を優先
- 意味的に重複する選択肢は禁止
- データ不足なら出題しない
- source未確認データは原則出題しない

## Distractor strategy

完全ランダムは禁止。

例：

- 年代問題 → 前後数年
- 選手問題 → 近い年代の選手
- 監督問題 → 前後の監督
- Kit問題 → 近年モデル
- Position問題 → 近い役割

## Done when

2006年データから最低50問相当を手入力なしで生成できる。

---

# 7. Phase 4 — Quiz UX Integration

## Purpose

現在のUI prototypeへQuiz Engineを接続する。

## Tasks

- real question rendering
- answer validation
- feedback
- Memory Hook
- Next Question
- Explore Season
- Quiz This Topic

## Answered state

回答後に表示するのは以下まで。

1. 正誤
2. 正答
3. Memory Hook 1件
4. Explore
5. Next

長い解説を毎回出さない。

## Done when

```text
Question → Answer → Memory Hook → History → Question
```

が実データで途切れず成立する。

---

# 8. Phase 5 — Multi-era Stress Test

## Purpose

2006年専用設計になっていないか確認する。

## Add two seasons

年代を離して追加する。

候補：

- 1990年代 × 1
- 2006
- 2020年代 × 1

## Stress cases

- 長い選手名
- 外国籍選手名
- 同姓同名
- 複数回在籍
- シーズン途中加入
- シーズン途中退団
- 監督途中交代
- 複数ポジション
- 長いseason summary
- 画像なし
- 画像URL切れ
- 同順位の複数年

## Done when

3年代を同じUI・同じDB Schema・同じQuiz Engineで扱える。

---

# 9. Phase 6 — History Browser

## Purpose

クイズで得た点の知識を、歴史の流れへつなげる。

## Timeline

Historyトップは年表を基本とする。

年をクリックしてSeason Detailへ入る。

## Season Detail

優先表示：

1. Year
2. League Result
3. Season Summary
4. Manager
5. Kit
6. Players
7. Competitions
8. Quiz this season

## Player Detail

- 在籍期間
- シーズン
- 背番号
- ポジション
- 関連選手
- Quiz this player

## Manager Detail

- 在籍期間
- 指揮シーズン
- 主な成績
- Quiz this manager

## Kit Archive

ユニフォームを「画像資料」ではなく、年代記憶の視覚アンカーとして扱う。

## Done when

History閲覧がWikipedia的なレコード閲覧ではなく、「年代を辿る」体験になっている。

---

# 10. Phase 7 — Learning History

## Purpose

単なる正答率ではなく、自分がどこまで浦和史を理解しているかを見る。

## localStorage MVP

- attempts
- correct_count
- incorrect_count
- last_answered_at
- recently_wrong

## Derived views

- Era mastery
- Category mastery
- Recently wrong
- Unseen

## YOU screen

例：

```text
1990s   40%
2000s   82%
2010s   62%
2020s   76%

PLAYER   82%
MANAGER  61%
SEASON   74%
KIT      48%
```

## Avoid

- XP
- coin
- ranking
- loot box的演出

## Done when

「何問解いたか」より「どの年代・カテゴリが曖昧か」が分かる。

---

# 11. Phase 8 — Historical DB Expansion

## Purpose

構造が安定した後に対象年代を広げる。

## Expansion order

1. Prototype 3 seasons
2. 2000年代
3. 2010年代
4. 2020年代
5. 1990年代
6. 全史監査

※実際の収集効率・出典品質を見て順番は変更可。

## Progress metrics

- seasons complete
- players complete
- managers complete
- uniforms complete
- source verification rate
- needs_review count

## Done when

DB完成度を定量的に把握できる。

---

# 12. Phase 9 — Data Quality Audit

## Required statuses

- confirmed
- needs_review
- disputed

## Checks

- duplicate player
- duplicate season relationship
- impossible tenure
- missing source
- broken image URL
- quiz ambiguity
- duplicate answer options
- incorrect overlap
- inconsistent position labels

## Rule

`needs_review` / `disputed` のデータは原則Quiz Eligibilityから除外する。

---

# 13. Phase 10 — Visual Polish

## Purpose

機能が成立してから視覚表現を磨く。

## Audit themes

- 赤の使用量
- Year typography
- spacing rhythm
- card乱用
- border hierarchy
- image ratio
- feedback motion
- reduced motion
- dark modeの必要性
- official identityとの距離

## Target direction

`Archive × Editorial × Football`

避ける：

- generic quiz app
- sports news dashboard
- 赤背景だらけのfan site
- 浦和公式サイトの模倣

---

# 14. Deployment

## GitHub Pages

Repositoryから静的サイトとして公開する。

初期はmain branchからのPages公開で十分。

将来的にbuild stepが必要になった場合のみGitHub Actions導入を検討する。

## Deployment checks

- direct URL access
- mobile viewport
- broken assets
- cache
- back navigation
- 404 handling
- image fallback

---

# 15. Testing Strategy

## Functional

- question generation
- one correct answer
- answer validation
- next question
- History navigation
- localStorage

## Data

- source exists
- relationship integrity
- tenure overlap
- uniform availability

## UX

- 390px
- long names
- image missing
- low data state
- empty learning history
- large learning history

## Accessibility

- keyboard operation
- focus visibility
- color-independent state communication
- touch target size
- reduced motion

---

# 16. Definition of MVP

MVPは「全シーズンが入った状態」ではない。

以下が成立した時点をMVPとする。

- 3シーズン以上の検証済みデータ
- 主要Quiz Templateが動く
- DBから自動生成
- 4択回答
- Memory Hook
- Season Detail
- Timeline
- localStorage学習履歴
- Mobile UI
- GitHub Pages公開

---

# 17. Do Not Build Yet

初期段階では以下を後回しにする。

- 全選手の一括収集
- 全ユニフォーム画像保存
- ログイン
- クラウド同期
- SNSランキング
- XP / coin
- 高度なAI出題
- 複雑な適応学習アルゴリズム
- 大規模SPA化
- 管理画面

必要性が実際の利用から確認できたものだけ追加する。

---

# 18. Immediate Next Actions

## Priority 1

GitHub Pagesで現在のprototypeを公開し、スマホ実機で確認する。

## Priority 2

Historical DB Schemaを確定する。

## Priority 3

2006年のSource Listを作る。

## Priority 4

2006年のSeason / Manager / Players / UniformsをJSON化する。

## Priority 5

2006年からQuiz Engine MVPを作る。

---

# 19. Next Planning Round

次回計画では以下を具体化する。

### Data Acquisition Plan

- 何をどのサイトから取得するか
- 一次情報優先順位
- 自動化できる範囲
- 手動確認が必要な範囲

### Schema Specification

JSON Schema相当まで各フィールドを確定する。

### 2006 Vertical Slice

2006年を対象に、

`Source → DB → Quiz → UI → Learning History`

を一本通す。

### UI Stress Test

実データを入れ、現在のprototypeを一度壊して再設計する。

---

# 20. Success Condition

最終的な成功状態は、「問題数が多いこと」ではない。

ユーザーがアプリを繰り返し使うことで、

- 年を見て、その年の選手・監督・ユニフォームを連想できる
- 選手を見て、その選手がいた時代を連想できる
- ユニフォームを見て、そのシーズンの出来事を思い出せる
- 各年代が孤立した知識ではなく、一本のクラブ史としてつながる

状態を目指す。
