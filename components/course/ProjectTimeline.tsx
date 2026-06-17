import type { TaskMeta } from '@/lib/types'
import { taskAnchor } from '@/lib/anchor'
import { Icon } from '@/components/icons'
import s from './course.module.css'

// Осмысленные lucide-иконки этапов педагогического дизайна.
const STAGE_ICONS = ['target', 'search', 'lightbulb', 'clipboard', 'pen', 'chart']

// Визуальная лента этапов проектирования: Тема → Анализ → … → Оценка.
// Каждый этап — карточка с иконкой, статусом и кратким результатом.
export default function ProjectTimeline({
  tasks,
  completed,
}: {
  tasks: TaskMeta[]
  completed: boolean
}) {
  // Короткие подписи этапов для ленты.
  const SHORT = ['Тема', 'Анализ', 'Цели', 'План', 'Материалы', 'Оценка']
  return (
    <div className={s.timeline}>
      {tasks.map((t, i) => (
        <a href={`#${taskAnchor(t.id)}`} className={s.tlCard} key={t.id}>
          <div className={s.tlConnector} aria-hidden="true" />
          <div className={s.tlIcon}>
            <Icon name={STAGE_ICONS[i] ?? 'book'} size={20} />
          </div>
          <div className={s.tlStep}>Этап {i + 1}</div>
          <div className={s.tlName}>{SHORT[i] ?? t.title}</div>
          {completed && (
            <div className={s.tlStatus}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Выполнено
            </div>
          )}
          {t.result && <div className={s.tlResult}>{t.result}</div>}
        </a>
      ))}
    </div>
  )
}
