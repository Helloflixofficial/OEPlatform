import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getCourses } from '@/Actions/get-courses'
import { Searchinput } from '@/components/navbarroutes/search-input'
import { SearchClient } from './_components/SearchClient'

interface SearchPageProps {
  searchParams: {
    title: string
    categoryId: string
  }
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId } = auth()
  if (!userId) return redirect('/')

  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })
  const courses = await getCourses({ userId, ...searchParams })

  return (
    <>
      {/* Mobile search bar */}
      <div className="block px-6 pt-6 md:hidden md:mb-0">
        <Searchinput />
      </div>

      <SearchClient
        categories={categories}
        courses={courses}
        selectedCategoryId={searchParams.categoryId}
        selectedTitle={searchParams.title}
      />
    </>
  )
}

export default SearchPage
