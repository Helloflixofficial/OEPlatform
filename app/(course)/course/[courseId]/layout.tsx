import { auth } from "@clerk/nextjs"
import { db } from "@/lib/db"
import { redirect } from "next/navigation";
const courseLayout = async ({ children, Params }: {
    children: React.ReactNode; Params: { courseId: String }
}) => {

    const { userId } = auth();
    if (!userId) {
        return redirect("/")
    }
    return (
        <div>this is the data</div>
    )
}
export default courseLayout;