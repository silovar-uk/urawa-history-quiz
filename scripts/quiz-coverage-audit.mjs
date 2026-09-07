#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const p = rel => path.join(root, rel);
const readJson = rel => JSON.parse(fs.readFileSync(p(rel), 'utf8'));
const readText = rel => fs.readFileSync(p(rel), 'utf8');

const outIndex = process.argv.indexOf('--out');
const outPath = outIndex >= 0 ? process.argv[outIndex + 1] : null;

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

const sandbox = { window: {}, console };
vm.createContext(sandbox);
for (const rel of [
  'data/provenance-claims.js',
  'data/uniform-contexts.js',
  'prototype/quiz-trust.js',
  'prototype/kit-trust.js',
  'prototype/quiz-distractors.js',
  'prototype/quiz-difficulty.js'
]) {
  vm.runInContext(readText(rel), sandbox, { filename: rel });
}

const trust = sandbox.window.URAWA_QUIZ_TRUST;
const kitTrust = sandbox.window.URAWA_KIT_TRUST;
const distractors = sandbox.window.URAWA_DISTRACTOR_POLICY;
const difficulty = sandbox.window.URAWA_DIFFICULTY_MODEL;

if (!trust || !kitTrust || !distractors || !difficulty) {
  console.error('Required Q4 dependencies could not be loaded.');
  process.exit(1);
}

const failures = [];
const warnings = [];
const GENERATORS = [
  'PLAYER_NUMBER',
  'PLAYER_POSITION',
  'PLAYER_OVERLAP',
  'MANAGER_SEASON',
  'SEASON_RANK',
  'SEASON_SUMMARY',
  'KIT_DETAIL'
];
const VALID_POSITIONS = ['GK', 'DF', 'MF', 'FW'];
const BROAD_ROOTS = new Set(['SRC_JLEAGUE_DATA', 'SRC_URAWA_OFFICIAL']);
const FAMOUS_YEARS = new Set([2003, 2004, 2005, 2006, 2007, 2017, 2022, 2023]);

function fail(area, detail) { failures.push({ area, detail }); }
function warn(area, detail) { warnings.push({ area, detail }); }
function assert(condition, area, detail) { if (!condition) fail(area, detail); }

function eraForYear(year) {
  if (year < 2000) return '1990s';
  if (year < 2010) return '2000s';
  if (year < 2020) return '2010s';
  return '2020s';
}

function pct(count, total) {
  return total ? Math.round((count / total) * 100000) / 1000 : 0;
}

function hashSeed(text) {
  let h = 2166136261 >>> 0;
  for (const ch of text) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h || 1;
}

function makeRng(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x / 4294967296;
  };
}

function shuffle(arr, rng) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalized(value) {
  return String(value ?? '').trim().normalize('NFKC').toLocaleLowerCase('ja-JP');
}

function validDraft(question) {
  return trust.validateQuestionBase(question).ok;
}

function safePlayer(rel) {
  const player = db.players.find(p => p.player_id === rel.player_id);
  return player && trust.hasKnownSources(player, db) ? player : null;
}

function playerNumberConstruction(season, target, sourced) {
  const player = safePlayer(target);
  if (!player) return null;

  const sameNumberWearers = new Set(
    sourced.filter(rel => String(rel.shirt_number) === String(target.shirt_number)).map(rel => rel.player_id)
  );
  if (sameNumberWearers.size !== 1) return null;

  const candidateRows = sourced
    .filter(rel => rel.player_id !== target.player_id && String(rel.shirt_number) !== String(target.shirt_number))
    .map(rel => ({ rel, player: safePlayer(rel) }))
    .filter(row => row.player);
  const ordered = distractors.playerNumber(target, candidateRows);
  if (ordered.length < 3) return null;
  const top = ordered.slice(0, 3);
  const draft = {
    question: `${season.year}年の浦和レッズで背番号「${target.shirt_number}」を背負った選手は？`,
    options: [player.name, ...top.map(row => row.player.name)],
    correct: player.name
  };
  if (!validDraft(draft)) return null;

  return {
    id: `PLAYER_NUMBER:${season.season_id}:${target.player_id}:${target.shirt_number}`,
    generatorId: 'PLAYER_NUMBER',
    category: 'PLAYER',
    seasonId: season.season_id,
    year: season.year,
    era: eraForYear(season.year),
    targetRelationId: target.id,
    playerId: player.player_id,
    playerName: player.name,
    difficulty: difficulty.score('PLAYER_NUMBER', {
      targetNumber: target.shirt_number,
      targetPosition: target.position,
      distractors: top.map(row => ({
        name: row.player.name,
        number: row.rel.shirt_number,
        position: row.rel.position
      }))
    })
  };
}

function playerPositionConstruction(season, target, sourced) {
  const player = safePlayer(target);
  if (!player) return null;
  const positions = new Set(sourced.filter(rel => rel.player_id === target.player_id).map(rel => rel.position));
  if (positions.size !== 1 || !VALID_POSITIONS.includes(target.position)) return null;
  const draft = {
    question: `${season.year}年シーズンの ${player.name} の登録ポジションは？`,
    options: [...VALID_POSITIONS],
    correct: target.position
  };
  if (!validDraft(draft)) return null;
  return {
    id: `PLAYER_POSITION:${season.season_id}:${target.player_id}:${target.position}`,
    generatorId: 'PLAYER_POSITION',
    category: 'PLAYER',
    seasonId: season.season_id,
    year: season.year,
    era: eraForYear(season.year),
    targetRelationId: target.id,
    playerId: player.player_id,
    playerName: player.name,
    difficulty: { score: null, band: 'UNMODELED', reasons: ['Q3 does not yet model fixed-position option difficulty.'] }
  };
}

function managerConstruction(season, safeManagers) {
  const check = trust.getSafeManagerForSeason(season.season_id, db);
  if (!check.ok) return null;
  const candidates = [];
  const seen = new Set([check.manager.manager_id]);
  for (const row of safeManagers) {
    if (row.season.season_id === season.season_id || seen.has(row.manager.manager_id)) continue;
    seen.add(row.manager.manager_id);
    candidates.push({ manager: row.manager, year: row.season.year });
  }
  if (candidates.length < 3) return null;
  const ordered = distractors.manager(season.year, candidates);
  if (ordered.length < 3) return null;
  const top = ordered.slice(0, 3);
  const draft = {
    question: `${season.year}年の浦和レッズの監督として登録データに記録されているのは？`,
    options: [check.manager.name, ...top.map(row => row.manager.name)],
    correct: check.manager.name
  };
  if (!validDraft(draft)) return null;
  return {
    id: `MANAGER_SEASON:${season.season_id}`,
    generatorId: 'MANAGER_SEASON',
    category: 'MANAGER',
    seasonId: season.season_id,
    year: season.year,
    era: eraForYear(season.year),
    managerId: check.manager.manager_id,
    managerName: check.manager.name,
    difficulty: difficulty.score('MANAGER_SEASON', {
      targetYear: season.year,
      distractors: top.map(row => ({ name: row.manager.name, year: row.year }))
    })
  };
}

function rankConstruction(season) {
  if (!trust.validateRankFact(season, db).ok) return null;
  const correctRank = Number(season.league_rank);
  const ordered = distractors.rank(correctRank, Number(season.total_teams));
  if (ordered.length < 3) return null;
  const top = ordered.slice(0, 3);
  const draft = {
    question: `${season.year}年シーズンの浦和レッズの${season.league_name}最終順位は？`,
    options: [`${correctRank}位`, ...top.map(v => `${v}位`)],
    correct: `${correctRank}位`
  };
  if (!validDraft(draft)) return null;
  return {
    id: `SEASON_RANK:${season.season_id}`,
    generatorId: 'SEASON_RANK',
    category: 'SEASON',
    seasonId: season.season_id,
    year: season.year,
    era: eraForYear(season.year),
    difficulty: difficulty.score('SEASON_RANK', {
      correctRank,
      distractors: top,
      titleCount: Array.isArray(season.titles) ? season.titles.length : 0
    })
  };
}

function summaryConstruction(season) {
  if (!trust.validateSummaryFact(season, db).ok) return null;
  const candidates = db.seasons.filter(other =>
    other.season_id !== season.season_id &&
    trust.isConfirmedSeason(other, db).ok &&
    other.summary &&
    !trust.summaryLeaksYear(other)
  );
  if (candidates.length < 3) return null;
  const ordered = distractors.seasonSummary(season, candidates);
  if (ordered.length < 3) return null;
  const top = ordered.slice(0, 3);
  const draft = {
    question: `「${season.summary}」\nこのシーズンはいつ？`,
    options: [`${season.year}年`, ...top.map(other => `${other.year}年`)],
    correct: `${season.year}年`
  };
  if (!validDraft(draft)) return null;
  return {
    id: `SEASON_SUMMARY:${season.season_id}`,
    generatorId: 'SEASON_SUMMARY',
    category: 'SEASON',
    seasonId: season.season_id,
    year: season.year,
    era: eraForYear(season.year),
    difficulty: difficulty.score('SEASON_SUMMARY', {
      targetYear: season.year,
      targetTitleCount: Array.isArray(season.titles) ? season.titles.length : 0,
      targetLeague: season.league_name,
      distractors: top.map(other => ({
        year: other.year,
        titleCount: Array.isArray(other.titles) ? other.titles.length : 0,
        league: other.league_name
      }))
    })
  };
}

function kitConstruction(target) {
  const allContexts = kitTrust.allEligibleContexts();
  const ordered = distractors.kit(target, allContexts.filter(ctx => ctx.context_id !== target.context_id));
  const seen = new Set();
  const top = [];
  for (const ctx of ordered) {
    const key = normalized(ctx.chest_sponsor);
    if (key === normalized(target.chest_sponsor) || seen.has(key)) continue;
    seen.add(key);
    top.push(ctx);
    if (top.length === 3) break;
  }
  if (top.length < 3) return null;
  const draft = {
    question: `${target.year}年シーズンの${target.competition_label}用HOMEユニフォームの胸スポンサーは？`,
    options: [target.chest_sponsor, ...top.map(ctx => ctx.chest_sponsor)],
    correct: target.chest_sponsor
  };
  if (!validDraft(draft)) return null;
  return {
    id: `KIT_DETAIL:${target.context_id}`,
    generatorId: 'KIT_DETAIL',
    category: 'KIT',
    seasonId: target.season_id,
    year: target.year,
    era: eraForYear(target.year),
    kitContextId: target.context_id,
    kitScope: target.competition_scope,
    kitSponsor: target.chest_sponsor,
    difficulty: difficulty.score('KIT_DETAIL', {
      targetYear: target.year,
      targetScope: target.competition_scope,
      distractors: top.map(ctx => ({ sponsor: ctx.chest_sponsor, year: ctx.year, scope: ctx.competition_scope }))
    })
  };
}

const safeManagers = [];
for (const season of db.seasons) {
  const check = trust.getSafeManagerForSeason(season.season_id, db);
  if (check.ok) safeManagers.push({ season, manager: check.manager });
}

const stateBySeason = new Map();
const allConstructions = [];
for (const season of [...db.seasons].sort((a, b) => a.year - b.year)) {
  const relations = db.playerSeasons.filter(rel => rel.season_id === season.season_id);
  const playerNumberSourced = relations.filter(rel => rel.shirt_number !== null && trust.hasKnownSources(rel, db));
  const playerPositionSourced = relations.filter(rel => trust.hasKnownSources(rel, db) && VALID_POSITIONS.includes(rel.position));

  const byGenerator = Object.fromEntries(GENERATORS.map(id => [id, []]));
  for (const rel of playerNumberSourced) {
    const item = playerNumberConstruction(season, rel, playerNumberSourced);
    if (item) byGenerator.PLAYER_NUMBER.push(item);
  }
  for (const rel of playerPositionSourced) {
    const item = playerPositionConstruction(season, rel, playerPositionSourced);
    if (item) byGenerator.PLAYER_POSITION.push(item);
  }
  const manager = managerConstruction(season, safeManagers);
  if (manager) byGenerator.MANAGER_SEASON.push(manager);
  const rank = rankConstruction(season);
  if (rank) byGenerator.SEASON_RANK.push(rank);
  const summary = summaryConstruction(season);
  if (summary) byGenerator.SEASON_SUMMARY.push(summary);
  const kitEligibleContexts = kitTrust.eligibleContextsForSeason(season.season_id);
  for (const ctx of kitEligibleContexts) {
    const item = kitConstruction(ctx);
    if (item) byGenerator.KIT_DETAIL.push(item);
  }

  const openIssueIds = db.issues
    .filter(issue => ['OPEN', 'BLOCKED'].includes(issue.status))
    .filter(issue => String(issue.entity_id || '').split(/[^0-9]+/).includes(String(season.year)))
    .map(issue => issue.id);
  const rootOnly = Array.isArray(season.source_ids) && season.source_ids.length > 0 && season.source_ids.every(id => BROAD_ROOTS.has(id));

  const state = {
    season,
    byGenerator,
    playerNumberSourced,
    playerPositionSourced,
    kitEligibleContexts,
    availability: {
      playerRelations: relations.length,
      playerRelationsWithNumber: relations.filter(rel => rel.shirt_number !== null && rel.shirt_number !== undefined).length,
      playerRelationsWithPosition: relations.filter(rel => VALID_POSITIONS.includes(rel.position)).length,
      claimBackedPlayerRelations: relations.filter(rel => trust.hasKnownSources(rel, db)).length,
      managerTenures: db.managerTenures.filter(t => t.season_id === season.season_id).length,
      rankFactPresent: Number.isFinite(Number(season.league_rank)) && Number.isFinite(Number(season.total_teams)) && Boolean(season.league_name),
      summaryPresent: Boolean(season.summary),
      legacyHomeKits: db.uniforms.filter(u => u.season_id === season.season_id && u.type === 'HOME').length,
      verifiedKitContexts: kitEligibleContexts.length,
      rootOnlySeasonSource: rootOnly,
      unresolvedIssueIds: openIssueIds
    }
  };
  stateBySeason.set(season.season_id, state);
  for (const rows of Object.values(byGenerator)) allConstructions.push(...rows);
}

function constructionForTarget(state, generatorId, targetId) {
  return state.byGenerator[generatorId].find(item => {
    if (generatorId === 'PLAYER_NUMBER' || generatorId === 'PLAYER_POSITION') return item.targetRelationId === targetId;
    if (generatorId === 'KIT_DETAIL') return item.kitContextId === targetId;
    return item.id === targetId;
  }) || null;
}

function sampleGenerator(state, generatorId, rng) {
  if (generatorId === 'PLAYER_NUMBER') {
    for (const rel of shuffle(state.playerNumberSourced, rng)) {
      const item = constructionForTarget(state, generatorId, rel.id);
      if (item) return item;
    }
    return null;
  }
  if (generatorId === 'PLAYER_POSITION') {
    for (const rel of shuffle(state.playerPositionSourced, rng)) {
      const item = constructionForTarget(state, generatorId, rel.id);
      if (item) return item;
    }
    return null;
  }
  if (generatorId === 'PLAYER_OVERLAP') return null;
  if (generatorId === 'KIT_DETAIL') {
    if (!state.kitEligibleContexts.length) return null;
    const target = shuffle(state.kitEligibleContexts, rng)[0];
    return constructionForTarget(state, generatorId, target.context_id);
  }
  return state.byGenerator[generatorId][0] || null;
}

function seasonPool(filterEra, specificSeasonId = null) {
  let pool = db.seasons.filter(s => trust.isConfirmedSeason(s, db).ok);
  if (specificSeasonId) return pool.filter(s => s.season_id === specificSeasonId);
  if (filterEra !== 'ALL') pool = pool.filter(s => eraForYear(s.year) === filterEra);
  return pool;
}

function increment(map, key) {
  if (!key) return;
  map[key] = (map[key] || 0) + 1;
}

function simulate({ id, filterEra = 'ALL', specificSeasonId = null, trials, seed }) {
  const rng = makeRng(seed);
  const counts = {
    byEra: {},
    bySeason: {},
    byCategory: {},
    byGenerator: {},
    byDifficulty: {},
    byPlayer: {},
    byManager: {},
    byKitScope: {},
    bySeasonCategory: {}
  };
  let noQuestion = 0;
  const pool = seasonPool(filterEra, specificSeasonId);

  for (let n = 0; n < trials; n += 1) {
    let selected = null;
    for (const season of shuffle(pool, rng)) {
      const state = stateBySeason.get(season.season_id);
      for (const generatorId of shuffle(GENERATORS, rng)) {
        selected = sampleGenerator(state, generatorId, rng);
        if (selected) break;
      }
      if (selected) break;
    }

    if (!selected) {
      noQuestion += 1;
      continue;
    }
    increment(counts.byEra, selected.era);
    increment(counts.bySeason, selected.seasonId);
    increment(counts.byCategory, selected.category);
    increment(counts.byGenerator, selected.generatorId);
    increment(counts.byDifficulty, selected.difficulty?.band || 'UNMODELED');
    increment(counts.byPlayer, selected.playerId);
    increment(counts.byManager, selected.managerId);
    increment(counts.byKitScope, selected.kitScope);
    increment(counts.bySeasonCategory, `${selected.seasonId}|${selected.category}`);
  }

  function decorate(map) {
    return Object.fromEntries(Object.entries(map)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([key, count]) => [key, { count, pct: pct(count, trials) }]));
  }

  return {
    id,
    filterEra,
    specificSeasonId,
    trials,
    seed,
    noQuestion,
    noQuestionPct: pct(noQuestion, trials),
    counts: Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, decorate(value)]))
  };
}

// Runtime contract guard: if production selection changes, this audit must be reviewed.
const appSource = readText('prototype/app.js');
const requiredRuntimeTokens = [
  'const generators = shuffle([',
  'generatePlayerNumber(seasonData, psList)',
  'generatePlayerPosition(seasonData, psList)',
  'generatePlayerOverlap(seasonData, psList)',
  'generateManagerSeason(seasonData)',
  'generateSeasonRank(seasonData)',
  'generateSeasonSummary(seasonData)',
  'generateKitDetail(seasonData)',
  'const seasons = getSeasonPool(filterEra, targetSeasonId);',
  'return shuffle(pool);'
];
for (const token of requiredRuntimeTokens) {
  assert(appSource.includes(token), 'RUNTIME_CONTRACT_DRIFT', `prototype/app.js missing expected selection token: ${token}`);
}

const eligibilityByGenerator = Object.fromEntries(GENERATORS.map(id => [id, 0]));
const eligibilityByCategory = { PLAYER: 0, MANAGER: 0, SEASON: 0, KIT: 0 };
const eligibilityByEra = { '1990s': 0, '2000s': 0, '2010s': 0, '2020s': 0 };
for (const item of allConstructions) {
  eligibilityByGenerator[item.generatorId] += 1;
  eligibilityByCategory[item.category] += 1;
  eligibilityByEra[item.era] += 1;
}

const scenarioSpecs = [
  { id: 'ALL', filterEra: 'ALL', trials: 200000 },
  { id: '1990s', filterEra: '1990s', trials: 50000 },
  { id: '2000s', filterEra: '2000s', trials: 50000 },
  { id: '2010s', filterEra: '2010s', trials: 50000 },
  { id: '2020s', filterEra: '2020s', trials: 50000 },
  { id: 'SEASON_2006', filterEra: 'ALL', specificSeasonId: '2006', trials: 50000 }
];
const scenarios = {};
for (const spec of scenarioSpecs) {
  const seed = hashSeed(`q4-2026-09-07:${spec.id}`);
  scenarios[spec.id] = simulate({ ...spec, seed });
}

// Reproducibility gate on a small duplicate run.
const deterministicA = simulate({ id: 'DETERMINISM_A', filterEra: 'ALL', trials: 2500, seed: 424242 });
const deterministicB = simulate({ id: 'DETERMINISM_B', filterEra: 'ALL', trials: 2500, seed: 424242 });
assert(JSON.stringify(deterministicA.counts) === JSON.stringify(deterministicB.counts), 'DETERMINISM', 'same seed produced different exposure counts');
assert(deterministicA.noQuestion === deterministicB.noQuestion, 'DETERMINISM', 'same seed produced different no-question count');

const allScenario = scenarios.ALL;
assert(allScenario.noQuestion === 0, 'RUNTIME_AVAILABILITY', `ALL produced ${allScenario.noQuestion} no-question trials`);
assert(allConstructions.length > 0, 'ELIGIBILITY', 'No safe constructions found');
assert(eligibilityByGenerator.PLAYER_OVERLAP === 0, 'TRUST_REGRESSION', 'PLAYER_OVERLAP must remain trust-disabled');

const confirmedSeasonCount = seasonPool('ALL').length;
const uniformSeasonPct = confirmedSeasonCount ? 100 / confirmedSeasonCount : 0;
const seasonRows = [...db.seasons].sort((a, b) => a.year - b.year).map(season => {
  const state = stateBySeason.get(season.season_id);
  const exposure = allScenario.counts.bySeason[season.season_id] || { count: 0, pct: 0 };
  const categoryExposure = {};
  for (const category of ['PLAYER', 'MANAGER', 'SEASON', 'KIT']) {
    categoryExposure[category] = allScenario.counts.bySeasonCategory[`${season.season_id}|${category}`] || { count: 0, pct: 0 };
  }
  const eligibleTargets = Object.fromEntries(GENERATORS.map(id => [id, state.byGenerator[id].length]));
  const eligibleGenerators = GENERATORS.filter(id => state.byGenerator[id].length > 0);
  return {
    seasonId: season.season_id,
    year: season.year,
    era: eraForYear(season.year),
    titles: Array.isArray(season.titles) ? season.titles : [],
    availability: state.availability,
    eligibility: {
      eligibleTargets,
      eligibleGenerators,
      eligibleGeneratorCount: eligibleGenerators.length,
      safeConstructionCount: Object.values(eligibleTargets).reduce((a, b) => a + b, 0),
      kitRuntimeSuccessRate: state.kitEligibleContexts.length ? Math.round((state.byGenerator.KIT_DETAIL.length / state.kitEligibleContexts.length) * 1000) / 1000 : null
    },
    defaultExposure: {
      count: exposure.count,
      pct: exposure.pct,
      ratioToUniformSeason: uniformSeasonPct ? Math.round((exposure.pct / uniformSeasonPct) * 1000) / 1000 : null,
      byCategory: categoryExposure
    }
  };
});

const lowVisibilitySeasons = seasonRows.filter(row => row.defaultExposure.ratioToUniformSeason !== null && row.defaultExposure.ratioToUniformSeason < 0.5);
const highVisibilitySeasons = seasonRows.filter(row => row.defaultExposure.ratioToUniformSeason !== null && row.defaultExposure.ratioToUniformSeason > 1.5);

const playerBlindSpots = seasonRows.filter(row => row.availability.playerRelations > 0 && row.eligibility.eligibleTargets.PLAYER_NUMBER === 0 && row.eligibility.eligibleTargets.PLAYER_POSITION === 0);
const kitBlindSpots = seasonRows.filter(row => row.availability.legacyHomeKits > 0 && row.eligibility.eligibleTargets.KIT_DETAIL === 0);
const managerBlindSpots = seasonRows.filter(row => row.availability.managerTenures > 0 && row.eligibility.eligibleTargets.MANAGER_SEASON === 0);

const famousExposureCount = seasonRows.filter(row => FAMOUS_YEARS.has(row.year)).reduce((sum, row) => sum + row.defaultExposure.count, 0);
const famousExpectedPct = confirmedSeasonCount ? (FAMOUS_YEARS.size / confirmedSeasonCount) * 100 : 0;
const famousObservedPct = pct(famousExposureCount, allScenario.trials);

const globalOpenIssues = db.issues.filter(issue => ['OPEN', 'BLOCKED'].includes(issue.status));
const rootOnlyCount = seasonRows.filter(row => row.availability.rootOnlySeasonSource).length;

function topEntities(countMap, master, idField, nameField, limit = 12) {
  return Object.entries(countMap)
    .map(([id, exposure]) => {
      const entity = master.find(row => row[idField] === id);
      return { id, name: entity ? entity[nameField] : id, ...exposure };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'ja'))
    .slice(0, limit);
}

const biasFindings = {
  seasonLayer: {
    uniformReferencePct: Math.round(uniformSeasonPct * 1000) / 1000,
    lowVisibilitySeasons: lowVisibilitySeasons.map(row => row.year),
    highVisibilitySeasons: highVisibilitySeasons.map(row => row.year),
    interpretation: lowVisibilitySeasons.length || highVisibilitySeasons.length
      ? 'Season selection itself is uneven under the current runtime.'
      : 'No strong season-level starvation detected; the larger imbalance sits inside seasons/categories/generators.'
  },
  famousEraTest: {
    years: [...FAMOUS_YEARS].sort(),
    expectedPctIfSeasonUniform: Math.round(famousExpectedPct * 1000) / 1000,
    observedPct: famousObservedPct,
    ratio: famousExpectedPct ? Math.round((famousObservedPct / famousExpectedPct) * 1000) / 1000 : null
  },
  provenanceBlindSpots: {
    playerSeasonCount: playerBlindSpots.length,
    playerYears: playerBlindSpots.map(row => row.year),
    kitSeasonCount: kitBlindSpots.length,
    kitYears: kitBlindSpots.map(row => row.year),
    managerSeasonCount: managerBlindSpots.length,
    managerYears: managerBlindSpots.map(row => row.year),
    rootOnlySeasonCount: rootOnlyCount,
    unresolvedIssueIds: globalOpenIssues.map(issue => issue.id)
  },
  categoryStarvation: Object.fromEntries(Object.entries(allScenario.counts.byCategory).filter(([, value]) => value.pct < 5)),
  topPlayers: topEntities(allScenario.counts.byPlayer, db.players, 'player_id', 'name'),
  topManagers: topEntities(allScenario.counts.byManager, db.managers, 'manager_id', 'name')
};

if (eligibilityByGenerator.PLAYER_NUMBER === 0 || eligibilityByGenerator.PLAYER_POSITION === 0) {
  warn('PLAYER_COVERAGE', 'Player generators have zero safe constructions.');
}
if (eligibilityByGenerator.KIT_DETAIL === 0) warn('KIT_COVERAGE', 'KIT_DETAIL has zero safe constructions.');
for (const [category, exposure] of Object.entries(allScenario.counts.byCategory)) {
  if (exposure.pct < 5) warn('CATEGORY_STARVATION', `${category} reaches only ${exposure.pct}% in ALL simulation`);
}
if (rootOnlyCount) warn('PROVENANCE_DEBT', `${rootOnlyCount} seasons still rely only on broad root season sources`);
if (playerBlindSpots.length) warn('PLAYER_BLIND_SPOTS', `${playerBlindSpots.length} seasons have player rows but no eligible player generator`);
if (kitBlindSpots.length) warn('KIT_BLIND_SPOTS', `${kitBlindSpots.length} seasons have legacy HOME kit rows but no eligible KIT_DETAIL construction`);
if (managerBlindSpots.length) warn('MANAGER_BLIND_SPOTS', `${managerBlindSpots.length} seasons have tenure data but no eligible manager question`);

const report = {
  auditVersion: 'q4-2026-09-07',
  interpretation: 'Deterministic engine-exposure model. It measures what the current generator is likely to show, not user engagement, learning value, or observed psychometric difficulty.',
  runtimeContract: {
    seasonPolicy: 'shuffle confirmed season pool; use first season that yields a question',
    generatorPolicy: 'shuffle seven generators within a season; use first generator that yields a question',
    targetPolicy: 'generator-specific target selection mirrors current production semantics',
    generators: GENERATORS,
    source: 'prototype/app.js',
    contractGuarded: failures.every(x => x.area !== 'RUNTIME_CONTRACT_DRIFT')
  },
  simulation: {
    prng: 'xorshift32',
    seedRule: 'FNV-1a hash of q4-2026-09-07:<scenario>',
    scenarios
  },
  dataAvailability: {
    seasons: db.seasons.length,
    playerRelations: db.playerSeasons.length,
    managerTenures: db.managerTenures.length,
    legacyUniforms: db.uniforms.length,
    verifiedKitContexts: kitTrust.allEligibleContexts().length,
    broadRootOnlySeasons: rootOnlyCount,
    unresolvedIssues: globalOpenIssues.map(issue => ({ id: issue.id, status: issue.status, entityType: issue.entity_type, entityId: issue.entity_id }))
  },
  eligibilityCensus: {
    safeConstructionCount: allConstructions.length,
    byGenerator: eligibilityByGenerator,
    byCategory: eligibilityByCategory,
    byEra: eligibilityByEra,
    note: 'Construction count is not runtime screen probability. The runtime chooses among passing generators, not uniformly among all safe constructions.'
  },
  biasFindings,
  seasonRows,
  warnings,
  failures
};

if (outPath) {
  fs.mkdirSync(path.dirname(path.resolve(root, outPath)), { recursive: true });
  fs.writeFileSync(path.resolve(root, outPath), JSON.stringify(report, null, 2) + '\n');
}

const consoleSummary = {
  auditVersion: report.auditVersion,
  safeConstructionCount: report.eligibilityCensus.safeConstructionCount,
  eligibilityByGenerator,
  eligibilityByCategory,
  allEraExposure: allScenario.counts.byEra,
  allCategoryExposure: allScenario.counts.byCategory,
  allGeneratorExposure: allScenario.counts.byGenerator,
  allDifficultyExposure: allScenario.counts.byDifficulty,
  seasonLayer: biasFindings.seasonLayer,
  famousEraTest: biasFindings.famousEraTest,
  provenanceBlindSpots: biasFindings.provenanceBlindSpots,
  topPlayers: biasFindings.topPlayers.slice(0, 8),
  topManagers: biasFindings.topManagers.slice(0, 8),
  warnings,
  failures,
  artifact: outPath || null
};
console.log(JSON.stringify(consoleSummary, null, 2));

if (failures.length) process.exit(1);
