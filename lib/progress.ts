import { prisma } from './db'
import type { SubjectMeta, SubjectProgress, TaskStatus } from './types'
import { getSubjectTaskIds } from './content'

export const STATUS_ORDER: TaskStatus[] = ['not_started', 'in_progress', 'read', 'done']

export const STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: 'Не начато',
  in_progress: 'В процессе',
  read: 'Изучено',
  done: 'Выполнено',
}

/** Карта статусов заданий предмета из БД: { taskId: status }. */
export async function getSubjectStatuses(
  subjectSlug: string
): Promise<Record<string, TaskStatus>> {
  const rows = await prisma.taskProgress.findMany({ where: { subjectSlug } })
  const map: Record<string, TaskStatus> = {}
  for (const r of rows) map[r.taskId] = r.status as TaskStatus
  return map
}

/** Сводный прогресс по предмету. «done» и «read» считаем выполненными. */
export function computeProgress(
  meta: SubjectMeta,
  statuses: Record<string, TaskStatus>
): SubjectProgress {
  const ids = getSubjectTaskIds(meta)
  const total = ids.length
  let done = 0
  let inProgress = 0
  for (const id of ids) {
    const s = statuses[id] ?? 'not_started'
    if (s === 'done' || s === 'read') done++
    else if (s === 'in_progress') inProgress++
  }
  return {
    total,
    done,
    inProgress,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

/** Профиль студента (singleton). Создаёт запись с дефолтами при первом обращении. */
export async function getStudentProfile() {
  const existing = await prisma.studentProfile.findUnique({ where: { id: 1 } })
  if (existing) return existing
  return prisma.studentProfile.create({ data: { id: 1 } })
}
