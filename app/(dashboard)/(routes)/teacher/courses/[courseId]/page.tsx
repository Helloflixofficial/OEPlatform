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
    course.categoryId,
  ];

  const totalField = requireFields.length;
  const completedField = requireFields.filter(Boolean).length;
  const completedData = `(${completedField}/${totalField})`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-center">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Coures Here</h1>
          <span className="text-slate-700 text-sm ">
            Completed Task{completedData}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1  md:grid-cols-2 gap-6 mt-16">
        <div className="flex items-center gap-x-2">
          <h1 className="text-xl">CUSTOMIZE YOUR CODE HERE</h1>
        </div>
      </div>
    </div>
  );
};
export default CourseIdPage;
