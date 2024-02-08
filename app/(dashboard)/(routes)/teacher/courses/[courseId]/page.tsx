import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "./_component/title-form";
import { DescriptionForm } from "./_component/description-form";
import { ImageForm } from "./_component/image-form";
import { CategoryForm } from "./_component/category-form";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  // userId verifying
  const userId = auth();
  if (!userId) {
    return;
    redirect("/");
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

console.log(categories)

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
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-slate-700 ">
            Completed Task{completedData}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1  md:grid-cols-2 gap-6 mt-16">
        <div className="flex items-center gap-x-2">
          <IconBadge icon={LayoutDashboard} />
          <h2 className="text-xl">CUSTOMIZE YOUR CODE HERE</h2>
        </div>
        <TitleForm initialData={course} courseId={course.id} />
        <DescriptionForm initialData={course} courseId={course.id} />
        <ImageForm initialData={course} courseId={course.id} />
    <CategoryForm initialData={course} courseId={course.id} options={categories.map((categories)=> ({
      label:categories.name,
      value:categories.id
    }))}/>
      </div>
    </div>
  );
};
export default CourseIdPage;
