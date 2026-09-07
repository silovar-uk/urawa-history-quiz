// URAWA HISTORY — Q1.6 kit context trust gate
(function () {
  'use strict';

  function ok(extra = {}) { return { ok: true, ...extra }; }
  function fail(reason, detail = '') { return { ok: false, reason, detail }; }

  function contexts() {
    return (window.URAWA_UNIFORM_CONTEXTS && window.URAWA_UNIFORM_CONTEXTS.contexts) || [];
  }

  function validateContext(ctx) {
    if (!ctx) return fail('MISSING_KIT_CONTEXT');
    if (ctx.verification_status !== 'confirmed') return fail('UNVERIFIED_KIT_CONTEXT', ctx.context_id || 'unknown');
    if (!ctx.season_id || !ctx.type || !ctx.competition_scope || !ctx.competition_label || !ctx.chest_sponsor) {
      return fail('MISSING_KIT_CONTEXT_FIELD', ctx.context_id || 'unknown');
    }
    if (ctx.type !== 'HOME') return fail('UNSUPPORTED_KIT_TYPE', ctx.type);
    if (!Array.isArray(ctx.source_ids) || ctx.source_ids.length === 0) {
      return fail('MISSING_KIT_CONTEXT_SOURCE', ctx.context_id || 'unknown');
    }
    return ok({ context: ctx });
  }

  function eligibleContextsForSeason(seasonId) {
    return contexts().filter(ctx => ctx.season_id === seasonId && validateContext(ctx).ok);
  }

  function allEligibleContexts() {
    return contexts().filter(ctx => validateContext(ctx).ok);
  }

  window.URAWA_KIT_TRUST = Object.freeze({
    version: 'q1.6-2026-09-07',
    validateContext,
    eligibleContextsForSeason,
    allEligibleContexts
  });
})();