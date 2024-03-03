import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

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

  const requireFields = [
    chapter?.title,
    chapter?.description,
    chapter?.videoUrl,
  ];

  const totleFeild = requireFields.length;
  const completedFeild = requireFields.filter(Boolean).length;

  const completionText = `(${completedFeild}/${totleFeild})`;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="w-full">
          <div>
            <Link
              href={`/teacher/course/${params.courseId}`}
              className="flex items-center hover:opacity-75 mb-6 text-sm translate"
            >
              <ArrowLeft className="h-4 w-4 mr-2"></ArrowLeft>
              BACK TO COURSE SETUP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChapterIdPage;
