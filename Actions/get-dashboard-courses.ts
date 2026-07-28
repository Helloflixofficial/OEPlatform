import { Category, Chapter, Course } from '@prisma/client'

import { db } from '@/lib/db'
import { getProgress } from './get-progress'

type CourseWithProgressWithCategory = Course & {
    category: Category
    chapters: Chapter[]
    progress: number | null
}

type DashboardCourses = {
    completedCourses: CourseWithProgressWithCategory[]
    coursesInProgress: CourseWithProgressWithCategory[]
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
                    include: {
                        category: true,
                        chapters: {
                            where: {
                                isPublished: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const courses = purchasedCourses.map(
            purchase => purchase.course,
        ) as CourseWithProgressWithCategory[]

        // Batch progress calculation to avoid N+1 queries
        const courseIds = courses.map(course => course.id)
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
                chapter: {
                    select: {
                        courseId: true,
                    },
                },
            },
        })

        const progressMap = new Map<string, number>()
        courses.forEach(course => {
            const publishedChapterIds = course.chapters.map(ch => ch.id)
            const completedCount = allProgress.filter(p =>
                publishedChapterIds.includes(p.chapterId) && p.chapter?.courseId === course.id
            ).length
            const progress = publishedChapterIds.length > 0 ? (completedCount / publishedChapterIds.length) * 100 : 0
            progressMap.set(course.id, progress)
        })

        courses.forEach(course => {
            course.progress = progressMap.get(course.id) || 0
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
