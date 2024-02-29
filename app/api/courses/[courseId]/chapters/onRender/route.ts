import { db } from '@/lib/db';
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params, userId }: { params: { courseId: string }, userId: string }
) {
  try {
    const { list } = await req.json();
    const ownCoures = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: userId,
      }
    });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}