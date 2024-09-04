import { Button } from "@/components/ui/button";
import { columns } from "./[courseId]/_component/columns";
import { DataTable } from "./[courseId]/_component/data-table";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
const TeacherPage = async () => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }
  const courses = await db.course.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <div className="p-6">
      <Link href="/teacher/create">
        <Button>Button</Button>
      </Link>
      <DataTable columns={columns} data={courses} />
    </div>
  );
};
export default TeacherPage;
