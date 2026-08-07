import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";

export const getCategories = unstable_cache(
  async () => db.category.findMany({ orderBy: { name: "asc" } }),
  ["course-categories"],
  { revalidate: 300 },
);
