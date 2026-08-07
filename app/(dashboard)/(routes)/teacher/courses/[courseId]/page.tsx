import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import {
  File,
  ListChecks,
  LayoutDashboard,
  CircleDollarSign,
} from "lucide-react";

import { db } from "@/lib/db";
import { getCategories } from "@/lib/catalog";
import { Banner } from "@/components/banner";
import { Actions } from "./_components/actions";
import { IconBadge } from "@/components/icon-badge";
import { TitleForm } from "./_components/title-form";
import { ImageForm } from "./_components/image-form";
import { PriceForm } from "./_components/price-form";
import { CategoryForm } from "./_components/category-form";
import { ChaptersForm } from "./_components/chapters-form";
import { AttachmentForm } from "./_components/attachment-form";
import { DescriptionForm } from "./_components/description-form";

const CourseIdPage = async ({
  params,
}: {
  params: {
    courseId: string;
  };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const [course, categories] = await Promise.all([
    db.course.findUnique({
      where: { userId, id: params.courseId },
      include: {
        attachments: { orderBy: { createdAt: "desc" } },
        chapters: { orderBy: { position: "asc" } },
      },
    }),
    getCategories(),
  ]);

  if (!course || course.userId !== userId) {
    return redirect("/");
  }

  const requiredFields = [
    course.title,
    course.price,
    course.imageUrl,
    course.categoryId,
    course.description,
    course.chapters.some((chapter) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isCompleted = requiredFields.every(Boolean);

  return (
    <div className="min-h-screen bg-[#fbf8f4] text-[#4d3929]">
      {!course.isPublished && (
        <Banner
          variant="warning"
          label="This course is unpublished. It will not be visible in the students."
        />
      )}

      <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ead7c1] bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b6b43]">Course studio</div>
            <h1 className="text-3xl font-black tracking-tight text-[#3f3024] sm:text-4xl">Course setup</h1>

            <span className="text-sm text-[#887768]">
              Complete all fields {completionText}
            </span>
          </div>

          <Actions
            courseId={course.id}
            disabled={!isCompleted}
            isPublished={course.isPublished}
          />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-x-3">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl font-extrabold tracking-tight text-[#4d3929]">Customize your course</h2>
            </div>

            <TitleForm initialData={course} courseId={course.id} />
            <DescriptionForm initialData={course} courseId={course.id} />
            <ImageForm initialData={course} courseId={course.id} />
            <CategoryForm
              initialData={course}
              courseId={course.id}
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-3">
                <IconBadge icon={ListChecks} />

                <h2 className="text-xl font-extrabold tracking-tight text-[#4d3929]">Course chapters</h2>
              </div>

              <ChaptersForm initialData={course} courseId={course.id} />
            </div>

            <div>
              <div className="flex items-center gap-x-3">
                <IconBadge icon={CircleDollarSign} />

                <h2 className="text-xl font-extrabold tracking-tight text-[#4d3929]">Sell your course</h2>
              </div>

              <PriceForm courseId={course.id} initialData={course} />
            </div>

            <div>
              <div className="flex items-center gap-x-3">
                <IconBadge icon={File} />

                <h2 className="text-xl font-extrabold tracking-tight text-[#4d3929]">Resources & Attachments</h2>
              </div>

              <AttachmentForm initialData={course} courseId={course.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;
