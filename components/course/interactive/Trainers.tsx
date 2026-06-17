'use client'

import { useState } from 'react'
import s from '../course.module.css'

/* ============ 1. Собери алгоритм ============ */
const ALGO_CORRECT = [
  'Открыть приложение',
  'Выбрать получателя',
  'Написать текст сообщения',
  'Нажать «Отправить»',
]
const ALGO_SHUFFLED = [
  'Нажать «Отправить»',
  'Открыть приложение',
  'Написать текст сообщения',
  'Выбрать получателя',
]

function BuildAlgorithm() {
  const [order, setOrder] = useState<string[]>(ALGO_SHUFFLED)
  const [checked, setChecked] = useState(false)

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    setOrder(next)
    setChecked(false)
  }
  const allRight = order.every((v, i) => v === ALGO_CORRECT[i])

  return (
    <div className={s.trainer}>
      <div className={s.trainerHead}>
        <span className={s.trainerNum}>1</span>
        <div>
          <div className={s.trainerTitle}>Собери алгоритм «Отправить сообщение»</div>
          <div className={s.trainerHint}>Расставь шаги в правильном порядке стрелками.</div>
        </div>
      </div>
      <ol className={s.stepList}>
        {order.map((step, i) => {
          const right = checked && step === ALGO_CORRECT[i]
          const wrong = checked && step !== ALGO_CORRECT[i]
          return (
            <li
              key={step}
              className={`${s.step}${right ? ' ' + s.stepRight : ''}${wrong ? ' ' + s.stepWrong : ''}`}
            >
              <span className={s.stepIdx}>{i + 1}</span>
              <span className={s.stepText}>{step}</span>
              <span className={s.stepBtns}>
                <button className={s.iconBtn} onClick={() => move(i, -1)} aria-label="Вверх" disabled={i === 0}>
                  ↑
                </button>
                <button
                  className={s.iconBtn}
                  onClick={() => move(i, 1)}
                  aria-label="Вниз"
                  disabled={i === order.length - 1}
                >
                  ↓
                </button>
              </span>
            </li>
          )
        })}
      </ol>
      <div className={s.actions}>
        <button className={s.btnCheck} onClick={() => setChecked(true)}>
          Проверить
        </button>
        <button
          className={s.btnReset}
          onClick={() => {
            setOrder(ALGO_SHUFFLED)
            setChecked(false)
          }}
        >
          Сброс
        </button>
        {checked && (
          <span className={allRight ? s.fbOk : s.fbNo}>
            {allRight ? '✓ Верно! Алгоритм собран правильно.' : '✗ Порядок ещё не верный — попробуй ещё.'}
          </span>
        )}
      </div>
    </div>
  )
}

/* ============ 2. Найди ошибку в команде ============ */
const CMDS = ['вперёд', 'немного туда', 'вправо', 'взять']
const CMD_WRONG = 'немного туда'

function FindError() {
  const [pick, setPick] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  return (
    <div className={s.trainer}>
      <div className={s.trainerHead}>
        <span className={s.trainerNum}>2</span>
        <div>
          <div className={s.trainerTitle}>Найди ошибку в командах исполнителя</div>
          <div className={s.trainerHint}>Исполнитель понимает: вперёд, назад, влево, вправо, взять. Какая команда неточная?</div>
        </div>
      </div>
      <div className={s.optRow}>
        {CMDS.map((c) => {
          const isPick = pick === c
          const cls = checked
            ? c === CMD_WRONG
              ? s.optRight
              : isPick
                ? s.optWrong
                : ''
            : isPick
              ? s.optActive
              : ''
          return (
            <button
              key={c}
              className={`${s.opt} ${cls}`}
              onClick={() => {
                setPick(c)
                setChecked(false)
              }}
            >
              {c}
            </button>
          )
        })}
      </div>
      <div className={s.actions}>
        <button className={s.btnCheck} onClick={() => setChecked(true)} disabled={!pick}>
          Проверить
        </button>
        {checked && (
          <span className={pick === CMD_WRONG ? s.fbOk : s.fbNo}>
            {pick === CMD_WRONG
              ? '✓ Верно! «немного туда» — неточная команда, исполнитель её не поймёт.'
              : '✗ Ошибочная команда — «немного туда»: она неточная и не входит в набор исполнителя.'}
          </span>
        )}
      </div>
    </div>
  )
}

/* ============ 3. Условие или цикл? ============ */
const SITUATIONS: { text: string; answer: 'cond' | 'loop' }[] = [
  { text: 'Если пароль правильный — открыть доступ', answer: 'cond' },
  { text: 'Повторить команду 10 раз', answer: 'loop' },
  { text: 'Пока не достигнут финиш — идти вперёд', answer: 'loop' },
  { text: 'Если идёт дождь — взять зонт', answer: 'cond' },
]

function ConditionOrLoop() {
  const [picks, setPicks] = useState<Record<number, 'cond' | 'loop'>>({})
  const [checked, setChecked] = useState(false)
  const allAnswered = Object.keys(picks).length === SITUATIONS.length
  const score = SITUATIONS.filter((sit, i) => picks[i] === sit.answer).length

  return (
    <div className={s.trainer}>
      <div className={s.trainerHead}>
        <span className={s.trainerNum}>3</span>
        <div>
          <div className={s.trainerTitle}>Условие или цикл?</div>
          <div className={s.trainerHint}>Отнеси каждую ситуацию к нужной конструкции.</div>
        </div>
      </div>
      <div className={s.classifyList}>
        {SITUATIONS.map((sit, i) => {
          const pick = picks[i]
          const correct = checked && pick === sit.answer
          const wrong = checked && pick && pick !== sit.answer
          return (
            <div
              key={i}
              className={`${s.classifyRow}${correct ? ' ' + s.stepRight : ''}${wrong ? ' ' + s.stepWrong : ''}`}
            >
              <span className={s.classifyText}>{sit.text}</span>
              <span className={s.groupBtns}>
                {(['cond', 'loop'] as const).map((g) => (
                  <button
                    key={g}
                    className={`${s.groupBtn}${pick === g ? ' ' + s.groupBtnOn : ''}`}
                    onClick={() => {
                      setPicks((p) => ({ ...p, [i]: g }))
                      setChecked(false)
                    }}
                  >
                    {g === 'cond' ? 'Условие' : 'Цикл'}
                  </button>
                ))}
              </span>
            </div>
          )
        })}
      </div>
      <div className={s.actions}>
        <button className={s.btnCheck} onClick={() => setChecked(true)} disabled={!allAnswered}>
          Проверить
        </button>
        <button
          className={s.btnReset}
          onClick={() => {
            setPicks({})
            setChecked(false)
          }}
        >
          Сброс
        </button>
        {checked && (
          <span className={score === SITUATIONS.length ? s.fbOk : s.fbNo}>
            {score === SITUATIONS.length
              ? '✓ Отлично! Все 4 верно.'
              : `Верно ${score} из ${SITUATIONS.length}. Подсказка: «если…» — условие, «повторить / пока…» — цикл.`}
          </span>
        )}
      </div>
    </div>
  )
}

/* ============ 4. Мини-проект-конструктор ============ */
const BLOCKS = [
  { id: 'start', label: 'Начало', line: 'начало программы' },
  { id: 'cmd', label: 'Команда', line: 'спросить число у пользователя' },
  { id: 'cond', label: 'Условие', line: 'если число > 0, то ...' },
  { id: 'loop', label: 'Цикл', line: 'повторить, пока ответ неверный' },
  { id: 'result', label: 'Результат', line: 'показать результат' },
]

function MiniProjectConstructor() {
  const [picked, setPicked] = useState<string[]>([])
  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  return (
    <div className={s.trainer}>
      <div className={s.trainerHead}>
        <span className={s.trainerNum}>4</span>
        <div>
          <div className={s.trainerTitle}>Мини-проект-конструктор</div>
          <div className={s.trainerHint}>Выбери блоки — и собери псевдоалгоритм программы.</div>
        </div>
      </div>
      <div className={s.blocks}>
        {BLOCKS.map((b) => (
          <button
            key={b.id}
            className={`${s.blockBtn}${picked.includes(b.id) ? ' ' + s.blockBtnOn : ''}`}
            onClick={() => toggle(b.id)}
          >
            {b.label}
          </button>
        ))}
      </div>
      <pre className={s.pseudo}>
        {picked.length === 0
          ? '// выбери блоки выше'
          : BLOCKS.filter((b) => picked.includes(b.id))
              .map((b, i) => `${i + 1}. ${b.line}`)
              .join('\n')}
      </pre>
    </div>
  )
}

export default function Trainers() {
  return (
    <div className={s.trainers}>
      <p className={s.trainersIntro}>
        Программирование осваивается через действие. Это интерактивные тренажёры из проектируемого
        курса — их можно пройти прямо здесь.
      </p>
      <BuildAlgorithm />
      <FindError />
      <ConditionOrLoop />
      <MiniProjectConstructor />
    </div>
  )
}
