"use client";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
interface categoriesProps {
  label: string;
  value?: string;
  icon?: IconType;
}
export const CategoryItems  =  ({
  label,
  value,
  icon: Icon,
}: categoriesProps)  =>  {
  return <button
  className={cn("py-2 px-3 text-sm border border-slate-200 bg-[#F5F5F5] rounded-sm flex items-center gap-x-1 hover:border-sky-950 transition"
     // Change anything if active 
  )}
  type="button">
     {Icon && <Icon size={20} />}
   <div>{label}</div> </button>;
 
};
