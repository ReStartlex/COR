/* progress.js: учёт прочитанного, прогресс, сброс, конфетти — модуль ЦОР. Подключается как обычный скрипт; функции глобальны для inline-обработчиков. */
// ===== READ TRACKING SYSTEM =====
    const STORAGE_KEY = 'cifrovoi_content_read_tasks';

    function getReadTasks() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    }
    function saveReadTasks(arr) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(arr)]));
    }
    let toastTimer;
    function showToast(msg) {
        const t = document.getElementById('toast');
        document.getElementById('toastText').textContent = msg;
        t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
    }

    // Display label for a task id (15 -> "1.5", 16 -> "1.6", 22 -> "2.2", 23 -> "2.3")
    const TASK_LABEL = { 15: '1.5', 16: '1.6', 22: '2.2', 23: '2.3', 24: '2.4', 26: '2.6', 27: '2.7', 29: '2.9', 210: '2.10', 211: '2.11', 213: '2.13', 214: '2.14', 32: '3.2' };

    function markTaskRead(taskNum) {
        const read = getReadTasks();
        if (!read.includes(taskNum)) {
            read.push(taskNum);
            saveReadTasks(read);
            refreshReadUI();
            showToast('Задание ' + (TASK_LABEL[taskNum] || taskNum) + ' прочитано');
            if (typeof maybeCelebrate === 'function') maybeCelebrate();
        }
    }

    function refreshReadUI() {
        const read = getReadTasks();
        const totalRead = read.length;

        document.querySelectorAll('.task-card[id^="task"]').forEach(card => {
            const num = parseInt(card.id.replace('task', ''));
            card.classList.toggle('is-read', read.includes(num));
        });

        document.querySelectorAll('.sidebar-item[data-task]').forEach(item => {
            const num = parseInt(item.dataset.task);
            item.classList.toggle('is-read', read.includes(num));
        });

        document.querySelectorAll('.theme-card[data-theme-tasks]').forEach(card => {
            const tasks = card.dataset.themeTasks.split(',').map(Number);
            const count = tasks.filter(t => read.includes(t)).length;
            const total = tasks.length;
            const pct = Math.round(count / total * 100);
            const countEl = card.querySelector('.theme-read-count');
            if (countEl) countEl.textContent = count;
            const fill = card.querySelector('.theme-card-progress-fill');
            if (fill) fill.style.width = pct + '%';
        });

        document.querySelectorAll('.theme-complete[data-theme-tasks]').forEach(banner => {
            const tasks = banner.dataset.themeTasks.split(',').map(Number);
            const allRead = tasks.every(t => read.includes(t));
            banner.style.display = allRead ? 'flex' : 'none';
        });

        const heroEl = document.getElementById('completedCount');
        if (heroEl) {
            const oldVal = parseInt(heroEl.textContent) || 0;
            if (oldVal !== totalRead) {
                heroEl.dataset.animated = '';
                heroEl.textContent = totalRead;
                animateCounter(heroEl, oldVal, totalRead);
            }
        }
    }

    // Inject sentinels, read badges and progress bar
    document.querySelectorAll('.task-card[id^="task"]:not(.locked)').forEach(card => {
        const body = card.querySelector('.task-card-body');
        if (body && !body.querySelector('.task-read-sentinel')) {
            const sentinel = document.createElement('div');
            sentinel.className = 'task-read-sentinel';
            body.appendChild(sentinel);
        }

        const bar = document.createElement('div');
        bar.className = 'task-read-bar';
        card.appendChild(bar);

        const title = card.querySelector('.task-card-title');
        if (title && !title.querySelector('.task-read-badge')) {
            const badge = document.createElement('span');
            badge.className = 'task-read-badge';
            badge.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Прочитано';
            title.appendChild(badge);
        }

        // Reading time estimate (~180 wpm for Russian)
        const info = card.querySelector('.task-card-info');
        const contentEl = card.querySelector('.task-card-content-inner');
        if (info && contentEl && !info.querySelector('.read-time')) {
            const text = contentEl.textContent || '';
            const words = text.trim().split(/\s+/).filter(Boolean).length;
            const minutes = Math.max(1, Math.round(words / 180));
            const rt = document.createElement('span');
            rt.className = 'read-time';
            rt.setAttribute('title', words + ' слов · чтение ≈ ' + minutes + ' мин');
            rt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>' +
                '≈ ' + minutes + ' мин';
            info.appendChild(rt);
        }
    });

    // ===== TABLE SCROLL HINT =====
    document.querySelectorAll('.table-wrapper').forEach(wrap => {
        const update = () => {
            const sl = wrap.scrollLeft;
            const max = wrap.scrollWidth - wrap.clientWidth;
            wrap.classList.toggle('scroll-left', sl > 2);
            wrap.classList.toggle('scroll-right', sl < max - 2);
        };
        update();
        wrap.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
    });

    // ===== CONFETTI CELEBRATION =====
    const CELEBRATION_KEY = 'celebrated100';
    function launchConfetti() {
        const layer = document.getElementById('confettiLayer');
        if (!layer) return;
        const colors = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        const count = 90;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('span');
            p.className = 'confetti-piece';
            p.style.left = Math.random() * 100 + '%';
            p.style.background = colors[i % colors.length];
            p.style.width = (6 + Math.random() * 8) + 'px';
            p.style.height = (10 + Math.random() * 10) + 'px';
            p.style.animationDuration = (2.2 + Math.random() * 2.4) + 's';
            p.style.animationDelay = (Math.random() * 0.6) + 's';
            p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
            layer.appendChild(p);
            setTimeout(() => p.remove(), 5500);
        }
    }
    function maybeCelebrate() {
        const read = getReadTasks();
        const totalTasks = document.querySelectorAll('.task-card[id^="task"]:not(.locked)').length;
        if (totalTasks > 0 && read.length >= totalTasks) {
            if (localStorage.getItem(CELEBRATION_KEY) !== '1') {
                localStorage.setItem(CELEBRATION_KEY, '1');
                launchConfetti();
                setTimeout(() => showToast('Поздравляем! Все задания прочитаны'), 400);
            }
        } else {
            localStorage.removeItem(CELEBRATION_KEY);
        }
    }

    // Observer: detect when user reaches end of an open task
    const readObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const card = entry.target.closest('.task-card');
            if (!card || !card.classList.contains('open')) return;
            const num = parseInt(card.id.replace('task', ''));
            if (!isNaN(num)) markTaskRead(num);
        });
    }, { threshold: 0.8 });

    document.querySelectorAll('.task-read-sentinel').forEach(s => readObserver.observe(s));

    refreshReadUI();
    // Do not auto-launch confetti on initial load; only trigger on fresh completion.

    // ===== RESET PROGRESS =====
    function openResetModal() {
        document.getElementById('resetModal').classList.add('active');
    }
    function closeResetModal() {
        document.getElementById('resetModal').classList.remove('active');
    }
    function confirmResetProgress() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CELEBRATION_KEY);
        closeResetModal();
        refreshReadUI();
        showToast('Прогресс сброшен');
    }
    document.getElementById('resetModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeResetModal();
    });

    