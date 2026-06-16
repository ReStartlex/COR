import { prisma } from './db'
import type { SubjectMeta, SubjectProgress, TaskStatus } from './types'
import { getSubjectTaskIds } from './content'

// Сайт — портфолио готовых ответов студента; преподаватель ОЗНАКАМЛИВАЕТСЯ.
// Поэтому статус задания — про чтение преподавателем, а не про выполнение студентом.
export const STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: 'Не прочитано',
  in_progress: 'Читается',
  read: 'Прочитано',
  done: 'Прочитано',
}

/** Прочитано ли задание (read и done — синонимы «прочитано»). */
export function isRead(status: TaskStatus | undefined): boolean {
  return status === 'read' || status === 'done'
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

/** Сводный прогресс чтения по предмету (сколько ответов прочитал преподаватель). */
export function computeProgress(
  meta: SubjectMeta,
  statuses: Record<string, TaskStatus>
): SubjectProgress {
  const ids = getSubjectTaskIds(meta)
  const total = ids.length
  let read = 0
  for (const id of ids) {
    if (isRead(statuses[id])) read++
  }
  return {
    total,
    read,
    percent: total === 0 ? 0 : Math.round((read / total) * 100),
  }
}

/** Профиль студента (singleton). Создаёт запись с дефолтами при первом обращении. */
export async function getStudentProfile() {
  const existing = await prisma.studentProfile.findUnique({ where: { id: 1 } })
  if (existing) return existing
  return prisma.studentProfile.create({ data: { id: 1 } })
}
