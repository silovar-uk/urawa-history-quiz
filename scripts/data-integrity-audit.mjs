#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const p = rel => path.join(root, rel);
const readJson = rel => JSON.parse(fs.readFileSync(p(rel), 'utf8'));

function loadWindowObject(rel, key) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(p(rel), 'utf8'), sandbox, { filename: rel });
  return JSON.parse(JSON.stringify(sandbox.window[key] || {}));
}

const db = {
  seasons: readJson('data/seasons.json'),
  players: readJson('data/players.json'),
  playerSeasons: readJson('data/player_seasons.json'),
  managers: readJson('data/managers.json'),
  managerTenures: readJson('data/manager_tenures.json'),
  uniforms: readJson('data/uniforms.json'),
  sources: readJson('data/sources.json'),
  issues: fs.existsSync(p('data/issues.json')) ? readJson('data/issues.json') : []
};
const provenance = loadWindowObject('data/provenance-claims.js', 'URAWA_CLAIM_PROVENANCE');
const uniformContexts = loadWindowObject('data/uniform-contexts.js', 'URAWA_UNIFORM_CONTEXTS');

const errors = [];
const warnings = [];
const checks = [];
const sourceIds = new Set(db.sources.map(s => s.source_id));
const seasonIds = new Set(db.seasons.map(s => s.season_id));
const playerIds = new Set(db.players.map(x => x.player_id));
const managerIds = new Set(db.managers.map(x => x.manager_id));

function addError(code, detail) { errors.push({ code, detail }); }
function addWarning(code, detail) { warnings.push({ code, detail }); }
function pass(name, detail = '') { checks.push({ name, detail }); }

function duplicateValues(arr, getKey) {
  const seen = new Set();
  const dup = new Set();
  for (const item of arr) {
    const k = getKey(item);
    if (seen.has(k)) dup.add(k);
    seen.add(k);
  }
  return [...dup];
}

const idSpecs = [
  ['season_id', db.seasons, x => x.season_id],
  ['player_id', db.players, x => x.player_id],
  ['player_season.id', db.playerSeasons, x => x.id],
  ['manager_id', db.managers, x => x.manager_id],
  ['manager_tenure.tenure_id', db.managerTenures, x => x.tenure_id],
  ['uniform_id', db.uniforms, x => x.uniform_id],
  ['source_id', db.sources, x => x.source_id],
  ['issue.id', db.issues, x => x.id]
];
for (const [label, arr, getKey] of idSpecs) {
  const dup = duplicateValues(arr, getKey);
  if (dup.length) addError('DUPLICATE_ID', `${label}: ${dup.join(', ')}`);
  else pass(`unique ${label}`, `${arr.length}`);
}

const expectedSeasons = Array.from({ length: 34 }, (_, i) => String(1992 + i));
const missingSeasons = expectedSeasons.filter(id => !seasonIds.has(id));
const extraSeasons = [...seasonIds].filter(id => !expectedSeasons.includes(id));
if (missingSeasons.length || extraSeasons.length) addError('SEASON_RANGE', `missing=${missingSeasons.join(',') || '-'} extra=${extraSeasons.join(',') || '-'}`);
else pass('season coverage', '1992–2025 complete');

for (const s of db.seasons) {
  if (Number.isFinite(s.matches) && Number.isFinite(s.wins) && Number.isFinite(s.draws) && Number.isFinite(s.losses)) {
    if (s.wins + s.draws + s.losses !== s.matches) addError('SEASON_MATCH_ARITHMETIC', `${s.season_id}: ${s.wins}+${s.draws}+${s.losses} != ${s.matches}`);
  }
  if (Number.isFinite(s.goals_for) && Number.isFinite(s.goals_against) && Number.isFinite(s.goal_difference)) {
    if (s.goals_for - s.goals_against !== s.goal_difference) addError('SEASON_GOAL_DIFFERENCE', `${s.season_id}: ${s.goals_for}-${s.goals_against} != ${s.goal_difference}`);
  }
  if (s.league_rank !== null && s.league_rank !== undefined && Number.isFinite(s.total_teams)) {
    if (s.league_rank < 1 || s.league_rank > s.total_teams) addError('SEASON_RANK_RANGE', `${s.season_id}: rank=${s.league_rank}, teams=${s.total_teams}`);
  }
}
pass('season arithmetic checked', `${db.seasons.length} seasons`);

for (const rel of db.playerSeasons) {
  if (!playerIds.has(rel.player_id)) addError('ORPHAN_PLAYER_SEASON_PLAYER', `${rel.id} -> ${rel.player_id}`);
  if (!seasonIds.has(rel.season_id)) addError('ORPHAN_PLAYER_SEASON_SEASON', `${rel.id} -> ${rel.season_id}`);
}
for (const rel of db.managerTenures) {
  if (!managerIds.has(rel.manager_id)) addError('ORPHAN_MANAGER_TENURE_MANAGER', `${rel.tenure_id} -> ${rel.manager_id}`);
  if (!seasonIds.has(rel.season_id)) addError('ORPHAN_MANAGER_TENURE_SEASON', `${rel.tenure_id} -> ${rel.season_id}`);
}
for (const u of db.uniforms) if (!seasonIds.has(u.season_id)) addError('ORPHAN_UNIFORM_SEASON', `${u.uniform_id} -> ${u.season_id}`);
pass('relationship references checked');

function checkSourceList(owner, ids) {
  if (!Array.isArray(ids) || !ids.length) return;
  for (const id of ids) if (!sourceIds.has(id)) addError('UNKNOWN_SOURCE_ID', `${owner}: ${id}`);
}
for (const s of db.seasons) checkSourceList(`season:${s.season_id}`, s.source_ids);
for (const p of db.players) checkSourceList(`player:${p.player_id}`, p.source_ids);
for (const t of db.managerTenures) checkSourceList(`tenure:${t.tenure_id}`, t.source_ids);
for (const m of db.managers) checkSourceList(`manager:${m.manager_id}`, m.source_ids);
for (const c of provenance.claims || []) for (const [field, claim] of Object.entries(c.fields || {})) checkSourceList(`claim:${c.entityType}:${c.entityId}:${field}`, claim.sourceIds);
for (const c of uniformContexts.contexts || []) checkSourceList(`uniform-context:${c.context_id}`, c.source_ids);
for (const i of db.issues) checkSourceList(`issue:${i.id}`, i.source_ids);
pass('source references checked', `${db.sources.length} source records`);

// Claim/base consistency.
for (const c of provenance.claims || []) {
  let entity = null;
  if (c.entityType === 'player_season') entity = db.playerSeasons.find(x => x.id === c.entityId);
  if (c.entityType === 'uniform') entity = db.uniforms.find(x => x.uniform_id === c.entityId);
  if (!entity) {
    addError('PROVENANCE_ENTITY_MISSING', `${c.entityType}:${c.entityId}`);
    continue;
  }
  for (const [field, claim] of Object.entries(c.fields || {})) {
    if (String(entity[field] ?? '').normalize('NFKC') !== String(claim.value ?? '').normalize('NFKC')) {
      addError('PROVENANCE_VALUE_MISMATCH', `${c.entityType}:${c.entityId}:${field} base=${entity[field]} claim=${claim.value}`);
    }
  }
}
pass('provenance/base values checked', `${(provenance.claims || []).length} claim entities`);

// Regression fixtures from the 2026-09-07 Research Gate.
const season = id => db.seasons.find(s => s.season_id === id);
const ps = id => db.playerSeasons.find(x => x.id === id);
const kit = id => db.uniforms.find(x => x.uniform_id === id);
function assertFixture(condition, detail) { if (!condition) addError('REGRESSION_FIXTURE', detail); }
assertFixture(season('1995')?.summary?.includes('32得点') && !season('1995')?.summary?.includes('27得点'), '1995 Fukuda summary must say 32 goals');
assertFixture((season('1995')?.key_events || []).some(x => x.includes('32得点')), '1995 Fukuda key event must say 32 goals');
assertFixture(ps('ps_1995_fukuda')?.memory_hook?.includes('32ゴール'), '1995 Fukuda player memory must say 32 goals');
assertFixture(!(season('1996')?.key_events || []).some(x => x.includes('岡野') && x.includes('新人王')), '1996 Okano must not be described as rookie of the year');
assertFixture(!ps('ps_1996_okano')?.memory_hook?.includes('新人王'), '1996 Okano player memory must not say rookie of the year');
assertFixture(!kit('kit_1996')?.description?.includes('新人王'), '1996 kit description must not say Okano rookie of the year');
assertFixture(season('2000')?.summary?.includes('鳥栖') && season('2000')?.summary?.includes('95分') && !season('2000')?.summary?.includes('延長後半'), '2000 summary must use Tosu and 95th minute/first extra-time period');
assertFixture(!(season('2000')?.key_events || []).some(x => x.includes('水戸')), '2000 promotion key event must not say Mito');
assertFixture(ps('ps_2006_washington')?.shirt_number === 21, '2006 Washington shirt number must be 21');
assertFixture(ps('ps_2006_yamada')?.position === 'MF', '2006 Yamada registered position must be MF for sourced season table');
assertFixture(ps('ps_2006_tsuzuki')?.shirt_number === 23, '2006 Tsuzuki shirt number must be 23');
assertFixture(ps('ps_2006_okano')?.shirt_number === 30, '2006 Okano shirt number must be 30');
assertFixture(kit('kit_2007')?.chest_sponsor === 'SAVAS', '2007 legacy domestic chest sponsor must be SAVAS');
assertFixture(kit('kit_2008')?.chest_sponsor === 'SAVAS', '2008 legacy league chest sponsor must be SAVAS');
assertFixture(kit('kit_2011')?.chest_sponsor === 'SAVAS', '2011 legacy domestic chest sponsor must be SAVAS');
assertFixture(db.managerTenures.filter(x => x.season_id === '2011').length >= 2, '2011 manager change must be represented by multiple tenure rows');
assertFixture(db.managerTenures.some(x => x.tenure_id === 'tenure_2024_ikeda'), '2024 Ikeda interim tenure must exist');
assertFixture(db.managerTenures.some(x => x.tenure_id === 'tenure_2024_skorza'), '2024 Skorza tenure must exist');
pass('regression fixtures checked');

// Warning-only completeness census.
const broadRoots = new Set(['SRC_JLEAGUE_DATA', 'SRC_URAWA_OFFICIAL']);
const rootOnlySeasons = db.seasons.filter(s => Array.isArray(s.source_ids) && s.source_ids.length && s.source_ids.every(id => broadRoots.has(id))).map(s => s.season_id);
if (rootOnlySeasons.length) addWarning('BROAD_SOURCE_ONLY_SEASONS', `${rootOnlySeasons.length} seasons rely only on broad root sources: ${rootOnlySeasons.join(', ')}`);

const playerSeasonBySeason = Object.fromEntries(expectedSeasons.map(id => [id, db.playerSeasons.filter(x => x.season_id === id).length]));
const sparsePlayerSeasons = Object.entries(playerSeasonBySeason).filter(([, count]) => count < 4).map(([id, count]) => `${id}:${count}`);
if (sparsePlayerSeasons.length) addWarning('SPARSE_PLAYER_SEASONS', sparsePlayerSeasons.join(', '));

const contextSeasonIds = new Set((uniformContexts.contexts || []).map(x => x.season_id));
const noVerifiedUniformContext = expectedSeasons.filter(id => !contextSeasonIds.has(id));
if (noVerifiedUniformContext.length) addWarning('UNIFORM_CONTEXT_GAPS', `${noVerifiedUniformContext.length} seasons lack a verified competition-aware uniform context`);

const singleTenureAmbiguous = db.managerTenures.filter(t => {
  const same = db.managerTenures.filter(x => x.season_id === t.season_id);
  if (same.length !== 1) return false;
  return /途中|交代|解任|引き継|代行|夏に|秋に|復帰して|から.+へ/.test(t.notes || '');
}).map(t => t.season_id);
if (singleTenureAmbiguous.length) addWarning('MANAGER_CHANGE_ONLY_IN_NOTES', [...new Set(singleTenureAmbiguous)].join(', '));

const claimEntities = new Set((provenance.claims || []).filter(c => c.entityType === 'player_season').map(c => c.entityId));
const playerRelWithNumber = db.playerSeasons.filter(x => x.shirt_number !== null && x.shirt_number !== undefined);
const claimedPlayerRelations = playerRelWithNumber.filter(x => claimEntities.has(x.id));

const census = {
  seasons: { total: db.seasons.length, confirmed: db.seasons.filter(x => x.verification_status === 'confirmed').length, broadSourceOnly: rootOnlySeasons.length },
  players: { total: db.players.length },
  playerSeasons: { total: db.playerSeasons.length, withShirtNumber: playerRelWithNumber.length, claimBackedEntities: claimEntities.size, claimBackedNumberRelations: claimedPlayerRelations.length },
  managers: { total: db.managers.length, tenures: db.managerTenures.length, seasonsWithMultipleTenures: expectedSeasons.filter(id => db.managerTenures.filter(x => x.season_id === id).length > 1).length },
  uniforms: { legacyRecords: db.uniforms.length, verifiedContexts: (uniformContexts.contexts || []).length, seasonsWithVerifiedContext: contextSeasonIds.size },
  sources: { total: db.sources.length },
  issues: { total: db.issues.length, open: db.issues.filter(x => ['OPEN', 'BLOCKED'].includes(x.status)).length, fixed: db.issues.filter(x => x.status === 'FIXED').length }
};

const report = { status: errors.length ? 'FAIL' : 'PASS', errors, warnings, checks, census };
console.log(JSON.stringify(report, null, 2));

const reportArg = process.argv.indexOf('--report');
if (reportArg >= 0 && process.argv[reportArg + 1]) {
  const target = p(process.argv[reportArg + 1]);
  const md = `# Data Integrity Report\n\nUpdated: 2026-09-07\n\nStatus: **${report.status}**\n\n## Census\n\n\`\`\`json\n${JSON.stringify(census, null, 2)}\n\`\`\`\n\n## Errors\n\n${errors.length ? errors.map(x => `- **${x.code}** — ${x.detail}`).join('\n') : '- None'}\n\n## Warnings / Known Gaps\n\n${warnings.length ? warnings.map(x => `- **${x.code}** — ${x.detail}`).join('\n') : '- None'}\n\n## Interpretation\n\n- ERRORは修正Gateを止める。\n- WARNINGは推測で埋めず、既知のResearch / Coverage Debtとして残す。\n- 34 seasons covered は、各領域がclaim-levelにverifiedであることを意味しない。\n`;
  fs.writeFileSync(target, md);
}

if (errors.length) process.exit(1);
