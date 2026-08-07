import { db } from '@/lib/db'

type DashboardCourse = {
    id: string
    title: string
    imageUrl: string | null
    price: number | null
    createdAt: Date
    category: { id: string; name: string } | null
    chapters: { id: string }[]
    progress: number | null
}

type DashboardCourses = {
    completedCourses: DashboardCourse[]
    coursesInProgress: DashboardCourse[]
}

export const getDashboardCourses = async (
    userId: string,
): Promise<DashboardCourses> => {
    try {
        const purchasedCourses = await db.purchase.findMany({
            where: {
                userId,
            },
            select: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        imageUrl: true,
                        price: true,
                        createdAt: true,
                        category: { select: { id: true, name: true } },
                        chapters: {
                            where: {
                                isPublished: true,
                            },
                            select: { id: true },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const courses = purchasedCourses.map(purchase => ({
            ...purchase.course,
            progress: 0,
        }))

        // Batch progress calculation to avoid N+1 queries
        const allProgress = await db.userProgress.findMany({
            where: {
                userId,
                chapterId: {
                    in: courses.flatMap(course => course.chapters.map(ch => ch.id))
                },
                isCompleted: true,
            },
            select: {
                chapterId: true,
            },
        })

        const completedChapterIds = new Set(allProgress.map(progress => progress.chapterId))
        courses.forEach(course => {
            const completedCount = course.chapters.reduce(
                (count, chapter) => count + (completedChapterIds.has(chapter.id) ? 1 : 0),
                0,
            )
            const publishedChapterIds = course.chapters.map(ch => ch.id)
            const progress = publishedChapterIds.length > 0 ? (completedCount / publishedChapterIds.length) * 100 : 0
            course.progress = progress
        })

        const completedCourses = courses.filter(course => course.progress === 100)
        const coursesInProgress = courses.filter(
            course => (course.progress ?? 0) < 100,
        )

        return {
            completedCourses,
            coursesInProgress,
        }
    } catch (error) {
        console.error('[GET_DASHBOARD_COURSES]', error)
        return {
            completedCourses: [],
            coursesInProgress: [],
        }
    }
}
