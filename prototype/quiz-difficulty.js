// URAWA HISTORY — Q3 structural difficulty estimate
// This is NOT observed psychometric item difficulty. It predicts structural challenge
// from target/distractor relationships before enough user-response data exists.
(function () {
  'use strict';

  const VERSION = 'q3-2026-09-07';

  function clamp01(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function round(value, digits = 3) {
    const p = 10 ** digits;
    return Math.round(Number(value) * p) / p;
  }

  function band(score) {
    if (score < 40) return 'EASY';
    if (score < 70) return 'MEDIUM';
    return 'HARD';
  }

  function result(generatorId, factors, weighted, cautions = []) {
    const score = Math.max(0, Math.min(100, Math.round(weighted)));
    const reasons = Object.entries(factors)
      .filter(([, value]) => typeof value === 'number' || typeof value === 'boolean')
      .map(([key, value]) => `${key}=${typeof value === 'number' ? round(value) : value}`);
    return Object.freeze({
      modelVersion: VERSION,
      kind: 'STRUCTURAL_ESTIMATE',
      generatorId,
      score,
      band: band(score),
      factors: Object.freeze({ ...factors }),
      reasons: Object.freeze(reasons),
      cautions: Object.freeze([...cautions])
    });
  }

  function playerNumber(input) {
    const distractors = input.distractors || [];
    if (!distractors.length) return result('PLAYER_NUMBER', {}, 0, ['NO_DISTRACTORS']);

    const targetNumber = Number(input.targetNumber);
    const targetPosition = input.targetPosition;
    const samePositionRatio = distractors.filter(d => d.position === targetPosition).length / distractors.length;
    const avgNumberDistance = distractors.reduce((sum, d) => sum + Math.abs(Number(d.number) - targetNumber), 0) / distractors.length;
    const numberCloseness = 1 - clamp01(avgNumberDistance / 15);

    // Same-role alternatives and nearby numbers both increase retrieval competition.
    const score = 10 + (samePositionRatio * 45) + (numberCloseness * 45);
    return result('PLAYER_NUMBER', {
      samePositionRatio,
      avgNumberDistance,
      numberCloseness
    }, score);
  }

  function manager(input) {
    const distractors = input.distractors || [];
    if (!distractors.length) return result('MANAGER_SEASON', {}, 0, ['NO_DISTRACTORS']);

    const targetYear = Number(input.targetYear);
    const targetDecade = Math.floor(targetYear / 10);
    const sameDecadeRatio = distractors.filter(d => Math.floor(Number(d.year) / 10) === targetDecade).length / distractors.length;
    const avgYearDistance = distractors.reduce((sum, d) => sum + Math.abs(Number(d.year) - targetYear), 0) / distractors.length;
    const temporalCloseness = 1 - clamp01(avgYearDistance / 12);

    const score = 10 + (sameDecadeRatio * 50) + (temporalCloseness * 40);
    return result('MANAGER_SEASON', {
      sameDecadeRatio,
      avgYearDistance,
      temporalCloseness
    }, score);
  }

  function rank(input) {
    const distractors = (input.distractors || []).map(Number).filter(Number.isFinite);
    if (!distractors.length) return result('SEASON_RANK', {}, 0, ['NO_DISTRACTORS']);

    const correctRank = Number(input.correctRank);
    const avgRankDistance = distractors.reduce((sum, rankValue) => sum + Math.abs(rankValue - correctRank), 0) / distractors.length;
    const rankCloseness = 1 - clamp01((avgRankDistance - 1) / 3);

    // Objective prominence proxy: a championship/title-rich season can make an exact-rank
    // question easier because the result itself is more historically distinctive.
    const titleCount = Math.max(0, Number(input.titleCount) || 0);
    const prominenceEase = clamp01(titleCount / 2);

    const score = 25 + (rankCloseness * 70) - (prominenceEase * 25);
    return result('SEASON_RANK', {
      avgRankDistance,
      rankCloseness,
      titleCount,
      prominenceEase
    }, score, ['PROMINENCE_IS_PROXY_NOT_OBSERVED_USER_KNOWLEDGE']);
  }

  function seasonSummary(input) {
    const distractors = input.distractors || [];
    if (!distractors.length) return result('SEASON_SUMMARY', {}, 0, ['NO_DISTRACTORS']);

    const targetYear = Number(input.targetYear);
    const targetDecade = Math.floor(targetYear / 10);
    const targetTitles = Math.max(0, Number(input.targetTitleCount) || 0);
    const targetLeague = input.targetLeague || '';

    const avgYearDistance = distractors.reduce((sum, d) => sum + Math.abs(Number(d.year) - targetYear), 0) / distractors.length;
    const temporalCloseness = 1 - clamp01(avgYearDistance / 8);
    const sameDecadeRatio = distractors.filter(d => Math.floor(Number(d.year) / 10) === targetDecade).length / distractors.length;
    const titleProfileSimilarity = distractors.reduce((sum, d) => {
      const diff = Math.abs((Number(d.titleCount) || 0) - targetTitles);
      return sum + (1 - clamp01(diff / 2));
    }, 0) / distractors.length;
    const sameLeagueRatio = distractors.filter(d => (d.league || '') === targetLeague).length / distractors.length;
    const prominenceEase = clamp01(targetTitles / 2);

    const score = 15
      + (temporalCloseness * 35)
      + (sameDecadeRatio * 20)
      + (titleProfileSimilarity * 15)
      + (sameLeagueRatio * 10)
      - (prominenceEase * 20);

    return result('SEASON_SUMMARY', {
      avgYearDistance,
      temporalCloseness,
      sameDecadeRatio,
      titleProfileSimilarity,
      sameLeagueRatio,
      targetTitleCount: targetTitles,
      prominenceEase
    }, score, ['TITLE_COUNT_IS_A_DISTINCTIVENESS_PROXY']);
  }

  function kit(input) {
    const distractors = input.distractors || [];
    if (!distractors.length) return result('KIT_DETAIL', {}, 0, ['NO_DISTRACTORS']);

    const targetYear = Number(input.targetYear);
    const targetScope = input.targetScope;
    const sameScopeRatio = distractors.filter(d => d.scope === targetScope).length / distractors.length;
    const avgYearDistance = distractors.reduce((sum, d) => sum + Math.abs(Number(d.year) - targetYear), 0) / distractors.length;
    const temporalCloseness = 1 - clamp01(avgYearDistance / 10);
    const sameYearAlternative = distractors.some(d => Number(d.year) === targetYear) ? 1 : 0;

    const score = 10
      + (sameScopeRatio * 45)
      + (temporalCloseness * 30)
      + (sameYearAlternative * 15);

    return result('KIT_DETAIL', {
      sameScopeRatio,
      avgYearDistance,
      temporalCloseness,
      sameYearAlternative
    }, score);
  }

  function score(generatorId, input) {
    switch (generatorId) {
      case 'PLAYER_NUMBER': return playerNumber(input);
      case 'MANAGER_SEASON': return manager(input);
      case 'SEASON_RANK': return rank(input);
      case 'SEASON_SUMMARY': return seasonSummary(input);
      case 'KIT_DETAIL': return kit(input);
      default:
        return Object.freeze({
          modelVersion: VERSION,
          kind: 'UNMODELED',
          generatorId,
          score: null,
          band: 'UNMODELED',
          factors: Object.freeze({}),
          reasons: Object.freeze([]),
          cautions: Object.freeze(['GENERATOR_NOT_MODELED_IN_Q3_VERTICAL_SLICE'])
        });
    }
  }

  window.URAWA_DIFFICULTY_MODEL = Object.freeze({
    version: VERSION,
    interpretation: 'structural estimate only; observed item difficulty requires user response data',
    thresholds: Object.freeze({ EASY_MAX: 39, MEDIUM_MAX: 69, HARD_MIN: 70 }),
    score,
    playerNumber,
    manager,
    rank,
    seasonSummary,
    kit
  });
})();