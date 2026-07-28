import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getCourses } from '@/Actions/get-courses'
import { SearchClient } from './_components/SearchClient'

interface SearchPageProps {
  searchParams: {
    title?: string
    categoryId?: string
  }
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { userId } = auth()
  if (!userId) return redirect('/')

  let categories: any[] = []
  let courses: any[] = []

  try {
    categories = await db.category.findMany({ orderBy: { name: 'asc' } })
    courses = await getCourses({ userId })
  } catch (error) {
    console.error('[SEARCH_PAGE_ERROR]', error)
  }

  return (
    <SearchClient
      categories={categories || []}
      courses={courses || []}
      selectedCategoryId={searchParams?.categoryId}
      selectedTitle={searchParams?.title}
    />
  )
}

export default SearchPage
