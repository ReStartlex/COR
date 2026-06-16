'use client'

import { useReading } from './ReadingProvider'

// Живой счётчик прочитанных заданий (для hero курса).
export function ReadCount() {
  const { readCount } = useReading()
  return <>{readCount}</>
}

// Живой процент прочитанного.
export function ReadPercent() {
  const { percent } = useReading()
  return <>{percent}</>
}
