import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { BookOpen, ListVideo } from 'lucide-react'
import { Chapter, Course, UserProgress } from '@prisma/client'

import { db } from '@/lib/db'
import { CourseSidebarItem } from './course-sidebar-item'
import { CourseProgress } from '@/components/course-progress'

interface CourseSidebarProps {
  progressCount: number
  course: Course & { chapters: (Chapter & { userProgress: UserProgress[] | null })[] }
}

export const CourseSidebar = async ({ course, progressCount }: CourseSidebarProps) => {
  const { userId } = auth()
  if (!userId) return redirect('/')

  const purchase = await db.purchase.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  })

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex-shrink-0 border-b border-slate-200 px-6 py-6">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-600">
          <BookOpen className="h-4 w-4" /> Course content
        </div>
        <h1 className="line-clamp-3 text-lg font-bold leading-snug text-slate-900">{course.title}</h1>
        <p className="mt-2 text-xs text-slate-500">{course.chapters.length} lessons</p>
        {purchase && <div className="mt-5"><CourseProgress variant="success" value={progressCount} size="sm" /></div>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-3">
        <div className="flex items-center gap-2 px-6 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400"><ListVideo className="h-3.5 w-3.5" /> Lessons</div>
        {course.chapters.map(chapter => (
          <CourseSidebarItem
            id={chapter.id}
            key={chapter.id}
            courseId={course.id}
            label={chapter.title}
            isLocked={!chapter.isFree && !purchase}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
          />
        ))}
      </div>
    </div>
  )
}
