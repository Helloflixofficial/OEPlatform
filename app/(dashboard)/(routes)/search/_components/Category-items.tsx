"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import queryString from "query-string";
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

const pathname = usePathname()
const router = useRouter();
const searchparams = useSearchParams();
const currentCategoryId = searchparams.get("categoryId");
const currenTitle = searchparams.get("title");
const isSelected = currentCategoryId === value;
const onClick = () => {
const url = queryString.stringifyUrl({
  url : pathname,
  query: {
    title : currenTitle,
    categoryId : isSelected ? null : value,
  }
},{skipNull:true, skipEmptyString: true})
router.push(url);
}
  return <button  onClick={onClick}
  className={cn("py-2 px-3 text-sm border border-slate-200 bg-[#F5F5F5] rounded-sm flex items-center gap-x-1 hover:border-sky-950 transition", 
    isSelected && "border-sky-700 bg-sky-200/20 text-sky-700"  
    // Change anything if active 
  )}
  type="button">
     {Icon && <Icon size={20} />}
   <div>{label}</div> </button>;
 
};
