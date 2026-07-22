/* ============================================================
 * Taylor Swift 歌曲对战锦标赛 — 对战树渲染（bracket.js）
 *
 * 渲染完整淘汰赛树（255 节点）：
 *   - 7 列对应 Round 1-7，最右侧冠军节点
 *   - SVG 贝塞尔曲线连接父子节点
 *   - 胜者金色高亮、败者灰色删除线、待定虚线
 *   - 当前轮节点脉冲提示
 *   - 支持双指缩放、拖拽平移、滚轮缩放
 *   - 控制按钮：重置视图、聚焦当前轮、放大、缩小
 *
 * 暴露：window.BracketView.render(bracket, champion, currentRound)
 * ============================================================ */

(function () {
  'use strict';

  /* ---------- 常量 ---------- */
  var ROUND_LABELS_128 = ['', 'R1 · 128→64', 'R2 · 64→32', 'R3 · 32→16',
                          'R4 · 16→8', 'R5 · 8→4', 'R6 · 4→2', 'R7 · 决赛'];
  var ROUND_LABELS_64 = ['', 'R1 · 64→32', 'R2 · 32→16', 'R3 · 16→8',
                         'R4 · 8→4', 'R5 · 4→2', 'R6 · 决赛'];

  var NODE_W = 190;
  var NODE_H = 32;
  var COL_GAP = 44;
  var COL_WIDTH = NODE_W + COL_GAP;
  var TOP_PAD = 52;
  var SLOT_H_R1 = 38;
  var MIN_SCALE = 0.12;
  var MAX_SCALE = 2.0;

  var currentSize = 128;
  var totalRounds = 7;
  var TOTAL_H = 128 * SLOT_H_R1;
  var CHAMPION_COL_X = 7 * COL_WIDTH;
  var CHAMPION_W = NODE_W + 28;
  var WORLD_W = CHAMPION_COL_X + CHAMPION_W + 30;
  var WORLD_H = TOTAL_H + TOP_PAD + 40;

  function setSize(size) {
    currentSize = size || 128;
    totalRounds = Math.log2(currentSize);
    TOTAL_H = currentSize * SLOT_H_R1;
    CHAMPION_COL_X = totalRounds * COL_WIDTH;
    CHAMPION_W = NODE_W + 28;
    WORLD_W = CHAMPION_COL_X + CHAMPION_W + 30;
    WORLD_H = TOTAL_H + TOP_PAD + 40;
  }

  function getRoundLabels() {
    return currentSize === 64 ? ROUND_LABELS_64 : ROUND_LABELS_128;
  }

  function getMatchesPerRound() {
    var arr = [0];
    for (var r = 1; r <= totalRounds; r++) {
      arr.push(currentSize / Math.pow(2, r));
    }
    return arr;
  }

  function buildCum() {
    var mpr = getMatchesPerRound();
    var cum = [];
    for (var r = 0; r < mpr.length; r++) {
      cum[r] = r === 0 ? 0 : cum[r - 1] + mpr[r - 1];
    }
    return cum;
  }

  /* ---------- 视图状态 ---------- */
  var viewport = null;
  var world = null;
  var zoomLabel = null;
  var view = { scale: 1, tx: 0, ty: 0 };
  var drag = null;
  var pinch = null;
  var interactionBound = false;
  var lastCurrentRound = 1;
  var hasChampion = false;

  /* ---------- 工具 ---------- */
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 缓存的 seed 表（按 popularityScore 降序排名）
  var seedCache = null;
  function getSeed(song) {
    if (!seedCache) {
      seedCache = {};
      var sorted = window.TS_SONGS.slice().sort(function (a, b) {
        return b.popularityScore - a.popularityScore;
      });
      sorted.forEach(function (s, i) { seedCache[s.id] = i + 1; });
    }
    return seedCache[song.id] || '—';
  }

  function findSong(id) {
    for (var i = 0; i < window.TS_SONGS.length; i++) {
      if (window.TS_SONGS[i].id === id) return window.TS_SONGS[i];
    }
    return null;
  }

  // 将十六进制色转 RGB
  function hexToRgb(hex) {
    hex = (hex || '#000').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function (c) { return c + c; }).join('');
    return {
      r: parseInt(hex.substr(0, 2), 16) || 0,
      g: parseInt(hex.substr(2, 2), 16) || 0,
      b: parseInt(hex.substr(4, 2), 16) || 0
    };
  }

  // 计算相对亮度（WCAG），用于自动选择文字深浅色
  function relativeLuminance(hex) {
    var rgb = hexToRgb(hex);
    var channel = function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
  }

  // 根据 era 色返回适合的文字色（亮背景→深字，暗背景→亮字）
  function pickTextColor(bgHex) {
    return relativeLuminance(bgHex) > 0.42 ? '#1A0E0E' : '#FBF6EB';
  }

  /* ============================================================
   * 主渲染入口
   * ============================================================ */
  function render(bracket, champion, currentRound, size) {
    var container = document.getElementById('bracket-container');
    viewport = document.getElementById('bracket-viewport');
    world = container;
    if (!world || !viewport) return;

    var sz = size || (window.TS_App && window.TS_App.getSize ? window.TS_App.getSize() : 128);
    setSize(sz);

    lastCurrentRound = currentRound || 1;
    hasChampion = !!champion;

    var nodes = buildNodes(bracket, champion);

    renderWorld(nodes, champion, currentRound);

    if (!interactionBound) {
      bindInteraction();
      bindControls();
      interactionBound = true;
    }

    if (hasChampion) {
      focusChampion();
    } else {
      focusRound(currentRound);
    }
  }

  /* ============================================================
   * 构建所有节点
   * ============================================================ */
  function buildNodes(bracket, champion) {
    var selected = getSelectedSongs();
    var r1Pairs = [];
    for (var i = 0; i < selected.length; i += 2) {
      r1Pairs.push([selected[i], selected[i + 1]]);
    }

    var recordMap = {};
    bracket.forEach(function (m) { recordMap[m.matchNo] = m; });

    var cum = buildCum();
    var nodes = [];

    for (var round = 1; round <= totalRounds; round++) {
      var count = currentSize / Math.pow(2, round - 1);
      var slotH = TOTAL_H / count;

      for (var s = 0; s < count; s++) {
        var matchIdx = Math.floor(s / 2);
        var mNo = cum[round] + matchIdx + 1;
        var rec = recordMap[mNo];

        var song = null;
        if (round === 1) {
          song = r1Pairs[matchIdx] ? r1Pairs[matchIdx][s % 2] : null;
        } else {
          var prevIdx = 2 * matchIdx + (s % 2);
          var prevMNo = cum[round - 1] + prevIdx + 1;
          var prevRec = recordMap[prevMNo];
          if (prevRec && prevRec.completed) {
            song = findSong(prevRec.winnerId);
          }
        }

        var status;
        if (rec && rec.completed) {
          status = (song && rec.winnerId === song.id) ? 'winner' : 'loser';
        } else if (song) {
          status = 'pending';
        } else {
          status = 'empty';
        }

        var x = (round - 1) * COL_WIDTH;
        var y = TOP_PAD + (s + 0.5) * slotH - NODE_H / 2;

        nodes.push({
          round: round, slot: s, matchNo: mNo,
          song: song, status: status, record: rec,
          x: x, y: y
        });
      }
    }

    if (champion) {
      nodes.push({
        round: totalRounds + 1, slot: 0,
        matchNo: cum[totalRounds] + 1,
        song: champion, status: 'champion', record: null,
        x: CHAMPION_COL_X, y: TOP_PAD + TOTAL_H / 2 - 22
      });
    }

    return nodes;
  }

  function getSelectedSongs() {
    var appState = window.TS_App && window.TS_App.State;
    if (appState && appState.selectedSongIds && appState.selectedSongIds.length > 0) {
      var result = [];
      for (var i = 0; i < appState.selectedSongIds.length; i++) {
        var s = findSong(appState.selectedSongIds[i]);
        if (s) result.push(s);
      }
      return result;
    }
    var sorted = window.TS_SONGS.slice().sort(function (a, b) {
      return b.popularityScore - a.popularityScore;
    });
    return sorted.slice(0, currentSize);
  }

  /* ============================================================
   * 渲染整个 world
   * ============================================================ */
  function renderWorld(nodes, champion, currentRound) {
    var html = '';

    // SVG 连接线层
    html += '<svg class="bracket-svg" width="' + WORLD_W + '" height="' + WORLD_H + '">';
    html += renderLinks(nodes, champion);
    html += '</svg>';

    var roundLabels = getRoundLabels();
    for (var r = 1; r <= totalRounds; r++) {
      var cx = (r - 1) * COL_WIDTH;
      html += '<div class="bracket-col-label" style="left:' + cx + 'px;width:' + NODE_W + 'px;top:8px;">' +
              roundLabels[r] + '</div>';
    }
    if (champion) {
      html += '<div class="bracket-col-label" style="left:' + CHAMPION_COL_X + 'px;width:' + CHAMPION_W + 'px;top:8px;">Champion</div>';
    }

    // 节点
    for (var i = 0; i < nodes.length; i++) {
      html += renderNode(nodes[i], currentRound);
    }

    world.innerHTML = html;
    world.style.width = WORLD_W + 'px';
    world.style.height = WORLD_H + 'px';
  }

  /* ---------- 渲染连接线 ---------- */
  function renderLinks(nodes, champion) {
    var byRound = {};
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (!byRound[n.round]) byRound[n.round] = {};
      byRound[n.round][n.slot] = n;
    }

    var paths = '';

    for (var r = 1; r <= totalRounds - 1; r++) {
      var count = currentSize / Math.pow(2, r - 1);
      for (var s = 0; s < count; s++) {
        var parent = byRound[r][s];
        var child = byRound[r + 1][Math.floor(s / 2)];
        if (!parent || !child) continue;
        paths += linkPath(parent, child, NODE_H);
      }
    }

    if (champion && byRound[totalRounds + 1] && byRound[totalRounds + 1][0]) {
      var champ = byRound[totalRounds + 1][0];
      for (var k = 0; k < 2; k++) {
        var p = byRound[totalRounds][k];
        if (!p) continue;
        paths += linkPath(p, champ, 44);
      }
    }

    return paths;
  }

  function linkPath(parent, child, childH) {
    var x1 = parent.x + NODE_W;
    var y1 = parent.y + NODE_H / 2;
    var x2 = child.x;
    var y2 = child.y + childH / 2;
    var mx = (x1 + x2) / 2;

    var cls = 'link';
    if (parent.status === 'winner') cls += ' is-win';
    else if (parent.status === 'loser') cls += ' is-lose';
    else cls += ' is-pending';

    return '<path class="' + cls + '" d="M ' + x1 + ' ' + y1 +
           ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2 + '" />';
  }

  /* ---------- 渲染单个节点（思维导图风格卡片） ---------- */
  function renderNode(n, currentRound) {
    var cls = 'tree-node';
    if (n.status === 'winner') cls += ' is-winner';
    else if (n.status === 'loser') cls += ' is-loser';
    else if (n.status === 'champion') cls += ' is-champion';
    else cls += ' is-pending'; // pending 和 empty 都用 pending 样式

    if (n.round === currentRound && n.status !== 'empty' && !hasChampion) {
      cls += ' is-current';
    }

    var w = n.status === 'champion' ? CHAMPION_W : NODE_W;
    var style = 'left:' + n.x + 'px;top:' + n.y + 'px;width:' + w + 'px;';

    var inner = '';
    if (n.song) {
      var eraColor = n.song.coverColor;
      var textColor = pickTextColor(eraColor);

      if (n.status === 'champion') {
        // 冠军：金色卡片
        style += '--node-bg:linear-gradient(135deg,' + eraColor + ',#D4AF37);--node-fg:#1A0E0E;';
        inner = '<span class="node-crown" aria-hidden="true">👑</span>' +
                '<span class="node-title">' + escapeHtml(n.song.title) + '</span>' +
                '<span class="node-era-tag">' + escapeHtml(n.song.era) + '</span>';
      } else if (n.status === 'winner') {
        // 胜者：era 色填充 + 金边
        style += '--node-bg:' + eraColor + ';--node-fg:' + textColor + ';';
        inner = '<span class="node-dot" style="background:' + textColor + ';"></span>' +
                '<span class="node-title">' + escapeHtml(n.song.title) + '</span>' +
                '<span class="node-seed">#' + getSeed(n.song) + '</span>';
      } else if (n.status === 'loser') {
        // 败者：era 色淡化
        style += '--node-bg:' + eraColor + ';--node-fg:' + textColor + ';';
        inner = '<span class="node-dot" style="background:' + textColor + ';opacity:.4;"></span>' +
                '<span class="node-title">' + escapeHtml(n.song.title) + '</span>' +
                '<span class="node-seed">#' + getSeed(n.song) + '</span>';
      } else {
        // 待定：半透明 era 色
        style += '--node-bg:' + eraColor + ';--node-fg:' + textColor + ';';
        inner = '<span class="node-dot" style="background:' + textColor + ';opacity:.5;"></span>' +
                '<span class="node-title">' + escapeHtml(n.song.title) + '</span>';
      }
    } else {
      inner = '<span class="node-title node-title--placeholder">待定</span>';
    }

    return '<div class="' + cls + '" style="' + style + '">' + inner + '</div>';
  }

  /* ============================================================
   * 视图变换
   * ============================================================ */
  function applyTransform() {
    if (!world) return;
    world.style.transform = 'translate(' + view.tx + 'px, ' + view.ty + 'px) scale(' + view.scale + ')';
    updateZoomLabel();
  }

  function updateZoomLabel() {
    if (viewport) {
      viewport.setAttribute('data-zoom-label', Math.round(view.scale * 100) + '%');
    }
  }

  function clampScale(s) {
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, s));
  }

  // 以世界坐标 (wx, wy) 为缩放原点
  function zoomAt(screenX, screenY, newScale) {
    newScale = clampScale(newScale);
    var rect = viewport.getBoundingClientRect();
    // 当前屏幕点对应的世界坐标
    var wx = (screenX - rect.left - view.tx) / view.scale;
    var wy = (screenY - rect.top - view.ty) / view.scale;
    // 缩放后让该世界坐标仍对齐屏幕点
    view.scale = newScale;
    view.tx = screenX - rect.left - wx * newScale;
    view.ty = screenY - rect.top - wy * newScale;
    applyTransform();
  }

  /* ---------- 视图预设 ---------- */
  function fitToScreen() {
    if (!viewport || !world) return;
    var rect = viewport.getBoundingClientRect();
    var sx = rect.width / WORLD_W;
    var sy = rect.height / WORLD_H;
    view.scale = clampScale(Math.min(sx, sy) * 0.95);
    view.tx = (rect.width - WORLD_W * view.scale) / 2;
    view.ty = (rect.height - WORLD_H * view.scale) / 2;
    if (view.ty < 0) view.ty = 0;
    applyTransform();
  }

  function focusRound(round) {
    if (!viewport) return;
    var rect = viewport.getBoundingClientRect();
    // 聚焦该列：让该列居中，垂直显示中段
    var colX = (round - 1) * COL_WIDTH + NODE_W / 2;
    // 目标 scale：让 2-3 列宽度可见
    var targetScale = clampScale(rect.width / (COL_WIDTH * 2.2));
    view.scale = targetScale;
    view.tx = rect.width / 2 - colX * targetScale;
    // 垂直居中
    view.ty = (rect.height - WORLD_H * targetScale) / 2;
    if (view.ty < -WORLD_H * targetScale + rect.height) {
      view.ty = -WORLD_H * targetScale + rect.height;
    }
    if (view.ty > 0) view.ty = 0;
    applyTransform();
  }

  function focusChampion() {
    if (!viewport) return;
    var rect = viewport.getBoundingClientRect();
    var champX = CHAMPION_COL_X + CHAMPION_W / 2;
    var champY = TOP_PAD + TOTAL_H / 2;
    var targetScale = clampScale(rect.width / (COL_WIDTH * 2.5));
    view.scale = targetScale;
    view.tx = rect.width / 2 - champX * targetScale;
    view.ty = rect.height / 2 - champY * targetScale;
    applyTransform();
  }

  /* ============================================================
   * 交互：拖拽 + 双指缩放 + 滚轮
   * ============================================================ */
  function bindInteraction() {
    if (!viewport) return;

    // 拖拽（pointer events 统一处理鼠标/触摸）
    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);
    viewport.addEventListener('pointerleave', onPointerUp);

    // 滚轮缩放（桌面端）
    viewport.addEventListener('wheel', onWheel, { passive: false });

    // 双指缩放（触摸）— pointer events 在多指时分别触发，需手动聚合
    // 已在 pointermove 中通过多点检测处理
  }

  function onPointerDown(e) {
    if (!viewport) return;
    // 检测当前活跃指针数
    if (e.isPrimary) {
      drag = {
        startX: e.clientX,
        startY: e.clientY,
        startTx: view.tx,
        startTy: view.ty,
        pointerId: e.pointerId
      };
      viewport.classList.add('is-dragging');
    }
    // 记录所有指针位置用于 pinch
    if (!pinch) pinch = { pointers: {} };
    pinch.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
    if (countKeys(pinch.pointers) === 2) {
      var pts = pinchValues(pinch.pointers);
      pinch.startDist = distance(pts[0], pts[1]);
      pinch.startScale = view.scale;
      pinch.startCenter = midpoint(pts[0], pts[1]);
      drag = null; // 双指时取消拖拽
    }
  }

  function onPointerMove(e) {
    if (!viewport) return;
    if (pinch && pinch.pointers[e.pointerId]) {
      pinch.pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (countKeys(pinch.pointers) >= 2) {
        var pts = pinchValues(pinch.pointers);
        var dist = distance(pts[0], pts[1]);
        var center = midpoint(pts[0], pts[1]);
        if (pinch.startDist > 0) {
          var newScale = pinch.startScale * (dist / pinch.startDist);
          zoomAt(center.x, center.y, newScale);
        }
        return;
      }
    }
    if (drag && e.pointerId === drag.pointerId) {
      var dx = e.clientX - drag.startX;
      var dy = e.clientY - drag.startY;
      view.tx = drag.startTx + dx;
      view.ty = drag.startTy + dy;
      applyTransform();
    }
  }

  function onPointerUp(e) {
    if (viewport) viewport.classList.remove('is-dragging');
    if (pinch && pinch.pointers) {
      delete pinch.pointers[e.pointerId];
      if (countKeys(pinch.pointers) < 2) {
        pinch = null;
      }
    }
    if (drag && e.pointerId === drag.pointerId) {
      drag = null;
    }
  }

  function onWheel(e) {
    e.preventDefault();
    var delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoomAt(e.clientX, e.clientY, view.scale * delta);
  }

  function countKeys(obj) {
    var c = 0;
    for (var k in obj) { if (obj.hasOwnProperty(k)) c++; }
    return c;
  }
  function pinchValues(obj) {
    var arr = [];
    for (var k in obj) { if (obj.hasOwnProperty(k)) arr.push(obj[k]); }
    return arr;
  }
  function distance(a, b) {
    var dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function midpoint(a, b) {
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  /* ---------- 控制按钮 ---------- */
  function bindControls() {
    var btnFit = document.getElementById('btn-tree-fit');
    var btnFocus = document.getElementById('btn-tree-focus');
    var btnIn = document.getElementById('btn-tree-zoom-in');
    var btnOut = document.getElementById('btn-tree-zoom-out');
    if (btnFit) btnFit.addEventListener('click', fitToScreen);
    if (btnFocus) btnFocus.addEventListener('click', function () {
      if (hasChampion) focusChampion();
      else focusRound(lastCurrentRound);
    });
    if (btnIn) btnIn.addEventListener('click', function () {
      if (!viewport) return;
      var rect = viewport.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, view.scale * 1.25);
    });
    if (btnOut) btnOut.addEventListener('click', function () {
      if (!viewport) return;
      var rect = viewport.getBoundingClientRect();
      zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, view.scale * 0.8);
    });
  }

  // 窗口尺寸变化时重新适配
  window.addEventListener('resize', function () {
    if (viewport && world) {
      // 保持当前缩放，不强制重置
      applyTransform();
    }
  });

  /* ---------- 暴露 ---------- */
  window.BracketView = {
    render: render,
    fitToScreen: fitToScreen,
    focusRound: focusRound,
    focusChampion: focusChampion
  };
})();
