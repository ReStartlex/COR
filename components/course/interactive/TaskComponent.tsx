'use client'

import DemoModule from './DemoModule'
import Trainers from './Trainers'
import { MaterialsBank, ConstructiveCheck, AnalyticsDashboard } from './ProjectBlocks'

// Реестр интерактивных компонентов-заданий (meta.task.component → React).
export default function TaskComponent({ name }: { name: string }) {
  switch (name) {
    case 'demo':
      return <DemoModule />
    case 'trainers':
      return <Trainers />
    case 'bank':
      return <MaterialsBank />
    case 'check':
      return <ConstructiveCheck />
    case 'analytics':
      return <AnalyticsDashboard />
    default:
      return null
  }
}
