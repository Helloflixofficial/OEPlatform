import { auth } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _req: Request,
  { params }: { params: { courseId: string; attachmentId: string } },
) {
  try {
    const { userId } = auth()
    if (!userId) return new NextResponse('Unauthorized', { status: 401 })

    const attachment = await db.attachment.findUnique({
      where: { id: params.attachmentId, courseId: params.courseId },
      include: { course: { select: { userId: true } } },
    })
    if (!attachment) return new NextResponse('File not found', { status: 404 })

    const purchase = await db.purchase.findUnique({
      where: { userId_courseId: { userId, courseId: params.courseId } },
      select: { id: true },
    })
    const isOwner = attachment.course.userId === userId
    if (!purchase && !isOwner) return new NextResponse('Forbidden', { status: 403 })

    const fileResponse = await fetch(attachment.url)
    if (!fileResponse.ok || !fileResponse.body) {
      return new NextResponse('Unable to download file', { status: 502 })
    }

    const filename = (attachment.name || 'course-file').replace(/[^a-zA-Z0-9._() -]/g, '_')
    const headers = new Headers()
    headers.set('Content-Type', fileResponse.headers.get('content-type') || 'application/octet-stream')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    const length = fileResponse.headers.get('content-length')
    if (length) headers.set('Content-Length', length)

    return new NextResponse(fileResponse.body, { headers })
  } catch (error) {
    console.error('[ATTACHMENT_DOWNLOAD]', error)
    return new NextResponse('Unable to download file', { status: 500 })
  }
}
