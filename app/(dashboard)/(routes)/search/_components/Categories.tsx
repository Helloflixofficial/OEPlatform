"use client";
import { Category} from "@prisma/client";
import { CategoryItems } from "./Category-items";
import { IconType } from "react-icons";
import {
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcMusic,
  FcOldTimeCamera,
  FcSalesPerformance,
  FcSportsMode,
} from "react-icons/fc";


interface CategoriesProps {
  items: Category[];
}

const iconMap: Record<Category["name"], IconType> = {
    "Music":FcMusic,
    "Editing": FcFilmReel,
    "Fitness" : FcSportsMode,
    "Painting":  FcFilmReel,
    "Photography" : FcOldTimeCamera,
    "Engineering" : FcEngineering,
    "Computer Science":  FcMultipleDevices,
    "Website Development":FcSalesPerformance,

};

export const  Categories = ({ items }:  CategoriesProps) =>  {
  return (
    <div className="flex pb-2 items-center overflow-x-auto gap-x-2">
      {items.map((item) => (
        <CategoryItems
          key={item.id}
          label={item.name}
          icon={iconMap[item.name]}
          value={item.id}
        />
      ))}
    </div>
  );
};
