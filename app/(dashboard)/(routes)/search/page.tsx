import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { getCourses } from '@/Actions/get-courses'
import { getCategories } from '@/lib/catalog'
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
    ;[categories, courses] = await Promise.all([
      getCategories(),
      getCourses({ userId, title: searchParams?.title, categoryId: searchParams?.categoryId }),
    ])
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
