'use client'

import { useState } from 'react'
import s from '../course.module.css'

interface Lesson {
  icon: string
  title: string
  goal: string
  explain: string
  task: string
  answer: string
}

const LESSONS: Lesson[] = [
  {
    icon: '🧠',
    title: 'Урок 1. Что такое алгоритм?',
    goal: 'Понять, что алгоритм — это точная последовательность действий.',
    explain: 'Алгоритм встречается повсюду: рецепт, маршрут, инструкция. Главное — правильный порядок шагов.',
    task: 'Расставь шаги алгоритма «Отправить сообщение»: Нажать «Отправить» · Открыть приложение · Выбрать получателя · Написать текст.',
    answer: 'Открыть приложение → Выбрать получателя → Написать текст → Нажать «Отправить».',
  },
  {
    icon: '🤖',
    title: 'Урок 2. Команды и исполнитель',
    goal: 'Понять связь алгоритма и программы; исполнитель выполняет только точные команды.',
    explain: 'Исполнитель (человек, робот, программа) действует строго по инструкции. Команды должны быть точными.',
    task: 'Исполнитель умеет: вперёд, назад, влево, вправо, взять. Составь путь до предмета.',
    answer: 'Например: вперёд → вперёд → вправо → вперёд → взять.',
  },
  {
    icon: '🔁',
    title: 'Урок 3. Условия и циклы',
    goal: 'Познакомиться с условием (выбор) и циклом (повторение).',
    explain: 'Условие выбирает действие по ситуации, цикл повторяет действие нужное число раз.',
    task: 'Определи: «Если пароль верный — открыть доступ» и «Повторить 5 раз: шаг вперёд».',
    answer: 'Первое — условие, второе — цикл.',
  },
  {
    icon: '🏁',
    title: 'Урок 4. Итоговый мини-проект',
    goal: 'Применить изученное и создать простой цифровой продукт.',
    explain: 'Ученик планирует алгоритм, использует команды, условие или цикл и объясняет, как работает программа.',
    task: 'Создай программу «Угадай число»: компьютер загадывает число, пользователь угадывает.',
    answer: 'Цикл «пока не угадано» + условие «если больше/меньше» + результат «угадал!».',
  },
]

function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  const [done, setDone] = useState(false)
  return (
    <div className={`${s.lessonCard}${done ? ' ' + s.lessonDone : ''}`}>
      <div className={s.lessonTop}>
        <span className={s.lessonIcon}>{lesson.icon}</span>
        <span className={done ? s.lessonStatusDone : s.lessonStatus}>
          {done ? '✓ Пройдено' : `Урок ${index + 1}`}
        </span>
      </div>
      <h4 className={s.lessonTitle}>{lesson.title}</h4>
      <div className={s.lessonGoal}>
        <strong>Цель:</strong> {lesson.goal}
      </div>
      <p className={s.lessonExplain}>{lesson.explain}</p>

      {done ? (
        <div className={s.lessonReveal}>
          <div className={s.lessonTask}>
            <strong>Мини-задание.</strong> {lesson.task}
          </div>
          <div className={s.lessonAnswer}>
            <strong>Решение:</strong> {lesson.answer}
          </div>
        </div>
      ) : (
        <button className={s.lessonBtn} onClick={() => setDone(true)}>
          Попробовать →
        </button>
      )}
    </div>
  )
}

export default function DemoModule() {
  const [doneAll, setDoneAll] = useState(false)
  return (
    <div>
      <p className={s.trainersIntro}>
        Демонстрация того, как мог бы выглядеть проектируемый раздел онлайн-курса
        «Основы алгоритмизации и первые шаги в программировании» для школьников 5–8 классов.
      </p>
      <div className={s.lessonGrid} key={doneAll ? 'r' : 'n'}>
        {LESSONS.map((l, i) => (
          <LessonCard key={l.title} lesson={l} index={i} />
        ))}
      </div>
      <button className={s.btnReset} style={{ marginTop: '1rem' }} onClick={() => setDoneAll((v) => !v)}>
        Сбросить уроки
      </button>
    </div>
  )
}
