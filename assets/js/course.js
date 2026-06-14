/* course.js — «Code Quest»: canvas-анимации, reveal, счётчики, тема, тест, лайтбокс */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- THEME ---------- */
  const root = document.documentElement, themeBtn = $('#themeBtn');
  const saved = localStorage.getItem('cor-theme');
  if (saved) root.setAttribute('data-theme', saved);
  function syncTheme() {
    const dark = root.getAttribute('data-theme') !== 'light';
    const m = $('.i-moon'), s = $('.i-sun');
    if (m && s) { m.style.display = dark ? '' : 'none'; s.style.display = dark ? 'none' : ''; }
  }
  syncTheme();
  themeBtn && themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('cor-theme', next);
    syncTheme();
  });

  /* ---------- NAV: scrolled, progress, burger, to-top ---------- */
  const nav = $('#nav'), navp = $('#navp'), totop = $('#totop');
  const burger = $('#burger'), links = $('#links');
  function onScroll() {
    const y = window.scrollY;
    nav && nav.classList.toggle('scrolled', y > 8);
    totop && totop.classList.toggle('show', y > 700);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (navp && h > 0) navp.style.width = (y / h * 100) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger && burger.addEventListener('click', () => links.classList.toggle('open'));
  links && $$('a', links).forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  totop && totop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- REVEAL ON SCROLL ---------- */
  const revs = $$('.reveal:not(.in)');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es, o) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revs.forEach(el => io.observe(el));
    // подстраховка: показать всё, что уже в зоне видимости после загрузки
    window.addEventListener('load', () => setTimeout(() => {
      $$('.reveal:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < innerHeight + 200) el.classList.add('in'); });
    }, 400));
  } else {
    revs.forEach(el => el.classList.add('in'));
  }
  // гарантия: если что-то пошло не так — раскрыть всё на полной загрузке
  window.addEventListener('load', () => setTimeout(() => $$('.reveal:not(.in)').forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in');
  }), 1200));

  /* ---------- ANIMATED COUNTERS ---------- */
  function animateCount(el) {
    const target = +el.dataset.count, suf = el.dataset.suffix || '', dur = 1100, t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e) + suf;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  const counters = $$('[data-count]');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const co = new IntersectionObserver((es, o) => es.forEach(e => {
        if (e.isIntersecting) { animateCount(e.target); o.unobserve(e.target); }
      }), { threshold: 0.5 });
      counters.forEach(c => co.observe(c));
    } else counters.forEach(animateCount);
  }

  /* ---------- ROBOT-DRAWS-SQUARE CANVAS ENGINE ---------- */
  function makeRobot(canvas, opts) {
    if (!canvas) return null;
    opts = opts || {};
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.aspectRatio = W + ' / ' + H;
    ctx.scale(DPR, DPR);

    const side = Math.min(W, H) * 0.56, cx = W / 2, cy = H / 2;
    const C = [
      { x: cx - side / 2, y: cy - side / 2 },
      { x: cx + side / 2, y: cy - side / 2 },
      { x: cx + side / 2, y: cy + side / 2 },
      { x: cx - side / 2, y: cy + side / 2 }
    ];
    let edge = 0, t = 0, running = false, raf = 0, last = 0;
    const speed = opts.speed || 0.6;

    function curPos() {
      const a = C[edge % 4], b = C[(edge + 1) % 4];
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    function grid() {
      const step = side / 4;
      ctx.fillStyle = 'rgba(127,150,190,.28)';
      for (let gx = cx - side / 2; gx <= cx + side / 2 + 1; gx += step)
        for (let gy = cy - side / 2; gy <= cy + side / 2 + 1; gy += step) {
          ctx.beginPath(); ctx.arc(gx, gy, 1.6, 0, 7); ctx.fill();
        }
    }
    function path() {
      const pts = [];
      for (let i = 0; i <= edge; i++) pts.push(C[i % 4]);
      pts.push(curPos());
      if (pts.length < 2) return;
      const g = ctx.createLinearGradient(C[0].x, C[0].y, C[2].x, C[2].y);
      g.addColorStop(0, '#4f8cff'); g.addColorStop(1, '#22d3ee');
      ctx.strokeStyle = g; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      ctx.shadowBlur = 16; ctx.shadowColor = 'rgba(34,211,238,.7)';
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke(); ctx.shadowBlur = 0;
      // corner dots
      for (let i = 0; i <= edge && i < 4; i++) { ctx.fillStyle = '#22d3ee'; ctx.beginPath(); ctx.arc(C[i].x, C[i].y, 4, 0, 7); ctx.fill(); }
    }
    function robot(p) {
      const r = Math.max(15, side * 0.075);
      ctx.save(); ctx.translate(p.x, p.y);
      ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(79,140,255,.6)';
      const g = ctx.createLinearGradient(-r, -r, r, r);
      g.addColorStop(0, '#5b9bff'); g.addColorStop(1, '#22d3ee');
      ctx.fillStyle = g;
      const rr = r * 0.45;
      ctx.beginPath();
      ctx.moveTo(-r + rr, -r); ctx.arcTo(r, -r, r, r, rr); ctx.arcTo(r, r, -r, r, rr);
      ctx.arcTo(-r, r, -r, -r, rr); ctx.arcTo(-r, -r, r, -r, rr); ctx.closePath(); ctx.fill();
      ctx.shadowBlur = 0;
      // antenna
      ctx.strokeStyle = '#22d3ee'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, -r - 8); ctx.stroke();
      ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0, -r - 10, 3, 0, 7); ctx.fill();
      // eyes
      ctx.fillStyle = '#04101f';
      ctx.beginPath(); ctx.arc(-r * 0.35, -r * 0.1, r * 0.18, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.35, -r * 0.1, r * 0.18, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.15, r * 0.06, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.4, -r * 0.15, r * 0.06, 0, 7); ctx.fill();
      // smile
      ctx.strokeStyle = '#04101f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, r * 0.2, r * 0.32, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.restore();
    }
    function render() { ctx.clearRect(0, 0, W, H); grid(); path(); robot(curPos()); }
    function frame(ts) {
      if (!running) return;
      if (!last) last = ts;
      t += (ts - last) / 1000 * speed; last = ts;
      if (t >= 1) {
        t = 0; edge++;
        if (opts.onIter) opts.onIter(Math.min(edge, 4));
        if (edge >= 4) {
          render(); running = false;
          if (opts.onDone) opts.onDone();
          if (opts.loop) setTimeout(() => { reset(); start(); }, 1000);
          return;
        }
      }
      if (opts.onLine) opts.onLine(t < 0.78 ? 1 : 2);
      render(); raf = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; last = 0; if (opts.onLine) opts.onLine(1); raf = requestAnimationFrame(frame); }
    function reset() { cancelAnimationFrame(raf); running = false; edge = 0; t = 0; last = 0; if (opts.onIter) opts.onIter(0); if (opts.onLine) opts.onLine(0); render(); }
    reset();
    if (opts.autoplay) {
      if ('IntersectionObserver' in window) {
        const vo = new IntersectionObserver((es) => es.forEach(e => e.isIntersecting ? start() : null), { threshold: 0.25 });
        vo.observe(canvas);
      } else start();
    }
    return { start, reset };
  }

  // hero (auto-loop)
  makeRobot($('#heroCanvas'), { autoplay: true, loop: true, speed: 0.55 });

  // interactive demo
  const codeLines = $$('#demoCode .line');
  const iterEl = $('#demoIter');
  function setLine(l) { codeLines.forEach(ln => ln.classList.toggle('on', +ln.dataset.l === l || (l > 0 && +ln.dataset.l === 0))); }
  const demo = makeRobot($('#demoCanvas'), {
    autoplay: false, loop: false, speed: 0.7,
    onIter: n => { if (iterEl) iterEl.textContent = 'Итерация: ' + n + ' / 4'; },
    onLine: l => setLine(l),
    onDone: () => { setLine(0); if (iterEl) iterEl.textContent = 'Готово! Квадрат нарисован за 4 итерации ✓'; }
  });
  $('#demoRun') && $('#demoRun').addEventListener('click', () => { demo.reset(); demo.start(); });
  $('#demoReset') && $('#demoReset').addEventListener('click', () => { demo.reset(); setLine(0); if (iterEl) iterEl.textContent = 'Итерация: 0 / 4'; });

  /* ---------- LIGHTBOX ---------- */
  const lb = $('#lb'), lbi = $('#lbi'), lbx = $('#lbx');
  if (lb && lbi) {
    const open = (s, a) => { lbi.src = s; lbi.alt = a || ''; lb.classList.add('on'); document.body.style.overflow = 'hidden'; };
    const close = () => { lb.classList.remove('on'); document.body.style.overflow = ''; lbi.src = ''; };
    $$('img.zoom').forEach(i => i.addEventListener('click', () => open(i.currentSrc || i.src, i.alt)));
    lb.addEventListener('click', close);
    lbx && lbx.addEventListener('click', e => { e.stopPropagation(); close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('on')) close(); });
  }

  /* ---------- QUIZ ---------- */
  const quiz = $('#quiz');
  if (quiz) {
    const checkBtn = $('#checkBtn'), resetBtn = $('#resetBtn'), scoreEl = $('#score');
    const qs = $$('.q', quiz);
    function grade(q) {
      const type = q.dataset.type, ans = q.dataset.answer;
      if (type === 'radio') { const c = $('input:checked', q); return !!c && c.value === ans; }
      if (type === 'checkbox') {
        const need = ans.split(',').sort().join(',');
        const got = $$('input:checked', q).map(i => i.value).sort().join(',');
        return need === got;
      }
      if (type === 'text') { const v = ($('input', q).value || '').trim().toLowerCase().replace(/ё/g, 'е'); return v === ans.toLowerCase().replace(/ё/g, 'е'); }
      if (type === 'match') { return ans.split(',').map(p => p.split('=')).every(([k, v]) => { const s = $('select[data-key="' + k + '"]', q); return s && s.value === v; }); }
      return false;
    }
    checkBtn.addEventListener('click', () => {
      let right = 0;
      qs.forEach(q => { const ok = grade(q); q.classList.remove('right', 'wrong'); q.classList.add(ok ? 'right' : 'wrong'); if (ok) right++; });
      const pct = Math.round(right / qs.length * 100);
      const mark = pct >= 85 ? 'отлично (5)' : pct >= 70 ? 'хорошо (4)' : pct >= 55 ? 'удовлетворительно (3)' : 'не зачтено';
      scoreEl.innerHTML = 'Результат: <span class="big">' + right + ' из ' + qs.length + '</span> · ' + pct + '% · ' + mark;
      resetBtn.style.display = 'inline-flex';
      quiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    resetBtn.addEventListener('click', () => {
      qs.forEach(q => { q.classList.remove('right', 'wrong'); $$('input', q).forEach(i => { i.checked = false; i.value = ''; }); $$('select', q).forEach(s => s.value = ''); });
      scoreEl.textContent = ''; resetBtn.style.display = 'none';
    });
  }
})();
