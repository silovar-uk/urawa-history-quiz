// URAWA HISTORY QUIZ — Application Core & Quiz Engine

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
  const STORAGE_KEY = 'urawa_history_quiz_stats_v1';

  function getStats() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        total: 0,
        correct: 0,
        recentWrong: 0,
        byCategory: { PLAYER: { total: 0, correct: 0 }, MANAGER: { total: 0, correct: 0 }, SEASON: { total: 0, correct: 0 }, KIT: { total: 0, correct: 0 } },
        byEra: { '1990s': { total: 0, correct: 0 }, '2000s': { total: 0, correct: 0 }, '2010s': { total: 0, correct: 0 }, '2020s': { total: 0, correct: 0 } }
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
  // 3. Dynamic Quiz Generator (Quiz Engine MVP)
  // --------------------------------------------------
  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function generateQuiz(targetSeasonId = null) {
    if (!db) return null;

    const availableSeason = targetSeasonId || '2006';
    const seasonData = db.seasons.find(s => s.season_id === availableSeason) || db.seasons[0];
    const psList = db.playerSeasons.filter(ps => ps.season_id === availableSeason);

    const generators = [
      // 1. PLAYER_NUMBER: 背番号から選手を当てる
      () => {
        if (!psList.length) return null;
        const targetPS = psList[Math.floor(Math.random() * psList.length)];
        const targetPlayer = db.players.find(p => p.player_id === targetPS.player_id);
        if (!targetPlayer) return null;

        // 同ポジションまたは近接番号の選手を誤答にする
        const samePos = psList.filter(ps => ps.player_id !== targetPS.player_id && ps.position === targetPS.position);
        let distractorPool = samePos.length >= 3 ? samePos : psList.filter(ps => ps.player_id !== targetPS.player_id);
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

      // 2. PLAYER_POSITION: 選手のポジションを当てる
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
          memoryHook: targetPS.memory_hook || `${targetPlayer.name}は背番号${targetPS.shirt_number}の${correctPos}として活躍。`,
          seasonId: seasonData.season_id
        };
      },

      // 3. MANAGER_SEASON: シーズンの監督を当てる
      () => {
        const tenure = db.managerTenures.find(mt => mt.season_id === availableSeason);
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

      // 4. SEASON_RANK: リーグ順位を当てる
      () => {
        if (!seasonData.league_rank) return null;
        const correct = `${seasonData.league_rank}位`;
        const possible = [1, 2, 3, 4, 6].filter(r => r !== seasonData.league_rank);
        const distractors = shuffle(possible).slice(0, 3).map(r => `${r}位`);
        const options = shuffle([correct, ...distractors]);

        return {
          category: 'SEASON',
          year: seasonData.year,
          question: `${seasonData.year}年シーズンの浦和レッズのJ1リーグ最終順位は？`,
          options,
          correct,
          memoryHook: seasonData.memory_hook || `勝点${seasonData.points}を獲得し、リーグ${seasonData.league_rank}位で終えた。`,
          seasonId: seasonData.season_id
        };
      },

      // 5. SEASON_SUMMARY: 要約からシーズンを当てる
      () => {
        const otherSeasons = db.seasons.filter(s => s.season_id !== availableSeason);
        const distractors = otherSeasons.map(s => `${s.year}年`);
        while (distractors.length < 3) {
          const fakeYear = 2000 + Math.floor(Math.random() * 20);
          if (fakeYear !== seasonData.year && !distractors.includes(`${fakeYear}年`)) {
            distractors.push(`${fakeYear}年`);
          }
        }
        const correct = `${seasonData.year}年`;
        const options = shuffle([correct, ...distractors.slice(0, 3)]);

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

      // 6. KIT_DETAIL: ユニフォーム胸スポンサーやサプライヤーを当てる
      () => {
        const kit = db.uniforms.find(u => u.season_id === availableSeason && u.type === 'HOME');
        if (!kit) return null;
        const correct = kit.chest_sponsor;
        const pool = ['MITSUBISHI MOTORS', 'Vodafone', 'POLUS', 'DHL'].filter(s => s !== correct);
        const distractors = shuffle(pool).slice(0, 3);
        const options = shuffle([correct, ...distractors]);

        return {
          category: 'KIT',
          year: seasonData.year,
          question: `${seasonData.year}年シーズンの公式ユニフォームの胸スポンサーは？`,
          options,
          correct,
          memoryHook: kit.description || `${seasonData.year}年のユニフォームはサプライヤーが${kit.supplier}、胸ロゴは${kit.chest_sponsor}。`,
          seasonId: seasonData.season_id
        };
      }
    ];

    const validGenerators = shuffle(generators);
    for (const gen of validGenerators) {
      const q = gen();
      if (q && q.options && q.options.length === 4) {
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

  const screens = {
    today: () => {
      const stats = getStats();
      const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
      return `
        <div class="eyebrow">TODAY</div>
        <div class="year">2006</div>
        <h1 class="display-title">1問から、浦和の歴史へ。</h1>
        <p class="lead">単なるクイズではなく、歴史データベースと連携して「解く → 覚える → 年代へ潜る」学習サイクルを体験できます。</p>
        <button class="primary" data-action="start-quiz">今日の1問を解く</button>
        <hr class="rule">
        <div class="section-label">CONTINUE</div>
        <div class="stat-line"><span>最近間違えた問題</span><strong>${stats.recentWrong}</strong></div>
        <div class="stat-line"><span>学習した問題数</span><strong>${stats.total}問 / 正答率 ${accuracy}%</strong></div>
        <div class="stat-line"><span>現在の基準シーズン</span><strong>2006年（初優勝）</strong></div>
      `;
    },

    quiz: () => {
      if (!activeQuiz) {
        activeQuiz = generateQuiz(selectedSeasonId);
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
          <span>${activeQuiz.category} · ${activeQuiz.year}</span>
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
      const seasons = db ? db.seasons : [];
      return `
        <div class="eyebrow">HISTORY</div>
        <h1 class="display-title">Timeline</h1>
        <p class="lead">年を入口に、選手・監督・ユニフォーム・出来事を結びつける。</p>
        <div class="timeline">
          ${seasons.map(s => `
            <div class="timeline-item" data-action="view-season" data-season="${s.season_id}">
              <div class="timeline-year">${s.year}</div>
              <div class="timeline-note">
                <strong>${s.titles && s.titles.length ? s.titles.join(' / ') : (s.league_rank ? `J1 ${s.league_rank}位` : 'シーズン')}</strong><br>
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
        <div class="stat-line"><span>最終順位</span><strong>${s.league_rank ? `J1 ${s.league_rank}位` : '—'}</strong></div>
        ${s.points ? `<div class="stat-line"><span>勝点 / 戦績</span><strong>勝点${s.points}（${s.wins}勝 ${s.draws}分 ${s.losses}敗）</strong></div>` : ''}
        ${s.titles && s.titles.length ? `<div class="stat-line"><span>獲得タイトル</span><strong>${s.titles.join('、')}</strong></div>` : ''}

        <hr class="rule">
        <div class="section-label">MANAGER</div>
        <div class="stat-line">
          <span>監督</span>
          <strong>${manager ? manager.name : '—'}</strong>
        </div>
        ${tenure ? `<p style="font-size:0.875rem; color:var(--text-secondary,#666); margin:4px 0 0 0;">${tenure.notes}</p>` : ''}

        <hr class="rule">
        <div class="section-label">KIT</div>
        <div class="kit-card">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px; height:36px; background:${kit ? kit.main_color : '#E6002D'}; border:1px solid #ddd; border-radius:4px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:10px; color:#fff;">KIT</div>
            <div>
              <strong>${kit ? kit.supplier : 'Nike'} (${kit ? kit.chest_sponsor : 'Vodafone'})</strong>
              <div style="font-size:0.8125rem; color:var(--muted);">${kit ? kit.description : '公式ユニフォーム'}</div>
            </div>
          </div>
        </div>

        <hr class="rule">
        <div class="section-label">KEY SQUAD (${psList.length}名登録)</div>
        <div class="squad-list">
          ${psList.map(ps => {
            const p = db.players.find(x => x.player_id === ps.player_id);
            return `
              <div class="squad-item">
                <div>
                  <span class="squad-num">#${ps.shirt_number}</span>
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
        { key: '1990s', label: '1990年代' },
        { key: '2000s', label: '2000年代' },
        { key: '2010s', label: '2010年代' },
        { key: '2020s', label: '2020年代' }
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
        <p class="lead">単なるスコアではなく、「どの年代・カテゴリを深く理解しているか」を可視化します。</p>

        <div class="stat-line"><span>総解答数</span><strong>${stats.total}問</strong></div>
        <div class="stat-line"><span>総合正答率</span><strong>${accuracy}%</strong></div>
        <div class="stat-line"><span>最近の誤答</span><strong>${stats.recentWrong}問</strong></div>

        <hr class="rule">
        <div class="section-label">ERA MASTERY（年代別）</div>
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
        <div class="section-label">CATEGORY MASTERY（カテゴリ別）</div>
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

  function render(screenName) {
    currentScreen = screenName;
    app.innerHTML = screens[screenName]();
    document.querySelectorAll('.nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.screen === screenName);
    });
    bindEvents();
  }

  function bindEvents() {
    // Navigation items
    document.querySelectorAll('[data-screen]').forEach(el => {
      el.addEventListener('click', () => {
        if (el.dataset.screen === 'quiz') {
          activeQuiz = generateQuiz(selectedSeasonId);
        }
        render(el.dataset.screen);
      });
    });

    // Start Quiz
    document.querySelectorAll('[data-action="start-quiz"]').forEach(el => {
      el.addEventListener('click', () => {
        activeQuiz = generateQuiz(selectedSeasonId);
        render('quiz');
      });
    });

    // View Season from timeline
    document.querySelectorAll('[data-action="view-season"]').forEach(el => {
      el.addEventListener('click', () => {
        selectedSeasonId = el.dataset.season;
        render('season');
      });
    });

    // Quiz this specific season
    document.querySelectorAll('[data-action="quiz-this-season"]').forEach(el => {
      el.addEventListener('click', () => {
        selectedSeasonId = el.dataset.season;
        activeQuiz = generateQuiz(selectedSeasonId);
        render('quiz');
      });
    });

    // Reset stats
    document.querySelectorAll('[data-action="reset-stats"]').forEach(el => {
      el.addEventListener('click', () => {
        if (confirm('学習履歴を初期化しますか？')) {
          localStorage.removeItem(STORAGE_KEY);
          render('you');
        }
      });
    });

    // Answer selection
    document.querySelectorAll('[data-answer]').forEach(el => {
      el.addEventListener('click', () => {
        if (!activeQuiz) return;
        const selectedVal = el.dataset.value;
        const isCorrect = selectedVal === activeQuiz.correct;

        // Record learning history
        recordAnswer(activeQuiz, isCorrect);

        // Lock all options and show results
        document.querySelectorAll('[data-answer]').forEach(b => {
          b.disabled = true;
          if (b.dataset.value === activeQuiz.correct) {
            b.classList.add('correct');
          }
          if (b.dataset.value === selectedVal && !isCorrect) {
            b.classList.add('wrong');
          }
        });

        // Feedback section with Memory Hook
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
          activeQuiz = generateQuiz(selectedSeasonId);
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
  // 5. App Bootstrap
  // --------------------------------------------------
  initDB().then(() => {
    render(currentScreen);
  });

})();
