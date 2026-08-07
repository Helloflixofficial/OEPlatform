import { Attachment, Chapter } from '@prisma/client'

import { db } from '@/lib/db'

interface GetChapterProps {
    userId: string
    courseId: string
    chapterId: string
}

export const getChapter = async ({
    userId,
    courseId,
    chapterId,
}: GetChapterProps) => {
    try {
        const [purchase, course, chapter] = await Promise.all([
            db.purchase.findUnique({
                where: { userId_courseId: { userId, courseId } },
            }),
            db.course.findUnique({
                where: { id: courseId, isPublished: true },
                select: { price: true },
            }),
            db.chapter.findUnique({
                where: { courseId, id: chapterId, isPublished: true },
            }),
        ])

        if (!chapter || !course) {
            throw new Error('Chapter or course no found')
        }

        const hasAccess = chapter.isFree || !!purchase
        const [userProgress, attachments, muxData, nextChapter] = await Promise.all([
            db.userProgress.findUnique({
                where: { userId_chapterId: { userId, chapterId } },
            }),
            purchase
                ? db.attachment.findMany({ where: { courseId } })
                : Promise.resolve([] as Attachment[]),
            hasAccess
                ? db.muxData.findUnique({ where: { chapterId } })
                : Promise.resolve(null),
            hasAccess
                ? db.chapter.findFirst({
                    where: { courseId, isPublished: true, position: { gt: chapter.position } },
                    orderBy: { position: 'asc' },
                })
                : Promise.resolve(null),
        ])

        return {
            course,
            chapter,
            muxData,
            purchase,
            attachments,
            nextChapter,
            userProgress,
        }
    } catch (error) {
        console.log('[GET_CHAPTER]', error)
        return {
            course: null,
            chapter: null,
            muxData: null,
            attachments: [],
            purchased: false,
            nextChapter: null,
            userProgress: null,
        }
    }
}
