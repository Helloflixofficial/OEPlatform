import { getDashboardCourses } from "@/Actions/get-dashboard-courses";
import { CoursesList } from "@/components/navbarroutes/courses-list";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { InfoCards } from "./components/info-cards";
import { CheckCircle, Clock } from "lucide-react";


export default async function dashboard() {
  const { userId } = auth()
  if (!userId) {
    redirect("/")
  }

  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId,
  )


  return (
    <div className="padding-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <InfoCards
          icon={Clock}
          label="In Progress"
          numberOfItems={coursesInProgress.length}
        />

        <InfoCards
          label="Completed"
          variant="success"
          icon={CheckCircle}
          numberOfItems={completedCourses.length}
        />

      </div>
      <CoursesList items={[...completedCourses, ...coursesInProgress]} />
    </div>
  );
}
