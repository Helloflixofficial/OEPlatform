import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";

const { Video } = new Mux(
  process.env.Mux_TOKEN_ID!,
  process.env.Mux_TOKEN_SECRET!
);

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new Response("UNAUTHRIZED_USER", { status: 401 });
    }
  } catch (error) {
    console.log("COURSE_ID_DELETE", error);
    return new NextResponse("INTERNAL_EROOR", { status: 404 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const values = await req.json();
    if (!userId) {
      return new NextResponse("Unathorized User Found", { status: 401 });
    }

    const course = await db.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: {
        ...values,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.log("[COURSE_ID]", error);
    return new NextResponse("internal Error", { status: 500 });
  }
}
