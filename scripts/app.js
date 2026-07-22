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

  /* ---------- 比赛配置 ---------- */
  var TOURNAMENT_CONFIG = {
    size: 128, // 128 或 64
    storageKey: 'ts_tournament_v3',
    cacheKey: 'ts_preview_cache_v3'
  };

  /* ---------- 常量（动态计算） ---------- */
  function getTotalMatches(size) {
    var s = size || TOURNAMENT_CONFIG.size;
    return s - 1; // 128→127, 64→63
  }
  function getMatchesPerRound(size) {
    var s = size || TOURNAMENT_CONFIG.size;
    var rounds = Math.log2(s);
    var arr = [0];
    for (var r = 1; r <= rounds; r++) {
      arr.push(s / Math.pow(2, r));
    }
    return arr;
  }
  function getTotalRounds(size) {
    return Math.log2(size || TOURNAMENT_CONFIG.size);
  }
  function buildCum(size) {
    var mpr = getMatchesPerRound(size);
    var cum = [];
    for (var r = 0; r < mpr.length; r++) {
      cum[r] = r === 0 ? 0 : cum[r - 1] + mpr[r - 1];
    }
    return cum;
  }

  var TOTAL_MATCHES = getTotalMatches();
  var STORAGE_KEY = TOURNAMENT_CONFIG.storageKey;
  var CACHE_KEY = TOURNAMENT_CONFIG.cacheKey;

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
  // 全局场次编号（1 起算）
  function matchNo(round, matchIdx) {
    var cum = buildCum();
    return cum[round] + matchIdx + 1;
  }
  // 当前轮总场次
  function roundTotal(round) {
    var mpr = getMatchesPerRound();
    return mpr[round] || 0;
  }
  // 已完成总场次
  function completedTotal() { return State.bracket.length; }

  /* ============================================================
   * 配对生成：Fisher-Yates 随机洗牌 + 两两配对
   * 保证每首歌出现且仅出现一次
   * ============================================================ */
  // Fisher-Yates 洗牌算法
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  // 从全部歌曲中随机选取指定数量
  function pickRandomSongs(count) {
    return shuffle(window.TS_SONGS.slice()).slice(0, count);
  }

  // 首轮：随机洗牌后两两配对
  function initFirstRound() {
    var songs = pickRandomSongs(TOURNAMENT_CONFIG.size);
    State.selectedSongIds = songs.map(function (s) { return s.id; });
    State.seeds = {};
    songs.forEach(function (s, i) { State.seeds[s.id] = i + 1; });
    State.pairings = makePairs(songs);
    State.currentRound = 1;
    State.currentMatch = 0;
  }

  // 将数组两两配对
  function makePairs(arr) {
    var pairs = [];
    for (var i = 0; i < arr.length; i += 2) {
      pairs.push([arr[i], arr[i + 1]]);
    }
    return pairs;
  }

  // 下一轮配对：晋级歌曲随机洗牌后两两配对
  function buildNextRoundPairings(fromRound) {
    var round = fromRound || State.currentRound;
    var advancing = [];
    State.bracket.forEach(function (m) {
      if (m.round === round && m.winnerId) {
        var winner = findSong(m.winnerId);
        if (winner) advancing.push(winner);
      }
    });
    // 随机洗牌
    advancing = shuffle(advancing);
    return makePairs(advancing);
  }

  function findSong(id) {
    for (var i = 0; i < window.TS_SONGS.length; i++) {
      if (window.TS_SONGS[i].id === id) return window.TS_SONGS[i];
    }
    return null;
  }

  /* ============================================================
   * 音乐片段播放（可配置音源）
   * 默认：iTunes Search API 官方 30 秒预览（合法授权）
   * 支持：自定义外部 API（通过 AUDIO_CONFIG 配置）
   * 时长：默认播放完整预览（约30秒），可配置
   * ============================================================ */

  // 音频配置：用户可在此接入外部 API 规避版权风险
  var AUDIO_CONFIG = {
    // 默认音源：iTunes 官方预览（合法，无需密钥）
    source: 'itunes',
    // 播放时长（秒）。null = 播放完整预览（约30秒）；数字 = 截取指定秒数
    duration: null,
    // 截取起始位置（秒），从预览的此处开始播放
    startOffset: 0,
    // 自定义音源配置（如需接入外部 API，填写此项）
    // external: {
    //   // 例：接入网易云/QQ音乐等第三方预览 API
    //   searchUrl: 'https://your-api.com/search?q={query}',
    //   previewField: 'preview_url',  // 返回 JSON 中预览地址的字段名
    //   termTemplate: '{title} Taylor Swift'
    // }
    external: null
  };

  var currentAudio = null;
  var currentPlayBtn = null;
  var currentSongId = null;
  var playTimeout = null;
  var previewCache = {}; // 内存缓存：songId -> previewUrl
  var CACHE_KEY = TOURNAMENT_CONFIG.cacheKey;

  // 从 localStorage 加载缓存 + 合并预置缓存
  function loadPreviewCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (raw) previewCache = JSON.parse(raw);
    } catch (e) {}
    // 合并预置缓存（优先使用 localStorage 中已有的，预置的作为补充）
    if (window.TS_PRESET_PREVIEWS) {
      for (var id in window.TS_PRESET_PREVIEWS) {
        if (window.TS_PRESET_PREVIEWS.hasOwnProperty(id)) {
          if (!previewCache[id]) {
            previewCache[id] = window.TS_PRESET_PREVIEWS[id];
          }
        }
      }
    }
  }

  // 保存缓存到 localStorage
  function savePreviewCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(previewCache));
    } catch (e) {}
  }

  // 停止当前播放
  function stopPlay() {
    if (playTimeout) {
      clearTimeout(playTimeout);
      playTimeout = null;
    }
    var audio = currentAudio;
    var btn = currentPlayBtn;
    // 先清空状态引用：清理 audio.src 时可能触发 'error' 事件，
    // 必须在此之前置空，使 playSongSnippet 内的 guard
    // (currentSongId !== song.id) 能拦截到销毁产生的 error，避免误触发回退音乐
    currentAudio = null;
    currentPlayBtn = null;
    currentSongId = null;
    if (btn) {
      btn.classList.remove('is-playing');
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
    }
    if (audio) {
      try {
        audio.pause();
        audio.src = '';
        audio.load();
      } catch (e) {}
    }
  }

  // 搜索 iTunes 获取预览 URL
  function fetchPreviewUrl(song) {
    // 如果配置了外部 API，优先使用
    if (AUDIO_CONFIG.external && AUDIO_CONFIG.external.searchUrl) {
      return fetchFromExternalApi(song);
    }
    return fetchFromItunes(song);
  }

  // 从外部自定义 API 获取预览（规避版权风险）
  function fetchFromExternalApi(song) {
    return new Promise(function (resolve, reject) {
      var cfg = AUDIO_CONFIG.external;
      var query = (cfg.termTemplate || '{title} Taylor Swift')
        .replace('{title}', song.title);
      var url = cfg.searchUrl.replace('{query}', encodeURIComponent(query));

      // JSONP 方式（若 API 支持 callback 参数）
      if (cfg.jsonp) {
        var cbName = 'ts_ext_cb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
        var script = document.createElement('script');
        window[cbName] = function (data) {
          try { delete window[cbName]; } catch (e) {}
          script.remove();
          var previewUrl = extractPreviewFromData(data, cfg.previewField);
          if (previewUrl) {
            previewCache[song.id] = previewUrl;
            savePreviewCache();
            resolve(previewUrl);
          } else {
            // 外部 API 失败，回退到 iTunes
            fetchFromItunes(song).then(resolve, reject);
          }
        };
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cbName;
        script.onerror = function () {
          try { delete window[cbName]; } catch (e) {}
          script.remove();
          fetchFromItunes(song).then(resolve, reject);
        };
        document.head.appendChild(script);
        setTimeout(function () {
          if (window[cbName]) {
            try { delete window[cbName]; } catch (e) {}
            script.remove();
            fetchFromItunes(song).then(resolve, reject);
          }
        }, 8000);
      } else {
        // 普通 fetch 方式
        fetch(url).then(function (res) { return res.json(); }).then(function (data) {
          var previewUrl = extractPreviewFromData(data, cfg.previewField);
          if (previewUrl) {
            previewCache[song.id] = previewUrl;
            savePreviewCache();
            resolve(previewUrl);
          } else {
            fetchFromItunes(song).then(resolve, reject);
          }
        }).catch(function () {
          fetchFromItunes(song).then(resolve, reject);
        });
      }
    });
  }

  // 从返回数据中提取预览 URL（支持嵌套字段，如 'data.preview_url'）
  function extractPreviewFromData(data, fieldPath) {
    if (!data || !fieldPath) return null;
    var parts = fieldPath.split('.');
    var cur = data;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return null;
      cur = cur[parts[i]];
    }
    // 如果是数组，取第一个
    if (Array.isArray(cur)) cur = cur[0];
    return (typeof cur === 'string') ? cur : null;
  }

  // 从 iTunes 获取预览
  function fetchFromItunes(song) {
    return new Promise(function (resolve, reject) {
      // 先查缓存
      if (previewCache[song.id]) {
        resolve(previewCache[song.id]);
        return;
      }

      var term = encodeURIComponent(song.title + ' Taylor Swift');
      var url = 'https://itunes.apple.com/search?term=' + term + '&media=music&limit=5';

      // 优先用 fetch + CORS（iTunes API 支持 CORS）
      // JSONP 在 iOS 上可能有兼容性问题
      if (window.fetch) {
        fetchWithTimeout(url, 15000)
          .then(function (res) { return res.json(); })
          .then(function (data) {
            var previewUrl = pickBestPreview(data, song);
            if (previewUrl) {
              previewCache[song.id] = previewUrl;
              savePreviewCache();
              resolve(previewUrl);
            } else {
              // fetch 成功但没找到匹配，尝试 JSONP fallback
              fetchFromItunesJsonp(song, url).then(resolve, reject);
            }
          })
          .catch(function () {
            // fetch 失败（可能是 CORS 或网络），回退到 JSONP
            fetchFromItunesJsonp(song, url).then(resolve, reject);
          });
      } else {
        // 不支持 fetch，直接用 JSONP
        fetchFromItunesJsonp(song, url).then(resolve, reject);
      }
    });
  }

  // fetch 带超时
  function fetchWithTimeout(url, timeoutMs) {
    return new Promise(function (resolve, reject) {
      var controller = null;
      if (window.AbortController) {
        controller = new AbortController();
      }
      var opts = controller ? { signal: controller.signal } : {};
      var timer = setTimeout(function () {
        if (controller) controller.abort();
        reject(new Error('Timeout'));
      }, timeoutMs);
      fetch(url, opts).then(function (res) {
        clearTimeout(timer);
        resolve(res);
      }).catch(function (err) {
        clearTimeout(timer);
        reject(err);
      });
    });
  }

  // 从 iTunes 返回数据中挑选最匹配的预览 URL
  function pickBestPreview(data, song) {
    if (!data || !data.results || data.results.length === 0) return null;
    var best = null;
    var lowerTitle = song.title.toLowerCase();
    for (var i = 0; i < data.results.length; i++) {
      var r = data.results[i];
      if (r.previewUrl && r.artistName && r.artistName.indexOf('Taylor') >= 0) {
        var match = r.trackName ? r.trackName.toLowerCase() : '';
        if (match === lowerTitle || match.indexOf(lowerTitle) >= 0 || lowerTitle.indexOf(match) >= 0) {
          best = r.previewUrl;
          break;
        }
        if (!best) best = r.previewUrl;
      }
    }
    return best;
  }

  // JSONP 方式请求 iTunes（作为 fetch 的 fallback）
  function fetchFromItunesJsonp(song, url) {
    return new Promise(function (resolve, reject) {
      if (previewCache[song.id]) {
        resolve(previewCache[song.id]);
        return;
      }
      var callbackName = 'ts_itunes_cb_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      var script = document.createElement('script');
      var settled = false;

      window[callbackName] = function (data) {
        if (settled) return;
        settled = true;
        try { delete window[callbackName]; } catch (e) {}
        try { script.remove(); } catch (e) {}
        var previewUrl = pickBestPreview(data, song);
        if (previewUrl) {
          previewCache[song.id] = previewUrl;
          savePreviewCache();
          resolve(previewUrl);
        } else {
          reject('No matching track found');
        }
      };

      script.src = url + '&callback=' + callbackName;
      script.onerror = function () {
        if (settled) return;
        settled = true;
        try { delete window[callbackName]; } catch (e) {}
        try { script.remove(); } catch (e) {}
        reject('Network error');
      };
      document.head.appendChild(script);

      // 超时 15 秒（iOS 网络可能较慢）
      setTimeout(function () {
        if (!settled && window[callbackName]) {
          settled = true;
          try { delete window[callbackName]; } catch (e) {}
          try { script.remove(); } catch (e) {}
          reject('Timeout');
        }
      }, 15000);
    });
  }

  // 播放歌曲片段（时长由 AUDIO_CONFIG.duration 控制，默认播放完整预览）
  function playSongSnippet(song, playBtn) {
    stopPlay();
    currentSongId = song.id;
    currentPlayBtn = playBtn;

    // 先显示 loading 状态
    playBtn.classList.add('is-playing');
    playBtn.innerHTML = '<svg viewBox="0 0 24 24" style="animation:spin 1s linear infinite;" aria-hidden="true"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>';

    // iOS 解锁 AudioContext（为 fallback 做准备，必须在用户手势内）
    unlockAudioContext();

    fetchPreviewUrl(song).then(function (previewUrl) {
      if (currentSongId !== song.id) return; // 用户已切换

      var audio = new Audio();
      audio.preload = 'auto';
      // 注意：不要设置 crossOrigin='anonymous'
      // iTunes 预览服务器对 CORS 头返回不一致，iOS Safari/Chrome 会静默失败
      // 我们只是播放音频，不需要用 Web Audio API 分析，所以不需要 CORS

      // 播放时长：null = 完整预览；数字 = 截取指定秒数
      var snippetDuration = AUDIO_CONFIG.duration; // null 或 秒数
      var startOffset = AUDIO_CONFIG.startOffset || 0;

      audio.addEventListener('canplaythrough', function onReady() {
        audio.removeEventListener('canplaythrough', onReady);
        if (currentSongId !== song.id) return;

        // 设置起始位置（如果配置了）
        if (startOffset > 0) {
          try { audio.currentTime = startOffset; } catch (e) {}
        }
        audio.volume = 0.85;
        audio.play().then(function () {
          if (currentPlayBtn && currentSongId === song.id) {
            currentPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
          }
        }).catch(function (playErr) {
          // 已停止或切换时（如 play() 因中断以 AbortError reject），不回退
          if (currentSongId !== song.id) return;
          // iOS 自动播放策略阻止：回退到生成式音乐
          stopPlay();
          playGeneratedSnippet(song, playBtn);
        });

        // 如果配置了固定时长，到时自动停止；否则播放到自然结束
        if (snippetDuration && snippetDuration > 0) {
          playTimeout = setTimeout(function () {
            stopPlay();
          }, snippetDuration * 1000);
        } else {
          // 完整预览模式：播放结束时自动停止
          audio.addEventListener('ended', function () {
            stopPlay();
          });
        }
      });

      audio.addEventListener('error', function () {
        // 已停止或切换到其他歌曲时，忽略销毁 src 触发的 error 事件
        if (currentSongId !== song.id) return;
        // 音频加载失败：回退到生成式音乐
        stopPlay();
        playGeneratedSnippet(song, playBtn);
      });

      audio.src = previewUrl;
      currentAudio = audio;

    }).catch(function () {
      // 已停止或切换时，不再回退
      if (currentSongId !== song.id) return;
      // 获取失败，回退到生成式旋律
      stopPlay();
      playGeneratedSnippet(song, playBtn);
    });
  }

  // iOS 需要在用户手势内解锁 AudioContext，否则 fallback 音乐也无法播放
  var unlockedAudioCtx = null;
  function unlockAudioContext() {
    try {
      if (unlockedAudioCtx) {
        if (unlockedAudioCtx.state === 'suspended') {
          unlockedAudioCtx.resume();
        }
        return;
      }
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      unlockedAudioCtx = new Ctx();
      // 创建一个空 oscillator 来解锁
      var osc = unlockedAudioCtx.createOscillator();
      var gain = unlockedAudioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(unlockedAudioCtx.destination);
      osc.start();
      osc.stop(unlockedAudioCtx.currentTime + 0.001);
    } catch (e) {}
  }

  // 回退：Web Audio 生成式音乐片段（当 iTunes 不可用时）
  // 使用和弦进行 + 主旋律，听起来更像真实音乐而非蜂鸣声
  function playGeneratedSnippet(song, playBtn) {
    stopPlay();
    currentSongId = song.id;
    currentPlayBtn = playBtn;
    playBtn.classList.add('is-playing');
    playBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';

    var ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      stopPlay();
      return;
    }

    var duration = AUDIO_CONFIG.duration || 8;
    var bpm = 100 + (song.popularityScore % 40);
    var beatTime = 60 / bpm;

    // 基于歌曲 ID 选择调式（C, G, D, A, F 大调）
    var keyIndex = song.id % 5;
    var rootFreqs = [261.63, 196.00, 293.66, 220.00, 174.61]; // C4, G3, D4, A3, F3
    var root = rootFreqs[keyIndex];

    var masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.08);
    masterGain.gain.setValueAtTime(0.35, ctx.currentTime + duration - 0.25);
    masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    masterGain.connect(ctx.destination);

    // 低通滤波器让音色更柔和
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;
    filter.connect(masterGain);

    // I-V-vi-IV 经典和弦进行
    var chordDegrees = [0, 4, 5, 3]; // I, V, vi, IV 相对大调
    var majorScale = [0, 2, 4, 5, 7, 9, 11]; // 全全半全全全半

    function getNoteFreq(degree, octaveShift) {
      var semitones = majorScale[((degree % 7) + 7) % 7];
      var octaves = Math.floor(degree / 7) + (octaveShift || 0);
      return root * Math.pow(2, semitones / 12 + octaves);
    }

    // 每和弦持续 2 拍
    var chordsPerLoop = 4;
    var chordDuration = beatTime * 2;
    var totalChords = Math.ceil(duration / chordDuration);

    for (var c = 0; c < totalChords; c++) {
      var chordRoot = chordDegrees[c % chordsPerLoop];
      var startTime = ctx.currentTime + c * chordDuration;

      // 三和弦音符（根、三、五）
      var chordNotes = [
        getNoteFreq(chordRoot, 0),
        getNoteFreq(chordRoot + 2, 0),
        getNoteFreq(chordRoot + 4, 0)
      ];

      // 低音（根音低八度）
      var bass = ctx.createOscillator();
      var bassGain = ctx.createGain();
      bass.type = 'sine';
      bass.frequency.value = getNoteFreq(chordRoot, -1);
      bassGain.gain.setValueAtTime(0, startTime);
      bassGain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
      bassGain.gain.setValueAtTime(0.15, startTime + chordDuration * 0.7);
      bassGain.gain.exponentialRampToValueAtTime(0.001, startTime + chordDuration);
      bass.connect(bassGain);
      bassGain.connect(filter);
      bass.start(startTime);
      bass.stop(startTime + chordDuration + 0.05);

      // 和弦铺底（三角波，柔和）
      for (var n = 0; n < chordNotes.length; n++) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = chordNotes[n];
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(0.07, startTime + 0.04);
        g.gain.setValueAtTime(0.06, startTime + chordDuration * 0.8);
        g.gain.exponentialRampToValueAtTime(0.001, startTime + chordDuration);
        osc.connect(g);
        g.connect(filter);
        osc.start(startTime);
        osc.stop(startTime + chordDuration + 0.05);
      }
    }

    // 主旋律（基于 popularityScore 生成不同旋律）
    var melodyNotes = [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0, -2];
    var noteDuration = beatTime * 0.5;
    var melodyStart = ctx.currentTime + 0.5;
    var totalMelodyNotes = Math.floor((duration - 0.5) / noteDuration);

    for (var m = 0; m < totalMelodyNotes; m++) {
      var idx = (m + song.popularityScore + song.id) % melodyNotes.length;
      var degree = melodyNotes[idx];
      var mFreq = getNoteFreq(degree, 1);
      var mTime = melodyStart + m * noteDuration;

      // 休息符（每第 4 个音的概率休息）
      if ((m + song.id) % 7 === 0) continue;

      var mOsc = ctx.createOscillator();
      var mGain = ctx.createGain();
      mOsc.type = 'sine';
      mOsc.frequency.value = mFreq;
      mGain.gain.setValueAtTime(0, mTime);
      mGain.gain.linearRampToValueAtTime(0.12, mTime + 0.02);
      mGain.gain.setValueAtTime(0.1, mTime + noteDuration * 0.6);
      mGain.gain.exponentialRampToValueAtTime(0.001, mTime + noteDuration * 0.9);
      mOsc.connect(mGain);
      mGain.connect(masterGain);
      mOsc.start(mTime);
      mOsc.stop(mTime + noteDuration);
    }

    playTimeout = setTimeout(function () {
      stopPlay();
    }, duration * 1000);

    currentAudio = {
      pause: function () {
        try { masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1); } catch (e) {}
      }
    };
  }

  // 切换播放/暂停
  // 基于按钮的视觉状态判断，避免异步加载导致的状态混乱
  function togglePlay(song, playBtn) {
    // 正在播放这首歌 → 停止
    if (playBtn.classList.contains('is-playing')) {
      stopPlay();
      return;
    }
    // 否则播放（stopPlay 已在 playSongSnippet 内部调用，会清掉其他歌的播放）
    playSongSnippet(song, playBtn);
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

    // 切换场次时停止播放
    stopPlay();

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
      // 播放按钮
      '<button class="play-btn" type="button" aria-label="播放 ' + escapeHtml(song.title) + '" data-play-id="' + song.id + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '</button>' +
      '<div class="card-inner">' +
        '<div class="card-meta">' +
          '<span class="card-era-tag">' + escapeHtml(song.era) + '</span>' +
          (song.isVault ? '<span class="card-vault-tag">Vault</span>' : '') +
          '<span class="card-meta-extra" style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-dim);">#' + seed + '</span>' +
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

    // 点击卡片选择胜者
    card.addEventListener('click', function (e) {
      // 如果点击的是播放按钮，不触卡片选择
      if (e.target.closest('.play-btn')) return;
      selectWinner(song.id, side);
    });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectWinner(song.id, side); }
    });

    // 播放按钮
    var playBtn = card.querySelector('.play-btn');
    playBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      e.preventDefault();
      togglePlay(song, playBtn);
    });
    playBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        togglePlay(song, playBtn);
      }
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
    var totalRounds = getTotalRounds();
    if (nextRound > totalRounds) {
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
    var mpr = getMatchesPerRound();
    var advanceCount = mpr[nextRound] || 0;
    els.transitionTitle.textContent = 'Round ' + doneRound + ' Complete';
    els.transitionDesc.textContent = advanceCount * 2 + ' 首歌曲已淘汰，' + advanceCount + ' 首晋级，进入 Round ' + nextRound;
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
      '<button class="play-btn" type="button" aria-label="播放 ' + escapeHtml(song.title) + '" data-play-id="' + song.id + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>' +
      '</button>' +
      '<div class="card-inner">' +
        '<div class="card-meta" style="justify-content:center;">' +
          '<span class="card-era-tag">' + escapeHtml(song.era) + '</span>' +
          (song.isVault ? '<span class="card-vault-tag">Vault</span>' : '') +
        '</div>' +
        '<h3 class="card-title">' + escapeHtml(song.title) + '</h3>' +
        '<p class="card-album" style="text-align:center;">' + escapeHtml(song.album) + ' · ' + song.year + '</p>' +
        '<p class="card-year-duration" style="justify-content:center;margin-top:6px;">' +
          '<span>' + fmtDuration(song.duration) + '</span>' +
          '<span>#' + seed + '</span>' +
        '</p>' +
        '<div class="card-popularity">' +
          '<div class="pop-label" style="justify-content:center;"><span>热度</span><span>' + song.popularityScore + '</span></div>' +
          '<div class="pop-bar"><div class="pop-fill" style="width:' + song.popularityScore + '%"></div></div>' +
        '</div>' +
      '</div>';

    // 冠军卡片播放按钮
    var champPlayBtn = els.championCard.querySelector('.play-btn');
    if (champPlayBtn) {
      champPlayBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        togglePlay(song, champPlayBtn);
      });
    }

    // 启动 confetti
    startConfetti(song.coverColor);
  }

  /* ---------- 重新开始 ---------- */
  function restart() {
    stopPlay();
    localStorage.removeItem(STORAGE_KEY);
    State.bracket = [];
    State.champion = null;
    State.seeds = {};
    State.selectedSongIds = [];
    initFirstRound();
    saveState();
    switchView('battle');
    renderCurrentMatch();
    if (window.BracketView && window.BracketView.render) {
      window.BracketView.render(State.bracket, State.champion, State.currentRound, TOURNAMENT_CONFIG.size);
    }
    updateSizeLabel();
  }

  /* ---------- 切换比赛规模（64 / 128 首） ---------- */
  function setSize(size) {
    if (size !== 64 && size !== 128) return;
    if (size === TOURNAMENT_CONFIG.size && State.bracket.length > 0) {
      return;
    }
    stopPlay();
    localStorage.removeItem(STORAGE_KEY);
    TOURNAMENT_CONFIG.size = size;
    TOTAL_MATCHES = getTotalMatches();
    State.bracket = [];
    State.champion = null;
    State.seeds = {};
    State.selectedSongIds = [];
    initFirstRound();
    saveState();
    switchView('battle');
    renderCurrentMatch();
    if (window.BracketView && window.BracketView.render) {
      window.BracketView.render(State.bracket, State.champion, State.currentRound, TOURNAMENT_CONFIG.size);
    }
    updateSizeLabel();
  }

  function updateSizeLabel() {
    var sizeLabels = document.querySelectorAll('[data-size-label]');
    sizeLabels.forEach(function (el) {
      el.textContent = TOURNAMENT_CONFIG.size + ' 首';
    });
    var sizeBtns = document.querySelectorAll('[data-size-btn]');
    sizeBtns.forEach(function (btn) {
      var s = parseInt(btn.dataset.sizeBtn, 10);
      btn.classList.toggle('is-active', s === TOURNAMENT_CONFIG.size);
    });
    var bracketSub = document.querySelector('.bracket-sub');
    if (bracketSub) {
      bracketSub.textContent = '共 ' + TOTAL_MATCHES + ' 场 · ' + getTotalRounds() + ' 轮 · 双指缩放拖拽';
    }
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Taylor Swift 歌曲对战锦标赛 — ' + TOURNAMENT_CONFIG.size + ' 首歌曲角逐冠军');
    }
  }

  /* ============================================================
   * 视图切换
   * ============================================================ */
  function switchView(view) {
    // 'battle' | 'transition' | 'champion' | 'bracket-view'
    if (view !== 'battle') stopPlay();
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

    // 切到对战树时刷新
    if (view === 'bracket-view' && window.BracketView && window.BracketView.render) {
      window.BracketView.render(State.bracket, State.champion, State.currentRound, TOURNAMENT_CONFIG.size);
    }
  }

  /* ============================================================
   * localStorage 持久化
   * ============================================================ */
  function saveState() {
    try {
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
      var slimPairings = State.pairings.map(function (p) {
        return [p[0] ? p[0].id : null, p[1] ? p[1].id : null];
      });
      var data = {
        currentRound: State.currentRound,
        currentMatch: State.currentMatch,
        bracket: slimBracket,
        pairings: slimPairings,
        championId: State.champion ? State.champion.id : null,
        seeds: State.seeds,
        selectedSongIds: State.selectedSongIds || [],
        tournamentSize: TOURNAMENT_CONFIG.size
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      // 静默失败
    }
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      var data = JSON.parse(raw);
      if (!data || !data.seeds) return false;

      if (data.tournamentSize) {
        TOURNAMENT_CONFIG.size = data.tournamentSize;
        TOTAL_MATCHES = getTotalMatches();
      }
      State.selectedSongIds = data.selectedSongIds || [];
      State.seeds = data.seeds;
      State.currentRound = data.currentRound;
      State.currentMatch = data.currentMatch;
      State.champion = data.championId ? findSong(data.championId) : null;

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

      if (data.pairings && data.pairings.length > 0) {
        State.pairings = data.pairings.map(function (p) {
          return [p[0] ? findSong(p[0]) : null, p[1] ? findSong(p[1]) : null];
        });
      } else {
        State.pairings = [];
      }

      if (State.pairings.length === 0 && !State.champion && State.bracket.length === 0) {
        initFirstRound();
        saveState();
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // 根据当前轮已完成的场次重建 pairings（备用方案）
  function rebuildPairingsForCurrentRound() {
    var round = State.currentRound;
    // 收集已完成对局和未完成的晋级者
    var allAdvancing = [];
    if (round === 1) {
      allAdvancing = window.TS_SONGS.slice().sort(function (a, b) {
        return (State.seeds[a.id] || 999) - (State.seeds[b.id] || 999);
      });
    } else {
      State.bracket.forEach(function (m) {
        if (m.round === round - 1 && m.completed) {
          allAdvancing.push(findSong(m.winnerId));
        }
      });
      allAdvancing.sort(function (a, b) {
        return (State.seeds[a.id] || 999) - (State.seeds[b.id] || 999);
      });
    }
    State.pairings = makePairs(allAdvancing);
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

    loadPreviewCache();

    if (!window.TS_SONGS || window.TS_SONGS.length !== 128) {
      console.error('歌曲数据异常：', window.TS_SONGS ? window.TS_SONGS.length : '未加载');
    }

    var restored = loadState();
    if (!restored) {
      initFirstRound();
      saveState();
    }

    document.getElementById('btn-continue-round').addEventListener('click', continueToNextRound);
    document.getElementById('btn-view-bracket').addEventListener('click', function () {
      switchView('bracket-view');
    });
    document.getElementById('btn-restart-champion').addEventListener('click', restart);
    els.navBattle.addEventListener('click', function () { switchView('battle'); });
    els.navBracket.addEventListener('click', function () { switchView('bracket-view'); });

    var btnReset = document.getElementById('btn-reset');
    if (btnReset) btnReset.addEventListener('click', function () {
      if (confirm('确定要重置所有选择，重新开始吗？')) {
        restart();
      }
    });

    var sizeBtns = document.querySelectorAll('[data-size-btn]');
    sizeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var size = parseInt(btn.dataset.sizeBtn, 10);
        if (size === TOURNAMENT_CONFIG.size) return;
        var msg = '切换到 ' + size + ' 首精简版？当前进度将被清空。';
        if (State.bracket.length > 0) {
          if (!confirm(msg)) return;
        }
        setSize(size);
      });
    });

    initBgParticles();

    if (State.champion) {
      showChampion();
    } else {
      switchView('battle');
      renderCurrentMatch();
    }

    updateSizeLabel();

    window.TS_App = {
      State: State,
      restart: restart,
      switchView: switchView,
      setSize: setSize,
      getSize: function () { return TOURNAMENT_CONFIG.size; }
    };
  }

  // DOM 就绪后启动
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
