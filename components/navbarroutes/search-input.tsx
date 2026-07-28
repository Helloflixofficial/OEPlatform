"use client"
import { useState, useEffect } from "react"
import { SearchIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use.debounce"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import qs from "query-string"
export const Searchinput = () => {
  const [value, setValue] = useState("")
  const debounceVlaue = useDebounce(value)
  const searchParamas = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentCategoryId = searchParamas.get("categoryId")

  useEffect(() => {
    const url = qs.stringifyUrl({
      url: pathname,
      query: {
        CategoriesId: currentCategoryId,
        title: debounceVlaue
      }
    }, { skipEmptyString: true, skipNull: true })
    router.push(url)
  }, [debounceVlaue, currentCategoryId, router, pathname])
  return (
    <div className="relative ">
      <SearchIcon className="h-4 w-4 absolute top-3 left-3 text-slate-600" />
      <Input onChange={(e) =>
        setValue(e.target.value)
      } value={value} className="w-full  md:w-[300px] pl-9 rounded-full bg-slate-100 focus-visible: ring-slate-200"
        placeholder="Seach courses" />
    </div>
  )
}