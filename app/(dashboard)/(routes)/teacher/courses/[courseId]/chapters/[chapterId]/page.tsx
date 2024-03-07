import { IconBadge } from "@/components/icon-badge";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
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
    },
  });

  if (!chapter) {
    return redirect("/");
  }

  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <div>
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className="flex items-center hover:opacity-75 mb-6 text-sm translate"
            >
              <ArrowLeft className="h-4 w-4 mr-2"></ArrowLeft>
              BACK
            </Link>
            <div className="flex items-center w-full justify-between">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Chapter creation</h1>
                <span className="text-sm text-slate-700">
                  complete all task{completionText}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h1 className="text-xl">Customize Your Chapters</h1>
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
        </div>
      </div>
    </div>
  );
};
export default ChapterIdPage;
