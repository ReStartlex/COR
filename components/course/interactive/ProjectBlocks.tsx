'use client'

import s from '../course.module.css'

/* ============ Банк методических материалов ============ */
const BANK = [
  { icon: '📝', title: 'Сценарии занятий', desc: 'Пошаговая структура каждого из 4 занятий' },
  { icon: '📖', title: 'Лонгриды', desc: 'Интерактивные тексты с примерами и схемами' },
  { icon: '🎥', title: 'Видеоуроки', desc: 'Короткие объяснения по 5–7 минут' },
  { icon: '🃏', title: 'Карточки понятий', desc: 'Алгоритм, команда, исполнитель, цикл и др.' },
  { icon: '❓', title: 'Квизы и тесты', desc: 'Быстрая проверка понимания темы' },
  { icon: '🧪', title: 'Практические задания', desc: 'Составить, исправить, дополнить алгоритм' },
  { icon: '☑️', title: 'Чек-листы', desc: 'Самопроверка перед сдачей работы' },
  { icon: '📐', title: 'Критерии оценивания', desc: 'Понятны учащемуся заранее' },
  { icon: '📋', title: 'Анкета обратной связи', desc: 'Оценка курса учащимися после раздела' },
]

export function MaterialsBank() {
  return (
    <div>
      <p className={s.trainersIntro}>
        Комплект методических и учебных материалов раздела — каждый элемент выполняет свою
        функцию в системе обучения.
      </p>
      <div className={s.bankGrid}>
        {BANK.map((b) => (
          <div className={s.bankCard} key={b.title}>
            <span className={s.bankIcon}>{b.icon}</span>
            <div>
              <div className={s.bankTitle}>{b.title}</div>
              <div className={s.bankDesc}>{b.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============ Проверка конструктивной согласованности ============ */
const CHECK = [
  { result: 'Умеет составлять алгоритм', action: 'Составляет алгоритм знакомого действия', assess: 'Проверка по критериям' },
  { result: 'Понимает команды исполнителя', action: 'Собирает последовательность команд', assess: 'Интерактивное задание' },
  { result: 'Применяет условие и цикл', action: 'Дополняет алгоритм конструкциями', assess: 'Практическая работа' },
  { result: 'Создаёт цифровой продукт', action: 'Выполняет мини-проект', assess: 'Оценка по чек-листу' },
]

export function ConstructiveCheck() {
  return (
    <div>
      <p className={s.trainersIntro}>
        Каждый образовательный результат подкреплён учебным действием и способом оценки — это
        подтверждает методическую целостность проекта (принцип конструктивной согласованности).
      </p>
      <div className={s.checkList}>
        <div className={`${s.checkRow} ${s.checkHead}`}>
          <span>Образовательный результат</span>
          <span>Учебное действие</span>
          <span>Метод оценки</span>
        </div>
        {CHECK.map((c) => (
          <div className={s.checkRow} key={c.result}>
            <span className={s.checkResult}>{c.result}</span>
            <span className={s.checkAction}>{c.action}</span>
            <span className={s.checkAssess}>{c.assess}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============ Панель аналитики апробации ============ */
const METRICS = [
  { label: 'Завершили раздел', value: '85%', accent: s.tcA1, w: 85 },
  { label: 'Средний результат тестов', value: '78%', accent: s.tcA2, w: 78 },
  { label: 'Выполнили мини-проект', value: '72%', accent: s.tcA3, w: 72 },
]

export function AnalyticsDashboard() {
  return (
    <div>
      <p className={s.trainersIntro}>
        Проектная модель аналитики апробации: после прохождения раздела собираются
        количественные и качественные данные для доработки курса.
      </p>
      <div className={s.dashGrid}>
        {METRICS.map((m) => (
          <div className={`${s.dashCard} ${m.accent}`} key={m.label}>
            <div className={s.dashTop} />
            <div className={s.dashValue}>{m.value}</div>
            <div className={s.dashLabel}>{m.label}</div>
            <div className={s.dashTrack}>
              <div className={s.dashFill} style={{ width: `${m.w}%` }} />
            </div>
          </div>
        ))}
        <div className={`${s.dashCard} ${s.tcA4}`}>
          <div className={s.dashTop} />
          <div className={s.dashValueSm}>Условия и циклы</div>
          <div className={s.dashLabel}>Самая сложная тема</div>
        </div>
      </div>
      <div className={`callout success ${s.dashNote}`}>
        <p>
          <strong>Главное направление доработки:</strong> добавить больше визуальных примеров и
          подсказок к темам «условия» и «циклы», предложить шаблон мини-проекта для начинающих.
        </p>
      </div>
    </div>
  )
}
