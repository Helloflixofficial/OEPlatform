// "use client";
import { db } from "@/lib/db";
import  { Categories } from "./_components/Categories";
const searchPage =  async () => {
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc", 
    },
  });
  return (
    <div className="p-6">
      <Categories items={categories} /><table></table>
    </div>
  );
};

export default searchPage;