import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getStudentProfile } from '@/lib/progress'

export const dynamic = 'force-dynamic'

// GET /api/student → профиль студента
export async function GET() {
  const profile = await getStudentProfile()
  return NextResponse.json(profile)
}

// PUT /api/student → обновить профиль (поля частично)
const EDITABLE = ['fullName', 'group', 'university', 'program', 'avatarUrl', 'bio', 'email'] as const

export async function PUT(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }
  const data: Record<string, string> = {}
  for (const key of EDITABLE) {
    if (typeof body[key] === 'string') data[key] = body[key] as string
  }
  await getStudentProfile() // гарантируем существование записи id=1
  const profile = await prisma.studentProfile.update({ where: { id: 1 }, data })
  return NextResponse.json(profile)
}
