const screens = {
  today: () => `
    <div class="eyebrow">TODAY</div>
    <div class="year">2006</div>
    <h1 class="display-title">1問から、浦和の歴史へ。</h1>
    <p class="lead">このプロトタイプでは、データベース完成前に「解く → 覚える → 歴史へ潜る」の流れだけを検証します。</p>
    <button class="primary" data-action="start">今日の1問を解く</button>
    <hr class="rule">
    <div class="section-label">CONTINUE</div>
    <div class="stat-line"><span>最近間違えた問題</span><strong>6</strong></div>
    <div class="stat-line"><span>今月</span><strong>42問 / 78%</strong></div>
    <div class="stat-line"><span>もう少し覚えたい</span><strong>1990s / KIT</strong></div>
  `,
  quiz: () => `
    <div class="question-meta"><span>PLAYER · SAMPLE</span><span>01 / 10</span></div>
    <h1 class="question">このサンプル選手と、同じシーズンに在籍していたのは？</h1>
    <div class="options">
      ${["選手A","選手B","選手C","選手D"].map((x,i)=>`
        <button class="option" data-answer="${i}">
          <span class="key">${String.fromCharCode(65+i)}</span><strong>${x}</strong>
        </button>`).join("")}
    </div>
    <div id="feedback"></div>
  `,
  history: () => `
    <div class="eyebrow">HISTORY</div>
    <h1 class="display-title">Timeline</h1>
    <p class="lead">年を入口に、選手・監督・ユニフォーム・出来事を結びつける。</p>
    <div class="timeline">
      <div class="timeline-item" data-action="season">
        <div class="timeline-year">1995</div>
        <div class="timeline-note">Prototype season — 実データ投入前の構造確認用。</div>
      </div>
      <div class="timeline-item" data-action="season">
        <div class="timeline-year">2006</div>
        <div class="timeline-note">Prototype season — Season Detailの見え方を確認。</div>
      </div>
      <div class="timeline-item" data-action="season">
        <div class="timeline-year">2025</div>
        <div class="timeline-note">Prototype season — 年代差が大きい状態でUIを監査。</div>
      </div>
    </div>
  `,
  season: () => `
    <div class="eyebrow">SEASON</div>
    <div class="year">2006</div>
    <h1 class="display-title">Season Detail</h1>
    <p class="lead">ここでは意図的に詳細な歴史情報をまだ入れていません。UIと情報階層だけを先に確認します。</p>
    <hr class="rule">
    <div class="section-label">MANAGER</div>
    <div class="stat-line"><span>Manager</span><strong>Verified data later</strong></div>
    <hr class="rule">
    <div class="section-label">KIT</div>
    <div class="kit" aria-label="ユニフォーム仮表示"><div class="jersey"></div></div>
    <hr class="rule">
    <div class="section-label">PLAYERS</div>
    <div class="stat-line"><span>Squad</span><strong>→</strong></div>
    <div class="actions">
      <button class="primary" data-action="start">このシーズンから出題</button>
      <button class="secondary" data-screen="history">年表へ戻る</button>
    </div>
  `,
  you: () => `
    <div class="eyebrow">YOU</div>
    <h1 class="display-title">Your Urawa</h1>
    <p class="lead">スコアではなく、「どこを知っていて、どこがまだ曖昧か」を見る。</p>
    ${[["1990s",40],["2000s",82],["2010s",62],["2020s",76]].map(([name,p])=>`
      <div class="stat-line">
        <div><strong>${name}</strong><div class="progress"><span style="width:${p}%"></span></div></div>
        <strong>${p}%</strong>
      </div>`).join("")}
    <hr class="rule">
    <div class="section-label">CATEGORY</div>
    <div class="stat-line"><span>PLAYER</span><strong>82%</strong></div>
    <div class="stat-line"><span>MANAGER</span><strong>61%</strong></div>
    <div class="stat-line"><span>SEASON</span><strong>74%</strong></div>
    <div class="stat-line"><span>KIT</span><strong>48%</strong></div>
  `
};

let current = "today";
const app = document.querySelector("#app");

function render(name) {
  current = name;
  app.innerHTML = screens[name]();
  document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.screen === name));
  bind();
}

function bind() {
  document.querySelectorAll("[data-screen]").forEach(el => {
    el.addEventListener("click", () => render(el.dataset.screen));
  });
  document.querySelectorAll("[data-action='start']").forEach(el => {
    el.addEventListener("click", () => render("quiz"));
  });
  document.querySelectorAll("[data-action='season']").forEach(el => {
    el.addEventListener("click", () => render("season"));
  });
  document.querySelectorAll("[data-answer]").forEach(el => {
    el.addEventListener("click", () => {
      const idx = Number(el.dataset.answer);
      document.querySelectorAll("[data-answer]").forEach((b,i) => {
        b.disabled = true;
        if (i === 1) b.classList.add("correct");
        if (i === idx && idx !== 1) b.classList.add("wrong");
      });
      const ok = idx === 1;
      document.querySelector("#feedback").innerHTML = `
        <section class="feedback" aria-live="polite">
          <div class="feedback-state ${ok ? "good":"bad"}">${ok ? "CORRECT":"NOT THIS TIME"}</div>
          <h2 class="answer-title">選手B</h2>
          <div class="memory-hook">
            ここに「その年を覚えるための短い関連情報」を1つだけ表示する。本番では検証済みDBから生成する。
          </div>
          <div class="actions">
            <button class="primary" data-action="next">次の問題</button>
            <button class="secondary" data-action="season">このシーズンを見る</button>
          </div>
        </section>`;
      document.querySelector("[data-action='next']").addEventListener("click", () => render("quiz"));
      document.querySelector("[data-action='season']").addEventListener("click", () => render("season"));
    });
  });
}

render(current);
