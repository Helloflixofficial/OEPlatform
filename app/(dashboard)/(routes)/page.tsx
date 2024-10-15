import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs";
import { HomeIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { getDashboardCourses } from "@/Actions/get-progress"
export default function Home() {
  const userId = auth();
  if (!userId) {
    redirect("/")
  }


  const { completedCourses, coursesInProgress } = await getDashboardCourses(
    userId,
  )


  return (
    <div className="flex">
      <Button size="sm" variant="ghost">
        <HomeIcon className="h-4 w-4 mr-2" />
        HOME Sweet Home!
      </Button>
    </div>
  );
}
