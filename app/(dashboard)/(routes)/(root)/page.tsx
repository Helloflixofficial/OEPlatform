import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock } from 'lucide-react'
import { getDashboardCourses } from '@/Actions/get-dashboard-courses'
import { InfoCard } from './_components/info-cards'
import { CoursesList } from '@/components/navbarroutes/courses-list'

export default async function DashboardPage() {
  const { userId } = auth()

  if (!userId) {
    return redirect('/')
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId,
  )

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <CoursesList items={[...completedCourses, ...coursesInProgress]} />
    </div>
  )
}
