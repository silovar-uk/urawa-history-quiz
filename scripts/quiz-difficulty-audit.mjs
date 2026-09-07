#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const readText = rel => fs.readFileSync(path.join(root, rel), 'utf8');

const outIndex = process.argv.indexOf('--out');
const outPath = outIndex >= 0 ? process.argv[outIndex + 1] : null;

const db = {
  seasons: readJson('data/seasons.json'),
  players: readJson('data/players.json'),
  playerSeasons: readJson('data/player_seasons.json'),
  managers: readJson('data/managers.json'),
  managerTenures: readJson('data/manager_tenures.json'),
  uniforms: readJson('data/uniforms.json'),
  sources: readJson('data/sources.json')
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
  console.error('Required Q3 dependencies could not be loaded.');
  process.exit(1);
}

const failures = [];
const warnings = [];
const items = [];

function fail(area, detail) {
  failures.push({ area, detail });
}

function warn(area, detail) {
  warnings.push({ area, detail });
}

function assert(condition, area, detail) {
  if (!condition) fail(area, detail);
}

function seasonById(id) {
  return db.seasons.find(s => s.season_id === id);
}

function pushItem(item) {
  const a = difficulty.score(item.generatorId, item.difficultyInput);
  const b = difficulty.score(item.generatorId, item.difficultyInput);

  assert(JSON.stringify(a) === JSON.stringify(b), 'DETERMINISM', `${item.id} produced non-deterministic score`);
  assert(Number.isInteger(a.score) && a.score >= 0 && a.score <= 100, 'SCORE_RANGE', `${item.id} score=${a.score}`);
  assert(['EASY', 'MEDIUM', 'HARD'].includes(a.band), 'BAND', `${item.id} band=${a.band}`);
  assert(Array.isArray(a.reasons) && a.reasons.length > 0, 'EXPLANATION', `${item.id} has no reasons`);

  items.push({
    ...item,
    difficulty: a
  });
}

// --------------------------------------------------
// PLAYER_NUMBER — enumerate every safe target with 3 safe same-season distractors.
// --------------------------------------------------
for (const season of db.seasons) {
  if (!trust.isConfirmedSeason(season, db).ok) continue;
  const sourced = db.playerSeasons.filter(rel =>
    rel.season_id === season.season_id &&
    rel.shirt_number !== null &&
    trust.hasKnownSources(rel, db)
  );

  for (const target of sourced) {
    const targetPlayer = db.players.find(p => p.player_id === target.player_id);
    if (!targetPlayer || !trust.hasKnownSources(targetPlayer, db)) continue;

    const sameNumberWearers = new Set(
      sourced.filter(rel => String(rel.shirt_number) === String(target.shirt_number)).map(rel => rel.player_id)
    );
    if (sameNumberWearers.size !== 1) continue;

    const candidateRows = sourced
      .filter(rel => rel.player_id !== target.player_id && String(rel.shirt_number) !== String(target.shirt_number))
      .map(rel => ({ rel, player: db.players.find(p => p.player_id === rel.player_id) }))
      .filter(row => row.player && trust.hasKnownSources(row.player, db));

    const ordered = distractors.playerNumber(target, candidateRows);
    if (ordered.length < 3) continue;
    const top = ordered.slice(0, 3);

    pushItem({
      id: `PLAYER_NUMBER:${season.season_id}:${target.player_id}:${target.shirt_number}`,
      generatorId: 'PLAYER_NUMBER',
      year: season.year,
      category: 'PLAYER',
      target: `${targetPlayer.name} #${target.shirt_number}`,
      options: [targetPlayer.name, ...top.map(row => row.player.name)],
      difficultyInput: {
        targetNumber: target.shirt_number,
        targetPosition: target.position,
        distractors: top.map(row => ({
          name: row.player.name,
          number: row.rel.shirt_number,
          position: row.rel.position
        }))
      }
    });
  }
}

// --------------------------------------------------
// MANAGER_SEASON — every trust-safe target season.
// --------------------------------------------------
const safeManagers = [];
for (const season of db.seasons) {
  const checked = trust.getSafeManagerForSeason(season.season_id, db);
  if (checked.ok) safeManagers.push({ season, manager: checked.manager });
}

for (const target of safeManagers) {
  const candidateRows = safeManagers
    .filter(row => row.manager.manager_id !== target.manager.manager_id)
    .map(row => ({ year: row.season.year, manager: row.manager }));
  const ordered = distractors.manager(target.season.year, candidateRows);
  if (ordered.length < 3) continue;
  const top = ordered.slice(0, 3);

  pushItem({
    id: `MANAGER_SEASON:${target.season.season_id}`,
    generatorId: 'MANAGER_SEASON',
    year: target.season.year,
    category: 'MANAGER',
    target: target.manager.name,
    options: [target.manager.name, ...top.map(row => row.manager.name)],
    difficultyInput: {
      targetYear: target.season.year,
      distractors: top.map(row => ({ name: row.manager.name, year: row.year }))
    }
  });
}

// --------------------------------------------------
// SEASON_RANK — every trust-safe rank fact.
// --------------------------------------------------
for (const season of db.seasons) {
  if (!trust.validateRankFact(season, db).ok) continue;
  const correctRank = Number(season.league_rank);
  const ordered = distractors.rank(correctRank, Number(season.total_teams));
  if (ordered.length < 3) continue;
  const top = ordered.slice(0, 3);

  pushItem({
    id: `SEASON_RANK:${season.season_id}`,
    generatorId: 'SEASON_RANK',
    year: season.year,
    category: 'SEASON',
    target: `${correctRank}位`,
    options: [`${correctRank}位`, ...top.map(rankValue => `${rankValue}位`)],
    difficultyInput: {
      correctRank,
      distractors: top,
      titleCount: Array.isArray(season.titles) ? season.titles.length : 0
    }
  });
}

// --------------------------------------------------
// SEASON_SUMMARY — every trust-safe summary fact.
// --------------------------------------------------
for (const season of db.seasons) {
  if (!trust.validateSummaryFact(season, db).ok) continue;
  const candidateRows = db.seasons.filter(other =>
    other.season_id !== season.season_id && trust.validateSummaryFact(other, db).ok
  );
  const ordered = distractors.seasonSummary(season, candidateRows);
  if (ordered.length < 3) continue;
  const top = ordered.slice(0, 3);

  pushItem({
    id: `SEASON_SUMMARY:${season.season_id}`,
    generatorId: 'SEASON_SUMMARY',
    year: season.year,
    category: 'SEASON',
    target: `${season.year}年`,
    options: [`${season.year}年`, ...top.map(other => `${other.year}年`)],
    difficultyInput: {
      targetYear: season.year,
      targetTitleCount: Array.isArray(season.titles) ? season.titles.length : 0,
      targetLeague: season.league_name,
      distractors: top.map(other => ({
        year: other.year,
        titleCount: Array.isArray(other.titles) ? other.titles.length : 0,
        league: other.league_name
      }))
    }
  });
}

// --------------------------------------------------
// KIT_DETAIL — every verified competition-aware context.
// --------------------------------------------------
const contexts = kitTrust.allEligibleContexts();
for (const target of contexts) {
  const ordered = distractors.kit(target, contexts.filter(ctx => ctx.context_id !== target.context_id));
  const seenSponsors = new Set();
  const top = [];
  for (const ctx of ordered) {
    const key = String(ctx.chest_sponsor).trim().toUpperCase();
    if (key === String(target.chest_sponsor).trim().toUpperCase() || seenSponsors.has(key)) continue;
    seenSponsors.add(key);
    top.push(ctx);
    if (top.length === 3) break;
  }
  if (top.length < 3) continue;

  pushItem({
    id: `KIT_DETAIL:${target.context_id}`,
    generatorId: 'KIT_DETAIL',
    year: target.year,
    category: 'KIT',
    target: target.chest_sponsor,
    options: [target.chest_sponsor, ...top.map(ctx => ctx.chest_sponsor)],
    difficultyInput: {
      targetYear: target.year,
      targetScope: target.competition_scope,
      distractors: top.map(ctx => ({
        sponsor: ctx.chest_sponsor,
        year: ctx.year,
        scope: ctx.competition_scope
      }))
    }
  });
}

// --------------------------------------------------
// Aggregate and research-oriented reasonableness checks.
// --------------------------------------------------
const modeledGenerators = ['PLAYER_NUMBER', 'MANAGER_SEASON', 'SEASON_RANK', 'SEASON_SUMMARY', 'KIT_DETAIL'];
const byGenerator = {};
const overallBands = { EASY: 0, MEDIUM: 0, HARD: 0 };

for (const generatorId of modeledGenerators) {
  const rows = items.filter(item => item.generatorId === generatorId);
  const bands = { EASY: 0, MEDIUM: 0, HARD: 0 };
  for (const row of rows) {
    bands[row.difficulty.band] += 1;
    overallBands[row.difficulty.band] += 1;
  }
  const scores = rows.map(row => row.difficulty.score);
  const average = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  byGenerator[generatorId] = {
    count: rows.length,
    bands,
    min: scores.length ? Math.min(...scores) : null,
    max: scores.length ? Math.max(...scores) : null,
    average: average === null ? null : Math.round(average * 10) / 10
  };

  if (!rows.length) warn('COVERAGE', `${generatorId} produced no Q3 baseline items`);
  if (rows.length >= 5 && Object.values(bands).filter(Boolean).length === 1) {
    warn('BAND_COLLAPSE', `${generatorId} occupies only ${rows[0].difficulty.band}`);
  }
}

assert(items.length > 0, 'BASELINE', 'No difficulty items generated');
assert(Object.values(overallBands).filter(Boolean).length >= 2, 'BASELINE', 'Overall baseline occupies fewer than 2 difficulty bands');
assert(modeledGenerators.filter(id => (byGenerator[id]?.count || 0) > 0).length >= 4, 'BASELINE', 'Fewer than 4 modeled generators produced items');

const sorted = [...items].sort((a, b) => a.difficulty.score - b.difficulty.score || a.id.localeCompare(b.id));
const easiest = sorted.slice(0, 8).map(item => ({
  id: item.id,
  year: item.year,
  generatorId: item.generatorId,
  target: item.target,
  score: item.difficulty.score,
  band: item.difficulty.band,
  factors: item.difficulty.factors
}));
const hardest = sorted.slice(-8).reverse().map(item => ({
  id: item.id,
  year: item.year,
  generatorId: item.generatorId,
  target: item.target,
  score: item.difficulty.score,
  band: item.difficulty.band,
  factors: item.difficulty.factors
}));

const representativeYears = new Set([1993, 2000, 2006, 2007, 2011, 2017, 2023]);
const representative = items
  .filter(item => representativeYears.has(Number(item.year)))
  .slice(0, 30)
  .map(item => ({
    id: item.id,
    year: item.year,
    generatorId: item.generatorId,
    target: item.target,
    options: item.options,
    score: item.difficulty.score,
    band: item.difficulty.band,
    factors: item.difficulty.factors,
    cautions: item.difficulty.cautions
  }));

const report = {
  auditVersion: 'q3-2026-09-07',
  interpretation: difficulty.interpretation,
  thresholds: difficulty.thresholds,
  itemCount: items.length,
  overallBands,
  byGenerator,
  unmodeledInQ3: {
    PLAYER_POSITION: 'Fixed GK/DF/MF/FW options do not provide enough structural variation for a defensible Q3 estimate yet.',
    PLAYER_OVERLAP: 'Trust-disabled pending registration interval evidence.'
  },
  easiest,
  hardest,
  representative,
  warnings,
  failures,
  items
};

if (outPath) {
  fs.writeFileSync(path.resolve(root, outPath), JSON.stringify(report, null, 2) + '\n');
}

const summary = {
  auditVersion: report.auditVersion,
  interpretation: report.interpretation,
  itemCount: report.itemCount,
  overallBands: report.overallBands,
  byGenerator: report.byGenerator,
  easiest: report.easiest,
  hardest: report.hardest,
  warnings: report.warnings,
  failures: report.failures,
  artifact: outPath || null
};
console.log(JSON.stringify(summary, null, 2));

if (failures.length) process.exit(1);