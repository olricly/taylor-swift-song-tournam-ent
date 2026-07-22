/* ============================================================
 * Taylor Swift 歌曲对战锦标赛 — 对战表渲染（bracket.js）
 *
 * 渲染全部 127 场对局表格：
 *   - 每行：轮次 / 场次编号(M1-M127) / 歌曲A / 歌曲B / 用户选择 / 结果状态
 *   - 按轮次分组可折叠展开（默认当前轮展开，其余折叠）
 *   - 冠军行高亮（金色背景）置顶
 *   - 未进行场次显示"待定"
 *   - 手机端：表格横向滚动
 *
 * 暴露：window.BracketView.render(bracket, champion, currentRound)
 * ============================================================ */

(function () {
  'use strict';

  var ROUND_LABELS = ['-', 'Round 1 · 128→64', 'Round 2 · 64→32', 'Round 3 · 32→16',
                      'Round 4 · 16→8', 'Round 5 · 8→4', 'Round 6 · 4→2', 'Round 7 · 决赛'];

  // 每轮场次数（与 app.js 保持一致）
  var MATCHES_PER_ROUND = [0, 64, 32, 16, 8, 4, 2, 1];
  var CUM = [0, 0, 0, 0, 0, 0, 0, 0];
  for (var r = 1; r <= 7; r++) { CUM[r] = CUM[r - 1] + MATCHES_PER_ROUND[r - 1]; }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * 主渲染入口
   * @param {Array} bracket    - 全部对局记录
   * @param {Object|null} champion - 冠军歌曲
   * @param {number} currentRound - 当前轮（决定默认展开哪一轮）
   */
  function render(bracket, champion, currentRound) {
    var container = document.getElementById('bracket-container');
    if (!container) return;

    // 构建 matchNo → record 的快速索引
    var recordMap = {};
    bracket.forEach(function (m) { recordMap[m.matchNo] = m; });

    var html = '';

    // 1. 冠军行置顶（如果有冠军）
    if (champion) {
      html += renderChampionBanner(champion);
    }

    // 2. 按轮次分组渲染（7 轮）
    for (var round = 1; round <= 7; round++) {
      var total = MATCHES_PER_ROUND[round];
      var rows = '';
      var completedInRound = 0;

      for (var m = 0; m < total; m++) {
        var matchNo = CUM[round] + m + 1;
        var rec = recordMap[matchNo];
        if (rec && rec.completed) {
          completedInRound++;
          rows += renderMatchRow(rec, champion);
        } else {
          rows += renderPendingRow(matchNo, round);
        }
      }

      // 当前轮默认展开，其余折叠（有冠军时全部展开方便查看完整结果）
      var collapsed = champion ? false : (round !== currentRound);
      html += renderRoundGroup(round, total, completedInRound, rows, collapsed);
    }

    container.innerHTML = html;
    bindToggle();
  }

  // 冠军横幅（置顶高亮）
  function renderChampionBanner(champion) {
    return '' +
      '<div class="bracket-champion-banner" style="margin-bottom:20px;padding:24px;border-radius:14px;' +
      'background:linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.06));' +
      'border:1px solid var(--accent-gold);box-shadow:0 0 40px rgba(212,175,55,0.25);text-align:center;">' +
        '<div style="font-family:var(--font-mono);font-size:0.74rem;letter-spacing:0.28em;text-transform:uppercase;color:var(--accent-gold);margin-bottom:8px;">Champion</div>' +
        '<div style="font-family:var(--font-display);font-style:italic;font-size:clamp(1.6rem,5vw,2.4rem);font-weight:600;color:var(--text-primary);">' +
          escapeHtml(champion.title) +
        '</div>' +
        '<div style="color:var(--text-secondary);font-size:0.9rem;margin-top:4px;">' +
          escapeHtml(champion.album) + ' · ' + champion.year +
        '</div>' +
      '</div>';
  }

  // 单轮分组容器
  function renderRoundGroup(round, total, completed, rowsHtml, collapsed) {
    var cls = 'bracket-round' + (collapsed ? ' is-collapsed' : '');
    return '' +
      '<div class="' + cls + '" data-round="' + round + '">' +
        '<button class="bracket-round-head" type="button" aria-expanded="' + !collapsed + '">' +
          '<span class="bracket-round-title">' + ROUND_LABELS[round] + '</span>' +
          '<span class="bracket-round-count">' + completed + ' / ' + total + ' 场</span>' +
          '<span class="bracket-round-toggle">▾</span>' +
        '</button>' +
        '<div class="bracket-round-body">' +
          '<table class="bracket-table">' +
            '<thead><tr>' +
              '<th>场次</th><th>歌曲 A</th><th>歌曲 B</th><th>胜者</th><th>状态</th>' +
            '</tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  // 已完成场次行
  function renderMatchRow(rec, champion) {
    var a = rec.songA, b = rec.songB;
    var aWin = rec.winnerId === a.id;
    var bWin = rec.winnerId === b.id;

    var isChampionMatch = (champion && rec.round === 7);
    var rowCls = isChampionMatch ? 'bracket-champion-row' : '';

    var statusText = isChampionMatch ? '冠军' : '已晋级 / 淘汰';
    var statusCls = isChampionMatch ? 'status-advance' : 'status-advance';

    return '' +
      '<tr class="' + rowCls + '">' +
        '<td class="col-match">M' + rec.matchNo + '</td>' +
        '<td class="song-name ' + (aWin ? 'is-winner' : 'is-loser') + '">' + escapeHtml(a.title) +
          '<div style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">' + escapeHtml(a.era) + '</div>' +
        '</td>' +
        '<td class="song-name ' + (bWin ? 'is-winner' : 'is-loser') + '">' + escapeHtml(b.title) +
          '<div style="font-size:0.72rem;color:var(--text-dim);font-family:var(--font-mono);">' + escapeHtml(b.era) + '</div>' +
        '</td>' +
        '<td class="song-name is-winner">' + escapeHtml((aWin ? a : b).title) + '</td>' +
        '<td class="' + statusCls + '">' + statusText + '</td>' +
      '</tr>';
  }

  // 待定场次行
  function renderPendingRow(matchNo, round) {
    return '' +
      '<tr>' +
        '<td class="col-match">M' + matchNo + '</td>' +
        '<td class="song-name status-pending">待定</td>' +
        '<td class="song-name status-pending">待定</td>' +
        '<td class="song-name status-pending">—</td>' +
        '<td class="status-pending">未进行</td>' +
      '</tr>';
  }

  // 绑定折叠/展开
  function bindToggle() {
    var heads = document.querySelectorAll('.bracket-round-head');
    heads.forEach(function (head) {
      head.addEventListener('click', function () {
        var group = head.closest('.bracket-round');
        if (!group) return;
        var collapsed = group.classList.toggle('is-collapsed');
        head.setAttribute('aria-expanded', String(!collapsed));
      });
    });
  }

  // 暴露
  window.BracketView = { render: render };
})();
