#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const readText = rel => fs.readFileSync(path.join(root, rel), 'utf8');

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
  'prototype/quiz-distractors.js'
]) {
  vm.runInContext(readText(rel), sandbox, { filename: rel });
}

const provenance = sandbox.window.URAWA_CLAIM_PROVENANCE;
const uniformRegistry = sandbox.window.URAWA_UNIFORM_CONTEXTS;
const trust = sandbox.window.URAWA_QUIZ_TRUST;
const kitTrust = sandbox.window.URAWA_KIT_TRUST;
const policy = sandbox.window.URAWA_DISTRACTOR_POLICY;
const failures = [];
const sourceIds = new Set(db.sources.map(s => s.source_id));

function fail(area, detail) {
  failures.push({ area, detail });
}

function assert(condition, area, detail) {
  if (!condition) fail(area, detail);
}

// --------------------------------------------------
// Q1.5 provenance registry integrity
// --------------------------------------------------
let provenanceClaimCount = 0;
for (const claim of provenance.claims || []) {
  for (const [fieldName, field] of Object.entries(claim.fields || {})) {
    provenanceClaimCount += 1;
    assert(Array.isArray(field.sourceIds) && field.sourceIds.length > 0, 'PROVENANCE', `${claim.entityId}.${fieldName} has no sourceIds`);
    for (const sourceId of field.sourceIds || []) {
      assert(sourceIds.has(sourceId), 'PROVENANCE', `${claim.entityId}.${fieldName} unknown source ${sourceId}`);
    }
  }
}

// --------------------------------------------------
// Q1.6 competition-aware kit model
// --------------------------------------------------
const contexts = uniformRegistry.contexts || [];
const contextKeys = new Set();
const sponsorSet = new Set();
for (const ctx of contexts) {
  const checked = kitTrust.validateContext(ctx);
  assert(checked.ok, 'KIT_CONTEXT', `${ctx.context_id}: ${checked.reason || checked.detail || 'invalid'}`);
  const key = `${ctx.season_id}|${ctx.type}|${ctx.competition_scope}`;
  assert(!contextKeys.has(key), 'KIT_CONTEXT', `duplicate context key ${key}`);
  contextKeys.add(key);
  sponsorSet.add(ctx.chest_sponsor);
  for (const sourceId of ctx.source_ids || []) {
    assert(sourceIds.has(sourceId), 'KIT_CONTEXT', `${ctx.context_id} unknown source ${sourceId}`);
  }
}
assert(sponsorSet.size >= 4, 'KIT_CONTEXT', `need >=4 distinct sponsors, found ${sponsorSet.size}`);

const kitQuestions = [];
for (const target of contexts) {
  const ordered = policy.kit(target, contexts.filter(ctx => ctx.context_id !== target.context_id));
  const names = [...new Set(ordered.map(ctx => ctx.chest_sponsor))]
    .filter(name => name !== target.chest_sponsor)
    .slice(0, 3);
  assert(names.length === 3, 'KIT_DISTRACTOR', `${target.context_id} has ${names.length} distractors`);
  assert(new Set([target.chest_sponsor, ...names]).size === 4, 'KIT_DISTRACTOR', `${target.context_id} options not unique`);
  kitQuestions.push({
    context: target.context_id,
    year: target.year,
    scope: target.competition_label,
    correct: target.chest_sponsor,
    distractors: names
  });
}

// --------------------------------------------------
// Q2 player-number policy
// --------------------------------------------------
const playerExamples = [];
for (const season of db.seasons) {
  const rels = db.playerSeasons.filter(rel => rel.season_id === season.season_id && rel.shirt_number !== null && trust.hasKnownSources(rel, db));
  if (rels.length < 4) continue;
  const target = rels[0];
  const candidates = rels.slice(1).map(rel => ({ rel, player: db.players.find(p => p.player_id === rel.player_id) })).filter(x => x.player);
  const ordered = policy.playerNumber(target, candidates);
  assert(ordered.length >= 3, 'PLAYER_DISTRACTOR', `${season.year} lacks 3 candidates`);
  const samePosAvailable = candidates.filter(x => x.rel.position === target.position).length;
  if (samePosAvailable > 0) {
    assert(ordered[0].rel.position === target.position, 'PLAYER_DISTRACTOR', `${season.year} did not prioritize same position`);
  }
  playerExamples.push({
    year: season.year,
    targetNumber: target.shirt_number,
    targetPosition: target.position,
    distractors: ordered.slice(0, 3).map(x => ({ name: x.player.name, number: x.rel.shirt_number, position: x.rel.position }))
  });
}

// --------------------------------------------------
// Q2 manager policy
// --------------------------------------------------
const safeManagersBySeason = [];
for (const season of db.seasons) {
  const checked = trust.getSafeManagerForSeason(season.season_id, db);
  if (checked.ok) safeManagersBySeason.push({ year: season.year, manager: checked.manager });
}
for (const target of safeManagersBySeason) {
  const candidates = safeManagersBySeason.filter(x => x.manager.manager_id !== target.manager.manager_id);
  const ordered = policy.manager(target.year, candidates);
  assert(ordered.length >= 3, 'MANAGER_DISTRACTOR', `${target.year} lacks 3 managers`);
  const firstThree = ordered.slice(0, 3);
  assert(new Set(firstThree.map(x => x.manager.manager_id)).size === 3, 'MANAGER_DISTRACTOR', `${target.year} duplicate managers`);
}

// --------------------------------------------------
// Q2 rank policy
// --------------------------------------------------
for (const season of db.seasons) {
  const checked = trust.validateRankFact(season, db);
  if (!checked.ok) continue;
  const correct = Number(season.league_rank);
  const ordered = policy.rank(correct, Number(season.total_teams));
  const top = ordered.slice(0, 3);
  assert(top.length === 3, 'RANK_DISTRACTOR', `${season.year} lacks 3 ranks`);
  const distances = top.map(x => Math.abs(x - correct));
  assert(distances[0] <= distances[1] && distances[1] <= distances[2], 'RANK_DISTRACTOR', `${season.year} rank distances not ordered`);
}

// --------------------------------------------------
// Q2 season-summary policy
// --------------------------------------------------
const summaryExamples = [];
for (const target of db.seasons) {
  const checked = trust.validateSummaryFact(target, db);
  if (!checked.ok) continue;
  const candidates = db.seasons.filter(s => s.season_id !== target.season_id && trust.validateSummaryFact(s, db).ok);
  const ordered = policy.seasonSummary(target, candidates);
  const top = ordered.slice(0, 3);
  assert(top.length === 3, 'SUMMARY_DISTRACTOR', `${target.year} lacks 3 seasons`);
  assert(new Set(top.map(s => s.season_id)).size === 3, 'SUMMARY_DISTRACTOR', `${target.year} duplicate seasons`);
  const maxYearDistance = Math.max(...top.map(s => Math.abs(Number(s.year) - Number(target.year))));
  assert(maxYearDistance <= 10, 'SUMMARY_DISTRACTOR', `${target.year} top distractor too remote: ${maxYearDistance} years`);
  if ([2006, 2017, 2023].includes(Number(target.year))) {
    summaryExamples.push({ target: target.year, distractors: top.map(s => s.year) });
  }
}

const kitEligibleSeasons = [...new Set(contexts.map(ctx => ctx.season_id))];
const report = {
  auditVersion: 'q2-2026-09-07',
  provenance: {
    registryVersion: provenance.version,
    fieldClaims: provenanceClaimCount,
    knownIssues: (provenance.issues || []).length
  },
  kit: {
    registryVersion: uniformRegistry.version,
    contexts: contexts.length,
    distinctSponsors: sponsorSet.size,
    eligibleSeasons: kitEligibleSeasons,
    sampleQuestions: kitQuestions
  },
  distractorPolicy: {
    version: policy.version,
    playerExamples,
    safeManagerSeasons: safeManagersBySeason.length,
    summaryExamples
  },
  failures
};

console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);