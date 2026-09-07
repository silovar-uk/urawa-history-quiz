// URAWA HISTORY — Quiz Trust Gate (Q0/Q1 + Q1.5 claim provenance)
(function () {
  'use strict';

  const REASONS = Object.freeze({
    UNVERIFIED_FACT: 'UNVERIFIED_FACT',
    MISSING_SOURCE: 'MISSING_SOURCE',
    MISSING_RELATION_SOURCE: 'MISSING_RELATION_SOURCE',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    AMBIGUOUS_CORRECT_ANSWER: 'AMBIGUOUS_CORRECT_ANSWER',
    DUPLICATE_OPTION: 'DUPLICATE_OPTION',
    SEMANTIC_DUPLICATE: 'SEMANTIC_DUPLICATE',
    MULTIPLE_MANAGER_SEASON: 'MULTIPLE_MANAGER_SEASON',
    OVERLAP_UNVERIFIED: 'OVERLAP_UNVERIFIED',
    SHIRT_NUMBER_NOT_UNIQUE: 'SHIRT_NUMBER_NOT_UNIQUE',
    INVALID_RANK_RANGE: 'INVALID_RANK_RANGE',
    ANSWER_LEAK_IN_STEM: 'ANSWER_LEAK_IN_STEM',
    INSUFFICIENT_DISTRACTORS: 'INSUFFICIENT_DISTRACTORS',
    NO_ELIGIBLE_TARGET: 'NO_ELIGIBLE_TARGET'
  });

  const RULES = Object.freeze({
    PLAYER_NUMBER: {
      required: ['confirmed season', 'sourced player', 'claim-backed player-season relationship', 'unique shirt number in season'],
      failClosed: true
    },
    PLAYER_POSITION: {
      required: ['confirmed season', 'sourced player', 'claim-backed player-season relationship', 'one normalized position'],
      failClosed: true
    },
    PLAYER_OVERLAP: {
      required: ['registration interval or equivalent overlap evidence', 'roster-completeness evidence for distractors'],
      failClosed: true,
      currentStatus: 'disabled'
    },
    MANAGER_SEASON: {
      required: ['confirmed season', 'sourced manager', 'sourced tenure', 'unambiguous single-manager season'],
      failClosed: true
    },
    SEASON_RANK: {
      required: ['confirmed season', 'known source', 'league_rank', 'total_teams', 'league_name'],
      failClosed: true
    },
    SEASON_SUMMARY: {
      required: ['confirmed season', 'known source', 'summary without direct year leak'],
      failClosed: true
    },
    KIT_DETAIL: {
      required: ['HOME kit', 'chest sponsor', 'claim-backed chest_sponsor provenance'],
      failClosed: true
    }
  });

  function ok(extra = {}) {
    return { ok: true, ...extra };
  }

  function fail(reason, detail = '') {
    return { ok: false, reason, detail };
  }

  function provenanceRegistry() {
    return window.URAWA_CLAIM_PROVENANCE || { claims: [], issues: [] };
  }

  function claimSourceIds() {
    const ids = [];
    for (const claim of provenanceRegistry().claims || []) {
      for (const field of Object.values(claim.fields || {})) {
        if (Array.isArray(field.sourceIds)) ids.push(...field.sourceIds);
      }
    }
    return ids;
  }

  function sourceIdSet(db) {
    // Claim source metadata is validated against data/sources.json by CI.
    // The union keeps the runtime compatible with the legacy data-bundle fallback,
    // whose embedded source list may lag the canonical JSON during this vertical slice.
    return new Set([
      ...(db && db.sources || []).map(s => s.source_id),
      ...claimSourceIds()
    ]);
  }

  function entityIdentity(entity) {
    if (!entity) return null;
    if (entity.id && String(entity.id).startsWith('ps_')) {
      return { entityType: 'player_season', entityId: entity.id };
    }
    if (entity.uniform_id) {
      return { entityType: 'uniform', entityId: entity.uniform_id };
    }
    return null;
  }

  function getClaim(entity) {
    const identity = entityIdentity(entity);
    if (!identity) return null;
    return (provenanceRegistry().claims || []).find(c =>
      c.entityType === identity.entityType && c.entityId === identity.entityId
    ) || null;
  }

  function normalizedComparable(value) {
    return String(value ?? '').trim().normalize('NFKC');
  }

  function fieldClaimMatches(entity, fieldName, db) {
    const claim = getClaim(entity);
    const field = claim && claim.fields && claim.fields[fieldName];
    if (!field || !Array.isArray(field.sourceIds) || !field.sourceIds.length) return false;
    if (normalizedComparable(field.value) !== normalizedComparable(entity[fieldName])) return false;
    const known = sourceIdSet(db);
    return field.sourceIds.every(id => known.has(id));
  }

  function hasClaimBackedSources(entity, db) {
    const identity = entityIdentity(entity);
    if (!identity) return false;

    if (identity.entityType === 'player_season') {
      // Current app.js uses one relationship source gate for PLAYER_NUMBER and PLAYER_POSITION.
      // Therefore a relationship is admitted only when BOTH fields used by those generators
      // are independently supported and match the current base values.
      return fieldClaimMatches(entity, 'shirt_number', db) && fieldClaimMatches(entity, 'position', db);
    }

    if (identity.entityType === 'uniform') {
      return fieldClaimMatches(entity, 'chest_sponsor', db);
    }

    return false;
  }

  function hasKnownSources(entity, db) {
    if (!entity) return false;
    if (Array.isArray(entity.source_ids) && entity.source_ids.length > 0) {
      const known = sourceIdSet(db);
      return entity.source_ids.every(id => known.has(id));
    }
    return hasClaimBackedSources(entity, db);
  }

  function isConfirmedSeason(season, db) {
    if (!season) return fail(REASONS.MISSING_REQUIRED_FIELD, 'season missing');
    if (season.verification_status !== 'confirmed') {
      return fail(REASONS.UNVERIFIED_FACT, `season verification_status=${season.verification_status || 'missing'}`);
    }
    if (!hasKnownSources(season, db)) {
      return fail(REASONS.MISSING_SOURCE, 'season source_ids missing or unknown');
    }
    return ok();
  }

  function managerNoteLooksAmbiguous(notes) {
    if (!notes) return false;
    const patterns = [
      /途中/,
      /交代/,
      /解任/,
      /引き継/,
      /代行/,
      /夏に/,
      /秋に/,
      /復帰して/,
      /から.+へ/
    ];
    return patterns.some(re => re.test(notes));
  }

  function getSafeManagerForSeason(seasonId, db) {
    const season = db.seasons.find(s => s.season_id === seasonId);
    const seasonCheck = isConfirmedSeason(season, db);
    if (!seasonCheck.ok) return seasonCheck;

    const tenures = db.managerTenures.filter(t => t.season_id === seasonId);
    if (tenures.length !== 1) {
      return fail(REASONS.MULTIPLE_MANAGER_SEASON, `tenure rows=${tenures.length}`);
    }

    const tenure = tenures[0];
    if (!hasKnownSources(tenure, db)) {
      return fail(REASONS.MISSING_SOURCE, 'manager tenure source_ids missing or unknown');
    }
    if (managerNoteLooksAmbiguous(tenure.notes)) {
      return fail(REASONS.MULTIPLE_MANAGER_SEASON, 'notes indicate mid-season change/interim context');
    }

    const manager = db.managers.find(m => m.manager_id === tenure.manager_id);
    if (!manager) return fail(REASONS.MISSING_REQUIRED_FIELD, 'manager master missing');
    if (!hasKnownSources(manager, db)) {
      return fail(REASONS.MISSING_SOURCE, 'manager source_ids missing or unknown');
    }

    if (tenure.role && tenure.role !== '監督') {
      return fail(REASONS.AMBIGUOUS_CORRECT_ANSWER, `role=${tenure.role}`);
    }

    return ok({ tenure, manager });
  }

  function validateRankFact(season, db) {
    const seasonCheck = isConfirmedSeason(season, db);
    if (!seasonCheck.ok) return seasonCheck;

    const rank = Number(season.league_rank);
    const total = Number(season.total_teams);
    if (!Number.isInteger(rank) || !Number.isInteger(total) || !season.league_name) {
      return fail(REASONS.MISSING_REQUIRED_FIELD, 'league_rank / total_teams / league_name required');
    }
    if (rank < 1 || rank > total || total < 4) {
      return fail(REASONS.INVALID_RANK_RANGE, `rank=${rank}, total=${total}`);
    }
    return ok();
  }

  function summaryLeaksYear(season) {
    if (!season || !season.summary || !season.year) return false;
    return new RegExp(`(^|\\D)${String(season.year)}(\\D|$)`).test(season.summary);
  }

  function validateSummaryFact(season, db) {
    const seasonCheck = isConfirmedSeason(season, db);
    if (!seasonCheck.ok) return seasonCheck;
    if (!season.summary) return fail(REASONS.MISSING_REQUIRED_FIELD, 'summary missing');
    if (summaryLeaksYear(season)) {
      return fail(REASONS.ANSWER_LEAK_IN_STEM, `summary contains ${season.year}`);
    }
    return ok();
  }

  function normalizeOption(value) {
    return String(value ?? '')
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFKC')
      .toLocaleLowerCase('ja-JP');
  }

  function validateQuestionBase(question) {
    if (!question || !question.question || !question.correct) {
      return fail(REASONS.MISSING_REQUIRED_FIELD, 'question/correct missing');
    }
    if (!Array.isArray(question.options) || question.options.length !== 4) {
      return fail(REASONS.INSUFFICIENT_DISTRACTORS, 'exactly four options required');
    }

    const normalized = question.options.map(normalizeOption);
    if (new Set(normalized).size !== 4) {
      return fail(REASONS.SEMANTIC_DUPLICATE, 'normalized options are not unique');
    }

    const correctNorm = normalizeOption(question.correct);
    const correctCount = normalized.filter(v => v === correctNorm).length;
    if (correctCount !== 1) {
      return fail(REASONS.AMBIGUOUS_CORRECT_ANSWER, `correct option count=${correctCount}`);
    }

    return ok();
  }

  window.URAWA_QUIZ_TRUST = Object.freeze({
    version: 'q1.5-2026-09-07',
    REASONS,
    RULES,
    hasKnownSources,
    fieldClaimMatches,
    hasClaimBackedSources,
    isConfirmedSeason,
    getSafeManagerForSeason,
    validateRankFact,
    summaryLeaksYear,
    validateSummaryFact,
    validateQuestionBase
  });
})();