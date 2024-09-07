"use client";
import { db } from "@/lib/db";
import { Categories } from "./_components/Categories";
const search = () => async () => {
  const category = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
  return (
    <div className="p-6">
      <Categories items={category} />
    </div>
  );
};

export default search;
