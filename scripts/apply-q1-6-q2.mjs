#!/usr/bin/env node
import fs from 'node:fs';

const file = 'prototype/app.js';
let src = fs.readFileSync(file, 'utf8');

if (src.includes("const distractorPolicy = window.URAWA_DISTRACTOR_POLICY || null;")) {
  console.log('Q1.6/Q2 app migration already applied.');
  process.exit(0);
}

function replaceRequired(search, replacement, label) {
  if (!src.includes(search)) {
    throw new Error(`Migration anchor missing: ${label}`);
  }
  src = src.replace(search, replacement);
}

replaceRequired(
  "  const trust = window.URAWA_QUIZ_TRUST || null;\n",
  "  const trust = window.URAWA_QUIZ_TRUST || null;\n  const kitTrust = window.URAWA_KIT_TRUST || null;\n  const distractorPolicy = window.URAWA_DISTRACTOR_POLICY || null;\n  const uniformContexts = () => (window.URAWA_UNIFORM_CONTEXTS && window.URAWA_UNIFORM_CONTEXTS.contexts) || [];\n",
  'runtime modules'
);

replaceRequired(
  "        gateVersion: 'q1-2026-09-07'",
  "        gateVersion: 'q2-2026-09-07'",
  'gate version'
);

replaceRequired(
`      const samePos = otherPlayers.filter(x => x.rel.position === targetPS.position);
      const pool = samePos.length >= 3 ? samePos : otherPlayers;
      const distractors = shuffle(pool).slice(0, 3).map(x => x.player.name);

      return finalizeQuestion(generatorId, seasonData, {
        category: 'PLAYER',
        year: seasonData.year,
        question: \`${'${seasonData.year}'}年の浦和レッズで背番号「${'${targetPS.shirt_number}'}」を背負った選手は？\`,
        options: shuffle([targetPlayer.name, ...distractors]),`,
`      const orderedPlayers = distractorPolicy
        ? distractorPolicy.playerNumber(targetPS, otherPlayers)
        : otherPlayers;
      const distractorNames = orderedPlayers.slice(0, 3).map(x => x.player.name);

      return finalizeQuestion(generatorId, seasonData, {
        category: 'PLAYER',
        year: seasonData.year,
        question: \`${'${seasonData.year}'}年の浦和レッズで背番号「${'${targetPS.shirt_number}'}」を背負った選手は？\`,
        options: shuffle([targetPlayer.name, ...distractorNames]),`,
  'player-number distractors'
);

replaceRequired(
  "      otherSafeManagers.push(check.manager);",
  "      otherSafeManagers.push({ manager: check.manager, year: otherSeason.year });",
  'manager candidate metadata'
);

replaceRequired(
`    const distractors = shuffle(otherSafeManagers).slice(0, 3).map(m => m.name);

    return finalizeQuestion(generatorId, seasonData, {
      category: 'MANAGER',
      year: seasonData.year,
      question: \`${'${seasonData.year}'}年の浦和レッズの監督として登録データに記録されているのは？\`,
      options: shuffle([manager.name, ...distractors]),`,
`    const orderedManagers = distractorPolicy
      ? distractorPolicy.manager(seasonData.year, otherSafeManagers)
      : otherSafeManagers;
    const distractorNames = orderedManagers.slice(0, 3).map(x => x.manager.name);

    return finalizeQuestion(generatorId, seasonData, {
      category: 'MANAGER',
      year: seasonData.year,
      question: \`${'${seasonData.year}'}年の浦和レッズの監督として登録データに記録されているのは？\`,
      options: shuffle([manager.name, ...distractorNames]),`,
  'manager distractors'
);

replaceRequired(
`    const byDistance = validRanks.sort((a, b) => Math.abs(a - correctRank) - Math.abs(b - correctRank));
    const nearPool = byDistance.slice(0, Math.min(8, byDistance.length));
    const distractors = shuffle(nearPool).slice(0, 3).map(r => \`${'${r}'}位\`);
    const correct = \`${'${correctRank}'}位\`;`,
`    const orderedRanks = distractorPolicy
      ? distractorPolicy.rank(correctRank, Number(seasonData.total_teams))
      : validRanks.sort((a, b) => Math.abs(a - correctRank) - Math.abs(b - correctRank));
    const distractorNames = orderedRanks.slice(0, 3).map(r => \`${'${r}'}位\`);
    const correct = \`${'${correctRank}'}位\`;`,
  'rank distractors'
);
replaceRequired("      options: shuffle([correct, ...distractors]),\n      correct,\n      memoryHook: seasonData.memory_hook || `${seasonData.league_name}${correct}でシーズンを終えた。`,", "      options: shuffle([correct, ...distractorNames]),\n      correct,\n      memoryHook: seasonData.memory_hook || `${seasonData.league_name}${correct}でシーズンを終えた。`,", 'rank option variable');

replaceRequired(
`    const distractors = shuffle(otherSeasons).slice(0, 3).map(s => \`${'${s.year}'}年\`);
    const correct = \`${'${seasonData.year}'}年\`;`,
`    const orderedSeasons = distractorPolicy
      ? distractorPolicy.seasonSummary(seasonData, otherSeasons)
      : otherSeasons;
    const distractorNames = orderedSeasons.slice(0, 3).map(s => \`${'${s.year}'}年\`);
    const correct = \`${'${seasonData.year}'}年\`;`,
  'summary distractors'
);
replaceRequired("      options: shuffle([correct, ...distractors]),\n      correct,\n      memoryHook: seasonData.memory_hook || seasonData.summary,", "      options: shuffle([correct, ...distractorNames]),\n      correct,\n      memoryHook: seasonData.memory_hook || seasonData.summary,", 'summary option variable');

const kitStart = src.indexOf('  function generateKitDetail(seasonData) {');
const kitEnd = src.indexOf('  function generateQuizForSeason(seasonData) {', kitStart);
if (kitStart < 0 || kitEnd < 0) throw new Error('Migration anchor missing: kit generator');
const newKit = `  function generateKitDetail(seasonData) {
    const generatorId = 'KIT_DETAIL';
    if (!kitTrust) {
      return noteReject(generatorId, 'MISSING_KIT_TRUST', seasonData.season_id);
    }

    const eligible = kitTrust.eligibleContextsForSeason(seasonData.season_id);
    if (!eligible.length) {
      return noteReject(generatorId, 'MISSING_KIT_CONTEXT', seasonData.season_id, 'No verified competition-aware HOME context.');
    }

    const target = shuffle(eligible)[0];
    const allContexts = kitTrust.allEligibleContexts();
    const candidateContexts = allContexts.filter(ctx => ctx.context_id !== target.context_id);
    const ordered = distractorPolicy
      ? distractorPolicy.kit(target, candidateContexts)
      : candidateContexts;
    const distractorNames = [...new Set(ordered.map(ctx => ctx.chest_sponsor))]
      .filter(name => name !== target.chest_sponsor)
      .slice(0, 3);

    if (distractorNames.length < 3) {
      return noteReject(generatorId, 'INSUFFICIENT_DISTRACTORS', seasonData.season_id, 'Need 3 distinct verified sponsor values.');
    }

    return finalizeQuestion(generatorId, seasonData, {
      category: 'KIT',
      year: seasonData.year,
      question: \`${'${seasonData.year}'}年シーズンの${'${target.competition_label}'}用HOMEユニフォームの胸スポンサーは？\`,
      options: shuffle([target.chest_sponsor, ...distractorNames]),
      correct: target.chest_sponsor,
      memoryHook: \`${'${seasonData.year}'}年の${'${target.competition_label}'}用HOMEユニフォームは、胸に${'${target.chest_sponsor}'}を掲出した。\`,
      seasonId: seasonData.season_id,
      kitContextId: target.context_id
    });
  }

`;
src = src.slice(0, kitStart) + newKit + src.slice(kitEnd);

replaceRequired(
  "      const kit = db.uniforms.find(u => u.season_id === s.season_id && u.type === 'HOME');\n      const psList = db.playerSeasons.filter(ps => ps.season_id === s.season_id);",
  "      const kit = db.uniforms.find(u => u.season_id === s.season_id && u.type === 'HOME');\n      const verifiedKitContexts = kitTrust ? kitTrust.eligibleContextsForSeason(s.season_id) : [];\n      const domesticKitContext = verifiedKitContexts.find(ctx => ctx.competition_scope === 'domestic') || null;\n      const internationalKitContexts = verifiedKitContexts.filter(ctx => ctx.competition_scope === 'international');\n      const sponsorSummary = verifiedKitContexts.length\n        ? [domesticKitContext ? `国内 ${domesticKitContext.chest_sponsor}` : null, ...internationalKitContexts.map(ctx => `${ctx.competition_label} ${ctx.chest_sponsor}`)].filter(Boolean).join(' / ')\n        : '胸スポンサー未検証';\n      const psList = db.playerSeasons.filter(ps => ps.season_id === s.season_id);",
  'season kit context'
);

replaceRequired(
  "              <strong>${kit ? kit.supplier : 'Mizuno/Puma/Nike'} (${kit && kit.chest_sponsor ? kit.chest_sponsor : '—'})</strong>\n              <div style=\"font-size:0.8125rem; color:var(--muted);\">${kit ? kit.description : '公式ユニフォーム'}</div>",
  "              <strong>${kit ? kit.supplier : 'Mizuno/Puma/Nike'} (${sponsorSummary})</strong>\n              <div style=\"font-size:0.8125rem; color:var(--muted);\">${verifiedKitContexts.length ? '大会別の胸スポンサーを公式情報で確認済み。' : 'ユニフォーム自体は収録済み。胸スポンサーはQuiz Trust対象外。'}</div>",
  'season kit display'
);

fs.writeFileSync(file, src);
console.log('Applied Q1.6 competition-aware kits and Q2 distractor policy to prototype/app.js');