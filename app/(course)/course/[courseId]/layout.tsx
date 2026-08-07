import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import { db } from '@/lib/db'
import { CourseNavbar } from './_components/course-navbar'
import { CourseSidebar } from './_components/course-sidebar'

export default async function CourseLayout({
    params,
    children,
}: {
    children: React.ReactNode
    params: { courseId: string }
}) {
    const { userId } = auth()

    if (!userId) return redirect('/')

    const [course, purchase] = await Promise.all([
        db.course.findUnique({
            where: { id: params.courseId },
            include: {
                chapters: {
                    where: { isPublished: true },
                    include: {
                        userProgress: {
                            where: { userId },
                            select: { id: true, userId: true, chapterId: true, isCompleted: true, createdAt: true, updatedAt: true },
                        },
                    },
                    orderBy: { position: 'asc' },
                },
            },
        }),
        db.purchase.findUnique({
            where: { userId_courseId: { userId, courseId: params.courseId } },
            select: { id: true },
        }),
    ])

    if (!course) return redirect('/')

    const completedChapters = course.chapters.reduce(
        (count, chapter) => count + (chapter.userProgress?.[0]?.isCompleted ? 1 : 0),
        0,
    )
    const progressCount = course.chapters.length > 0
        ? (completedChapters / course.chapters.length) * 100
        : 0

    return (
        <div className="h-full">
        <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-80">
                <CourseNavbar course={course} progressCount={progressCount} isPurchased={!!purchase} />
            </div>

            <div className="fixed inset-y-0 z-50 hidden h-full w-80 flex-col md:flex">
                <CourseSidebar course={course} progressCount={progressCount} isPurchased={!!purchase} />
            </div>

            <main className="min-h-screen bg-[#f5f7fb] pt-[80px] md:pl-80">{children}</main>
        </div>
    )
}
