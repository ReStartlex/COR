/* navigation.js: тема, навигация, scroll-spy, счётчики, «развернуть все» — модуль ЦОР. Подключается как обычный скрипт; функции глобальны для inline-обработчиков. */
// ===== THEME TOGGLE =====
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        html.setAttribute('data-theme', 'light');
    }
    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
    });

    // ===== NAV SCROLL + READING PROGRESS =====
    const nav = document.getElementById('nav');
    const readingBar = document.getElementById('readingProgress');
    const backToTopBtn = document.getElementById('backToTop');
    let navRaf = 0;
    function updateNav() {
        navRaf = 0;
        nav.classList.toggle('scrolled', window.scrollY > 20);
        backToTopBtn.classList.toggle('visible', window.scrollY > 600);
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        if (docH > 0) readingBar.style.width = (window.scrollY / docH * 100) + '%';
    }
    window.addEventListener('scroll', () => {
        if (!navRaf) navRaf = requestAnimationFrame(updateNav);
    }, { passive: true });
    updateNav();

    // ===== HAMBURGER MENU =====
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('active');
    });
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    });
    document.querySelectorAll('.sidebar-item:not(.locked)').forEach(item => {
        item.addEventListener('click', () => {
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        });
    });

    // ===== FADE-IN OBSERVER =====
    // threshold:0 + generous rootMargin — критично для очень высоких раскрытых карточек,
    // чей intersectionRatio на мобильном viewport никогда не достигает 0.1.
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0, rootMargin: '0px 0px 100px 0px' });
    document.querySelectorAll('.fade-in, .section-header, .theme-card, .task-card').forEach(el => {
        observer.observe(el);
    });

    // Safety net: если по любой причине IO не сработал (таб в фоне, Telegram/VK in-app browser и т.п.)
    // — показываем всё, что сейчас в области просмотра или выше. Остальное — как обычно.
    function revealVisibleFallback() {
        const vh = window.innerHeight;
        document.querySelectorAll('.fade-in:not(.visible)').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < vh + 200) el.classList.add('visible');
        });
    }
    window.addEventListener('load', () => {
        setTimeout(revealVisibleFallback, 800);
    });
    window.addEventListener('resize', revealVisibleFallback, { passive: true });
    // И ещё одна мгновенная подстраховка: если IO не поддерживается — сразу показываем всё.
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.fade-in').forEach(el => el.classList.add('visible'));
    }

    // ===== ACTIVE NAV LINK + SIDEBAR SCROLL-SPY =====
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebarItems = document.querySelectorAll('.sidebar-item[data-task]');
    const taskCards = document.querySelectorAll('.task-card[id^="task"]');
    const sidebarEl = document.getElementById('sidebar');
    let lastActiveTaskId = '';
    let spyRaf = 0;
    function updateScrollSpy() {
        spyRaf = 0;
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            if (window.scrollY >= sectionTop) current = section.getAttribute('id');
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });

        let activeTaskId = '';
        taskCards.forEach(card => {
            const top = card.getBoundingClientRect().top;
            if (top < 160) activeTaskId = card.id;
        });
        if (activeTaskId !== lastActiveTaskId) {
            lastActiveTaskId = activeTaskId;
            sidebarItems.forEach(item => {
                const isActive = item.getAttribute('href') === '#' + activeTaskId;
                item.classList.toggle('active', isActive);
                if (isActive && sidebarEl) {
                    // Плавно центрируем активный пункт в сайдбаре
                    const r = item.getBoundingClientRect();
                    const sr = sidebarEl.getBoundingClientRect();
                    if (r.top < sr.top + 40 || r.bottom > sr.bottom - 40) {
                        sidebarEl.scrollTo({
                            top: sidebarEl.scrollTop + (r.top - sr.top) - (sr.height / 2 - r.height / 2),
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    }
    window.addEventListener('scroll', () => {
        if (!spyRaf) spyRaf = requestAnimationFrame(updateScrollSpy);
    }, { passive: true });

    // ===== ANIMATED COUNTER =====
    function animateCounter(el, from, to) {
        if (from === to) return;
        const duration = 600;
        const start = performance.now();
        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            el.textContent = Math.round(from + (to - from) * ease);
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
    function animateCounters() {
        document.querySelectorAll('.hero-stat-num').forEach(el => {
            const target = parseInt(el.textContent);
            if (isNaN(target) || el.dataset.animated) return;
            el.dataset.animated = 'true';
            animateCounter(el, 0, target);
        });
    }
    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) animateCounters(); });
    }, { threshold: 0.5 });
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) heroObserver.observe(heroStats);

    // ===== KEYBOARD: ESC CLOSES CARDS / MODAL ===== 
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.getElementById('resetModal').classList.contains('active')) {
                closeResetModal();
                return;
            }
            document.querySelectorAll('.task-card.open').forEach(c => c.classList.remove('open'));
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
        }
    });

    // ===== EXPAND ALL / COLLAPSE ALL =====
    const ICON_EXPAND = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 13 12 18 17 13"/><polyline points="7 6 12 11 17 6"/></svg> Развернуть все';
    const ICON_COLLAPSE = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 11 12 6 7 11"/><polyline points="17 18 12 13 7 18"/></svg> Свернуть все';
    document.querySelectorAll('section').forEach(section => {
        const cards = section.querySelectorAll('.task-card:not(.locked)');
        if (!cards.length) return;
        // куда вставить кнопку: заголовок секции или разделитель темы
        const host = section.querySelector('.section-header') || section.querySelector('.theme-divider-inner');
        if (!host || host.querySelector('.expand-all-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'expand-all-btn';
        btn.innerHTML = ICON_EXPAND;
        if (host.classList.contains('theme-divider-inner')) btn.style.marginLeft = 'auto';
        const sync = () => {
            const anyOpen = [...cards].some(c => c.classList.contains('open'));
            btn.innerHTML = anyOpen ? ICON_COLLAPSE : ICON_EXPAND;
        };
        btn.addEventListener('click', () => {
            const anyOpen = [...cards].some(c => c.classList.contains('open'));
            cards.forEach(c => { anyOpen ? c.classList.remove('open') : c.classList.add('open'); });
            sync();
        });
        host.appendChild(btn);
        sync();
    });

    