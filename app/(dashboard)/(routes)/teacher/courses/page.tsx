import { columns } from "./[courseId]/_component/columns";
import { DataTable } from "./[courseId]/_component/data-table";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const TeacherPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  try {
    const courses = await db.course.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return (
      <div className="p-3">
        <DataTable columns={columns} data={courses} />
      </div>
    );
  } catch (error) {
    console.error("[TEACHER_COURSES]", error);
    // Return empty state instead of crashing
    return (
      <div className="p-3">
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Unable to load courses. Please try again.
          </p>
        </div>
      </div>
    );
  }
};

export default TeacherPage;
