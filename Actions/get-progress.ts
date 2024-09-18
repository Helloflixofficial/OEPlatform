import { db } from "@/lib/db";

export const getProgress = async (
userId : string,
courseId:string
): Promise<number> => {
   try { 
    const publishedChapter = await db.chapter.findMany({
        where:{
            courseId: courseId,
            isPublished : true,
        },
        select: {
            id: true,
        }
    })

    const publishedChapterids = publishedChapter.map((chapter) => chapter.id);
    const validCompleteChapter = await db.userProgress.count({
        where: {
            userId :userId,
            chapterId :{
                in : publishedChapterids
            },
            isCompleted: true,
        }
    })
    const ProgressPercentage = (validCompleteChapter / publishedChapterids.length) * 100;
    return ProgressPercentage ;
    
   } catch (error) {
    console.log("GET_PROGRESS",error);
    return 0;
    
   }
}