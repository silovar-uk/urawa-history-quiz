# UI 05 — Visual System

## Direction

`Archive × Editorial × Football × Urawa Identity`

浦和レッズらしさは、ロゴ・写真・赤面積の多さではなく、色・形・余白・タイポグラフィの一貫した使い方で表現する。

目標：
- generic quiz appに見えない
- sports news dashboardに見えない
- 赤いfan siteに見えない
- 公式サイトの模倣にも見えない
- それでも一目で「浦和の歴史を扱うプロダクト」と感じられる

---

## 1. Color Roles

### White / Off-white — Reading Surface
- 本文
- 問題文
- History
- Season Detail
- 長時間読む領域

白は「空白」ではなく、資料を読む面として使う。

### Black / Near-black — Structure
- 本文
- 強い見出し
- Primary CTA
- 年代の数字
- UIの骨格

黒は強さ・構造・コントラストを担当する。

### Urawa Red — Identity / Direction
- 現在地
- active state
- Section marker
- Historyへの入口
- 重要なアクセント
- 小さなブランドサイン

赤を背景面として常用しない。
画面の大部分を赤くしない。

### Semantic colors
Correct / Wrong / Focusはブランド色と分離する。

- Correct：独立したpositive color
- Wrong：独立したerror color
- Focus：WCAGを満たす独立したfocus color

「赤＝不正解」にしない。

※正確なクラブCIカラー値を利用する場合は、公式ガイドライン確認後にtokenへ反映する。

---

## 2. Diamond Motif

ダイヤは浦和らしさを補助するshape languageとして使う。

### Good uses
- Timeline node
- Active navigation marker
- Section marker
- Selected stateの小さな印
- Historyへのdirection cue
- 年代と年代をつなぐ節点
- Progress上のmilestone

### Avoid
- 背景全面の連続パターン
- 大量の装飾ダイヤ
- 全ボタンのdiamond化
- テキストを読みづらくする斜めレイアウト
- ロゴ代替としての過剰利用

### Rule
1画面に強いdiamond表現は原則1箇所まで。
小さな補助表現は複数可だが、情報階層より目立たせない。

Diamondは「Decorative shape」ではなく「History node / Current state / Direction」の意味を持たせる。

---

## 3. Typography

### Year
- 最も強いdisplay role
- oversized
- compact line-height
- 太く、記憶のアンカーになる
- 装飾より数字そのものを見せる

### Question
- bold
- compact
- 選択肢より明確に上位
- 1画面内で読み切れることを優先

### Editorial Headline
Season / History / Player Detailでは、Quizとは少し違う編集的な見出し階層を作る。

### Supporting copy
読みやすい日本語sans-serifを基本とする。

### Metadata
- small
- restrained
- uppercase英字は補助用途のみ
- 日本語情報より主張させない

---

## 4. Shape

- Card乱用禁止
- Border / spacing / typographyで階層を作る
- 大きな角丸はQuiz optionなど明確な操作要素に限定
- shadowは原則不要
- 直線を基本とし、diamond / diagonalはアクセントとして限定利用

UI全体を丸く・柔らかくしすぎない。
「強いが威圧的ではない」「硬質だが読みやすい」を狙う。

---

## 5. Spacing

Spacingは装飾より重要。

優先順位：
1. 情報グループを余白で分ける
2. 必要ならborder
3. それでも必要な場合のみcard

画面全体に一定のvertical rhythmを持たせる。

---

## 6. Navigation

Bottom Navigationは機能一覧ではなく、現在地を示す骨格として設計する。

Active state候補：
- red line
- small red diamond
- black text + red marker

赤背景タブの連続は避ける。

---

## 7. Timeline

HistoryはDiamond motifが最も自然に機能する領域。

候補：
- 年代ノードをdiamond化
- current / selected yearのみ赤
- 通常年は黒またはneutral
- タイトル獲得年など重要イベントに別の強弱を付ける

ただし「全34年が赤いダイヤ」にならないよう階層化する。

---

## 8. Quiz Answer State

回答前：
- Neutral
- 赤を正解予告に使わない

回答後：
- Correct / Wrongはsemantic color
- 赤はHistoryへ潜る導線など、ブランド文脈に残す

正誤演出よりMemory Hookを視覚的に強くできるか検討する。

---

## 9. Motion

- answer feedback：小さく短い変化
- Timeline transition：必要なら軽微
- Diamond marker：過剰に回転・跳ねさせない
- confetti禁止
- page transitionは控えめ
- prefers-reduced-motion対応

Motionの目的は「楽しくする」より「状態変化を理解しやすくする」。

---

## 10. Desktop

Desktopをスマホ幅の紙面を中央に置くだけで終わらせない。

Desktopで検討する：
- Timeline + Detailの関係
- 年代の俯瞰
- 2-columnの限定利用
- 大きなYear typography
- Archive browserらしい余白

ただしMobileとの情報構造は共通に保つ。

---

## 11. Visual Rejection Conditions

以下になった案は却下する。

- 画面の赤面積が主役になる
- Diamondが単なる柄になる
- 何でもcard化する
- 角丸・shadowでgeneric SaaS化する
- 正誤よりブランド赤が混乱を起こす
- Yearよりdecorative elementが目立つ
- Historyよりnavigationが目立つ
- 公式サイトや公式エンブレムを模倣する
- 「浦和らしい」の説明が赤色だけで終わる

---

## 12. Visual Pass Criteria

主要画面について：

- grayscaleでも情報階層が成立する
- 赤を消しても操作構造が理解できる
- 赤を戻すと浦和らしい現在地・方向性が加わる
- Diamondを消しても機能する
- Diamondを戻すと浦和固有のリズムが加わる
- Yearが最も記憶に残る
- 3秒で画面目的が分かる

最終目標：

**Red / White / Black / Diamond を足したUIではなく、それらが自然に構造へ溶け込んだURAWA HISTORY。**
