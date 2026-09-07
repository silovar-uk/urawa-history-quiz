#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

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
  'prototype/kit-trust.js'
]) {
  const code = fs.readFileSync(path.join(root, rel), 'utf8');
  vm.runInContext(code, sandbox, { filename: rel });
}

const trust = sandbox.window.URAWA_QUIZ_TRUST;
const provenance = sandbox.window.URAWA_CLAIM_PROVENANCE;
const kitTrust = sandbox.window.URAWA_KIT_TRUST;
const uniformRegistry = sandbox.window.URAWA_UNIFORM_CONTEXTS;

if (!trust || !provenance || !kitTrust || !uniformRegistry) {
  console.error('Quiz Trust Gate, provenance registry, or kit context registry could not be loaded.');
  process.exit(1);
}

const results = {};
const rejectionReasons = {};
const invariantFailures = [];
const provenanceFailures = [];

function bucket(id) {
  if (!results[id]) results[id] = { eligible: 0, rejected: 0, reasons: {} };
  return results[id];
}

function reject(id, reason, seasonId, detail = '') {
  const b = bucket(id);
  b.rejected += 1;
  b.reasons[reason] = (b.reasons[reason] || 0) + 1;
  rejectionReasons[reason] = (rejectionReasons[reason] || 0) + 1;
  return { ok: false, reason, seasonId, detail };
}

function pass(id) {
  bucket(id).eligible += 1;
}

function baseQuestionIsValid(id, seasonId, question) {
  const checked = trust.validateQuestionBase(question);
  if (!checked.ok) {
    invariantFailures.push({ id, seasonId, reason: checked.reason, detail: checked.detail });
    return false;
  }
  return true;
}

function entityForClaim(claim) {
  if (claim.entityType === 'player_season') return db.playerSeasons.find(x => x.id === claim.entityId);
  if (claim.entityType === 'uniform') return db.uniforms.find(x => x.uniform_id === claim.entityId);
  return null;
}

function normalize(value) {
  return String(value ?? '').trim().normalize('NFKC');
}

function auditProvenanceRegistry() {
  const knownSources = new Set(db.sources.map(s => s.source_id));
  const seen = new Set();

  for (const claim of provenance.claims || []) {
    const key = `${claim.entityType}:${claim.entityId}`;
    if (seen.has(key)) {
      provenanceFailures.push({ type: 'DUPLICATE_CLAIM_ENTITY', key });
      continue;
    }
    seen.add(key);

    const entity = entityForClaim(claim);
    if (!entity) {
      provenanceFailures.push({ type: 'CLAIM_ENTITY_MISSING', key });
      continue;
    }

    for (const [fieldName, field] of Object.entries(claim.fields || {})) {
      if (!Array.isArray(field.sourceIds) || !field.sourceIds.length) {
        provenanceFailures.push({ type: 'CLAIM_SOURCE_MISSING', key, fieldName });
        continue;
      }
      const unknown = field.sourceIds.filter(id => !knownSources.has(id));
      if (unknown.length) provenanceFailures.push({ type: 'CLAIM_SOURCE_UNKNOWN', key, fieldName, unknown });
      if (normalize(entity[fieldName]) !== normalize(field.value)) {
        provenanceFailures.push({
          type: 'CLAIM_VALUE_MISMATCH', key, fieldName,
          baseValue: entity[fieldName], claimValue: field.value
        });
      }
    }
  }
}

function auditUniformContextRegistry() {
  const knownSources = new Set(db.sources.map(s => s.source_id));
  const seen = new Set();
  for (const ctx of uniformRegistry.contexts || []) {
    const checked = kitTrust.validateContext(ctx);
    if (!checked.ok) {
      provenanceFailures.push({ type: 'KIT_CONTEXT_INVALID', contextId: ctx.context_id, reason: checked.reason, detail: checked.detail });
      continue;
    }
    const key = `${ctx.season_id}:${ctx.type}:${ctx.competition_scope}`;
    if (seen.has(key)) provenanceFailures.push({ type: 'KIT_CONTEXT_DUPLICATE', key });
    seen.add(key);
    const unknown = (ctx.source_ids || []).filter(id => !knownSources.has(id));
    if (unknown.length) provenanceFailures.push({ type: 'KIT_CONTEXT_SOURCE_UNKNOWN', contextId: ctx.context_id, unknown });
  }
}

function auditPlayerNumber(season) {
  const id = 'PLAYER_NUMBER';
  const ps = db.playerSeasons.filter(x => x.season_id === season.season_id);
  const sourced = ps.filter(x => x.shirt_number !== null && trust.hasKnownSources(x, db));
  if (!sourced.length) return reject(id, 'MISSING_RELATION_SOURCE', season.season_id);

  const uniqueTargets = sourced.filter(target => {
    const wearers = new Set(sourced.filter(x => String(x.shirt_number) === String(target.shirt_number)).map(x => x.player_id));
    return wearers.size === 1;
  });
  if (!uniqueTargets.length) return reject(id, 'SHIRT_NUMBER_NOT_UNIQUE', season.season_id);

  for (const target of uniqueTargets) {
    const targetPlayer = db.players.find(p => p.player_id === target.player_id);
    if (!targetPlayer || !trust.hasKnownSources(targetPlayer, db)) continue;

    const distractors = [];
    const seen = new Set([target.player_id]);
    for (const rel of sourced) {
      if (seen.has(rel.player_id) || String(rel.shirt_number) === String(target.shirt_number)) continue;
      const player = db.players.find(p => p.player_id === rel.player_id);
      if (!player || !trust.hasKnownSources(player, db)) continue;
      seen.add(rel.player_id);
      distractors.push(player.name);
    }
    if (distractors.length < 3) continue;

    const q = {
      question: `${season.year}年の浦和レッズで背番号「${target.shirt_number}」を背負った選手は？`,
      options: [targetPlayer.name, ...distractors.slice(0, 3)],
      correct: targetPlayer.name
    };
    if (baseQuestionIsValid(id, season.season_id, q)) return pass(id);
  }
  return reject(id, 'INSUFFICIENT_DISTRACTORS', season.season_id);
}

function auditPlayerPosition(season) {
  const id = 'PLAYER_POSITION';
  const positions = ['GK', 'DF', 'MF', 'FW'];
  const ps = db.playerSeasons.filter(x => x.season_id === season.season_id);
  const sourced = ps.filter(x => trust.hasKnownSources(x, db) && positions.includes(x.position));
  if (!sourced.length) return reject(id, 'MISSING_RELATION_SOURCE', season.season_id);

  for (const target of sourced) {
    const player = db.players.find(p => p.player_id === target.player_id);
    if (!player || !trust.hasKnownSources(player, db)) continue;
    const pos = new Set(sourced.filter(x => x.player_id === target.player_id).map(x => x.position));
    if (pos.size !== 1) continue;
    const q = {
      question: `${season.year}年シーズンの ${player.name} の登録ポジションは？`,
      options: positions,
      correct: target.position
    };
    if (baseQuestionIsValid(id, season.season_id, q)) return pass(id);
  }
  return reject(id, 'AMBIGUOUS_CORRECT_ANSWER', season.season_id);
}

function auditPlayerOverlap(season) {
  return reject('PLAYER_OVERLAP', 'OVERLAP_UNVERIFIED', season.season_id, 'No registration interval / roster-completeness evidence.');
}

function auditManager(season) {
  const id = 'MANAGER_SEASON';
  const check = trust.getSafeManagerForSeason(season.season_id, db);
  if (!check.ok) return reject(id, check.reason, season.season_id, check.detail);

  const names = [];
  const seen = new Set([check.manager.manager_id]);
  for (const s of db.seasons) {
    if (s.season_id === season.season_id) continue;
    const other = trust.getSafeManagerForSeason(s.season_id, db);
    if (!other.ok || seen.has(other.manager.manager_id)) continue;
    seen.add(other.manager.manager_id);
    names.push(other.manager.name);
  }
  if (names.length < 3) return reject(id, 'INSUFFICIENT_DISTRACTORS', season.season_id);

  const q = {
    question: `${season.year}年の浦和レッズの監督として登録データに記録されているのは？`,
    options: [check.manager.name, ...names.slice(0, 3)],
    correct: check.manager.name
  };
  if (baseQuestionIsValid(id, season.season_id, q)) return pass(id);
  return reject(id, 'AMBIGUOUS_CORRECT_ANSWER', season.season_id);
}

function auditRank(season) {
  const id = 'SEASON_RANK';
  const check = trust.validateRankFact(season, db);
  if (!check.ok) return reject(id, check.reason, season.season_id, check.detail);

  const correct = Number(season.league_rank);
  const other = Array.from({ length: Number(season.total_teams) }, (_, i) => i + 1).filter(x => x !== correct);
  if (other.length < 3) return reject(id, 'INSUFFICIENT_DISTRACTORS', season.season_id);

  const q = {
    question: `${season.year}年シーズンの浦和レッズの${season.league_name}最終順位は？`,
    options: [`${correct}位`, ...other.slice(0, 3).map(x => `${x}位`)],
    correct: `${correct}位`
  };
  if (baseQuestionIsValid(id, season.season_id, q)) return pass(id);
  return reject(id, 'AMBIGUOUS_CORRECT_ANSWER', season.season_id);
}

function auditSummary(season) {
  const id = 'SEASON_SUMMARY';
  const check = trust.validateSummaryFact(season, db);
  if (!check.ok) return reject(id, check.reason, season.season_id, check.detail);
  const others = db.seasons.filter(s => s.season_id !== season.season_id && trust.isConfirmedSeason(s, db).ok && s.summary && !trust.summaryLeaksYear(s));
  if (others.length < 3) return reject(id, 'INSUFFICIENT_DISTRACTORS', season.season_id);

  const q = {
    question: `「${season.summary}」 このシーズンはいつ？`,
    options: [`${season.year}年`, ...others.slice(0, 3).map(s => `${s.year}年`)],
    correct: `${season.year}年`
  };
  if (baseQuestionIsValid(id, season.season_id, q)) return pass(id);
  return reject(id, 'AMBIGUOUS_CORRECT_ANSWER', season.season_id);
}

function auditKit(season) {
  const id = 'KIT_DETAIL';
  const contexts = kitTrust.eligibleContextsForSeason(season.season_id);
  if (!contexts.length) return reject(id, 'MISSING_KIT_CONTEXT', season.season_id);

  const allContexts = kitTrust.allEligibleContexts();
  for (const target of contexts) {
    const sponsors = [...new Set(allContexts
      .filter(ctx => ctx.context_id !== target.context_id && ctx.chest_sponsor !== target.chest_sponsor)
      .map(ctx => ctx.chest_sponsor))];
    if (sponsors.length < 3) continue;
    const q = {
      question: `${season.year}年シーズンの${target.competition_label}用HOMEユニフォームの胸スポンサーは？`,
      options: [target.chest_sponsor, ...sponsors.slice(0, 3)],
      correct: target.chest_sponsor
    };
    if (baseQuestionIsValid(id, season.season_id, q)) return pass(id);
  }
  return reject(id, 'INSUFFICIENT_DISTRACTORS', season.season_id);
}

auditProvenanceRegistry();
auditUniformContextRegistry();

for (const season of db.seasons) {
  const seasonCheck = trust.isConfirmedSeason(season, db);
  if (!seasonCheck.ok) {
    for (const id of Object.keys(trust.RULES)) reject(id, seasonCheck.reason, season.season_id, seasonCheck.detail);
    continue;
  }
  auditPlayerNumber(season);
  auditPlayerPosition(season);
  auditPlayerOverlap(season);
  auditManager(season);
  auditRank(season);
  auditSummary(season);
  auditKit(season);
}

const report = {
  trustVersion: trust.version,
  provenanceVersion: provenance.version,
  uniformContextVersion: uniformRegistry.version,
  seasons: db.seasons.length,
  sources: db.sources.length,
  provenanceClaims: (provenance.claims || []).length,
  uniformContexts: (uniformRegistry.contexts || []).length,
  knownDataIssues: (provenance.issues || []).length,
  generators: results,
  rejectionReasons,
  invariantFailures,
  provenanceFailures
};

console.log(JSON.stringify(report, null, 2));
if (invariantFailures.length || provenanceFailures.length) process.exit(1);
