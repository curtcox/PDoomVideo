// app.js: ties the reference list to the YouTube player. The page is fully rendered by build.mjs; this only enhances it.
(() => {
  const D = window.PDOOM, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const store = { get: k => { try { return localStorage.getItem(k); } catch { return null; } },
                  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
  const mmss = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const narrow = matchMedia('(max-width: 960px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const behavior = () => reduced.matches ? 'auto' : 'smooth';

  const iframe = $('#player'), stage = $('.stage'), followBtn = $('#follow'), filmstrip = $('.filmstrip');
  const entryEls = $$('.entry'), shotEls = $$('.shot'), segEls = $$('.seg');
  const byT = new Map(D.entries.map(e => [e.t, e]));

  let player = null, ready = false, playing = false, timer = 0, now = 0;
  let active = { entry: -1, shot: -1, chapter: -1, lyric: -2 };
  let follow = true;

  // ---------- which cut ----------
  const params = new URLSearchParams(location.search);
  let video = D.videos.find(v => v.key === (params.get('v') || store.get('pdoom-video'))) || D.videos[0];
  const embed = (v, start = 0, autoplay = false) =>
    `https://www.youtube-nocookie.com/embed/${v.id}?enablejsapi=1&rel=0&playsinline=1${start ? `&start=${Math.floor(start)}` : ''}${autoplay ? '&autoplay=1' : ''}`;
  if (video !== D.videos[0]) iframe.src = embed(video);
  const markVideo = () => $$('[data-video]').forEach(b => b.setAttribute('aria-pressed', b.dataset.video === video.key));
  markVideo();
  $$('[data-video]').forEach(b => b.addEventListener('click', () => {
    const next = D.videos.find(v => v.key === b.dataset.video);
    if (next === video) return;
    video = next; store.set('pdoom-video', video.key); markVideo();
    const url = new URL(location.href); url.searchParams.set('v', video.key); history.replaceState(null, '', url);
    if (ready) (playing ? player.loadVideoById : player.cueVideoById).call(player, { videoId: video.id, startSeconds: now });
    else iframe.src = embed(video, now);
  }));

  // ---------- the player ----------
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player('player', { events: {
      onReady: () => { ready = true; if (pending != null) { cue(pending); pending = null; } },
      onStateChange: ev => {
        playing = ev.data === YT.PlayerState.PLAYING;
        clearInterval(timer);
        if (playing) timer = setInterval(tick, 200);
        tick();
      },
    } });
  };
  const api = document.createElement('script');
  api.src = 'https://www.youtube.com/iframe_api';
  document.head.append(api);

  let pending = null;
  function tick() { if (ready && player.getCurrentTime) update(player.getCurrentTime() || 0); }
  function seek(t, play = true) {
    t = Math.max(0, Math.min(D.dur - 0.1, t));
    if (ready) { player.seekTo(t, true); if (play) player.playVideo(); }
    else iframe.src = embed(video, t, play);   // the API is blocked or still loading: reload the embed at t
    update(t, true);
  }
  function cue(t) {   // move to t without starting playback
    if (ready) player.cueVideoById({ videoId: video.id, startSeconds: t });
    else pending = t;
    update(t, true);
  }
  const exact = t => byT.get(t)?.start ?? t;   // ?t= links are rounded down; use the moment's real start

  // ---------- following the song ----------
  const lastIndex = (list, t, start = x => x.start) => { let i = -1; list.forEach((x, j) => { if (start(x) <= t + 0.05) i = j; }); return i; };

  function update(t, jumped = false) {
    now = t;
    $('#clock-now').textContent = mmss(t);
    $('.playhead').style.left = `calc(${(t / D.dur) * 100}% - 1px)`;

    const c = lastIndex(D.chapters, t);
    if (c !== active.chapter) { segEls.forEach((s, i) => s.classList.toggle('active', i === c)); active.chapter = c; }

    const s = D.shots.findIndex(s => t >= s.start && t < s.end);
    if (s !== active.shot) {
      shotEls.forEach((el, i) => el.classList.toggle('active', i === s));
      const el = shotEls[s];
      if (el && filmstrip.offsetParent) filmstrip.scrollTo({ left: el.offsetLeft - filmstrip.clientWidth / 2 + el.offsetWidth / 2, behavior: behavior() });
      active.shot = s;
    }

    const l = D.lyrics.findIndex(([a, b]) => t >= a && t < b + 0.4);
    if (l !== active.lyric || c !== active.nowChapter) {
      const ch = D.chapters[c];
      $('#now').innerHTML = '';
      const a = Object.assign(document.createElement('span'), { className: 'now-ch', textContent: ch ? `${ch.n} · ${ch.name}` : '' });
      const b = Object.assign(document.createElement('span'), { className: 'now-ly', textContent: l >= 0 ? `“${D.lyrics[l][2]}”` : '♪' });
      $('#now').append(a, ' ', b);
      active.lyric = l; active.nowChapter = c;
    }

    const e = lastIndex(D.entries, t);
    if (e !== active.entry || jumped) {
      if (e !== active.entry) entryEls.forEach((el, i) => el.classList.toggle('active', i === e));
      active.entry = e;
      if (follow && (playing || jumped)) reveal(entryEls[e]);
    }
  }

  function reveal(el, force = false) {
    if (!el || el.hidden || el.closest('[hidden]') || $('#view-timeline').hidden) return;
    const r = el.getBoundingClientRect(), top = narrow.matches ? stage.offsetHeight : 0;
    const inView = r.top >= top + 8 && r.top < top + (innerHeight - top) * 0.45 && r.bottom <= innerHeight;
    if (force || !inView) el.scrollIntoView({ block: 'start', behavior: behavior() });
  }

  function setFollow(on) {
    follow = on;
    followBtn.setAttribute('aria-pressed', on);
    if (on) reveal(entryEls[active.entry], true);
  }
  followBtn.addEventListener('click', () => setFollow(!follow));
  // Scrolling the list yourself while the song plays stops following, so the page doesn't pull you back.
  const userScroll = ev => { if (follow && playing && !(ev.target instanceof Node && stage.contains(ev.target))) setFollow(false); };
  addEventListener('wheel', userScroll, { passive: true });
  addEventListener('touchmove', userScroll, { passive: true });
  addEventListener('keydown', ev => {
    if (/^(PageUp|PageDown|ArrowUp|ArrowDown|Home|End| )$/.test(ev.key) && !/INPUT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)) userScroll(ev);
    if (ev.key === '/' && document.activeElement !== $('#q')) { ev.preventDefault(); showTab('timeline'); $('#q').focus(); }
  });

  // keep entries clear of the pinned video on narrow screens
  new ResizeObserver(() => document.documentElement.style.setProperty('--stage-h', narrow.matches ? `${stage.offsetHeight}px` : '0px')).observe(stage);

  // ---------- clicks ----------
  document.addEventListener('click', ev => {
    const a = ev.target.closest('a[data-t]');
    if (a) {
      ev.preventDefault();
      const t = +a.dataset.t, entry = byT.get(t);
      if (entry) {
        history.replaceState(null, '', `${location.search}#${entry.anchor}`);
        if ($('#view-timeline').hidden) showTab('timeline');
      }
      setFollow(true);
      seek(exact(t));
      return;
    }
    const strip = ev.target.closest('.strip');
    if (strip) {
      const times = strip.dataset.times.split(',').map(Number), r = strip.getBoundingClientRect();
      const i = Math.min(times.length - 1, Math.floor(((ev.clientX - r.left) / r.width) * times.length));
      seek(ev.detail === 0 ? +strip.dataset.start : times[i]);   // keyboard activation plays from the shot's start
      return;
    }
    const shot = ev.target.closest('.shot, .seg');
    if (shot) { setFollow(true); seek(+shot.dataset.start); }
  });

  // ---------- tabs ----------
  function showTab(name) {
    $$('[role="tab"]').forEach(t => {
      const on = t.id === `tab-${name}`;
      t.setAttribute('aria-selected', on);
      $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
    $('.toolbar').hidden = name === 'about';
    $('.chips').hidden = name !== 'timeline';
    apply();
  }
  $$('[role="tab"]').forEach(t => t.addEventListener('click', () => showTab(t.id.replace('tab-', ''))));
  $('.tabs').addEventListener('keydown', ev => {
    const tabs = $$('[role="tab"]'), i = tabs.indexOf(document.activeElement);
    if (i < 0 || !/Arrow(Left|Right)/.test(ev.key)) return;
    const next = tabs[(i + (ev.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    next.focus(); next.click();
  });

  // ---------- search and level filter ----------
  const levels = new Set();
  $$('.chip').forEach(c => c.addEventListener('click', () => {
    const k = c.dataset.level;
    levels.has(k) ? levels.delete(k) : levels.add(k);
    c.setAttribute('aria-pressed', levels.has(k));
    apply();
  }));
  let debounce = 0;
  $('#q').addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(apply, 120); });

  function apply() {
    const terms = $('#q').value.toLowerCase().split(/\s+/).filter(Boolean);
    const match = s => terms.every(w => s.includes(w));
    const onTimeline = !$('#view-timeline').hidden;
    let shown = 0;
    entryEls.forEach(el => {
      let any = !levels.size;
      el.querySelectorAll('.refs li').forEach(li => {
        const ok = !levels.size || li.dataset.levels.split(' ').some(l => levels.has(l));
        li.hidden = !ok; any ||= ok;
      });
      el.hidden = !(any && match(el.dataset.search));
      if (!el.hidden) shown++;
    });
    $$('.chapter').forEach(ch => ch.hidden = !ch.querySelector('.entry:not([hidden])'));

    let topics = 0;
    $$('.topic').forEach(el => { el.hidden = !match(el.dataset.search); if (!el.hidden) topics++; });
    $$('.topic-group').forEach(g => g.hidden = g.querySelector('.topic')
      ? !g.querySelector('.topic:not([hidden])') : !match(g.textContent.toLowerCase()));

    const filtering = terms.length || (levels.size && onTimeline);
    $('#count').textContent = !filtering ? '' : onTimeline
      ? `${shown} of ${entryEls.length} moments${shown ? '' : '. Try fewer words or another kind of source.'}`
      : `${topics} of ${$$('.topic').length} topics`;
  }

  // ---------- deep links: #<entry anchor>, #t=81 or #t=1:21 ----------
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (!h) return;
    const t = h.match(/^t=(?:(\d+):)?(\d+(?:\.\d+)?)$/);
    if (t) { cue((+t[1] || 0) * 60 + +t[2]); return; }
    const el = document.getElementById(h);
    if (!el) return;
    const tab = el.closest('.view')?.id.replace('view-', '');
    if (tab) showTab(tab);
    const entry = D.entries.find(e => e.anchor === h);
    if (entry) {
      setFollow(false);
      if (!playing) cue(entry.start);
      el.classList.remove('target'); void el.offsetWidth; el.classList.add('target');
    }
    requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }
  addEventListener('hashchange', fromHash);
  fromHash();
  apply();
})();
