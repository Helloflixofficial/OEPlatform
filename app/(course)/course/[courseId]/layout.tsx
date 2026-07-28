import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import { db } from '@/lib/db'
import { getProgress } from '@/Actions/get-progress'
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

    const course = await db.course.findUnique({
        where: {
            id: params.courseId,
        },
        include: {
            chapters: {
                where: {
                    isPublished: true,
                },
                include: {
                    userProgress: {
                        where: {
                            userId,
                        },
                    },
                },
                orderBy: {
                    position: 'asc',
                },
            },
        },
    })

    if (!course) return redirect('/')

    const progressCount = await getProgress(userId, course.id)

    return (
        <div className="h-full">
        <div className="fixed inset-y-0 z-50 h-[80px] w-full md:pl-80">
                <CourseNavbar course={course} progressCount={progressCount} />
            </div>

            <div className="fixed inset-y-0 z-50 hidden h-full w-80 flex-col md:flex">
                <CourseSidebar course={course} progressCount={progressCount} />
            </div>

            <main className="min-h-screen bg-[#f5f7fb] pt-[80px] md:pl-80">{children}</main>
        </div>
    )
}
