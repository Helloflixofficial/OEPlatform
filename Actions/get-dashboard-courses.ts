import { db } from '@/lib/db';
import { Category, Chapter, Course } from '@prisma/client';
import { getProgress } from '@/Actions/get-progress';

type CourseWithProcessWithCategory = Course & {
    category: Category;
    chapters: Chapter[];
    Progress: number | null;
}

type DashboardProps = {
    completedCourses: CourseWithProcessWithCategory[];
    coursesInProgress: CourseWithProcessWithCategory[];
}

export const getDashboardCourses = async (userId: string): Promise<DashboardProps> => {
    try {
        const PurchaseCourses = await db.purchase.findMany({
            where: {
                userId: userId,
            },
            select: {
                course: {
                    include: {
                        category: true,
                        chapters: {
                            where: {
                                isPublished: true,
                            }
                        }
                    }
                }
            }
        })

        const courses = PurchaseCourses.map((purchase) => purchase.course) as CourseWithProcessWithCategory[];
        for (let course of courses) {
            const Progress = await getProgress(userId, course.id);
            course["Progress"] = Progress;
        }

        const completedCourses = courses.filter((course) => course.Progress === 100);
        const coursesInProgress = courses.filter((course) => (course.Progress ?? 0) < 100);

        return {
            completedCourses,
            coursesInProgress,
        }
    } catch (error) {
        console.log("[Get_dashboard_error]", error);
        return {
            completedCourses: [],
            coursesInProgress: [],
        }
    }

}