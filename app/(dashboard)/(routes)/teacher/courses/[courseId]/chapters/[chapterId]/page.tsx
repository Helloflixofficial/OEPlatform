import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";

import { db } from "@/lib/db";
import { Banner } from "@/components/banner";
import { IconBadge } from "@/components/icon-badge";
import { ChapterActions } from "./_components/chapter-action";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterVideoForm } from "./_components/chapter-video-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";

const ChapterIdPage = async ({
  params,
}: {
  params: {
    courseId: string;
    chapterId: string;
  };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      muxData: true,
      course: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!chapter || chapter.course.userId !== userId) {
    return redirect("/");
  }

  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;

  const isCompleted = requiredFields.every(Boolean);

  return (
    <div className="min-h-screen bg-[#fbf8f4] text-[#4d3929]">
      {!chapter.isPublished && (
        <Banner
          variant="warning"
          label="This chapter is unpublished. It will not be visible in the course."
        />
      )}

      <div className="mx-auto max-w-[1500px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className="mb-6 flex items-center text-sm font-bold text-[#80644d] transition hover:text-[#5d422e]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to course setup
            </Link>

            <div className="flex w-full flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-y-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ead7c1] bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#9b6b43]">Course studio</div>
                <h1 className="text-3xl font-black tracking-tight text-[#3f3024] sm:text-4xl">Chapter creation</h1>

                <span className="text-sm text-[#887768]">
                  Complete all fields {completionText}
                </span>
              </div>

              <ChapterActions
                disabled={!isCompleted}
                courseId={params.courseId}
                chapterId={params.chapterId}
                isPublished={chapter.isPublished}
              />
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div className="flex items-center gap-x-3">
              <IconBadge icon={LayoutDashboard} />

              <h2 className="text-xl font-extrabold tracking-tight text-[#4d3929]">Customize your chapter</h2>
            </div>

            <ChapterTitleForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />

            <ChapterDescriptionForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />

            <div>
              <div className="flex items-center gap-x-3">
                <IconBadge icon={Eye} />
                <h2 className="text-xl font-extrabold tracking-tight text-[#4d3929]">Access settings</h2>
              </div>

              <ChapterAccessForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-3">
              <IconBadge icon={Video} />
              <h2 className="text-xl font-extrabold tracking-tight text-[#4d3929]">Add a video</h2>
            </div>

            <ChapterVideoForm
              initialData={chapter}
              courseId={params.courseId}
              chapterId={params.chapterId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;
