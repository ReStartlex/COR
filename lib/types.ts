// Типы контента предметов. Контент — файлы в content/subjects/<slug>/.
// Динамика (статусы прохождения) живёт в БД и сливается с этими типами при рендере.

export type TaskStatus = 'not_started' | 'in_progress' | 'read' | 'done'

export interface TaskMeta {
  /** Номер задания, напр. "1.5". Уникален в пределах предмета. Используется в якоре/прогрессе. */
  id: string
  /** Что показать в бейдже-номере, если отличается от id (напр. эмодзи). */
  numLabel?: string
  title: string
  /** Тип работы: Лекция, Практическая, Самостоятельная и т.п. — для бейджа. */
  kind?: string
  /** Короткое описание для списков. */
  desc?: string
}

/** Строка паспорта проектной работы. */
export interface PassportRow {
  label: string
  value: string
}

/** Карточка карты образовательной системы. */
export interface SystemMapItem {
  icon: string
  label: string
  value: string
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
  /** Статус работы студента по предмету: 'completed' (ответы готовы) | 'in_progress'. */
  studentStatus?: 'completed' | 'in_progress'
  /** Акцентный токен: '1' | '2' | '3' | '4' (см. --accent-*). */
  accent?: '1' | '2' | '3' | '4'
  /** Эмодзи/иконка предмета. */
  icon?: string
  /** Есть ли премиум-витрина ЦОР (course showcase). */
  hasShowcase?: boolean
  showcaseSlug?: string
  showcaseTitle?: string
  /** Преподаватель предмета (для проектных предметов). */
  teacher?: string
  /** Паспорт проектной работы (если предмет — проектная работа). */
  passport?: PassportRow[]
  /** Карта образовательной системы (карточки). */
  systemMap?: SystemMapItem[]
  themes: ThemeMeta[]
}

/** Прогресс из БД, наложенный на задание. */
export interface TaskWithProgress extends TaskMeta {
  status: TaskStatus
  grade?: number | null
}

/** Сводный прогресс ЧТЕНИЯ по предмету (сколько ответов прочитал преподаватель). */
export interface SubjectProgress {
  total: number
  /** Сколько заданий отмечено прочитанными. */
  read: number
  percent: number
}
