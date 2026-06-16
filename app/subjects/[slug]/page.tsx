import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getSubject, getTaskHtml, getSubjectTaskIds } from '@/lib/content'
import { getSubjectStatuses, computeProgress, isRead } from '@/lib/progress'
import CourseChrome from '@/components/course/CourseChrome'
import { taskAnchor } from '@/lib/anchor'
import TaskCard from '@/components/course/TaskCard'
import Lightbox from '@/components/course/Lightbox'
import Toast from '@/components/course/Toast'
import ReadingProvider from '@/components/course/ReadingProvider'
import { ReadCount, ReadPercent } from '@/components/course/ReadingStats'
import FinalResult from '@/components/course/FinalResult'
import { ProjectPassport, SystemMap } from '@/components/course/ProjectPassport'
import s from '@/components/course/course.module.css'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const meta = getSubject(slug)
  if (!meta) return { title: 'Предмет не найден' }
  return { title: meta.title, description: meta.description }
}

const THEME_ICONS = ['📚', '🛠️', '🧩', '🎯', '⭐']

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const meta = getSubject(slug)
  if (!meta) notFound()

  const statuses = await getSubjectStatuses(slug)
  const progress = computeProgress(meta, statuses)
  const allIds = getSubjectTaskIds(meta)
  const initialRead = allIds.filter((id) => isRead(statuses[id]))
  const studentCompleted = meta.studentStatus === 'completed'

  // Загружаем тела заданий на сервере (фрагменты из content/.../tasks/<id>.html).
  const bodies: Record<string, string | null> = {}
  for (const theme of meta.themes) {
    for (const task of theme.tasks) bodies[task.id] = getTaskHtml(slug, task.id)
  }

  const firstTaskId = meta.themes[0]?.tasks[0]?.id

  return (
    <ReadingProvider subjectSlug={slug} taskIds={allIds} initialRead={initialRead}>
      <CourseChrome meta={meta} />

      <main className="main" id="top">
        {/* ===== HERO курса ===== */}
        <section className="hero" style={{ minHeight: 'auto', padding: '7rem 2rem 3rem' }}>
          <div className="hero-badge">
            <span className="dot" />
            {meta.term}
          </div>
          <h1>{meta.title}</h1>
          <p className="hero-subtitle">{meta.description}</p>
          {studentCompleted && (
            <div className={s.studentDone}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Все задания по предмету выполнены студентом
            </div>
          )}
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{meta.themes.length}</div>
              <div className="hero-stat-label">Темы</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{progress.total}</div>
              <div className="hero-stat-label">Заданий</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">
                <ReadCount />
              </div>
              <div className="hero-stat-label">Прочитано</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">
                <ReadPercent />
              </div>
              <div className="hero-stat-label">Прочитано, %</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' }}>
            {firstTaskId && (
              <a href={`#${taskAnchor(firstTaskId)}`} className="hero-cta">
                К ответам
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            )}
            {meta.hasShowcase && meta.showcaseSlug && (
              <a href={`/showcase/${meta.showcaseSlug}`} className={s.showcaseCta}>
                Открыть ЦОР «{meta.showcaseTitle}»
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M7 17L17 7M7 7h10v10" />
                </svg>
              </a>
            )}
          </div>
        </section>

        {/* ===== Паспорт проектной работы ===== */}
        {meta.passport && meta.passport.length > 0 && (
          <section className="section" id="passport">
            <ProjectPassport rows={meta.passport} />
          </section>
        )}

        {/* ===== Карта образовательной системы ===== */}
        {meta.systemMap && meta.systemMap.length > 0 && (
          <section className="section" id="systemmap">
            <div className="section-header visible">
              <div className="section-label">Системный подход</div>
              <h2>Карта проектируемой образовательной системы</h2>
            </div>
            <SystemMap items={meta.systemMap} />
          </section>
        )}

        {/* ===== Обзор тем ===== */}
        <section className="section" id="overview">
          <div className="section-header visible">
            <div className="section-label">Структура курса</div>
            <h2>
              {meta.themes.length} тем(ы), {progress.total} заданий
            </h2>
          </div>
          <div className="module-timeline">
            {meta.themes.map((theme, i) => (
              <div className="module-item" data-num={i + 1} key={theme.id}>
                <div className="module-title">{theme.title}</div>
                <div className="module-desc">
                  {theme.tasks.length} заданий · {theme.tasks.map((t) => t.id).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Темы с заданиями ===== */}
        {meta.themes.map((theme, ti) => (
          <section className="section" id={theme.id} key={theme.id}>
            <div className="theme-divider">
              <div className="theme-divider-inner">
                <div className={`theme-divider-icon t${(ti % 2) + 1}`}>{THEME_ICONS[ti] ?? '📘'}</div>
                <div className="theme-divider-text">
                  <h3>
                    Тема {ti + 1}. {theme.title}
                  </h3>
                  <p>{theme.tasks.length} заданий</p>
                </div>
              </div>
            </div>

            {theme.tasks.map((task) => {
              const html = bodies[task.id]
              if (!html) {
                return (
                  <div className="task-card fade-in visible" id={taskAnchor(task.id)} key={task.id}>
                    <div className="task-card-header" style={{ cursor: 'default' }}>
                      <div className="task-num">{task.id}</div>
                      <div className="task-card-info">
                        <div className="task-card-title">{task.title}</div>
                        <div className="task-card-desc">{task.kind} · материал готовится</div>
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  numLabel={task.numLabel}
                  anchor={taskAnchor(task.id)}
                  title={task.title}
                  kind={task.kind}
                  desc={task.desc}
                  html={html}
                  defaultOpen={task.id === firstTaskId}
                />
              )
            })}
          </section>
        ))}

        {/* ===== Итоговый результат ===== */}
        <section className="section" id="result">
          <div className="section-header visible">
            <div className="section-label">Итог</div>
            <h2>Ознакомление с ответами</h2>
          </div>
          <FinalResult studentCompleted={studentCompleted} />
        </section>

        <footer className="footer">
          <p className="footer-brand">{meta.title}</p>
          <p>Савчишен Алексей Алексеевич · {meta.term}</p>
        </footer>
      </main>

      <Lightbox />
      <Toast />
    </ReadingProvider>
  )
}
