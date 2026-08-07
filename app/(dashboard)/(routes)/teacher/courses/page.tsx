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
      <div className="min-h-screen bg-[#fbf8f4] px-4 pb-12 pt-6 text-[#4d3929] sm:px-6 lg:px-8">
        <DataTable columns={columns} data={courses} />
      </div>
    );
  } catch (error) {
    console.error("[TEACHER_COURSES]", error);
    // Return empty state instead of crashing
    return (
      <div className="min-h-screen bg-[#fbf8f4] px-4 pb-12 pt-6 text-[#4d3929] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1500px] rounded-2xl border border-[#eadfd3] bg-white p-10 text-center shadow-[0_8px_30px_rgba(113,83,52,0.05)]">
          <p className="text-sm text-[#8d7967]">
            Unable to load courses. Please try again.
          </p>
        </div>
      </div>
    );
  }
};

export default TeacherPage;
