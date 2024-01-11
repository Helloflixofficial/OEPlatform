import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
    // userId verifying
  const userId = auth();
  if (!userId) {
    return;
    redirect("/");
  }

  //course id verifying
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
  });
  if (!course) {
    return redirect("/");
  }

const requireFields = [
    course.title,
    course.imageUrl,
    course.description,
    course.price,
    course.categoryId
]


  return <div>course Id is = {params.courseId}</div>;
};
export default CourseIdPage;
