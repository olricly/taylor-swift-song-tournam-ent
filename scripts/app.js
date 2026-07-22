/* ============================================================
 * Taylor Swift 歌曲对战锦标赛 — 对战核心逻辑
 *
 * 状态结构：
 *   currentRound  1-7 当前轮次
 *   currentMatch  当前轮内场次索引（0 起算）
 *   pairings      当前轮的配对数组（每项 [songA, songB]）
 *   bracket       全部对局记录数组（127 条）
 *   champion      冠军歌曲对象（null 或歌曲）
 *   seeds         首轮排序后的种子映射 { id: seed }
 *
 * 锦标赛规则：
 *   首轮 128 首按 popularityScore 降序排 seed，
 *   seed 法配对：1v128、2v127、3v126…（保证热门不早期相遇）
 *   每轮晋级歌曲按 seed 重新配对。
 *   7 轮（128→64→32→16→8→4→2→1）共 127 场。
 * ============================================================ */

(function () {
  'use strict';

  /* ---------- 常量 ---------- */
  // 每轮场次数：index = round（1-7）。Round1=64, Round2=32...Round7=1
  var MATCHES_PER_ROUND = [0, 64, 32, 16, 8, 4, 2, 1];
  // 累计场次（用于全局编号）：CUM[round] = 之前轮次总场次
  var CUM = [0, 0, 0, 0, 0, 0, 0, 0];
  for (var r = 1; r <= 7; r++) { CUM[r] = CUM[r - 1] + MATCHES_PER_ROUND[r - 1]; }
  var TOTAL_MATCHES = 127; // 64+32+16+8+4+2+1
  var STORAGE_KEY = 'ts_tournament_v1';

  /* ---------- 全局状态 ---------- */
  var State = {
    currentRound: 1,
    currentMatch: 0,
    pairings: [],   // 当前轮配对 [[songA, songB], ...]
    bracket: [],    // 全部对局记录
    champion: null,
    seeds: {}       // { songId: seedNumber }
  };

  /* ---------- DOM 引用 ---------- */
  var els = {};
  function cacheEls() {
    els.battleArena = document.getElementById('battle-arena');
    els.matchNo = document.getElementById('match-no');
    els.matchTitle = document.getElementById('match-title');
    els.overallCount = document.getElementById('overall-count');
    els.overallFill = document.getElementById('overall-fill');
    els.roundFill = document.getElementById('round-fill');
    els.roundLabel = document.getElementById('round-label');
    els.eraBadge = document.getElementById('era-badge');
    els.eraText = document.getElementById('era-text');
    // 视图
    els.viewBattle = document.getElementById('battle');
    els.viewTransition = document.getElementById('round-transition');
    els.viewChampion = document.getElementById('champion');
    els.viewBracket = document.getElementById('bracket-view');
    // 过渡
    els.transitionTitle = document.getElementById('transition-title');
    els.transitionDesc = document.getElementById('transition-desc');
    // 冠军
    els.championCard = document.getElementById('champion-card');
    // 导航
    els.navBattle = document.getElementById('nav-battle');
    els.navBracket = document.getElementById('nav-bracket');
  }

  /* ---------- 工具函数 ---------- */
  // 秒转 mm:ss
  function fmtDuration(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' + s : s);
  }
  // 全局场次编号（1-127）
  function matchNo(round, matchIdx) {
    return CUM[round] + matchIdx + 1;
  }
  // 当前轮总场次
  function roundTotal(round) { return MATCHES_PER_ROUND[round]; }
  // 已完成总场次
  function completedTotal() { return State.bracket.length; }

  /* ============================================================
   * 配对生成：seed 法
   * ============================================================ */
  // 首轮：按 popularityScore 降序排，赋 seed，然后 1vN、2v(N-1)...
  function initFirstRound() {
    var songs = window.TS_SONGS.slice();
    // 降序排（稳定排序保证并列分数一致）
    songs.sort(function (a, b) { return b.popularityScore - a.popularityScore; });
    // 赋 seed
    State.seeds = {};
    songs.forEach(function (s, i) { State.seeds[s.id] = i + 1; });
    // seed 法配对
    State.pairings = seedPair(songs);
    State.currentRound = 1;
    State.currentMatch = 0;
  }

  // seed 配对：升序的前半 vs 后半倒序
  function seedPair(sortedSongs) {
    var n = sortedSongs.length;
    var pairs = [];
    for (var i = 0; i < n / 2; i++) {
      pairs.push([sortedSongs[i], sortedSongs[n - 1 - i]]);
    }
    return pairs;
  }

  // 下一轮配对：晋级歌曲按 seed 升序排，再 seed 法配对
  // 参数 fromRound 指定从哪一轮收集晋级者（避免依赖 State.currentRound 时机）
  function buildNextRoundPairings(fromRound) {
    var round = fromRound || State.currentRound;
    var advancing = [];
    State.bracket.forEach(function (m) {
      if (m.round === round && m.winnerId) {
        var winner = findSong(m.winnerId);
        if (winner) advancing.push(winner);
      }
    });
    // 按 seed 升序（保持热门不相遇）
    advancing.sort(function (a, b) {
      return (State.seeds[a.id] || 999) - (State.seeds[b.id] || 999);
    });
    return seedPair(advancing);
  }

  function findSong(id) {
    for (var i = 0; i < window.TS_SONGS.length; i++) {
      if (window.TS_SONGS[i].id === id) return window.TS_SONGS[i];
    }
    return null;
  }

  /* ============================================================
   * 渲染：当前场次
   * ============================================================ */
  function renderCurrentMatch() {
    // 冠军已产生 → 显示冠军页
    if (State.champion) { showChampion(); return; }

    var pair = State.pairings[State.currentMatch];
    if (!pair) {
      // 当前轮已完成但未点"继续"进入下一轮（如刷新页面）→ 显示轮次过渡
      // 决赛（Round 7）完成时 champion 已设置，不会走到这里
      showRoundTransition(State.currentRound, State.currentRound + 1);
      return;
    }

    var songA = pair[0], songB = pair[1];
    var no = matchNo(State.currentRound, State.currentMatch);
    var total = roundTotal(State.currentRound);

    // 顶部场次信息
    els.matchNo.textContent = 'M' + no;
    els.matchTitle.textContent = 'Round ' + State.currentRound + ' · 第 ' + (State.currentMatch + 1) + ' 场';

    // era 主题色：以两首歌 era 色混合取 A
    applyEraTheme(songA);

    // 渲染卡片
    els.battleArena.innerHTML = '';
    els.battleArena.appendChild(buildCard(songA, 'A'));
    els.battleArena.appendChild(buildVsDivider());
    els.battleArena.appendChild(buildCard(songB, 'B'));

    updateProgress();
  }

  // 构建单张歌曲卡片
  function buildCard(song, side) {
    var card = document.createElement('article');
    card.className = 'song-card';
    card.style.setProperty('--cover', song.coverColor);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', '选择 ' + song.title + ' 晋级');
    card.dataset.songId = song.id;

    var seed = State.seeds[song.id] || '—';
    var html =
      '<div class="card-inner">' +
        '<div class="card-meta">' +
          '<span class="card-era-tag">' + escapeHtml(song.era) + '</span>' +
          (song.isVault ? '<span class="card-vault-tag">Vault</span>' : '') +
          '<span class="card-meta-extra" style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-dim);">Seed #' + seed + '</span>' +
        '</div>' +
        '<h3 class="card-title">' + escapeHtml(song.title) + '</h3>' +
        '<p class="card-album">' + escapeHtml(song.album) + '</p>' +
        '<p class="card-year-duration">' +
          '<span>' + song.year + '</span>' +
          '<span>' + fmtDuration(song.duration) + '</span>' +
        '</p>' +
        '<div class="card-popularity">' +
          '<div class="pop-label"><span>热度</span><span>' + song.popularityScore + '</span></div>' +
          '<div class="pop-bar"><div class="pop-fill" style="width:' + song.popularityScore + '%"></div></div>' +
        '</div>' +
      '</div>';
    card.innerHTML = html;

    // 点击 / 键盘选择
    card.addEventListener('click', function () { selectWinner(song.id, side); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectWinner(song.id, side); }
    });
    return card;
  }

  function buildVsDivider() {
    var div = document.createElement('div');
    div.className = 'vs-divider';
    div.innerHTML = '<span class="vs-text">VS</span>';
    return div;
  }

  /* ---------- era 主题色切换 ---------- */
  function applyEraTheme(song) {
    document.documentElement.style.setProperty('--era-color', song.coverColor);
    // 将 coverColor 转 rgba 用作 glow
    var rgba = hexToRgba(song.coverColor, 0.45);
    document.documentElement.style.setProperty('--era-glow', rgba);
    els.eraText.textContent = 'Round ' + State.currentRound + ' · ' + song.era;
  }

  function hexToRgba(hex, alpha) {
    var h = hex.replace('#', '');
    if (h.length === 3) { h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; }
    var r = parseInt(h.substring(0, 2), 16);
    var g = parseInt(h.substring(2, 4), 16);
    var b = parseInt(h.substring(4, 6), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  /* ============================================================
   * 核心：选择胜者 → 记录 → 推进
   * ============================================================ */
  function selectWinner(winnerId, side) {
    var pair = State.pairings[State.currentMatch];
    if (!pair) return;
    var songA = pair[0], songB = pair[1];
    var loserId = (winnerId === songA.id) ? songB.id : songA.id;

    // 视觉反馈：高亮选中、淘汰对手
    var cards = els.battleArena.querySelectorAll('.song-card');
    cards.forEach(function (c) {
      var id = parseInt(c.dataset.songId, 10);
      if (id === winnerId) c.classList.add('is-selected');
      else c.classList.add('is-eliminated');
      c.style.pointerEvents = 'none'; // 防止重复点击
    });

    // 记录到 bracket
    var no = matchNo(State.currentRound, State.currentMatch);
    State.bracket.push({
      round: State.currentRound,
      matchNo: no,
      songA: songA,
      songB: songB,
      winnerId: winnerId,
      loserId: loserId,
      completed: true
    });

    saveState();

    // 延迟推进，让用户看到反馈
    setTimeout(function () { advance(); }, 520);
  }

  // 推进下一场 / 轮次过渡 / 冠军
  function advance() {
    State.currentMatch++;
    // 当前轮未完成 → 渲染下一场
    if (State.currentMatch < State.pairings.length) {
      saveState();
      renderCurrentMatch();
      return;
    }
    // 当前轮完成
    var nextRound = State.currentRound + 1;
    // 决赛完成（第 7 轮）→ 冠军
    if (nextRound > 7) {
      // 最后一场的胜者即冠军
      var lastMatch = State.bracket[State.bracket.length - 1];
      State.champion = findSong(lastMatch.winnerId);
      saveState();
      showChampion();
      return;
    }
    // 显示轮次过渡
    showRoundTransition(State.currentRound, nextRound);
  }

  /* ============================================================
   * 轮次过渡
   * ============================================================ */
  function showRoundTransition(doneRound, nextRound) {
    saveState();
    switchView('transition');
    var advanceCount = MATCHES_PER_ROUND[nextRound];
    els.transitionTitle.textContent = 'Round ' + doneRound + ' Complete';
    els.transitionDesc.textContent = advanceCount * 2 + ' 首歌曲已淘汰，' + advanceCount + ' 首晋级，进入 Round ' + nextRound;
    // 同步更新进度条（当前轮已 100%）
    updateProgress();
  }

  function continueToNextRound() {
    var completedRound = State.currentRound; // 刚完成的轮次
    var nextRound = completedRound + 1;
    // 先用 completedRound 的晋级者构建下一轮配对（此时 currentRound 尚未改动）
    State.pairings = buildNextRoundPairings(completedRound);
    State.currentRound = nextRound;
    State.currentMatch = 0;
    saveState();
    switchView('battle');
    renderCurrentMatch();
  }

  /* ============================================================
   * 进度条更新
   * ============================================================ */
  function updateProgress() {
    var done = completedTotal();
    var overallPct = (done / TOTAL_MATCHES) * 100;
    els.overallCount.textContent = done + ' / ' + TOTAL_MATCHES;
    els.overallFill.style.width = overallPct + '%';

    var roundDone = State.currentMatch; // 当前轮已完成场次
    var roundTotalNum = roundTotal(State.currentRound);
    var roundPct = (roundDone / roundTotalNum) * 100;
    els.roundFill.style.width = roundPct + '%';
    els.roundLabel.textContent = 'Round ' + State.currentRound + ' · ' + roundDone + ' / ' + roundTotalNum;
  }

  /* ============================================================
   * 冠军页
   * ============================================================ */
  function showChampion() {
    if (!State.champion) return;
    switchView('champion');
    applyEraTheme(State.champion);

    var song = State.champion;
    var seed = State.seeds[song.id] || '—';
    els.championCard.style.setProperty('--cover', song.coverColor);
    els.championCard.innerHTML =
      '<div class="card-inner">' +
        '<div class="card-meta" style="justify-content:center;">' +
          '<span class="card-era-tag">' + escapeHtml(song.era) + '</span>' +
          (song.isVault ? '<span class="card-vault-tag">Vault</span>' : '') +
        '</div>' +
        '<h3 class="card-title">' + escapeHtml(song.title) + '</h3>' +
        '<p class="card-album" style="text-align:center;">' + escapeHtml(song.album) + ' · ' + song.year + '</p>' +
        '<p class="card-year-duration" style="justify-content:center;margin-top:6px;">' +
          '<span>' + fmtDuration(song.duration) + '</span>' +
          '<span>Seed #' + seed + '</span>' +
        '</p>' +
        '<div class="card-popularity">' +
          '<div class="pop-label" style="justify-content:center;"><span>热度</span><span>' + song.popularityScore + '</span></div>' +
          '<div class="pop-bar"><div class="pop-fill" style="width:' + song.popularityScore + '%"></div></div>' +
        '</div>' +
      '</div>';

    // 启动 confetti
    startConfetti(song.coverColor);
  }

  /* ============================================================
   * 重新开始
   * ============================================================ */
  function restart() {
    localStorage.removeItem(STORAGE_KEY);
    State.bracket = [];
    State.champion = null;
    State.seeds = {};
    initFirstRound();
    saveState();
    switchView('battle');
    renderCurrentMatch();
    // 刷新对战表
    if (window.BracketView && window.BracketView.render) {
      window.BracketView.render(State.bracket, State.champion, State.currentRound);
    }
  }

  /* ============================================================
   * 视图切换
   * ============================================================ */
  function switchView(view) {
    // 'battle' | 'transition' | 'champion' | 'bracket-view'
    var map = {
      'battle': els.viewBattle,
      'transition': els.viewTransition,
      'champion': els.viewChampion,
      'bracket-view': els.viewBracket
    };
    Object.keys(map).forEach(function (k) {
      var el = map[k];
      if (k === view) {
        el.hidden = false;
        el.classList.add('view--active');
      } else {
        el.hidden = true;
        el.classList.remove('view--active');
      }
    });

    // 导航高亮
    var isBracket = (view === 'bracket-view');
    els.navBattle.classList.toggle('nav-btn--active', !isBracket);
    els.navBracket.classList.toggle('nav-btn--active', isBracket);

    // 切到对战表时刷新
    if (view === 'bracket-view' && window.BracketView && window.BracketView.render) {
      window.BracketView.render(State.bracket, State.champion, State.currentRound);
    }
  }

  /* ============================================================
   * localStorage 持久化
   * ============================================================ */
  function saveState() {
    try {
      // bracket 里存了完整歌曲对象，但为减小体积只存 id + 关键字段
      var slimBracket = State.bracket.map(function (m) {
        return {
          round: m.round,
          matchNo: m.matchNo,
          aId: m.songA.id,
          bId: m.songB.id,
          winnerId: m.winnerId,
          loserId: m.loserId,
          completed: m.completed
        };
      });
      var data = {
        currentRound: State.currentRound,
        currentMatch: State.currentMatch,
        bracket: slimBracket,
        championId: State.champion ? State.champion.id : null,
        seeds: State.seeds
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage 满或不可用，静默失败
    }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.seeds) return false;

      State.seeds = data.seeds;
      State.currentRound = data.currentRound;
      State.currentMatch = data.currentMatch;
      State.champion = data.championId ? findSong(data.championId) : null;

      // 重建 bracket（恢复完整歌曲对象）
      State.bracket = (data.bracket || []).map(function (m) {
        return {
          round: m.round,
          matchNo: m.matchNo,
          songA: findSong(m.aId),
          songB: findSong(m.bId),
          winnerId: m.winnerId,
          loserId: m.loserId,
          completed: m.completed
        };
      });

      // 重建当前轮 pairings
      if (State.champion) {
        State.pairings = [];
      } else if (State.bracket.length === 0) {
        initFirstRound();
      } else {
        // 根据当前轮已记录的对局重建晋级者，再生成 pairings
        rebuildPairingsForCurrentRound();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // 根据当前轮已完成的场次重建 pairings（处理恢复进度时）
  function rebuildPairingsForCurrentRound() {
    var round = State.currentRound;
    // 收集本轮已完成对局的胜者（按场次顺序）
    var winnersInOrder = [];
    State.bracket.forEach(function (m) {
      if (m.round === round && m.completed) {
        winnersInOrder.push(findSong(m.winnerId));
      }
    });
    // 本轮全部晋级者（用于生成完整配对结构）
    var allAdvancing;
    if (round === 1) {
      allAdvancing = window.TS_SONGS.slice().sort(function (a, b) {
        return (State.seeds[a.id] || 999) - (State.seeds[b.id] || 999);
      });
    } else {
      // 上一轮晋级者
      allAdvancing = [];
      State.bracket.forEach(function (m) {
        if (m.round === round - 1 && m.completed) {
          allAdvancing.push(findSong(m.winnerId));
        }
      });
      allAdvancing.sort(function (a, b) {
        return (State.seeds[a.id] || 999) - (State.seeds[b.id] || 999);
      });
    }
    State.pairings = seedPair(allAdvancing);
  }

  /* ============================================================
   * HTML 转义（防注入）
   * ============================================================ */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ============================================================
   * confetti 庆祝动画（自实现 canvas，金色 + era 色）
   * ============================================================ */
  var confettiCtx = null;
  var confettiParticles = [];
  var confettiRAF = null;

  function startConfetti(eraColor) {
    var canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    confettiCtx = canvas.getContext('2d');
    confettiParticles = [];

    // 生成 ~180 个纸屑
    var colors = ['#D4AF37', '#F5EFE6', eraColor, '#f0d878', '#b8941f'];
    for (var i = 0; i < 180; i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 12,
        vy: 1.5 + Math.random() * 2.5,
        vx: -1 + Math.random() * 2,
        rot: Math.random() * Math.PI * 2,
        vr: -0.2 + Math.random() * 0.4,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.5 ? 'rect' : 'star'
      });
    }
    if (confettiRAF) cancelAnimationFrame(confettiRAF);
    confettiLoop();
    // 8 秒后停止
    setTimeout(function () {
      if (confettiRAF) cancelAnimationFrame(confettiRAF);
      if (confettiCtx) confettiCtx.clearRect(0, 0, canvas.width, canvas.height);
    }, 8000);
  }

  function confettiLoop() {
    var canvas = document.getElementById('confetti-canvas');
    if (!canvas || !confettiCtx) return;
    confettiCtx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < confettiParticles.length; i++) {
      var p = confettiParticles[i];
      p.y += p.vy;
      p.x += p.vx;
      p.rot += p.vr;
      if (p.y > canvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.color;
      if (p.shape === 'rect') {
        confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        // 简易星形
        confettiCtx.beginPath();
        for (var s = 0; s < 5; s++) {
          var ang = (Math.PI * 2 * s) / 5 - Math.PI / 2;
          var rOut = p.w / 2;
          var rIn = rOut * 0.45;
          confettiCtx.lineTo(Math.cos(ang) * rOut, Math.sin(ang) * rOut);
          var ang2 = ang + Math.PI / 5;
          confettiCtx.lineTo(Math.cos(ang2) * rIn, Math.sin(ang2) * rIn);
        }
        confettiCtx.closePath();
        confettiCtx.fill();
      }
      confettiCtx.restore();
    }
    confettiRAF = requestAnimationFrame(confettiLoop);
  }

  /* ============================================================
   * 背景粒子流场（低频，性能优先，80-150 粒子）
   * ============================================================ */
  function initBgParticles() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 100 个粒子
    var count = 100;
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.8,
        vx: -0.15 + Math.random() * 0.3,
        vy: -0.2 + Math.random() * 0.4,
        alpha: 0.1 + Math.random() * 0.4,
        hue: Math.random() > 0.6 ? 'gold' : 'white'
      });
    }

    function loop() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        // 流场：用正弦扰动模拟
        p.x += p.vx + Math.sin(p.y * 0.005 + i) * 0.15;
        p.y += p.vy + Math.cos(p.x * 0.005 + i) * 0.1;
        // 边界回绕
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.hue === 'gold'
          ? 'rgba(212,175,55,' + p.alpha + ')'
          : 'rgba(245,239,230,' + p.alpha + ')';
        ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ============================================================
   * 初始化与事件绑定
   * ============================================================ */
  function init() {
    cacheEls();

    // 数据校验
    if (!window.TS_SONGS || window.TS_SONGS.length !== 128) {
      console.error('歌曲数据异常：', window.TS_SONGS ? window.TS_SONGS.length : '未加载');
    }

    // 尝试恢复进度
    var restored = loadState();
    if (!restored) {
      initFirstRound();
      saveState();
    }

    // 事件：继续按钮
    document.getElementById('btn-continue-round').addEventListener('click', continueToNextRound);
    // 冠军页按钮
    document.getElementById('btn-view-bracket').addEventListener('click', function () {
      switchView('bracket-view');
    });
    document.getElementById('btn-restart-champion').addEventListener('click', restart);
    // 导航
    els.navBattle.addEventListener('click', function () { switchView('battle'); });
    els.navBracket.addEventListener('click', function () { switchView('bracket-view'); });

    // 背景粒子
    initBgParticles();

    // 渲染
    if (State.champion) {
      showChampion();
    } else {
      switchView('battle');
      renderCurrentMatch();
    }

    // 暴露给外部调试
    window.TS_App = { State: State, restart: restart, switchView: switchView };
  }

  // DOM 就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
