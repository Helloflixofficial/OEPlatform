import { Category, Course } from '@prisma/client'

import { db } from '@/lib/db'
import { getProgress } from '@/Actions/get-progress'

type CourseWithProgressWithCategory = Course & {
    progress: number | null
    category: Category | null
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
                category: {
                    id: categoryId,
                },
            },
            include: {
                category: true,
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

        const progressMap = new Map<string, number>()
        courses.forEach(course => {
            if (course.purchases.length === 0) {
                progressMap.set(course.id, 0) // or null, but since type is number | null, but in usage it's number
            } else {
                const publishedChapterIds = course.chapters.map(ch => ch.id)
                const completedCount = allProgress.filter(p => publishedChapterIds.includes(p.chapterId)).length
                const progress = publishedChapterIds.length > 0 ? (completedCount / publishedChapterIds.length) * 100 : 0
                progressMap.set(course.id, progress)
            }
        })

        const coursesWithProgress: CourseWithProgressWithCategory[] = courses.map(course => ({
            ...course,
            progress: course.purchases.length > 0 ? progressMap.get(course.id) || 0 : null,
        }))

        return coursesWithProgress
    } catch (error) {
        console.error('[GET_COURSES]', error)
        return []
    }
}
