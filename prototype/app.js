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

    // Category
    const cat = question.category || 'PLAYER';
    if (!stats.byCategory[cat]) stats.byCategory[cat] = { total: 0, correct: 0 };
    stats.byCategory[cat].total += 1;
    if (isCorrect) stats.byCategory[cat].correct += 1;

    // Era
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
  // 3. Quiz Engine (All 34 Seasons Dynamic Generator)
  // --------------------------------------------------
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getSeasonForFilter(selectedEra, specificSeasonId) {
    if (specificSeasonId) {
      return db.seasons.find(s => s.season_id === specificSeasonId) || db.seasons[0];
    }
    let pool = db.seasons;
    if (selectedEra === '1990s') pool = db.seasons.filter(s => s.year < 2000);
    else if (selectedEra === '2000s') pool = db.seasons.filter(s => s.year >= 2000 && s.year < 2010);
    else if (selectedEra === '2010s') pool = db.seasons.filter(s => s.year >= 2010 && s.year < 2020);
    else if (selectedEra === '2020s') pool = db.seasons.filter(s => s.year >= 2020);

    if (!pool.length) pool = db.seasons;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function generateQuiz(targetSeasonId = null, filterEra = 'ALL') {
    if (!db) return null;

    const seasonData = getSeasonForFilter(filterEra, targetSeasonId);
    const seasonId = seasonData.season_id;
    const psList = db.playerSeasons.filter(ps => ps.season_id === seasonId);

    const generators = [
      // 1. PLAYER_NUMBER (背番号問題)
      () => {
        const withNumber = psList.filter(ps => ps.shirt_number !== null);
        if (!withNumber.length) return null;
        const targetPS = withNumber[Math.floor(Math.random() * withNumber.length)];
        const targetPlayer = db.players.find(p => p.player_id === targetPS.player_id);
        if (!targetPlayer) return null;

        const samePos = withNumber.filter(ps => ps.player_id !== targetPS.player_id && ps.position === targetPS.position);
        let distractorPool = samePos.length >= 3 ? samePos : withNumber.filter(ps => ps.player_id !== targetPS.player_id);
        if (distractorPool.length < 3) {
          distractorPool = db.playerSeasons.filter(ps => ps.player_id !== targetPS.player_id);
        }
        const distractors = shuffle(distractorPool)
          .slice(0, 3)
          .map(ps => {
            const p = db.players.find(x => x.player_id === ps.player_id);
            return p ? p.name : '選手';
          });

        const options = shuffle([targetPlayer.name, ...distractors]);
        return {
          category: 'PLAYER',
          year: seasonData.year,
          question: `${seasonData.year}年の浦和レッズで背番号「${targetPS.shirt_number}」を背負った選手は？`,
          options,
          correct: targetPlayer.name,
          memoryHook: targetPS.memory_hook || `${targetPlayer.name}（背番号${targetPS.shirt_number}・${targetPS.position}）`,
          seasonId: seasonData.season_id
        };
      },

      // 2. PLAYER_POSITION (ポジション問題)
      () => {
        if (!psList.length) return null;
        const targetPS = psList[Math.floor(Math.random() * psList.length)];
        const targetPlayer = db.players.find(p => p.player_id === targetPS.player_id);
        if (!targetPlayer) return null;

        const allPositions = ['GK', 'DF', 'MF', 'FW'];
        const correctPos = targetPS.position;
        const distractors = allPositions.filter(pos => pos !== correctPos);
        const options = shuffle([correctPos, ...distractors]);

        return {
          category: 'PLAYER',
          year: seasonData.year,
          question: `${seasonData.year}年シーズンの ${targetPlayer.name} の登録ポジションは？`,
          options,
          correct: correctPos,
          memoryHook: targetPS.memory_hook || `${targetPlayer.name}は${correctPos}として活躍。`,
          seasonId: seasonData.season_id
        };
      },

      // 3. PLAYER_OVERLAP (同時在籍問題)
      () => {
        if (psList.length < 2) return null;
        const targetPS = psList[Math.floor(Math.random() * psList.length)];
        const targetPlayer = db.players.find(p => p.player_id === targetPS.player_id);
        if (!targetPlayer) return null;

        const coPlayers = psList.filter(ps => ps.player_id !== targetPS.player_id);
        const correctPS = coPlayers[Math.floor(Math.random() * coPlayers.length)];
        const correctPlayer = db.players.find(p => p.player_id === correctPS.player_id);
        if (!correctPlayer) return null;

        const coPlayerIds = new Set(psList.map(ps => ps.player_id));
        const diffEraPS = db.playerSeasons.filter(ps => !coPlayerIds.has(ps.player_id));
        const distinctDiffPlayers = [...new Set(diffEraPS.map(ps => ps.player_id))];
        if (distinctDiffPlayers.length < 3) return null;

        const distractors = shuffle(distinctDiffPlayers)
          .slice(0, 3)
          .map(pid => {
            const p = db.players.find(x => x.player_id === pid);
            return p ? p.name : '選手';
          });

        const options = shuffle([correctPlayer.name, ...distractors]);
        return {
          category: 'PLAYER',
          year: seasonData.year,
          question: `${seasonData.year}年シーズンに ${targetPlayer.name} とチームメイトとして在籍していた選手は？`,
          options,
          correct: correctPlayer.name,
          memoryHook: `${targetPlayer.name} と ${correctPlayer.name} は${seasonData.year}年の浦和レッズで共に戦った。`,
          seasonId: seasonData.season_id
        };
      },

      // 4. MANAGER_SEASON (歴代監督問題)
      () => {
        const tenure = db.managerTenures.find(mt => mt.season_id === seasonId);
        if (!tenure) return null;
        const manager = db.managers.find(m => m.manager_id === tenure.manager_id);
        if (!manager) return null;

        const distractors = shuffle(db.managers.filter(m => m.manager_id !== manager.manager_id))
          .slice(0, 3)
          .map(m => m.name);

        const options = shuffle([manager.name, ...distractors]);
        return {
          category: 'MANAGER',
          year: seasonData.year,
          question: `${seasonData.year}年に浦和レッズを率いて指揮を執った監督は？`,
          options,
          correct: manager.name,
          memoryHook: tenure.notes || `${manager.name}監督がチームを指揮した。`,
          seasonId: seasonData.season_id
        };
      },

      // 5. SEASON_RANK (順位問題)
      () => {
        if (!seasonData.league_rank) return null;
        const correct = `${seasonData.league_rank}位`;
        const possible = [1, 2, 3, 4, 6, 7, 10, 11, 14, 15].filter(r => r !== seasonData.league_rank);
        const distractors = shuffle(possible).slice(0, 3).map(r => `${r}位`);
        const options = shuffle([correct, ...distractors]);

        return {
          category: 'SEASON',
          year: seasonData.year,
          question: `${seasonData.year}年シーズンの浦和レッズのJ1/J2最終順位は？`,
          options,
          correct,
          memoryHook: seasonData.memory_hook || `リーグ${seasonData.league_rank}位でシーズンを終えた。`,
          seasonId: seasonData.season_id
        };
      },

      // 6. SEASON_SUMMARY (要約から年度を当てる)
      () => {
        const otherSeasons = db.seasons.filter(s => s.season_id !== seasonId);
        const distractors = shuffle(otherSeasons.map(s => `${s.year}年`)).slice(0, 3);
        const correct = `${seasonData.year}年`;
        const options = shuffle([correct, ...distractors]);

        return {
          category: 'SEASON',
          year: seasonData.year,
          question: `「${seasonData.summary}」\nこのシーズンはいつ？`,
          options,
          correct,
          memoryHook: seasonData.memory_hook,
          seasonId: seasonData.season_id
        };
      },

      // 7. KIT_DETAIL (キット胸スポンサー問題)
      () => {
        const kit = db.uniforms.find(u => u.season_id === seasonId && u.type === 'HOME');
        if (!kit || !kit.chest_sponsor) return null;
        const correct = kit.chest_sponsor;
        const pool = ['MITSUBISHI MOTORS', 'Vodafone', 'DHL', 'POLUS'].filter(s => s !== correct);
        const distractors = shuffle(pool).slice(0, 3);
        const options = shuffle([correct, ...distractors]);

        return {
          category: 'KIT',
          year: seasonData.year,
          question: `${seasonData.year}年シーズンの公式ユニフォームの胸スポンサーは？`,
          options,
          correct,
          memoryHook: kit.description || `${seasonData.year}年のサプライヤーは${kit.supplier}、胸ロゴは${kit.chest_sponsor}。`,
          seasonId: seasonData.season_id
        };
      }
    ];

    const validGenerators = shuffle(generators);
    for (const gen of validGenerators) {
      const q = gen();
      if (q && q.options && q.options.length === 4 && new Set(q.options).size === 4) {
        return q;
      }
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
      if (!activeQuiz) {
        activeQuiz = generateQuiz(null, activeEraFilter);
      }
      if (!activeQuiz) {
        return `
          <div class="eyebrow">ERROR</div>
          <p class="lead">データを読み込めませんでした。再読み込みしてください。</p>
          <button class="secondary" data-screen="today">ホームへ戻る</button>
        `;
      }

      return `
        <div class="question-meta">
          <span>${activeQuiz.category} · ${activeQuiz.year}年</span>
          <span>FACT VERIFIED</span>
        </div>
        <h1 class="question">${activeQuiz.question.replace(/\n/g, '<br>')}</h1>
        <div class="options">
          ${activeQuiz.options.map((opt, i) => `
            <button class="option" data-answer="${i}" data-value="${opt}">
              <span class="key">${String.fromCharCode(65 + i)}</span>
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
              <strong>${kit ? kit.supplier : 'Mizuno/Puma/Nike'} (${kit && kit.chest_sponsor ? kit.chest_sponsor : '—'})</strong>
              <div style="font-size:0.8125rem; color:var(--muted);">${kit ? kit.description : '公式ユニフォーム'}</div>
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
    const history = db.playerSeasons.filter(ps => ps.player_id === playerId).sort((a, b) => parseInt(a.season_id) - parseInt(b.season_id));

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

  function bindEvents() {
    document.querySelectorAll('[data-screen]').forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.screen === 'quiz') {
          activeQuiz = generateQuiz(null, activeEraFilter);
        }
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
          if (b.dataset.value === activeQuiz.correct) {
            b.classList.add('correct');
          }
          if (b.dataset.value === selectedVal && !isCorrect) {
            b.classList.add('wrong');
          }
        });

        const feedbackEl = document.querySelector('#feedback');
        feedbackEl.innerHTML = `
          <section class="feedback" aria-live="polite">
            <div class="feedback-state ${isCorrect ? 'good' : 'bad'}">
              ${isCorrect ? 'CORRECT' : 'NOT THIS TIME'}
            </div>
            <h2 class="answer-title">${activeQuiz.correct}</h2>
            <div class="memory-hook">
              <strong>💡 記憶フック:</strong><br>
              ${activeQuiz.memoryHook}
            </div>
            <div class="actions">
              <button class="primary" data-action="next-question">次の問題へ</button>
              <button class="secondary" data-action="explore-season" data-season="${activeQuiz.seasonId}">このシーズンを見る (${activeQuiz.year}年)</button>
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
