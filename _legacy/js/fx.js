/* fx.js — премиум микровзаимодействия (общие для course.html и index.html).
   Прогрессивное улучшение: всё отключается на touch-устройствах и при
   prefers-reduced-motion, чтобы не мешать доступности и производительности. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const $$ = (s) => [...document.querySelectorAll(s)];

  /* спотлайт-подсветка, следующая за курсором (работает и слегка на всех) */
  $$('[data-spotlight]').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  if (reduce || !fine) return; // дальше — только мышь и без reduced-motion

  /* магнитные элементы (кнопки) */
  $$('[data-magnetic]').forEach(el => {
    const k = 0.25;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * k + 'px,' + (e.clientY - r.top - r.height / 2) * k + 'px)';
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  /* 3D-наклон карточек */
  $$('[data-tilt]').forEach(el => {
    let raf = 0;
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = 'perspective(900px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 5).toFixed(2) + 'deg) translateY(-4px)';
      });
    });
    el.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); el.style.transform = ''; });
  });

  /* лёгкий параллакс */
  const par = $$('[data-parallax]');
  if (par.length) {
    let raf = 0;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        par.forEach(el => { const s = +el.dataset.parallax || 0.08; el.style.transform = 'translateY(' + (y * s) + 'px)'; });
        raf = 0;
      });
    }, { passive: true });
  }
})();
