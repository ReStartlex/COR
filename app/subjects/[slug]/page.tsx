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
import { ProjectPassport } from '@/components/course/ProjectPassport'
import SystemMap from '@/components/course/SystemMap'
import ThemeCards from '@/components/course/ThemeCards'
import ProjectTimeline from '@/components/course/ProjectTimeline'
import TaskComponent from '@/components/course/interactive/TaskComponent'
import { SubjectIcon } from '@/components/icons'
import ExpandAllToggle from '@/components/course/ExpandAllToggle'
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

function plural(n: number, one: string, few: string, many: string): string {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return `${n} ${one}`
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return `${n} ${few}`
  return `${n} ${many}`
}
const pluralThemes = (n: number) => plural(n, 'тема', 'темы', 'тем')
const pluralTasks = (n: number) => plural(n, 'задание', 'задания', 'заданий')

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
          <SubjectIcon type={meta.iconType} size={34} className={s.heroSubjectIcon} />
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

        {/* ===== Лента этапов проектирования ===== */}
        {meta.showTimeline && meta.themes[0] && (
          <section className="section" id="timeline">
            <div className="section-header visible">
              <div className="section-label">Лента проектирования</div>
              <h2>Этапы педагогического дизайна</h2>
            </div>
            <ProjectTimeline tasks={meta.themes[0].tasks} completed={studentCompleted} />
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

        {/* ===== Обзор тем (карточки) ===== */}
        <section className="section" id="overview">
          <div className="section-header visible">
            <div className="section-label">Структура курса</div>
            <h2>
              {pluralThemes(meta.themes.length)}, {pluralTasks(progress.total)}
            </h2>
          </div>
          <ThemeCards themes={meta.themes} />
          <ExpandAllToggle />
        </section>

        {/* ===== Темы с заданиями ===== */}
        {meta.themes.map((theme, ti) => (
          <section className="section" id={theme.id} key={theme.id}>
            <div className="theme-divider">
              <div className="theme-divider-inner">
                <div className={`theme-divider-icon t${(ti % 2) + 1}`} style={{ fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  {ti + 1}
                </div>
                <div className="theme-divider-text">
                  <h3>
                    Тема {ti + 1}. {theme.title}
                  </h3>
                  <p>{theme.tasks.length} заданий</p>
                </div>
              </div>
            </div>

            {theme.tasks.map((task) => {
              // Интерактивное задание — React-компонент вместо HTML.
              if (task.component) {
                return (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    numLabel={task.numLabel}
                    icon={task.icon}
                    anchor={taskAnchor(task.id)}
                    title={task.title}
                    kind={task.kind}
                    desc={task.desc}
                  >
                    <TaskComponent name={task.component} />
                  </TaskCard>
                )
              }
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
                  icon={task.icon}
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
          <p style={{ marginTop: '0.4rem', fontSize: '12px' }}>
            ЦОР — Цифровой образовательный ресурс
          </p>
        </footer>
      </main>

      <Lightbox />
      <Toast />
    </ReadingProvider>
  )
}
