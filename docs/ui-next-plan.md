# UI Next Plan

## Goal
プロトタイプを「見た目のサンプル」から「実データを入れても壊れない学習UI」へ進める。

## Round 11 — Wireframe validation
対象:
- TODAY
- QUIZ / unanswered
- QUIZ / answered
- SEASON DETAIL
- YOUR URAWA

確認:
- 390pxで1問1画面が成立するか
- 情報の主役が1つに絞れているか
- CTAが競合していないか
- 年代が視覚的アンカーとして機能するか

完了条件:
各画面について「3秒で何をする画面か分かる」。

## Round 12 — Real-content stress test
3シーズンだけ検証済みデータを入れる。
年代は離して選ぶ。

確認:
- 長い選手名
- 複数回在籍
- 途中加入 / 途中退団
- 監督交代
- 画像なし / URL切れ
- 長いシーズン説明
- 同順位の複数年

完了条件:
実データを入れてもレイアウトと正答の一意性が壊れない。

## Round 13 — Quiz interaction
追加:
- answer state
- wrong again
- next question
- explore fact
- keyboard操作
- reduced motion

完了条件:
Question → Answer → Memory Hook → History → Quiz が途切れない。

## Round 14 — History browsing
追加:
- Timeline
- Season detail
- Player detail
- Manager detail
- Kit archive

完了条件:
「DBを見る」のではなく「年代をたどる」体験になっている。

## Round 15 — Learning model
追加:
- attempts
- correct / incorrect
- last_answered_at
- recently_wrong
- era/category mastery

完了条件:
正答率だけでなく「どこが得意・曖昧か」を見せられる。

## Round 16 — Visual refinement
監査:
- 赤の使用量
- card乱用
- typography hierarchy
- spacing rhythm
- dark mode要否
- official club identityとの距離

完了条件:
「汎用クイズアプリ」でも「赤いファンサイト」でもなく、Archive × Editorial × Footballになっている。

## Implementation order
1. Repository作成
2. 現スターター投入
3. GitHub Pages有効化
4. Prototype DB 3シーズン
5. Quiz Engine最小実装
6. UI stress test
7. History browser
8. Learning history
9. Visual polish
10. Historical DB expansion

## Do not do yet
- 全選手収集
- 全ユニフォーム画像収集
- 高度な適応学習
- XP / coin / ranking
- 大規模SPA化
- 公式ロゴ・画像の無断保存
