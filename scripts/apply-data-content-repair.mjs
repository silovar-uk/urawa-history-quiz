#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const p = rel => path.join(root, rel);
const readJson = rel => JSON.parse(fs.readFileSync(p(rel), 'utf8'));
const writeJson = (rel, value) => fs.writeFileSync(p(rel), `${JSON.stringify(value, null, 2)}\n`);

function loadWindowObject(rel, key) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(p(rel), 'utf8'), sandbox, { filename: rel });
  return JSON.parse(JSON.stringify(sandbox.window[key] || {}));
}

function writeWindowObject(rel, key, value, header) {
  const body = `${header}\nwindow.${key} = Object.freeze(${JSON.stringify(value, null, 2)});\n`;
  fs.writeFileSync(p(rel), body);
}

function mustFind(arr, predicate, label) {
  const item = arr.find(predicate);
  if (!item) throw new Error(`Missing expected entity: ${label}`);
  return item;
}

function addSource(sources, source) {
  const existing = sources.find(s => s.source_id === source.source_id);
  if (existing) Object.assign(existing, source);
  else sources.push(source);
}

function upsertClaim(registry, entityType, entityId, fields) {
  let claim = (registry.claims || []).find(c => c.entityType === entityType && c.entityId === entityId);
  if (!claim) {
    claim = { entityType, entityId, fields: {} };
    registry.claims.push(claim);
  }
  claim.fields = { ...(claim.fields || {}), ...fields };
}

function upsertContext(registry, ctx) {
  const index = (registry.contexts || []).findIndex(x => x.context_id === ctx.context_id);
  if (index >= 0) registry.contexts[index] = ctx;
  else registry.contexts.push(ctx);
}

const seasons = readJson('data/seasons.json');
const players = readJson('data/players.json');
const playerSeasons = readJson('data/player_seasons.json');
const managers = readJson('data/managers.json');
const managerTenures = readJson('data/manager_tenures.json');
const uniforms = readJson('data/uniforms.json');
const sources = readJson('data/sources.json');
const provenance = loadWindowObject('data/provenance-claims.js', 'URAWA_CLAIM_PROVENANCE');
const uniformContexts = loadWindowObject('data/uniform-contexts.js', 'URAWA_UNIFORM_CONTEXTS');
provenance.claims ||= [];
provenance.issues ||= [];
uniformContexts.contexts ||= [];

// ---------------------------------------------------------------------------
// Sources added in the Research Gate. All are official sources.
// ---------------------------------------------------------------------------
[
  {
    source_id: 'SRC_JLEAGUE_FUKUDA_1995',
    title: 'Jリーグアウォーズ司会者紹介（福田正博プロフィール）',
    publisher: '公益社団法人日本プロサッカーリーグ',
    url: 'https://www.jleague.jp/news/article/23628/',
    source_type: 'official',
    accessed_at: '2026-09-07'
  },
  {
    source_id: 'SRC_JLEAGUE_AWARDS_HISTORY',
    title: '大会の歴史・Jリーグアウォーズ歴代受賞者',
    publisher: '公益社団法人日本プロサッカーリーグ',
    url: 'https://www.jleague.jp/corporate/about_competitions/tournament_history/',
    source_type: 'official',
    accessed_at: '2026-09-07'
  },
  {
    source_id: 'SRC_JLEAGUE_2000_TOSU_VGOAL',
    title: '記憶に残るJリーグのVゴールTOP10（土橋正樹）',
    publisher: '公益社団法人日本プロサッカーリーグ',
    url: 'https://www.jleague.jp/news/article/15590/?mode=pc',
    source_type: 'official',
    accessed_at: '2026-09-07'
  },
  {
    source_id: 'SRC_URAWA_KIT_2008_SAVAS_DHL',
    title: '2008レプリカユニホーム販売のお知らせ',
    publisher: '浦和レッドダイヤモンズ株式会社',
    url: 'https://www.urawa-reds.co.jp/clubinfo/33173/',
    source_type: 'official',
    accessed_at: '2026-09-07'
  },
  {
    source_id: 'SRC_URAWA_KIT_2011_SAVAS',
    title: '新ユニフォーム、販売開始！',
    publisher: '浦和レッドダイヤモンズ株式会社',
    url: 'https://www.urawa-reds.co.jp/clubinfo/24257/',
    source_type: 'official',
    accessed_at: '2026-09-07'
  },
  {
    source_id: 'SRC_URAWA_MANAGER_2011_HORI',
    title: '堀 孝史ユース監督、トップチーム監督就任について',
    publisher: '浦和レッドダイヤモンズ株式会社',
    url: 'https://www.urawa-reds.co.jp/topteamtopics/7734/',
    source_type: 'official',
    accessed_at: '2026-09-07'
  },
  {
    source_id: 'SRC_URAWA_MANAGER_2024_IKEDA',
    title: '池田伸康コーチ 暫定監督就任について',
    publisher: '浦和レッドダイヤモンズ株式会社',
    url: 'https://www.urawa-reds.co.jp/topteamtopics/216250/',
    source_type: 'official',
    accessed_at: '2026-09-07'
  },
  {
    source_id: 'SRC_URAWA_MANAGER_2024_SKORZA',
    title: 'マチェイ スコルジャ氏 監督就任に関する契約合意のお知らせ',
    publisher: '浦和レッドダイヤモンズ株式会社',
    url: 'https://www.urawa-reds.co.jp/topteamtopics/216248/',
    source_type: 'official',
    accessed_at: '2026-09-07'
  }
].forEach(s => addSource(sources, s));

// ---------------------------------------------------------------------------
// A. Confirmed factual repairs.
// ---------------------------------------------------------------------------
const s1995 = mustFind(seasons, s => s.season_id === '1995', 'season 1995');
s1995.summary = 'オジェック監督のもと福田正博が日本人初となるJリーグ得点王（32得点）に輝き、サントリーシリーズ3位、年間4位と大躍進。';
s1995.key_events = (s1995.key_events || []).map(v => v.replace('福田正博が日本人初のJ1得点王（27得点）', '福田正博が日本人初のJリーグ得点王（32得点）'));
if (!s1995.source_ids.includes('SRC_JLEAGUE_FUKUDA_1995')) s1995.source_ids.push('SRC_JLEAGUE_FUKUDA_1995');

const ps1995Fukuda = mustFind(playerSeasons, x => x.id === 'ps_1995_fukuda', 'ps_1995_fukuda');
ps1995Fukuda.memory_hook = '32ゴールを叩き出し、日本人初となるJリーグ得点王に輝いた。';

const s1996 = mustFind(seasons, s => s.season_id === '1996', 'season 1996');
s1996.key_events = (s1996.key_events || []).map(v => v === '岡野雅行がJリーグ新人王を受賞' ? '岡野雅行がJリーグベストイレブン・フェアプレー個人賞を受賞' : v);
if (!s1996.source_ids.includes('SRC_JLEAGUE_AWARDS_HISTORY')) s1996.source_ids.push('SRC_JLEAGUE_AWARDS_HISTORY');

const ps1996Okano = mustFind(playerSeasons, x => x.id === 'ps_1996_okano', 'ps_1996_okano');
ps1996Okano.memory_hook = '快速を武器に躍動し、Jリーグベストイレブン・フェアプレー個人賞を受賞した。';

const kit1996 = mustFind(uniforms, x => x.uniform_id === 'kit_1996', 'kit_1996');
kit1996.description = '岡野雅行がベストイレブンに選出される活躍を見せた、1シーズン制イヤーのキット。';

const s2000 = mustFind(seasons, s => s.season_id === '2000', 'season 2000');
s2000.summary = '「1年でのJ1復帰」を誓ったJ2シーズン。最終節・鳥栖戦の延長前半5分（95分）、土橋正樹の劇的Vゴールで2位となりJ1復帰を果たした。';
s2000.key_events = (s2000.key_events || []).map(v => v.includes('土橋正樹のVゴール') ? '最終節・鳥栖戦で土橋正樹が延長前半5分（95分）にVゴールを決め、J1昇格決定' : v);
if (!s2000.source_ids.includes('SRC_JLEAGUE_2000_TOSU_VGOAL')) s2000.source_ids.push('SRC_JLEAGUE_2000_TOSU_VGOAL');

const ps2000Tsuchihashi = mustFind(playerSeasons, x => x.id === 'ps_2000_tsuchihashi', 'ps_2000_tsuchihashi');
ps2000Tsuchihashi.memory_hook = 'J2最終節・鳥栖戦の延長前半5分（95分）に劇的Vゴールを決め、1年でのJ1復帰をもたらした英雄。';

const playerFixes = [
  ['ps_2006_washington', 'shirt_number', 21],
  ['ps_2006_yamada', 'position', 'MF'],
  ['ps_2006_tsuzuki', 'shirt_number', 23],
  ['ps_2006_okano', 'shirt_number', 30]
];
for (const [id, field, value] of playerFixes) mustFind(playerSeasons, x => x.id === id, id)[field] = value;

// ---------------------------------------------------------------------------
// B. Legacy uniform archive repairs where official evidence is direct.
// Quiz truth remains data/uniform-contexts.js.
// ---------------------------------------------------------------------------
const kit2007 = mustFind(uniforms, x => x.uniform_id === 'kit_2007', 'kit_2007');
kit2007.chest_sponsor = 'SAVAS';
kit2007.description = '国内大会用は胸にSAVAS。ACL等の国際大会ではDHLを掲出し、アジア初制覇と世界3位を達成した。';

const kit2008 = mustFind(uniforms, x => x.uniform_id === 'kit_2008', 'kit_2008');
kit2008.chest_sponsor = 'SAVAS';
kit2008.description = 'リーグ戦用1stは胸にSAVAS。国際試合用はDHLを掲出したNike製キット。';

const kit2011 = mustFind(uniforms, x => x.uniform_id === 'kit_2011', 'kit_2011');
kit2011.chest_sponsor = 'SAVAS';
kit2011.description = '国内1stユニフォームは胸にSAVAS。J1残留を懸けた2011シーズンのNike製キット。';

upsertContext(uniformContexts, {
  context_id: 'uc_2008_domestic_home', season_id: '2008', year: 2008, type: 'HOME',
  competition_scope: 'domestic', competition_label: 'Jリーグ・国内カップ', chest_sponsor: 'SAVAS',
  verification_status: 'confirmed', source_ids: ['SRC_URAWA_KIT_2008_SAVAS_DHL']
});
upsertContext(uniformContexts, {
  context_id: 'uc_2008_international_home', season_id: '2008', year: 2008, type: 'HOME',
  competition_scope: 'international', competition_label: '国際大会', chest_sponsor: 'DHL',
  verification_status: 'confirmed', source_ids: ['SRC_URAWA_KIT_2008_SAVAS_DHL']
});
upsertContext(uniformContexts, {
  context_id: 'uc_2011_domestic_home', season_id: '2011', year: 2011, type: 'HOME',
  competition_scope: 'domestic', competition_label: 'Jリーグ・国内カップ', chest_sponsor: 'SAVAS',
  verification_status: 'confirmed', source_ids: ['SRC_URAWA_KIT_2011_SAVAS']
});
uniformContexts.version = 'data-repair-2026-09-07';

// ---------------------------------------------------------------------------
// C. Convert repaired 2006 relations from known issue to positive provenance.
// ---------------------------------------------------------------------------
const claim2006 = [
  ['ps_2006_washington', { shirt_number: { value: 21, sourceIds: ['SRC_URAWA_SQUAD_2006', 'SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'FW', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } }],
  ['ps_2006_yamada', { shirt_number: { value: 6, sourceIds: ['SRC_URAWA_SQUAD_2006', 'SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'MF', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } }],
  ['ps_2006_tsuzuki', { shirt_number: { value: 23, sourceIds: ['SRC_URAWA_SQUAD_2006', 'SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'GK', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } }],
  ['ps_2006_okano', { shirt_number: { value: 30, sourceIds: ['SRC_URAWA_SQUAD_2006', 'SRC_URAWA_RFILE_2006_J1'] }, position: { value: 'FW', sourceIds: ['SRC_URAWA_RFILE_2006_J1'] } }]
];
for (const [id, fields] of claim2006) upsertClaim(provenance, 'player_season', id, fields);

provenance.issues = (provenance.issues || []).filter(issue => ![
  'ps_2006_washington', 'ps_2006_yamada', 'ps_2006_tsuzuki', 'ps_2006_okano', 'kit_2007'
].includes(issue.entityId));
provenance.version = 'data-repair-2026-09-07';

// ---------------------------------------------------------------------------
// D. Represent directly sourced manager changes instead of hiding them in notes.
// ---------------------------------------------------------------------------
let ikeda = managers.find(m => m.manager_id === 'nobuyasu_ikeda');
if (!ikeda) {
  managers.push({
    manager_id: 'nobuyasu_ikeda', name: '池田 伸康', name_en: 'Nobuyasu IKEDA', nationality: 'Japan',
    birth_date: '1970-05-18', source_ids: ['SRC_URAWA_MANAGER_2024_IKEDA']
  });
} else if (!ikeda.source_ids.includes('SRC_URAWA_MANAGER_2024_IKEDA')) ikeda.source_ids.push('SRC_URAWA_MANAGER_2024_IKEDA');

const t2011 = mustFind(managerTenures, x => x.tenure_id === 'tenure_2011_petrovic_z', 'tenure_2011_petrovic_z');
t2011.notes = 'シーズン開幕から指揮し、10月20日に契約解除。第30節から堀孝史監督へ交代。';
t2011.source_ids = [...new Set([...(t2011.source_ids || []), 'SRC_URAWA_MANAGER_2011_HORI'])];
if (!managerTenures.some(x => x.tenure_id === 'tenure_2011_hori')) {
  managerTenures.push({
    tenure_id: 'tenure_2011_hori', manager_id: 'takafumi_hori', season_id: '2011', role: '監督', titles_won: [],
    notes: '10月20日にトップチーム監督へ就任し、第30節から最終節まで指揮してJ1残留を達成。',
    source_ids: ['SRC_URAWA_MANAGER_2011_HORI']
  });
}

const t2024 = mustFind(managerTenures, x => x.tenure_id === 'tenure_2024_hogmo', 'tenure_2024_hogmo');
t2024.notes = 'シーズン開幕から指揮し、8月27日に監督職を解除。池田伸康コーチの暫定指揮を経てスコルジャ監督へ交代。';
t2024.source_ids = [...new Set([...(t2024.source_ids || []), 'SRC_URAWA_MANAGER_2024_SKORZA'])];
if (!managerTenures.some(x => x.tenure_id === 'tenure_2024_ikeda')) {
  managerTenures.push({
    tenure_id: 'tenure_2024_ikeda', manager_id: 'nobuyasu_ikeda', season_id: '2024', role: '暫定監督', titles_won: [],
    notes: '8月27日のヘグモ監督職解除後、スコルジャ監督就任まで暫定的にトップチームを指揮。',
    source_ids: ['SRC_URAWA_MANAGER_2024_IKEDA']
  });
}
if (!managerTenures.some(x => x.tenure_id === 'tenure_2024_skorza')) {
  managerTenures.push({
    tenure_id: 'tenure_2024_skorza', manager_id: 'maciej_skorza', season_id: '2024', role: '監督', titles_won: [],
    notes: 'ヘグモ監督職解除後、池田伸康コーチの暫定指揮を経て監督に復帰。',
    source_ids: ['SRC_URAWA_MANAGER_2024_SKORZA']
  });
}

// ---------------------------------------------------------------------------
// E. Issue registry. Fixed issues remain as history; uncertain claims stay open.
// ---------------------------------------------------------------------------
const issues = [
  { id: 'ISSUE_1995_FUKUDA_GOALS', classification: 'CONFIRMED_ERROR', status: 'FIXED', entity_type: 'season/player_season', entity_id: '1995/ps_1995_fukuda', field: 'summary/key_events/memory_hook', current_value: '27 goals', expected_value: '32 goals', source_ids: ['SRC_JLEAGUE_FUKUDA_1995'], notes: 'Jリーグ公式プロフィールで50試合32得点、日本人初の得点王を確認。' },
  { id: 'ISSUE_1996_OKANO_ROOKIE', classification: 'CONFIRMED_ERROR', status: 'FIXED', entity_type: 'season/player_season/uniform', entity_id: '1996/ps_1996_okano/kit_1996', field: 'award text', current_value: '岡野雅行が新人王', expected_value: '新人王は斉藤俊秀。岡野はベストイレブン・フェアプレー個人賞。', source_ids: ['SRC_JLEAGUE_AWARDS_HISTORY'], notes: '複数表示面の誤記を同時修正。' },
  { id: 'ISSUE_2000_PROMOTION_MATCH', classification: 'CONFIRMED_ERROR', status: 'FIXED', entity_type: 'season/player_season', entity_id: '2000/ps_2000_tsuchihashi', field: 'opponent/time', current_value: '水戸戦（鳥栖戦）/延長後半', expected_value: '鳥栖戦/延長前半5分（95分）', source_ids: ['SRC_JLEAGUE_2000_TOSU_VGOAL'], notes: 'Jリーグ公式のVゴール記事で確認。' },
  { id: 'ISSUE_2006_PLAYER_RELATIONS', classification: 'CONFIRMED_ERROR', status: 'FIXED', entity_type: 'player_season', entity_id: 'ps_2006_washington,ps_2006_yamada,ps_2006_tsuzuki,ps_2006_okano', field: 'shirt_number/position', current_value: 'multiple', expected_value: 'Washington #21; Yamada MF; Tsuzuki #23; Okano #30', source_ids: ['SRC_URAWA_SQUAD_2006', 'SRC_URAWA_RFILE_2006_J1'], notes: 'base dataを修正しclaim-level provenanceへ昇格。' },
  { id: 'ISSUE_KIT_2007', classification: 'MODEL_ERROR', status: 'FIXED', entity_type: 'uniform', entity_id: 'kit_2007', field: 'chest_sponsor', current_value: 'DHL as generic season value', expected_value: 'domestic SAVAS / international DHL', source_ids: ['SRC_URAWA_KIT_2007_SAVAS_DHL'], notes: 'legacy archiveは国内値SAVASへ修正。Quizはcompetition-aware contextを使用。' },
  { id: 'ISSUE_KIT_2008', classification: 'MODEL_ERROR', status: 'FIXED', entity_type: 'uniform', entity_id: 'kit_2008', field: 'chest_sponsor', current_value: 'DHL as generic season value', expected_value: 'league domestic SAVAS / international DHL', source_ids: ['SRC_URAWA_KIT_2008_SAVAS_DHL'], notes: '浦和公式販売案内がリーグ戦用SAVASと国際試合用DHLを明示。' },
  { id: 'ISSUE_KIT_2011', classification: 'CONFIRMED_ERROR', status: 'FIXED', entity_type: 'uniform', entity_id: 'kit_2011', field: 'chest_sponsor', current_value: 'DHL', expected_value: 'SAVAS for domestic 1st', source_ids: ['SRC_URAWA_KIT_2011_SAVAS'], notes: '浦和公式販売案内で1st SAVASを確認。' },
  { id: 'ISSUE_KIT_2004', classification: 'UNVERIFIED', status: 'BLOCKED', entity_type: 'uniform', entity_id: 'kit_2004', field: 'chest_sponsor', current_value: 'Vodafone', expected_value: null, source_ids: ['SRC_URAWA_KIT_2005_VODAFONE'], notes: '2005公式発表がVodafoneを新パートナーとするため疑義あり。ただし2004の直接一次資料を今回確保できず、推測修正しない。' },
  { id: 'ISSUE_KIT_2009_2010_2012', classification: 'UNVERIFIED', status: 'BLOCKED', entity_type: 'uniform', entity_id: 'kit_2009,kit_2010,kit_2012', field: 'chest_sponsor', current_value: 'DHL', expected_value: null, source_ids: [], notes: 'SAVASトップパートナー継続を示す公式情報はあるが、このRoundでは各年の国内胸ロゴを直接証明する一次ページを揃え切れていないため変更しない。' },
  { id: 'ISSUE_MANAGER_TENURES_LEGACY', classification: 'COVERAGE_GAP', status: 'OPEN', entity_type: 'manager_tenure', entity_id: '1997,1999,2000,2001,2008,2017,2018,2019', field: 'multiple tenures', current_value: 'change information often stored only in notes', expected_value: 'one row per actual tenure/interim period', source_ids: [], notes: '2011と2024は今回構造化。残りは年別一次資料Researchを要する。' },
  { id: 'ISSUE_SOURCE_GRANULARITY', classification: 'COVERAGE_GAP', status: 'OPEN', entity_type: 'season', entity_id: '1992-2025', field: 'source_ids', current_value: 'many records rely on broad root sources', expected_value: 'claim-specific sources for important textual claims', source_ids: [], notes: 'source presenceとclaim verificationを分離して継続改善する。' }
];

// ---------------------------------------------------------------------------
// Write canonical sources and registries.
// ---------------------------------------------------------------------------
writeJson('data/seasons.json', seasons);
writeJson('data/players.json', players);
writeJson('data/player_seasons.json', playerSeasons);
writeJson('data/managers.json', managers);
writeJson('data/manager_tenures.json', managerTenures);
writeJson('data/uniforms.json', uniforms);
writeJson('data/sources.json', sources);
writeJson('data/issues.json', issues);
writeWindowObject('data/provenance-claims.js', 'URAWA_CLAIM_PROVENANCE', provenance, '// URAWA HISTORY — claim-level provenance registry\n// Only explicitly sourced field claims may pass the Quiz Trust Gate.');
writeWindowObject('data/uniform-contexts.js', 'URAWA_UNIFORM_CONTEXTS', uniformContexts, '// URAWA HISTORY — competition-aware uniform context facts\n// Quiz-safe kit facts live here. Legacy uniforms.json is archive/display data.');

console.log(JSON.stringify({
  repaired: ['1995 Fukuda goals', '1996 Okano award', '2000 Tosu V-goal context', '2006 player relations', '2007/2008/2011 kit archive'],
  managerTenuresAdded: ['2011 Hori', '2024 Ikeda interim', '2024 Skorza'],
  sources: sources.length,
  issues: issues.length,
  provenanceClaims: provenance.claims.length,
  uniformContexts: uniformContexts.contexts.length
}, null, 2));
