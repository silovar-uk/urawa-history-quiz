# Historical DB スキーマ仕様書

## 概要
浦和レッズ歴史クイズアプリで使用する構造化データ（JSON）の定義および命名規則を定めます。
本設計は「Facts first, questions second（事実はDBに持ち、問題は生成する）」の原則に従います。

---

## エンティティ一覧

| ファイル | エンティティ名 | 説明 |
| :--- | :--- | :--- |
| `sources.json` | 出典 | 記録・ファクトの参照元（一次情報、公式記録等） |
| `seasons.json` | シーズン | 年度ごとの大会成績、順位、勝点、要約、記憶フック |
| `managers.json` | 監督マスタ | 監督の基本情報（氏名、生年月日、国籍等） |
| `manager_tenures.json` | 監督在任 | 監督とシーズンの紐付け、任期、獲得タイトル |
| `players.json` | 選手マスタ | 選手の基本情報（氏名、カナ、生年月日、国籍等） |
| `player_seasons.json` | 選手在籍 | 選手とシーズンの紐付け、背番号、ポジション、出場記録等 |
| `uniforms.json` | ユニフォーム | シーズンごとのキット情報（色、特徴、画像参照等） |

---

## 1. sources.json
出典情報を管理します。

```json
[
  {
    "source_id": "SRC_JLEAGUE_DATA",
    "title": "J.LEAGUE Data Site",
    "publisher": "公益社団法人日本プロサッカーリーグ",
    "url": "https://data.j-league.or.jp/",
    "source_type": "official",
    "accessed_at": "2026-09-07"
  }
]
```

- `source_id` (string, 必須): 一意のID（例: `SRC_JLEAGUE_DATA`）
- `title` (string, 必須): 資料名
- `publisher` (string, 必須): 発行元・運営元
- `url` (string, 任意): 参照URL
- `source_type` (string, 必須): `official` / `book` / `media`
- `accessed_at` (string, 必須): 確認日（ISO 8601形式）

---

## 2. seasons.json
シーズン単位のクラブ記録を保持します。

```json
[
  {
    "season_id": "2006",
    "year": 2006,
    "league_name": "J1",
    "league_rank": 1,
    "total_teams": 18,
    "points": 68,
    "matches": 34,
    "wins": 22,
    "draws": 6,
    "losses": 6,
    "goals_for": 67,
    "goals_against": 28,
    "goal_difference": 39,
    "titles": ["J1リーグ優勝", "天皇杯優勝", "ゼロックススーパーカップ優勝"],
    "summary": "ギド・ブッフバルト体制3年目。最終節でG大阪との直接対決を制し、クラブ史上悲願のJ1リーグ初優勝を達成した伝説のシーズン。",
    "memory_hook": "最終節・超満員の埼スタでワシントンが2発。悲願のJ1初戴冠と天皇杯連覇を成し遂げた。",
    "key_events": [
      "J1リーグ初制覇（勝点68）",
      "ワシントンが得点王（26得点）",
      "田中マルクス闘莉王が最優秀選手賞（MVP）受賞",
      "天皇杯全日本サッカー選手権大会連覇（元日決勝でG大阪に勝利）"
    ],
    "verification_status": "confirmed",
    "source_ids": ["SRC_JLEAGUE_DATA", "SRC_URAWA_OFFICIAL"]
  }
]
```

---

## 3. managers.json & manager_tenures.json

### managers.json
```json
[
  {
    "manager_id": "guido_buchwald",
    "name": "ギド・ブッフバルト",
    "name_en": "Guido BUCHWALD",
    "nationality": "Germany",
    "birth_date": "1961-01-24",
    "source_ids": ["SRC_JLEAGUE_DATA"]
  }
]
```

### manager_tenures.json
```json
[
  {
    "tenure_id": "tenure_buchwald_2006",
    "manager_id": "guido_buchwald",
    "season_id": "2006",
    "role": "監督",
    "tenure_type": "full_season",
    "titles_won": ["J1リーグ", "天皇杯", "ゼロックススーパーカップ"],
    "notes": "このシーズン限りで勇退。",
    "source_ids": ["SRC_JLEAGUE_DATA"]
  }
]
```

---

## 4. players.json & player_seasons.json

### players.json
```json
[
  {
    "player_id": "makoto_hasebe",
    "name": "長谷部 誠",
    "name_kana": "ハセベ マコト",
    "name_en": "Makoto HASEBE",
    "nationality": "Japan",
    "birth_date": "1984-01-18",
    "primary_position": "MF",
    "source_ids": ["SRC_JLEAGUE_DATA"]
  }
]
```

### player_seasons.json
```json
[
  {
    "id": "ps_2006_hasebe",
    "player_id": "makoto_hasebe",
    "season_id": "2006",
    "shirt_number": 17,
    "position": "MF",
    "league_matches": 32,
    "league_goals": 2,
    "memory_hook": "中盤で躍動しボランチとしてリーグ制覇に大きく貢献。背番号17を背負った。",
    "source_ids": ["SRC_JLEAGUE_DATA"]
  }
]
```

---

## 5. uniforms.json
ユニフォーム情報を管理します。

```json
[
  {
    "uniform_id": "kit_2006_home",
    "season_id": "2006",
    "type": "HOME",
    "supplier": "Nike",
    "chest_sponsor": "Vodafone",
    "main_color": "#E6002D",
    "description": "赤のシャツ、白のパンツ、黒のソックス。衿付きで伝統的な赤白黒のクラシックなトリコロール。",
    "image_url": "https://example.com/kits/2006_home.png",
    "image_status": "placeholder",
    "source_ids": ["SRC_URAWA_OFFICIAL"]
  }
]
```

---

## 6. クイズ適格性（Quiz Eligibility）ルール
1. `verification_status` が `confirmed` のデータのみを出題対象とする。
2. 誤答（ディストラクター）は、同一エンティティ群（同じシーズン、同じポジション、近隣年代）から自動選定する。
3. 選択肢に意味的な重複（同姓同名、同一シーズン等）が発生しないようにフィルタリングを行う。
