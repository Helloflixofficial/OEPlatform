// "use client";
import { db } from "@/lib/db";
import  { Categories } from "./_components/Categories";
import { Searchinput } from "@/components/navbarroutes/search-input";
const searchPage =  async () => {
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc", 
    },
  });
  return (
    <>
    <div className="px-6 pt-6 md:hidden md:mb-0 block">
      <Searchinput />
    </div> 
    <div className="p-6 ">
      <Categories items={categories} /><table></table>
    </div>
    </>
  );
};
export default searchPage;