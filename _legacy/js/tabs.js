/* tabs.js: раскрытие карточек и вкладки подзадач — модуль ЦОР. Подключается как обычный скрипт; функции глобальны для inline-обработчиков. */
// ===== TOGGLE TASK =====
    function toggleTask(header) {
        const card = header.closest('.task-card');
        if (card.classList.contains('locked')) return;
        card.classList.toggle('open');
    }

    // ===== SUBTASK TABS =====
    function switchSubtask(tab, panelId) {
        const container = tab.closest('.task-card-body');
        container.querySelectorAll('.subtask-tab').forEach(t => t.classList.remove('active'));
        container.querySelectorAll('.subtask-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const panel = document.getElementById(panelId);
        if (panel) panel.classList.add('active');
    }

    