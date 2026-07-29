import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CourseManagement, TeacherCourse } from "./_components/course-management";

const TeacherPage = async () => {
  const { userId } = auth();

  if (!userId) return redirect("/");

  try {
    const courses = await db.course.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        category: { select: { name: true } },
        chapters: { select: { id: true, isPublished: true } },
        attachments: { select: { id: true } },
        purchases: { select: { id: true, userId: true } },
      },
    });

    const courseData: TeacherCourse[] = courses.map((course) => {
      const requiredFields = [
        Boolean(course.title),
        Boolean(course.price),
        Boolean(course.imageUrl),
        Boolean(course.categoryId),
        Boolean(course.description),
        course.chapters.some((chapter) => chapter.isPublished),
      ];

      return {
        ...course,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        completedFields: requiredFields.filter(Boolean).length,
        totalFields: requiredFields.length,
        isReadyToPublish: requiredFields.every(Boolean),
      };
    });

    return <CourseManagement courses={courseData} />;
  } catch (error) {
    console.error("[TEACHER_COURSES]", error);
    return (
      <div className="flex min-h-full items-center justify-center bg-[#FBF6EE] p-6">
        <div className="rounded-2xl border border-[#eadbc9] bg-white p-8 text-center shadow-sm"><p className="font-bold text-[#4b3829]">Unable to load your courses</p><p className="mt-1 text-sm text-[#927b65]">Please refresh the page and try again.</p></div>
      </div>
    );
  }
};

export default TeacherPage;
