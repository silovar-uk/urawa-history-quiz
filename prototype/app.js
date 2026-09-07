// URAWA HISTORY QUIZ — All 34 Seasons Complete Engine (1992-2025)

(function () {
  'use strict';

  // --------------------------------------------------
  // 1. Data Store & Fallback Initialization
  // --------------------------------------------------
  let db = window.URAWA_DB || null;

  async function initDB() {
    if (db) return db;
    try {
      const [seasons, players, playerSeasons, managers, managerTenures, uniforms, sources] = await Promise.all([
        fetch('../data/seasons.json').then(r => r.json()),
        fetch('../data/players.json').then(r => r.json()),
        fetch('../data/player_seasons.json').then(r => r.json()),
        fetch('../data/managers.json').then(r => r.json()),
        fetch('../data/manager_tenures.json').then(r => r.json()),
        fetch('../data/uniforms.json').then(r => r.json()),
        fetch('../data/sources.json').then(r => r.json())
      ]);
      db = { seasons, players, playerSeasons, managers, managerTenures, uniforms, sources };
      window.URAWA_DB = db;
      return db;
    } catch (e) {
      console.warn('Failed to fetch JSON data, using fallback if available', e);
      return window.URAWA_DB || null;
    }
  }

  // --------------------------------------------------
  // 2. Learning History Store (localStorage)
  // --------------------------------------------------
  const STORAGE_KEY = 'urawa_history_quiz_stats_v2';

  function getStats() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        total: 0,
        correct: 0,
        recentWrong: 0,
        byCategory: {
          PLAYER: { total: 0, correct: 0 },
          MANAGER: { total: 0, correct: 0 },
          SEASON: { total: 0, correct: 0 },
          KIT: { total: 0, correct: 0 }
        },
        byEra: {
          '1990s': { total: 0, correct: 0 },
          '2000s': { total: 0, correct: 0 },
          '2010s': { total: 0, correct: 0 },
          '2020s': { total: 0, correct: 0 }
        }
      };
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return { total: 0, correct: 0, recentWrong: 0, byCategory: {}, byEra: {} };
    }
  }

  function recordAnswer(question, isCorrect) {
    const stats = getStats();
    stats.total += 1;
    if (isCorrect) {
      stats.correct += 1;
      if (stats.recentWrong > 0) stats.recentWrong -= 1;
    } else {
      stats.recentWrong += 1;
    }

    const cat = question.category || 'PLAYER';
    if (!stats.byCategory[cat]) stats.byCategory[cat] = { total: 0, correct: 0 };
    stats.byCategory[cat].total += 1;
    if (isCorrect) stats.byCategory[cat].correct += 1;

    const year = parseInt(question.year || '2006', 10);
    let era = '2000s';
    if (year < 2000) era = '1990s';
    else if (year >= 2020) era = '2020s';
    else if (year >= 2010) era = '2010s';

    if (!stats.byEra[era]) stats.byEra[era] = { total: 0, correct: 0 };
    stats.byEra[era].total += 1;
    if (isCorrect) stats.byEra[era].correct += 1;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  // --------------------------------------------------
  // 3. Quiz Trust Gate + Dynamic Generator
  // --------------------------------------------------
  const trust = window.URAWA_QUIZ_TRUST || null;
  const kitTrust = window.URAWA_KIT_TRUST || null;
  const distractorPolicy = window.URAWA_DISTRACTOR_POLICY || null;
  const uniformContexts = () => (window.URAWA_UNIFORM_CONTEXTS && window.URAWA_UNIFORM_CONTEXTS.contexts) || [];

  const quizQA = {
    generated: 0,
    passed: 0,
    rejected: 0,
    reasons: {},
    lastRejected: []
  };
  window.URAWA_QUIZ_QA = quizQA;

  function noteReject(generatorId, reason, seasonId, detail = '') {
    quizQA.rejected += 1;
    quizQA.reasons[reason] = (quizQA.reasons[reason] || 0) + 1;
    quizQA.lastRejected.unshift({ generatorId, reason, seasonId, detail });
    quizQA.lastRejected = quizQA.lastRejected.slice(0, 30);
    return null;
  }

  function notePass(question) {
    quizQA.passed += 1;
    return question;
  }

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getSeasonPool(selectedEra, specificSeasonId) {
    if (!db || !trust) return [];

    let pool = db.seasons.filter(s => trust.isConfirmedSeason(s, db).ok);

    if (specificSeasonId) {
      return pool.filter(s => s.season_id === specificSeasonId);
    }

    if (selectedEra === '1990s') pool = pool.filter(s => s.year < 2000);
    else if (selectedEra === '2000s') pool = pool.filter(s => s.year >= 2000 && s.year < 2010);
    else if (selectedEra === '2010s') pool = pool.filter(s => s.year >= 2010 && s.year < 2020);
    else if (selectedEra === '2020s') pool = pool.filter(s => s.year >= 2020);

    return shuffle(pool);
  }

  function uniquePlayersFromRelations(relations) {
    const seen = new Set();
    const out = [];
    for (const rel of relations) {
      if (seen.has(rel.player_id)) continue;
      const player = db.players.find(p => p.player_id === rel.player_id);
      if (!player || !trust.hasKnownSources(player, db)) continue;
      seen.add(rel.player_id);
      out.push({ rel, player });
    }
    return out;
  }

  function finalizeQuestion(generatorId, seasonData, draft) {
    quizQA.generated += 1;

    if (!draft) {
      return noteReject(generatorId, 'MISSING_REQUIRED_FIELD', seasonData.season_id, 'Generator returned no draft.');
    }

    const base = trust.validateQuestionBase(draft);
    if (!base.ok) {
      return noteReject(generatorId, base.reason, seasonData.season_id, base.detail || '');
    }

    return notePass({
      ...draft,
      generatorId,
      trust: {
        eligible: true,
        sourceChecked: true,
        gateVersion: 'q2-2026-09-07'
      }
    });
  }

  function generatePlayerNumber(seasonData, psList) {
    const generatorId = 'PLAYER_NUMBER';
    const sourced = psList.filter(ps => ps.shirt_number !== null && trust.hasKnownSources(ps, db));

    if (!sourced.length) {
      return noteReject(generatorId, 'MISSING_RELATION_SOURCE', seasonData.season_id, 'player_seasons source_ids required.');
    }

    const candidates = shuffle(sourced);
    for (const targetPS of candidates) {
      const targetPlayer = db.players.find(p => p.player_id === targetPS.player_id);
      if (!targetPlayer || !trust.hasKnownSources(targetPlayer, db)) continue;

      const sameNumber = sourced.filter(ps => String(ps.shirt_number) === String(targetPS.shirt_number));
      const distinctWearers = new Set(sameNumber.map(ps => ps.player_id));
      if (distinctWearers.size !== 1) {
        noteReject(generatorId, 'SHIRT_NUMBER_NOT_UNIQUE', seasonData.season_id, `shirt_number=${targetPS.shirt_number}`);
        continue;
      }

      const otherPlayers = uniquePlayersFromRelations(
        sourced.filter(ps => ps.player_id !== targetPS.player_id && String(ps.shirt_number) !== String(targetPS.shirt_number))
      );
      if (otherPlayers.length < 3) {
        return noteReject(generatorId, 'INSUFFICIENT_DISTRACTORS', seasonData.season_id, 'Need 3 sourced same-season players with different numbers.');
      }

      const orderedPlayers = distractorPolicy
        ? distractorPolicy.playerNumber(targetPS, otherPlayers)
        : otherPlayers;
      const distractorNames = orderedPlayers.slice(0, 3).map(x => x.player.name);

      return finalizeQuestion(generatorId, seasonData, {
        category: 'PLAYER',
        year: seasonData.year,
        question: `${seasonData.year}年の浦和レッズで背番号「${targetPS.shirt_number}」を背負った選手は？`,
        options: shuffle([targetPlayer.name, ...distractorNames]),
        correct: targetPlayer.name,
        memoryHook: targetPS.memory_hook || `${targetPlayer.name}（背番号${targetPS.shirt_number}・${targetPS.position}）`,
        seasonId: seasonData.season_id
      });
    }

    return noteReject(generatorId, 'NO_ELIGIBLE_TARGET', seasonData.season_id);
  }

  function generatePlayerPosition(seasonData, psList) {
    const generatorId = 'PLAYER_POSITION';
    const allPositions = ['GK', 'DF', 'MF', 'FW'];
    const sourced = psList.filter(ps => trust.hasKnownSources(ps, db) && allPositions.includes(ps.position));

    if (!sourced.length) {
      return noteReject(generatorId, 'MISSING_RELATION_SOURCE', seasonData.season_id, 'player_seasons source_ids required.');
    }

    for (const targetPS of shuffle(sourced)) {
      const targetPlayer = db.players.find(p => p.player_id === targetPS.player_id);
      if (!targetPlayer || !trust.hasKnownSources(targetPlayer, db)) continue;

      const positionsForPlayer = new Set(
        sourced.filter(ps => ps.player_id === targetPS.player_id).map(ps => ps.position)
      );
      if (positionsForPlayer.size !== 1) {
        noteReject(generatorId, 'AMBIGUOUS_CORRECT_ANSWER', seasonData.season_id, `${targetPlayer.name} has multiple registered positions.`);
        continue;
      }

      const correctPos = targetPS.position;
      return finalizeQuestion(generatorId, seasonData, {
        category: 'PLAYER',
        year: seasonData.year,
        question: `${seasonData.year}年シーズンの ${targetPlayer.name} の登録ポジションは？`,
        options: shuffle([correctPos, ...allPositions.filter(pos => pos !== correctPos)]),
        correct: correctPos,
        memoryHook: targetPS.memory_hook || `${targetPlayer.name}は${correctPos}として登録された。`,
        seasonId: seasonData.season_id
      });
    }

    return noteReject(generatorId, 'NO_ELIGIBLE_TARGET', seasonData.season_id);
  }

  function generatePlayerOverlap(seasonData) {
    return noteReject(
      'PLAYER_OVERLAP',
      'OVERLAP_UNVERIFIED',
      seasonData.season_id,
      'Disabled until registration interval or roster-completeness evidence is available.'
    );
  }

  function generateManagerSeason(seasonData) {
    const generatorId = 'MANAGER_SEASON';
    const managerCheck = trust.getSafeManagerForSeason(seasonData.season_id, db);
    if (!managerCheck.ok) {
      return noteReject(generatorId, managerCheck.reason, seasonData.season_id, managerCheck.detail || '');
    }

    const { tenure, manager } = managerCheck;
    const otherSafeManagers = [];
    const seen = new Set([manager.manager_id]);

    for (const otherSeason of db.seasons) {
      if (otherSeason.season_id === seasonData.season_id) continue;
      if (!trust.isConfirmedSeason(otherSeason, db).ok) continue;
      const check = trust.getSafeManagerForSeason(otherSeason.season_id, db);
      if (!check.ok || seen.has(check.manager.manager_id)) continue;
      seen.add(check.manager.manager_id);
      otherSafeManagers.push({ manager: check.manager, year: otherSeason.year });
    }

    if (otherSafeManagers.length < 3) {
      return noteReject(generatorId, 'INSUFFICIENT_DISTRACTORS', seasonData.season_id);
    }

    const orderedManagers = distractorPolicy
      ? distractorPolicy.manager(seasonData.year, otherSafeManagers)
      : otherSafeManagers;
    const distractorNames = orderedManagers.slice(0, 3).map(x => x.manager.name);

    return finalizeQuestion(generatorId, seasonData, {
      category: 'MANAGER',
      year: seasonData.year,
      question: `${seasonData.year}年の浦和レッズの監督として登録データに記録されているのは？`,
      options: shuffle([manager.name, ...distractorNames]),
      correct: manager.name,
      memoryHook: tenure.notes || `${manager.name}監督がチームを指揮した。`,
      seasonId: seasonData.season_id
    });
  }

  function generateSeasonRank(seasonData) {
    const generatorId = 'SEASON_RANK';
    const rankCheck = trust.validateRankFact(seasonData, db);
    if (!rankCheck.ok) {
      return noteReject(generatorId, rankCheck.reason, seasonData.season_id, rankCheck.detail || '');
    }

    const correctRank = Number(seasonData.league_rank);
    const validRanks = Array.from({ length: Number(seasonData.total_teams) }, (_, i) => i + 1)
      .filter(r => r !== correctRank);

    if (validRanks.length < 3) {
      return noteReject(generatorId, 'INSUFFICIENT_DISTRACTORS', seasonData.season_id);
    }

    const orderedRanks = distractorPolicy
      ? distractorPolicy.rank(correctRank, Number(seasonData.total_teams))
      : validRanks.sort((a, b) => Math.abs(a - correctRank) - Math.abs(b - correctRank));
    const distractorNames = orderedRanks.slice(0, 3).map(r => `${r}位`);
    const correct = `${correctRank}位`;

    return finalizeQuestion(generatorId, seasonData, {
      category: 'SEASON',
      year: seasonData.year,
      question: `${seasonData.year}年シーズンの浦和レッズの${seasonData.league_name}最終順位は？`,
      options: shuffle([correct, ...distractorNames]),
      correct,
      memoryHook: seasonData.memory_hook || `${seasonData.league_name}${correct}でシーズンを終えた。`,
      seasonId: seasonData.season_id
    });
  }

  function generateSeasonSummary(seasonData) {
    const generatorId = 'SEASON_SUMMARY';
    const summaryCheck = trust.validateSummaryFact(seasonData, db);
    if (!summaryCheck.ok) {
      return noteReject(generatorId, summaryCheck.reason, seasonData.season_id, summaryCheck.detail || '');
    }

    const otherSeasons = db.seasons.filter(s =>
      s.season_id !== seasonData.season_id &&
      trust.isConfirmedSeason(s, db).ok &&
      s.summary &&
      !trust.summaryLeaksYear(s)
    );

    if (otherSeasons.length < 3) {
      return noteReject(generatorId, 'INSUFFICIENT_DISTRACTORS', seasonData.season_id);
    }

    const orderedSeasons = distractorPolicy
      ? distractorPolicy.seasonSummary(seasonData, otherSeasons)
      : otherSeasons;
    const distractorNames = orderedSeasons.slice(0, 3).map(s => `${s.year}年`);
    const correct = `${seasonData.year}年`;

    return finalizeQuestion(generatorId, seasonData, {
      category: 'SEASON',
      year: seasonData.year,
      question: `「${seasonData.summary}」\nこのシーズンはいつ？`,
      options: shuffle([correct, ...distractorNames]),
      correct,
      memoryHook: seasonData.memory_hook || seasonData.summary,
      seasonId: seasonData.season_id
    });
  }

  function generateKitDetail(seasonData) {
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
      question: `${seasonData.year}年シーズンの${target.competition_label}用HOMEユニフォームの胸スポンサーは？`,
      options: shuffle([target.chest_sponsor, ...distractorNames]),
      correct: target.chest_sponsor,
      memoryHook: `${seasonData.year}年の${target.competition_label}用HOMEユニフォームは、胸に${target.chest_sponsor}を掲出した。`,
      seasonId: seasonData.season_id,
      kitContextId: target.context_id
    });
  }

  function generateQuizForSeason(seasonData) {
    const psList = db.playerSeasons.filter(ps => ps.season_id === seasonData.season_id);
    const generators = shuffle([
      () => generatePlayerNumber(seasonData, psList),
      () => generatePlayerPosition(seasonData, psList),
      () => generatePlayerOverlap(seasonData, psList),
      () => generateManagerSeason(seasonData),
      () => generateSeasonRank(seasonData),
      () => generateSeasonSummary(seasonData),
      () => generateKitDetail(seasonData)
    ]);

    for (const gen of generators) {
      const question = gen();
      if (question) return question;
    }
    return null;
  }

  function generateQuiz(targetSeasonId = null, filterEra = 'ALL') {
    if (!db || !trust) {
      console.warn('Quiz Trust Gate is unavailable. Failing closed.');
      return null;
    }

    const seasons = getSeasonPool(filterEra, targetSeasonId);
    for (const seasonData of seasons) {
      const question = generateQuizForSeason(seasonData);
      if (question) return question;
    }
    return null;
  }

  // --------------------------------------------------
  // 4. UI Rendering & Screen Handlers
  // --------------------------------------------------
  const app = document.querySelector('#app');
  let currentScreen = 'today';
  let activeQuiz = null;
  let selectedSeasonId = '2006';
  let activeEraFilter = 'ALL';

  const screens = {
    today: () => {
      const stats = getStats();
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      return `
        <div class="eyebrow">TODAY</div>
        <div class="year">34 YEARS</div>
        <h1 class="display-title">1問から、浦和の歴史へ。</h1>
        <p class="lead">1992年クラブ発足から2025年最新シーズンまで、全34年におよぶ浦和レッズ全史の記憶を旅する学習アプリです。</p>

        <div class="era-filters" aria-label="出題年代フィルター">
          <button class="filter-pill ${activeEraFilter === 'ALL' ? 'active' : ''}" data-era="ALL">全年代 (1992〜2025)</button>
          <button class="filter-pill ${activeEraFilter === '1990s' ? 'active' : ''}" data-era="1990s">1990年代</button>
          <button class="filter-pill ${activeEraFilter === '2000s' ? 'active' : ''}" data-era="2000s">2000年代</button>
          <button class="filter-pill ${activeEraFilter === '2010s' ? 'active' : ''}" data-era="2010s">2010年代</button>
          <button class="filter-pill ${activeEraFilter === '2020s' ? 'active' : ''}" data-era="2020s">2020年代</button>
        </div>

        <button class="primary" data-action="start-quiz">今日の1問を解く</button>
        <hr class="rule">
        <div class="section-label">CONTINUE</div>
        <div class="stat-line"><span>最近間違えた問題</span><strong>${stats.recentWrong}</strong></div>
        <div class="stat-line"><span>学習した問題数</span><strong>${stats.total}問 / 正答率 ${accuracy}%</strong></div>
        <div class="stat-line"><span>収録シーズン</span><strong>1992年 〜 2025年（全34シーズン網羅）</strong></div>
      `;
    },

    quiz: () => {
      if (!activeQuiz) activeQuiz = generateQuiz(null, activeEraFilter);
      if (!activeQuiz) {
        return `
          <div class="eyebrow">QUIZ PAUSED</div>
          <p class="lead">この条件では、現在の品質基準を満たす問題を生成できませんでした。</p>
          <button class="secondary" data-screen="today">ホームへ戻る</button>
        `;
      }

      return `
        <div class="question-meta">
          <span>${activeQuiz.category} · ${activeQuiz.year}年</span>
          <span>SOURCE CHECKED</span>
        </div>
        <h1 class="question">${activeQuiz.question.replace(/\n/g, '<br>')}</h1>
        <div class="options">
          ${activeQuiz.options.map((opt, i) => `
            <button class="option" data-answer="${i}" data-value="${opt}">
              <span class="key">${String(i + 1).padStart(2, '0')}</span>
              <strong>${opt}</strong>
            </button>
          `).join('')}
        </div>
        <div id="feedback"></div>
      `;
    },

    history: () => {
      const seasons = db ? [...db.seasons].sort((a, b) => b.year - a.year) : [];
      return `
        <div class="eyebrow">HISTORY</div>
        <h1 class="display-title">Timeline (全34年)</h1>
        <p class="lead">1992年のクラブ発足から現在まで。年をタップして詳細へ潜る。</p>
        <div class="timeline">
          ${seasons.map(s => `
            <div class="timeline-item" data-action="view-season" data-season="${s.season_id}">
              <div class="timeline-year">${s.year}</div>
              <div class="timeline-note">
                <strong style="color:var(--brand);">${s.titles && s.titles.length ? '🏆 ' + s.titles.join(' / ') : (s.league_rank ? `${s.league_name} ${s.league_rank}位` : 'シーズン')}</strong><br>
                ${s.summary}
              </div>
            </div>
          `).join('')}
        </div>
      `;
    },

    season: () => {
      const s = db.seasons.find(x => x.season_id === selectedSeasonId) || db.seasons[0];
      const tenure = db.managerTenures.find(m => m.season_id === s.season_id);
      const manager = tenure ? db.managers.find(m => m.manager_id === tenure.manager_id) : null;
      const kit = db.uniforms.find(u => u.season_id === s.season_id && u.type === 'HOME');
      const verifiedKitContexts = kitTrust ? kitTrust.eligibleContextsForSeason(s.season_id) : [];
      const domesticKitContext = verifiedKitContexts.find(ctx => ctx.competition_scope === 'domestic') || null;
      const internationalKitContexts = verifiedKitContexts.filter(ctx => ctx.competition_scope === 'international');
      const sponsorSummary = verifiedKitContexts.length
        ? [domesticKitContext ? `国内 ${domesticKitContext.chest_sponsor}` : null, ...internationalKitContexts.map(ctx => `${ctx.competition_label} ${ctx.chest_sponsor}`)].filter(Boolean).join(' / ')
        : '胸スポンサー未検証';
      const psList = db.playerSeasons.filter(ps => ps.season_id === s.season_id);

      return `
        <div class="eyebrow">SEASON DETAIL</div>
        <div class="year">${s.year}</div>
        <h1 class="display-title">${s.year}年シーズン</h1>
        <p class="lead">${s.summary}</p>

        <hr class="rule">
        <div class="section-label">RECORD & TITLES</div>
        <div class="stat-line"><span>最終順位</span><strong>${s.league_rank ? `${s.league_name} ${s.league_rank}位` : '—'}</strong></div>
        ${s.points !== null ? `<div class="stat-line"><span>勝点 / 戦績</span><strong>勝点${s.points}（${s.wins}勝 ${s.draws}分 ${s.losses}敗）</strong></div>` : ''}
        ${s.titles && s.titles.length ? `<div class="stat-line"><span>獲得タイトル</span><strong style="color:var(--brand);">🏆 ${s.titles.join('、')}</strong></div>` : ''}

        <hr class="rule">
        <div class="section-label">MANAGER</div>
        <div class="stat-line">
          <span>監督</span>
          <strong>${manager ? manager.name : '—'}</strong>
        </div>
        ${tenure ? `<p style="font-size:0.875rem; color:var(--muted); margin:4px 0 0 0;">${tenure.notes}</p>` : ''}

        <hr class="rule">
        <div class="section-label">KIT</div>
        <div class="kit-card">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; background:${kit ? kit.main_color : '#E6002D'}; border:1px solid #ddd; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; color:#fff;">KIT</div>
            <div>
              <strong>${kit ? kit.supplier : 'Mizuno/Puma/Nike'} (${sponsorSummary})</strong>
              <div style="font-size:0.8125rem; color:var(--muted);">${verifiedKitContexts.length ? '大会別の胸スポンサーを公式情報で確認済み。' : 'ユニフォーム自体は収録済み。胸スポンサーはQuiz Trust対象外。'}</div>
            </div>
          </div>
        </div>

        <hr class="rule">
        <div class="section-label">KEY PLAYERS (${psList.length}名登録 · タップで選手詳細)</div>
        <div class="squad-list">
          ${psList.map(ps => {
            const p = db.players.find(x => x.player_id === ps.player_id);
            return `
              <div class="squad-item" data-action="view-player" data-player="${ps.player_id}">
                <div>
                  <span class="squad-num">${ps.shirt_number ? '#' + ps.shirt_number : '—'}</span>
                  <span class="squad-name">${p ? p.name : ''}</span>
                </div>
                <span class="squad-pos">${ps.position}</span>
              </div>
            `;
          }).join('')}
        </div>

        <div class="actions" style="margin-top:24px;">
          <button class="primary" data-action="quiz-this-season" data-season="${s.season_id}">このシーズンから出題</button>
          <button class="secondary" data-screen="history">年表へ戻る</button>
        </div>
      `;
    },

    you: () => {
      const stats = getStats();
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      const eras = [
        { key: '1990s', label: '1990年代 (草創期・J2降格まで)' },
        { key: '2000s', label: '2000年代 (J1初制覇・ACL初制覇)' },
        { key: '2010s', label: '2010年代 (ミシャ体制・ACL2度目)' },
        { key: '2020s', label: '2020年代 (ACL3度目・世界へ)' }
      ];
      const categories = [
        { key: 'PLAYER', label: '選手' },
        { key: 'MANAGER', label: '監督' },
        { key: 'SEASON', label: 'シーズン' },
        { key: 'KIT', label: 'ユニフォーム' }
      ];

      return `
        <div class="eyebrow">YOU</div>
        <h1 class="display-title">Your Urawa</h1>
        <p class="lead">全34年の歴史の中で、「どの年代・カテゴリを深く理解しているか」を可視化します。</p>

        <div class="stat-line"><span>総解答数</span><strong>${stats.total}問</strong></div>
        <div class="stat-line"><span>総合正答率</span><strong>${accuracy}%</strong></div>
        <div class="stat-line"><span>最近の誤答</span><strong>${stats.recentWrong}問</strong></div>

        <hr class="rule">
        <div class="section-label">ERA MASTERY（年代別理解度）</div>
        ${eras.map(e => {
          const eraData = stats.byEra[e.key] || { total: 0, correct: 0 };
          const pct = eraData.total > 0 ? Math.round((eraData.correct / eraData.total) * 100) : 0;
          return `
            <div class="stat-line">
              <div style="flex:1;">
                <strong>${e.label}</strong>
                <span style="font-size:0.75rem; color:#888; margin-left:8px;">(${eraData.correct}/${eraData.total}問)</span>
                <div class="progress" style="margin-top:4px;"><span style="width:${pct}%"></span></div>
              </div>
              <strong style="margin-left:16px;">${pct}%</strong>
            </div>
          `;
        }).join('')}

        <hr class="rule">
        <div class="section-label">CATEGORY MASTERY（カテゴリ別理解度）</div>
        ${categories.map(c => {
          const catData = stats.byCategory[c.key] || { total: 0, correct: 0 };
          const pct = catData.total > 0 ? Math.round((catData.correct / catData.total) * 100) : 0;
          return `
            <div class="stat-line">
              <div style="flex:1;">
                <strong>${c.label} (${c.key})</strong>
                <span style="font-size:0.75rem; color:#888; margin-left:8px;">(${catData.correct}/${catData.total}問)</span>
                <div class="progress" style="margin-top:4px;"><span style="width:${pct}%"></span></div>
              </div>
              <strong style="margin-left:16px;">${pct}%</strong>
            </div>
          `;
        }).join('')}

        <div style="margin-top:32px;">
          <button class="secondary" data-action="reset-stats" style="font-size:0.8125rem; opacity:0.7;">学習履歴をリセット</button>
        </div>
      `;
    }
  };

  function showPlayerDetail(playerId) {
    const player = db.players.find(p => p.player_id === playerId);
    if (!player) return;
    const history = db.playerSeasons
      .filter(ps => ps.player_id === playerId)
      .sort((a, b) => parseInt(a.season_id) - parseInt(b.season_id));

    let modal = document.querySelector('#player-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'player-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-sheet">
        <div class="eyebrow">PLAYER DETAIL</div>
        <h2 style="font-size:1.75rem; margin:6px 0 2px;">${player.name}</h2>
        <p style="color:var(--muted); font-size:0.875rem; margin:0 0 16px;">
          ${player.name_kana} / ${player.primary_position} / ${player.nationality}
        </p>

        <div class="section-label">RECORD IN URAWA (${history.length}シーズン登録)</div>
        ${history.map(h => `
          <div class="stat-line" style="align-items:center;">
            <div>
              <span class="tag">${h.season_id}年</span>
              <strong>${h.shirt_number ? '#' + h.shirt_number : '—'} ${h.position}</strong>
              <div style="font-size:0.8125rem; color:var(--muted); margin-top:2px;">
                ${h.memory_hook}
              </div>
            </div>
          </div>
        `).join('')}

        <div class="actions" style="margin-top:20px;">
          <button class="secondary" data-action="close-modal" style="width:100%;">閉じる</button>
        </div>
      </div>
    `;

    modal.style.display = 'flex';
    modal.querySelector('[data-action="close-modal"]').addEventListener('click', () => {
      modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }

  function render(screenName) {
    currentScreen = screenName;
    app.innerHTML = screens[screenName]();
    document.querySelectorAll('.nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.screen === screenName);
    });
    bindEvents();
  }

  function getAnswerSpineContext(question) {
    if (!db || !question) return [];
    const seasons = [...db.seasons].sort((a, b) => a.year - b.year);
    const index = seasons.findIndex(s => s.season_id === question.seasonId);
    if (index < 0) return [];
    return seasons.slice(Math.max(0, index - 1), Math.min(seasons.length, index + 2));
  }

  function getHistoryEchoText(season) {
    if (!season) return '';
    if (Array.isArray(season.titles) && season.titles.length) return season.titles.join(' / ');
    if (season.league_rank && season.league_name) return season.league_name + ' ' + season.league_rank + '位';
    const text = season.summary || 'シーズン記録';
    return text.length > 72 ? text.slice(0, 72) + '…' : text;
  }

  function renderAnswerSpine(question) {
    const context = getAnswerSpineContext(question);
    if (!context.length) return '';
    const current = context.find(s => s.season_id === question.seasonId) || context[0];
    const nodes = context.map(season => {
      const isCurrent = season.season_id === question.seasonId;
      return '<button class="history-node" type="button" data-history-preview data-season="' + season.season_id + '" aria-pressed="' + (isCurrent ? 'true' : 'false') + '"' + (isCurrent ? ' aria-current="true"' : '') + '>' +
        '<span class="history-diamond" aria-hidden="true"></span><span class="history-year">' + season.year + '</span></button>';
    }).join('');
    return '<section class="history-spine-reveal" aria-label="回答した年の前後の歴史">' +
      '<div class="history-spine">' + nodes + '</div>' +
      '<div class="history-echo" id="history-echo">' + current.year + ' — ' + getHistoryEchoText(current) + '</div>' +
      '</section>';
  }

  function bindEvents() {
    document.querySelectorAll('[data-screen]').forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.screen === 'quiz') activeQuiz = generateQuiz(null, activeEraFilter);
        render(el.dataset.screen);
      });
    });

    document.querySelectorAll('[data-era]').forEach(el => {
      el.addEventListener('click', () => {
        activeEraFilter = el.dataset.era;
        render('today');
      });
    });

    document.querySelectorAll('[data-action="start-quiz"]').forEach(el => {
      el.addEventListener('click', () => {
        activeQuiz = generateQuiz(null, activeEraFilter);
        render('quiz');
      });
    });

    document.querySelectorAll('[data-action="view-season"]').forEach(el => {
      el.addEventListener('click', () => {
        selectedSeasonId = el.dataset.season;
        render('season');
      });
    });

    document.querySelectorAll('[data-action="quiz-this-season"]').forEach(el => {
      el.addEventListener('click', () => {
        selectedSeasonId = el.dataset.season;
        activeQuiz = generateQuiz(selectedSeasonId, 'ALL');
        render('quiz');
      });
    });

    document.querySelectorAll('[data-action="view-player"]').forEach(el => {
      el.addEventListener('click', () => {
        showPlayerDetail(el.dataset.player);
      });
    });

    document.querySelectorAll('[data-action="reset-stats"]').forEach(el => {
      el.addEventListener('click', () => {
        if (confirm('学習履歴を初期化しますか？')) {
          localStorage.removeItem(STORAGE_KEY);
          render('you');
        }
      });
    });

    document.querySelectorAll('[data-answer]').forEach(el => {
      el.addEventListener('click', () => {
        if (!activeQuiz) return;
        const selectedVal = el.dataset.value;
        const isCorrect = selectedVal === activeQuiz.correct;

        recordAnswer(activeQuiz, isCorrect);

        document.querySelectorAll('[data-answer]').forEach(b => {
          b.disabled = true;
          if (b.dataset.value === activeQuiz.correct) b.classList.add('correct');
          if (b.dataset.value === selectedVal && !isCorrect) b.classList.add('wrong');
        });

        const feedbackEl = document.querySelector('#feedback');
        const spineMarkup = renderAnswerSpine(activeQuiz);
        feedbackEl.innerHTML = `
          <section class="feedback">
            <div class="feedback-announcement" role="status" aria-live="polite" aria-atomic="true">
              <div class="feedback-state ${isCorrect ? 'good' : 'bad'}">
                ${isCorrect ? 'CORRECT' : 'NOT THIS TIME'}
              </div>
              <h2 class="answer-title">${activeQuiz.correct}</h2>
            </div>
            <div class="memory-echo">
              <span class="memory-echo-label">MEMORY ECHO</span>
              <span>${activeQuiz.memoryHook}</span>
            </div>
            ${spineMarkup}
            <div class="actions">
              <button class="primary" data-action="next-question">次の問題へ</button>
              <button class="secondary" data-action="explore-season" data-season="${activeQuiz.seasonId}">${activeQuiz.year}年を見る</button>
            </div>
          </section>
        `;

        feedbackEl.querySelector('[data-action="next-question"]').addEventListener('click', () => {
          activeQuiz = generateQuiz(null, activeEraFilter);
          render('quiz');
        });

        feedbackEl.querySelector('[data-action="explore-season"]').addEventListener('click', (e) => {
          selectedSeasonId = e.currentTarget.dataset.season;
          render('season');
        });

        const historyEchoEl = feedbackEl.querySelector('#history-echo');
        const exploreButton = feedbackEl.querySelector('[data-action="explore-season"]');
        feedbackEl.querySelectorAll('[data-history-preview]').forEach(btn => {
          btn.addEventListener('click', () => {
            const previewSeason = db.seasons.find(s => s.season_id === btn.dataset.season);
            if (!previewSeason) return;
            feedbackEl.querySelectorAll('[data-history-preview]').forEach(node => node.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            if (historyEchoEl) historyEchoEl.textContent = previewSeason.year + ' — ' + getHistoryEchoText(previewSeason);
            if (exploreButton) {
              exploreButton.dataset.season = previewSeason.season_id;
              exploreButton.textContent = previewSeason.year + '年を見る';
            }
          });
        });
      });
    });
  }

  // --------------------------------------------------
  // 5. Bootstrap
  // --------------------------------------------------
  initDB().then(() => {
    render(currentScreen);
  });

})();
