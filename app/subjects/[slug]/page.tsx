import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import SiteNav from '@/components/layout/SiteNav'
import { getSubject, getSubjectSlugs } from '@/lib/content'
import { getSubjectStatuses, computeProgress } from '@/lib/progress'

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

  return (
    <>
      <SiteNav
        brandTitle="ЦОР"
        brandSubtitle={meta.short ?? 'Предмет'}
        links={[{ href: '/', label: 'Главная' }]}
      />
      <main className="main" id="top">
        <section className="hero" style={{ minHeight: 'auto', paddingBottom: '2rem' }}>
          <div className="hero-badge">
            <span className="dot" />
            {meta.term}
          </div>
          <h1>{meta.title}</h1>
          <p className="hero-subtitle">{meta.description}</p>
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
              <div className="hero-stat-num">{progress.done}</div>
              <div className="hero-stat-label">Выполнено</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{progress.percent}</div>
              <div className="hero-stat-label">Прогресс, %</div>
            </div>
          </div>
        </section>

        {meta.themes.map((theme, i) => (
          <section className="section" id={theme.id} key={theme.id}>
            <div className="section-header visible">
              <div className="section-label">Тема {i + 1}</div>
              <h2>{theme.title}</h2>
            </div>
            <div className="resource-group">
              {theme.tasks.map((task) => (
                <div className="resource-card" key={task.id}>
                  <div className="resource-card-num">{task.id}</div>
                  <div className="resource-card-body">
                    <div className="resource-card-head">
                      <span className="resource-card-title">{task.title}</span>
                      {task.kind && <span className="resource-card-type">{task.kind}</span>}
                    </div>
                    {task.desc && <div className="resource-card-desc">{task.desc}</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <footer className="footer">
          <p className="footer-brand">{meta.title}</p>
          <p>Полная страница курса с навигацией, статусами и материалами — в разработке (Этап 2).</p>
        </footer>
      </main>
    </>
  )
}
