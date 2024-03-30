import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("unAuthrized user", { status: 401 });
    }

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId,
      },
    });
    if (!userId) {
      return new NextResponse("unAuthrized user", { status: 401 });
    }


  } catch (error) {
    console.log("error Found Here in Folder call Publish");
    return new NextResponse("server not found path", { status: 500 });
  }
}
