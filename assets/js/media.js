/* media.js: копирование сценария, видео-слоты, ARIA-вкладки, лайтбокс — модуль ЦОР. Подключается как обычный скрипт; функции глобальны для inline-обработчиков. */
// ===== COPY SCRIPT (2.4) =====
    function copyScript() {
        const board = document.getElementById('scriptBoard');
        if (!board) return;
        const lines = [];
        board.querySelectorAll('.script-scene').forEach((scene, i) => {
            const title = scene.querySelector('h5')?.textContent?.trim() || '';
            const onscreen = scene.querySelector('.script-onscreen')?.textContent?.trim();
            const voice = scene.querySelector('.script-voice')?.textContent?.trim() || '';
            lines.push((i + 1) + '. ' + title);
            if (onscreen) lines.push('   На экране: ' + onscreen);
            if (voice) lines.push('   ' + voice);
            lines.push('');
        });
        const text = 'Сценарий промо-ролика «Игровые основы программирования»\n\n' + lines.join('\n');
        navigator.clipboard.writeText(text).then(() => showToast('Сценарий скопирован')).catch(() => showToast('Не удалось скопировать'));
    }

    // ===== VIDEO SLOTS: вставка по data-src (YouTube, VK, прямой URL) =====
    function embedVideoSlot(slot) {
        const src = (slot.dataset.src || '').trim();
        if (!src) return;
        slot.querySelectorAll('iframe, video').forEach(el => el.remove());
        let embedUrl = src;
        const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (yt) embedUrl = 'https://www.youtube.com/embed/' + yt[1] + '?rel=0';
        else if (/\.(mp4|webm|ogg)(\?|$)/i.test(src)) {
            const v = document.createElement('video');
            v.src = src; v.controls = true; v.playsInline = true;
            v.preload = 'none';
            v.setAttribute('preload', 'none');
            v.setAttribute('aria-label', slot.dataset.videoLabel || 'Видео');
            slot.appendChild(v);
            slot.classList.add('has-media');
            return;
        }
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.loading = 'lazy';
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.title = slot.dataset.videoLabel || 'Видео';
        slot.appendChild(iframe);
        slot.classList.add('has-media');
    }
    // Ленивое встраивание: видео/плееры подгружаются только когда пользователь
    // доскроллил до них (внутри свёрнутых карточек слоты невидимы и не грузятся).
    if ('IntersectionObserver' in window) {
        const slotObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) { embedVideoSlot(e.target); obs.unobserve(e.target); }
            });
        }, { rootMargin: '300px 0px' });
        document.querySelectorAll('.video-slot[data-src]').forEach(s => slotObserver.observe(s));
    } else {
        document.querySelectorAll('.video-slot[data-src]').forEach(embedVideoSlot);
    }

    // ===== ДОСТУПНОСТЬ ВКЛАДОК ПОДЗАДАЧ (ARIA + стрелки) =====
    (function () {
        function panelIdOf(tab) {
            const m = (tab.getAttribute('onclick') || '').match(/'([^']+)'/);
            return m ? m[1] : null;
        }
        function syncAria(container) {
            container.querySelectorAll('.subtask-tab').forEach(t => {
                t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false');
                t.tabIndex = t.classList.contains('active') ? 0 : -1;
            });
        }
        document.querySelectorAll('.subtask-tabs').forEach(group => {
            group.setAttribute('role', 'tablist');
            const tabs = [...group.querySelectorAll('.subtask-tab')];
            tabs.forEach((tab, i) => {
                tab.setAttribute('role', 'tab');
                const pid = panelIdOf(tab);
                if (pid) {
                    tab.setAttribute('aria-controls', pid);
                    const panel = document.getElementById(pid);
                    if (panel) { panel.setAttribute('role', 'tabpanel'); panel.setAttribute('tabindex', '0'); }
                }
                tab.addEventListener('keydown', (e) => {
                    let ni = null;
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') ni = (i + 1) % tabs.length;
                    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') ni = (i - 1 + tabs.length) % tabs.length;
                    else if (e.key === 'Home') ni = 0;
                    else if (e.key === 'End') ni = tabs.length - 1;
                    if (ni !== null) { e.preventDefault(); tabs[ni].click(); tabs[ni].focus(); }
                });
            });
            syncAria(group);
        });
        // Обновлять aria после переключения вкладки
        const orig = window.switchSubtask;
        if (typeof orig === 'function') {
            window.switchSubtask = function (tab, panelId) {
                orig(tab, panelId);
                const c = tab.closest('.task-card-body');
                if (c) c.querySelectorAll('.subtask-tabs').forEach(syncAria);
            };
        }
    })();

    // ===== LIGHTBOX (увеличение изображений) =====
    (function () {
        const lb = document.getElementById('lightbox');
        const lbImg = document.getElementById('lightboxImg');
        const lbClose = document.getElementById('lightboxClose');
        if (!lb || !lbImg) return;
        function open(src, alt) {
            lbImg.src = src;
            lbImg.alt = alt || '';
            lb.classList.add('active');
            lb.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
        function close() {
            lb.classList.remove('active');
            lb.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            lbImg.src = '';
        }
        document.querySelectorAll('img.zoomable').forEach(img => {
            img.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                open(img.currentSrc || img.src, img.alt);
            });
        });
        lb.addEventListener('click', close);
        lbClose.addEventListener('click', close);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lb.classList.contains('active')) close();
        });
    })();
