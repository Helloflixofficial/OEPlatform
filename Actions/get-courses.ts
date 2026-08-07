import { db } from '@/lib/db'

type CourseWithProgressWithCategory = {
    id: string
    title: string
    imageUrl: string | null
    price: number | null
    progress: number | null
    category: { id: string; name: string } | null
    chapters: {
        id: string
    }[]
}

type GetCourses = {
    userId: string
    title?: string
    categoryId?: string
}

export const getCourses = async ({
    title,
    userId,
    categoryId,
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
    try {
        const courses = await db.course.findMany({
            where: {
                isPublished: true,
                title: {
                    contains: title,
                    mode: 'insensitive',
                },
                ...(categoryId ? { categoryId } : {}),
            },
            select: {
                id: true,
                title: true,
                imageUrl: true,
                price: true,
                category: { select: { id: true, name: true } },
                chapters: {
                    where: {
                        isPublished: true,
                    },
                    select: {
                        id: true,
                    },
                },
                purchases: {
                    where: {
                        userId,
                    },
                    select: { id: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Batch progress calculation
        const allChapterIds = courses.flatMap(course => course.chapters.map(ch => ch.id))
        const allProgress = await db.userProgress.findMany({
            where: {
                userId,
                chapterId: {
                    in: allChapterIds
                },
                isCompleted: true,
            },
            select: {
                chapterId: true,
            },
        })

        const completedChapterIds = new Set(allProgress.map(progress => progress.chapterId))
        const coursesWithProgress: CourseWithProgressWithCategory[] = courses.map(course => {
            if (course.purchases.length === 0) return { ...course, progress: null }

            const completedCount = course.chapters.reduce(
                (count, chapter) => count + (completedChapterIds.has(chapter.id) ? 1 : 0),
                0,
            )
            const progress = course.chapters.length > 0 ? (completedCount / course.chapters.length) * 100 : 0
            return { ...course, progress }
        })

        return coursesWithProgress
    } catch (error) {
        console.error('[GET_COURSES]', error)
        return []
    }
}
