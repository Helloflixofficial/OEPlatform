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
    <div className="relative w-full max-w-[420px]">
      <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ae7b4a]" />
      <Input onChange={(e) =>
        setValue(e.target.value)
      } value={value} className="h-11 w-full rounded-xl border-[#e6d4bd] bg-white/85 pl-10 text-sm text-[#3d3026] shadow-sm placeholder:text-[#a49383] focus-visible:border-[#c99a69] focus-visible:ring-2 focus-visible:ring-[#d7b28b]/30"
        placeholder="Search courses" />
    </div>
  )
}
