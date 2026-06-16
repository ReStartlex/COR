// Типы контента предметов. Контент — файлы в content/subjects/<slug>/.
// Динамика (статусы прохождения) живёт в БД и сливается с этими типами при рендере.

export type TaskStatus = 'not_started' | 'in_progress' | 'read' | 'done'

export interface TaskMeta {
  /** Номер задания, напр. "1.5". Уникален в пределах предмета. */
  id: string
  title: string
  /** Тип работы: Лекция, Практическая, Самостоятельная и т.п. — для бейджа. */
  kind?: string
  /** Короткое описание для списков. */
  desc?: string
}

export interface ThemeMeta {
  id: string
  title: string
  /** Короткий заголовок темы для сайдбара. */
  short?: string
  tasks: TaskMeta[]
}

export interface SubjectMeta {
  slug: string
  title: string
  /** Короткое название (для карточек/навигации). */
  short?: string
  description: string
  /** Семестр/период. */
  term?: string
  /** Акцентный токен: '1' | '2' | '3' | '4' (см. --accent-*). */
  accent?: '1' | '2' | '3' | '4'
  /** Эмодзи/иконка предмета. */
  icon?: string
  /** Есть ли премиум-витрина ЦОР (course showcase). */
  hasShowcase?: boolean
  showcaseSlug?: string
  showcaseTitle?: string
  themes: ThemeMeta[]
}

/** Прогресс из БД, наложенный на задание. */
export interface TaskWithProgress extends TaskMeta {
  status: TaskStatus
  grade?: number | null
}

/** Сводный прогресс по предмету (вычисляется). */
export interface SubjectProgress {
  total: number
  done: number
  inProgress: number
  percent: number
}
