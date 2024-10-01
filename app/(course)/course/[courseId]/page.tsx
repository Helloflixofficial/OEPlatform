import { redirect } from 'next/navigation'

import { db } from '@/lib/db'

export default async function courseIdPage({
    params,
}: {
    params: {
        courseId: string
    }
}) {
    const course = await db.course.findUnique({
        where: {
            id: params.courseId,
        },
        include: {
            chapters: {
                where: {
                    isPublished: true,
                },
                orderBy: {
                    position: 'asc',
                },
            },
        },
    })

    if (!course) {
        return redirect('/')
    }

    return redirect(`/course/${course.id}/chapters/${course.chapters[0].id}`)
}





