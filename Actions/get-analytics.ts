import { db } from "@/lib/db";

const MONTH_COUNT = 6;

export type AnalyticsCourse = {
  id: string;
  title: string;
  category: string;
  price: number;
  isPublished: boolean;
  chapterCount: number;
  publishedChapterCount: number;
  attachmentCount: number;
  sales: number;
  revenue: number;
  learners: number;
  averageProgress: number;
  completionRate: number;
};

export type AnalyticsSnapshot = {
  totalRevenue: number;
  totalSales: number;
  uniqueLearners: number;
  activeLearners: number;
  averageProgress: number;
  completionRate: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalChapters: number;
  publishedChapters: number;
  totalAttachments: number;
  monthly: { label: string; revenue: number; sales: number }[];
  categoryData: { name: string; sales: number; revenue: number; learners: number }[];
  coursePerformance: AnalyticsCourse[];
  lessonActivity: {
    title: string;
    courseTitle: string;
    progressRecords: number;
    completions: number;
    learners: number;
  }[];
  recentSales: { courseTitle: string; amount: number; createdAt: string }[];
};

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const round = (value: number) => Math.round(value * 10) / 10;

export const getAnalytics = async (userId: string): Promise<AnalyticsSnapshot> => {
  try {
    const courses = await db.course.findMany({
      where: { userId },
      include: {
        category: true,
        attachments: { select: { id: true } },
        chapters: {
          select: {
            id: true,
            title: true,
            position: true,
            isPublished: true,
            userProgress: {
              select: {
                userId: true,
                isCompleted: true,
                updatedAt: true,
              },
            },
          },
        },
        purchases: {
          select: {
            userId: true,
            createdAt: true,
          },
        },
      },
    });

    const now = new Date();
    const activeSince = new Date(now);
    activeSince.setDate(activeSince.getDate() - 30);

    const monthly = Array.from({ length: MONTH_COUNT }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (MONTH_COUNT - 1 - index), 1);
      return {
        key: monthKey(date),
        label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date),
        revenue: 0,
        sales: 0,
      };
    });
    const monthlyByKey = new Map(monthly.map((item) => [item.key, item]));

    const allPurchases = courses.flatMap((course) =>
      course.purchases.map((purchase) => ({
        ...purchase,
        courseTitle: course.title,
        amount: course.price ?? 0,
      }))
    );

    const learnerIds = new Set(allPurchases.map((purchase) => purchase.userId));
    const activeLearnerIds = new Set<string>();
    const categoryMap = new Map<string, { sales: number; revenue: number; learners: Set<string> }>();
    const lessonActivity = courses.flatMap((course) =>
      course.chapters.map((chapter) => {
        const progress = chapter.userProgress;
        progress.forEach((item) => {
          if (item.updatedAt >= activeSince) activeLearnerIds.add(item.userId);
        });

        return {
          title: chapter.title,
          courseTitle: course.title,
          progressRecords: progress.length,
          completions: progress.filter((item) => item.isCompleted).length,
          learners: new Set(progress.map((item) => item.userId)).size,
        };
      })
    );

    const coursePerformance: AnalyticsCourse[] = courses.map((course) => {
      const price = course.price ?? 0;
      const sales = course.purchases.length;
      const learners = new Set(course.purchases.map((purchase) => purchase.userId));
      const publishedChapterCount = course.chapters.filter((chapter) => chapter.isPublished).length;
      const chapterCount = publishedChapterCount || course.chapters.length;
      const progressByLearner = Array.from(learners, (learnerId) => {
        const completed = course.chapters.filter((chapter) =>
          chapter.userProgress.some((item) => item.userId === learnerId && item.isCompleted)
        ).length;
        return chapterCount ? (completed / chapterCount) * 100 : 0;
      });
      const averageProgress = progressByLearner.length
        ? progressByLearner.reduce((sum, progress) => sum + progress, 0) / progressByLearner.length
        : 0;

      const category = course.category?.name || "General";
      const categoryStats = categoryMap.get(category) || { sales: 0, revenue: 0, learners: new Set<string>() };
      categoryStats.sales += sales;
      categoryStats.revenue += sales * price;
      learners.forEach((learnerId) => categoryStats.learners.add(learnerId));
      categoryMap.set(category, categoryStats);

      return {
        id: course.id,
        title: course.title,
        category,
        price,
        isPublished: course.isPublished,
        chapterCount: course.chapters.length,
        publishedChapterCount,
        attachmentCount: course.attachments.length,
        sales,
        revenue: sales * price,
        learners: learners.size,
        averageProgress: round(averageProgress),
        completionRate: round(progressByLearner.filter((progress) => progress >= 100).length / Math.max(progressByLearner.length, 1) * 100),
      };
    });

    allPurchases.forEach((purchase) => {
      const month = monthlyByKey.get(monthKey(purchase.createdAt));
      if (!month) return;
      month.sales += 1;
      month.revenue += purchase.amount;
    });

    const averageProgress = coursePerformance.reduce(
      (sum, course) => sum + course.averageProgress * course.sales,
      0
    ) / Math.max(allPurchases.length, 1);
    const completedEnrollments = coursePerformance.reduce(
      (sum, course) => sum + Math.round((course.completionRate / 100) * course.learners),
      0
    );

    return {
      totalRevenue: allPurchases.reduce((sum, purchase) => sum + purchase.amount, 0),
      totalSales: allPurchases.length,
      uniqueLearners: learnerIds.size,
      activeLearners: activeLearnerIds.size,
      averageProgress: round(averageProgress),
      completionRate: round(completedEnrollments / Math.max(allPurchases.length, 1) * 100),
      totalCourses: courses.length,
      publishedCourses: courses.filter((course) => course.isPublished).length,
      draftCourses: courses.filter((course) => !course.isPublished).length,
      totalChapters: courses.reduce((sum, course) => sum + course.chapters.length, 0),
      publishedChapters: courses.reduce(
        (sum, course) => sum + course.chapters.filter((chapter) => chapter.isPublished).length,
        0
      ),
      totalAttachments: courses.reduce((sum, course) => sum + course.attachments.length, 0),
      monthly: monthly.map(({ key: _key, ...item }) => ({ ...item, revenue: round(item.revenue) })),
      categoryData: Array.from(categoryMap.entries())
        .map(([name, stats]) => ({ name, sales: stats.sales, revenue: round(stats.revenue), learners: stats.learners.size }))
        .sort((a, b) => b.sales - a.sales),
      coursePerformance: coursePerformance.sort((a, b) => b.sales - a.sales || b.revenue - a.revenue),
      lessonActivity: lessonActivity
        .sort((a, b) => b.learners - a.learners || b.completions - a.completions)
        .slice(0, 8),
      recentSales: allPurchases
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 8)
        .map((purchase) => ({
          courseTitle: purchase.courseTitle,
          amount: purchase.amount,
          createdAt: purchase.createdAt.toISOString(),
        })),
    };
  } catch (error) {
    console.log("GET_ANALYTICS", error);
    return {
      totalRevenue: 0,
      totalSales: 0,
      uniqueLearners: 0,
      activeLearners: 0,
      averageProgress: 0,
      completionRate: 0,
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      totalChapters: 0,
      publishedChapters: 0,
      totalAttachments: 0,
      monthly: [],
      categoryData: [],
      coursePerformance: [],
      lessonActivity: [],
      recentSales: [],
    };
  }
};
