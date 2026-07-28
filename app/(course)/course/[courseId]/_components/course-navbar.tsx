import { Chapter, Course, UserProgress } from '@prisma/client'

import { NavbarRoutes } from '@/components/navbarroutes/navbar-routes'
import { CourseMobileSidebar } from './course-mobile-sidebar'

interface CourseNavbarProps {
  progressCount: number
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null
    })[]
  }
}

export const CourseNavbar = ({ course, progressCount }: CourseNavbarProps) => {
  return (
    <div className="flex h-full items-center gap-3 border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <div className="hidden min-w-0 md:block"><p className="truncate text-sm font-semibold text-slate-800">Learning space</p><p className="text-[11px] text-slate-400">Work through each lesson at your pace</p></div>
      <NavbarRoutes />
    </div>
  )
}
