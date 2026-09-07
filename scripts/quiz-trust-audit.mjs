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

const trustCode = fs.readFileSync(path.join(root, 'prototype/quiz-trust.js'), 'utf8');
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(trustCode, sandbox, { filename: 'quiz-trust.js' });
const trust = sandbox.window.URAWA_QUIZ_TRUST;

if (!trust) {
  console.error('Quiz Trust Gate could not be loaded.');
  process.exit(1);
}

const results = {};
const rejectionReasons = {};
const failures = [];

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
    failures.push({ id, seasonId, reason: checked.reason, detail: checked.detail });
    return false;
  }
  return true;
}

function auditPlayerNumber(season) {
  const id = 'PLAYER_NUMBER';
  const ps = db.playerSeasons.filter(x => x.season_id === season.season_id);
  const sourced = ps.filter(x => x.shirt_number !== null && trust.hasKnownSources(x, db));
  if (!sourced.length) return reject(id, 'MISSING_RELATION_SOURCE', season.season_id);

  const uniqueTargets = sourced.filter(target => {
    const wearers = new Set(
      sourced.filter(x => String(x.shirt_number) === String(target.shirt_number)).map(x => x.player_id)
    );
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
  return reject(
    'PLAYER_OVERLAP',
    'OVERLAP_UNVERIFIED',
    season.season_id,
    'No registration interval / roster-completeness evidence.'
  );
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
  const other = Array.from({ length: Number(season.total_teams) }, (_, i) => i + 1)
    .filter(x => x !== correct);
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
  const others = db.seasons.filter(s =>
    s.season_id !== season.season_id &&
    trust.isConfirmedSeason(s, db).ok &&
    s.summary &&
    !trust.summaryLeaksYear(s)
  );
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
  const kit = db.uniforms.find(u => u.season_id === season.season_id && u.type === 'HOME');
  if (!kit || !kit.chest_sponsor) return reject(id, 'MISSING_REQUIRED_FIELD', season.season_id);
  if (!trust.hasKnownSources(kit, db)) return reject(id, 'MISSING_SOURCE', season.season_id);

  const sponsors = [...new Set(
    db.uniforms
      .filter(u => u.type === 'HOME' && u.chest_sponsor && trust.hasKnownSources(u, db))
      .map(u => u.chest_sponsor)
  )].filter(x => x !== kit.chest_sponsor);
  if (sponsors.length < 3) return reject(id, 'INSUFFICIENT_DISTRACTORS', season.season_id);

  const q = {
    question: `${season.year}年シーズンのHOMEユニフォームの胸スポンサーは？`,
    options: [kit.chest_sponsor, ...sponsors.slice(0, 3)],
    correct: kit.chest_sponsor
  };
  if (baseQuestionIsValid(id, season.season_id, q)) return pass(id);
  return reject(id, 'AMBIGUOUS_CORRECT_ANSWER', season.season_id);
}

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
  seasons: db.seasons.length,
  sources: db.sources.length,
  generators: results,
  rejectionReasons,
  invariantFailures: failures
};

console.log(JSON.stringify(report, null, 2));

if (failures.length) process.exit(1);
