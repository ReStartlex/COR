import {
  Layers,
  Workflow,
  BookOpen,
  Target,
  Search,
  Lightbulb,
  ClipboardList,
  PenTool,
  BarChart3,
  Clapperboard,
  Gamepad2,
  FolderOpen,
  ListChecks,
  type LucideIcon,
} from 'lucide-react'
import s from './icons.module.css'

// Карта осмысленных иконок (lucide). Имена — в meta предметов/заданий.
export const ICONS: Record<string, LucideIcon> = {
  layers: Layers,
  workflow: Workflow,
  book: BookOpen,
  target: Target,
  search: Search,
  lightbulb: Lightbulb,
  clipboard: ClipboardList,
  pen: PenTool,
  chart: BarChart3,
  clapperboard: Clapperboard,
  gamepad: Gamepad2,
  folder: FolderOpen,
  checks: ListChecks,
}

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const C = ICONS[name] ?? BookOpen
  return <C size={size} strokeWidth={2} />
}

type SubjectType = 'digital-content' | 'educational-systems' | 'default'

const SUBJECT_ICON: Record<SubjectType, LucideIcon> = {
  'digital-content': Layers,
  'educational-systems': Workflow,
  default: BookOpen,
}

const SUBJECT_CLASS: Record<SubjectType, string> = {
  'digital-content': s.gradDigital,
  'educational-systems': s.gradSystems,
  default: s.gradDefault,
}

// Иконка дисциплины в градиент-карте. Своя ассоциация и градиент на каждый тип.
export function SubjectIcon({
  type = 'default',
  size = 28,
  className = '',
}: {
  type?: SubjectType
  size?: number
  className?: string
}) {
  const C = SUBJECT_ICON[type] ?? BookOpen
  return (
    <span className={`${s.subjectIcon} ${SUBJECT_CLASS[type] ?? s.gradDefault} ${className}`}>
      <C size={size} strokeWidth={1.9} color="#fff" />
    </span>
  )
}
