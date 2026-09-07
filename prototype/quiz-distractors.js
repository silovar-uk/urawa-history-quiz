// URAWA HISTORY — Q2 distractor quality policy
(function () {
  'use strict';

  function uniqueBy(items, keyFn) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
      const key = keyFn(item);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out;
  }

  function playerNumber(targetRel, candidates) {
    return [...candidates].sort((a, b) => {
      const aSamePos = a.rel.position === targetRel.position ? 0 : 1;
      const bSamePos = b.rel.position === targetRel.position ? 0 : 1;
      if (aSamePos !== bSamePos) return aSamePos - bSamePos;
      const aDistance = Math.abs(Number(a.rel.shirt_number) - Number(targetRel.shirt_number));
      const bDistance = Math.abs(Number(b.rel.shirt_number) - Number(targetRel.shirt_number));
      if (aDistance !== bDistance) return aDistance - bDistance;
      return String(a.player.name).localeCompare(String(b.player.name), 'ja');
    });
  }

  function manager(targetYear, candidates) {
    const unique = uniqueBy(candidates, x => x.manager.manager_id);
    return unique.sort((a, b) => {
      const aDecade = Math.floor(a.year / 10) === Math.floor(targetYear / 10) ? 0 : 1;
      const bDecade = Math.floor(b.year / 10) === Math.floor(targetYear / 10) ? 0 : 1;
      if (aDecade !== bDecade) return aDecade - bDecade;
      const aDistance = Math.abs(a.year - targetYear);
      const bDistance = Math.abs(b.year - targetYear);
      if (aDistance !== bDistance) return aDistance - bDistance;
      return a.year - b.year;
    });
  }

  function rank(correctRank, totalTeams) {
    return Array.from({ length: totalTeams }, (_, i) => i + 1)
      .filter(rankValue => rankValue !== correctRank)
      .sort((a, b) => {
        const distance = Math.abs(a - correctRank) - Math.abs(b - correctRank);
        return distance || a - b;
      });
  }

  function seasonSummary(target, candidates) {
    const targetTitles = Array.isArray(target.titles) ? target.titles.length : 0;
    return [...candidates].sort((a, b) => {
      const score = season => {
        const yearDistance = Math.abs(Number(season.year) - Number(target.year));
        const eraPenalty = Math.floor(Number(season.year) / 10) === Math.floor(Number(target.year) / 10) ? 0 : 4;
        const titleCount = Array.isArray(season.titles) ? season.titles.length : 0;
        const titlePenalty = Math.abs(titleCount - targetTitles) * 2;
        const leaguePenalty = season.league_name === target.league_name ? 0 : 2;
        return yearDistance + eraPenalty + titlePenalty + leaguePenalty;
      };
      return score(a) - score(b) || Number(a.year) - Number(b.year);
    });
  }

  function kit(targetContext, candidates) {
    const uniqueSponsors = uniqueBy(
      candidates.filter(ctx => ctx.chest_sponsor !== targetContext.chest_sponsor),
      ctx => String(ctx.chest_sponsor).trim().toUpperCase()
    );
    return uniqueSponsors.sort((a, b) => {
      const aScope = a.competition_scope === targetContext.competition_scope ? 0 : 1;
      const bScope = b.competition_scope === targetContext.competition_scope ? 0 : 1;
      if (aScope !== bScope) return aScope - bScope;
      const aDistance = Math.abs(Number(a.year) - Number(targetContext.year));
      const bDistance = Math.abs(Number(b.year) - Number(targetContext.year));
      if (aDistance !== bDistance) return aDistance - bDistance;
      return String(a.chest_sponsor).localeCompare(String(b.chest_sponsor), 'en');
    });
  }

  window.URAWA_DISTRACTOR_POLICY = Object.freeze({
    version: 'q2-2026-09-07',
    playerNumber,
    manager,
    rank,
    seasonSummary,
    kit
  });
})();