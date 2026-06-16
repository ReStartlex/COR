import SiteNav from '@/components/layout/SiteNav'
import SubjectCard from '@/components/home/SubjectCard'
import { getAllSubjects } from '@/lib/content'
import { getSubjectStatuses, computeProgress, getStudentProfile } from '@/lib/progress'
import s from '@/components/home/home.module.css'

// Главная читает БД (прогресс/профиль) — рендерим на каждый запрос.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const subjects = getAllSubjects()
  const profile = await getStudentProfile()

  const withProgress = await Promise.all(
    subjects.map(async (meta) => {
      const statuses = await getSubjectStatuses(meta.slug)
      return { meta, progress: computeProgress(meta, statuses) }
    })
  )

  const totalTasks = withProgress.reduce((n, x) => n + x.progress.total, 0)
  const totalRead = withProgress.reduce((n, x) => n + x.progress.read, 0)
  const avgPercent =
    withProgress.length === 0
      ? 0
      : Math.round(withProgress.reduce((n, x) => n + x.progress.percent, 0) / withProgress.length)

  return (
    <>
      <SiteNav
        brandTitle="ЦОР"
        brandSubtitle="Савчишен А.А."
        links={[{ href: '#subjects', label: 'Предметы' }]}
      />

      <main className="main" id="top">
        <section className="hero" style={{ minHeight: 'auto', padding: '7rem 2rem 2rem' }}>
          <div className="hero-badge">
            <span className="dot" />
            {profile.program}
          </div>
          <h1>
            Образовательная <span className="gradient-text">платформа</span>
          </h1>
          <p className="hero-subtitle">
            Портфолио выполненных работ магистранта: каждый предмет — отдельный курс с
            теорией, заданиями и интерактивом. Преподаватели могут ознакомиться с ответами и
            отмечать прочитанное.
          </p>

          <div className={s.profileCard}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.avatar} src={profile.avatarUrl} alt={profile.fullName} />
            <div className={s.profileBody}>
              <h2>{profile.fullName}</h2>
              <span className={s.profileRole}>Студент магистратуры</span>
              <div className={s.profileRows}>
                <div className={s.profileRow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                  {profile.university}
                </div>
                <div className={s.profileRow}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  Группа {profile.group}
                </div>
              </div>
            </div>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-num">{subjects.length}</div>
              <div className="hero-stat-label">Предметов</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{totalTasks}</div>
              <div className="hero-stat-label">Заданий</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{totalRead}</div>
              <div className="hero-stat-label">Прочитано</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-num">{avgPercent}</div>
              <div className="hero-stat-label">Прочитано, %</div>
            </div>
          </div>
        </section>

        <section className="section" id="subjects">
          <div className="section-header visible">
            <div className="section-label">Дисциплины</div>
            <h2>Мои предметы</h2>
            <p>
              Дисциплины с выполненными работами. Откройте предмет, чтобы ознакомиться с
              темами, ответами на задания, теорией и интерактивными материалами.
            </p>
          </div>
          <div className={s.grid}>
            {withProgress.map(({ meta, progress }) => (
              <SubjectCard key={meta.slug} meta={meta} progress={progress} />
            ))}
          </div>
        </section>

        <footer className="footer">
          <p className="footer-brand">ЦОР — образовательная платформа</p>
          <p>
            {profile.fullName} · {profile.university} · группа {profile.group}
          </p>
        </footer>
      </main>
    </>
  )
}
