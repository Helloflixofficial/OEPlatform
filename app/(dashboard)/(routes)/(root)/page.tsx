import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { CheckCircle, Clock } from 'lucide-react'
import { getDashboardCourses } from '@/Actions/get-dashboard-courses'
import { getCategories } from '@/lib/catalog'
import { InfoCard } from './_components/info-cards'
import { EnrolledCoursesClient } from './_components/enrolled-courses-client'

export default async function DashboardPage() {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  const [{ completedCourses, coursesInProgress }, categories] = await Promise.all([
    getDashboardCourses(userId),
    getCategories(),
  ])

  return (
    <div className="flex h-[calc(100vh-80px)] min-h-0 flex-col gap-4 overflow-hidden p-4 sm:p-6">
      <div className="grid flex-shrink-0 grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard
          icon={Clock}
          label="In Progress"
          numberOfItems={coursesInProgress.length}
        />

        <InfoCard
          label="Completed"
          variant="success"
          icon={CheckCircle}
          numberOfItems={completedCourses.length}
        />
      </div>

      <EnrolledCoursesClient items={[...completedCourses, ...coursesInProgress]} categories={categories} />
    </div>
  )
}
