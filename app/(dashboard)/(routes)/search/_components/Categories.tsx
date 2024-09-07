"use client";
import { Category } from "@prisma/client";
import {
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcMusic,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
} from "react-icons/fc";
import { IconType } from "react-icons";
import { CategoryItems } from "./category-items";
interface categoriesProps {
  items: Category[];
}

const iconMap: Record<Category["name"], IconType> = {
  Computer_Science: FcMultipleDevices,
  Website_Development: FcSalesPerformance,
  Music: FcMusic,
  Fitness: FcSportsMode,
  Painting: FcFilmReel,
  Photography: FcOldTimeCamera,
  Engineering: FcEngineering,
};
export const Categories = ({ items }: categoriesProps) => {
  return (
    <div className="flex pb-2 items-center overflow-x-auto gap-x-2">
      {items.map((item) => (
        <CategoryItems
          key={item.id}
          lable={item.name}
          icon={iconMap[item.name]}
          value={item.id}
        />
      ))}
    </div>
  );
};
