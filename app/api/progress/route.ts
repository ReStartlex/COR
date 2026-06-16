import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

// GET /api/progress?subject=<slug> → { statuses: { taskId: status } }
export async function GET(req: Request) {
  const subject = new URL(req.url).searchParams.get('subject')
  if (!subject) return NextResponse.json({ error: 'subject required' }, { status: 400 })
  const rows = await prisma.taskProgress.findMany({ where: { subjectSlug: subject } })
  const statuses: Record<string, string> = {}
  for (const r of rows) statuses[r.taskId] = r.status
  return NextResponse.json({ statuses })
}

// POST /api/progress  { subjectSlug, taskId, read } → отметить «прочитано»/«не прочитано»
export async function POST(req: Request) {
  let body: { subjectSlug?: string; taskId?: string; read?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const { subjectSlug, taskId, read } = body
  if (!subjectSlug || !taskId) {
    return NextResponse.json({ error: 'subjectSlug и taskId обязательны' }, { status: 400 })
  }
  const status = read ? 'read' : 'not_started'
  const row = await prisma.taskProgress.upsert({
    where: { subjectSlug_taskId: { subjectSlug, taskId } },
    update: { status, completedAt: read ? new Date() : null },
    create: { subjectSlug, taskId, status, completedAt: read ? new Date() : null },
  })
  return NextResponse.json({ ok: true, taskId: row.taskId, status: row.status })
}
