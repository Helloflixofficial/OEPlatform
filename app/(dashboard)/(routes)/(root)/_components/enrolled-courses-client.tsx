"use client"

import { useMemo, useState } from 'react'
import { Category } from '@prisma/client'
import { BookOpen, ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  FcEngineering, FcFilmReel, FcMultipleDevices, FcMusic,
  FcOldTimeCamera, FcSalesPerformance, FcSportsMode,
} from 'react-icons/fc'
import { CourseCard } from '@/components/navbarroutes/course-card'

type EnrolledCourse = {
  id: string
  title: string
  imageUrl: string | null
  price: number | null
  progress: number | null
  createdAt: Date | string
  category: { id: string; name: string } | null
  chapters: { id: string }[]
}

const ITEMS_PER_PAGE = 12
const iconMap: Record<string, React.ElementType> = {
  Music: FcMusic,
  Editing: FcFilmReel,
  Fitness: FcSportsMode,
  Painting: FcFilmReel,
  Photography: FcOldTimeCamera,
  Engineering: FcEngineering,
  'Computer Science': FcMultipleDevices,
  'Website Development': FcSalesPerformance,
}

function Filters({ categories, selectedCategoryId, status, onCategory, onStatus, onApply }: {
  categories: Category[]
  selectedCategoryId?: string
  status: 'all' | 'progress' | 'completed'
  onCategory: (id?: string) => void
  onStatus: (value: 'all' | 'progress' | 'completed') => void
  onApply?: () => void
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Categories</p>
        <div className="max-h-[260px] space-y-0.5 overflow-y-auto pr-1">
          <button onClick={() => onCategory()} className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors ${!selectedCategoryId ? 'bg-sky-50 font-semibold text-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            All Categories
          </button>
          {categories.map(category => {
            const Icon = iconMap[category.name]
            const active = selectedCategoryId === category.id
            return (
              <button key={category.id} onClick={() => onCategory(category.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-sky-50 font-semibold text-sky-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                {Icon && <Icon size={17} />}
                <span className="truncate">{category.name}</span>
              </button>
            )
          })}
        </div>

        <p className="mb-2 mt-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">Course Status</p>
        <div className="space-y-1">
          {([
            ['all', 'All enrolled courses'],
            ['progress', 'In progress'],
            ['completed', 'Completed'],
          ] as const).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-gray-600 hover:bg-gray-50">
              <input type="radio" checked={status === value} onChange={() => onStatus(value)} className="h-3.5 w-3.5 accent-sky-600" />
              {label}
            </label>
          ))}
        </div>
      </div>
      {onApply && <div className="border-t border-gray-100 p-4"><button onClick={onApply} className="w-full rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white hover:bg-gray-800">Apply Filters</button></div>}
    </div>
  )
}

export function EnrolledCoursesClient({ items, categories }: { items: EnrolledCourse[]; categories: Category[] }) {
  const [query, setQuery] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>()
  const [status, setStatus] = useState<'all' | 'progress' | 'completed'>('all')
  const [activeTab, setActiveTab] = useState<'popular' | 'recent' | 'trending'>('popular')
  const [sortBy, setSortBy] = useState<'default' | 'progress' | 'title'>('default')
  const [page, setPage] = useState(1)
  const [mobileFilters, setMobileFilters] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = items.filter(item => {
      const matchesQuery = !q || item.title.toLowerCase().includes(q) || item.category?.name.toLowerCase().includes(q)
      const matchesCategory = !selectedCategoryId || item.category?.id === selectedCategoryId
      const progress = item.progress ?? 0
      const matchesStatus = status === 'all' || (status === 'completed' ? progress >= 100 : progress < 100)
      return matchesQuery && matchesCategory && matchesStatus
    })

    return result.sort((a, b) => {
      if (sortBy === 'progress') return (b.progress ?? 0) - (a.progress ?? 0)
      if (sortBy === 'title') return a.title.localeCompare(b.title)
      if (activeTab === 'popular') return (b.chapters?.length ?? 0) - (a.chapters?.length ?? 0)
      if (activeTab === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      return (b.progress ?? 0) - (a.progress ?? 0)
    })
  }, [activeTab, items, query, selectedCategoryId, sortBy, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const resetPage = (callback: () => void) => { callback(); setPage(1) }

  return (
    <section className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
      <aside className="hidden h-full w-60 flex-shrink-0 border-r border-gray-200 bg-white lg:block"><Filters categories={categories} selectedCategoryId={selectedCategoryId} status={status} onCategory={id => resetPage(() => setSelectedCategoryId(id))} onStatus={value => resetPage(() => setStatus(value))} /></aside>

      {mobileFilters && <>
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileFilters(false)} />
        <div className="fixed inset-y-0 left-0 z-[70] flex w-72 flex-col bg-white shadow-2xl lg:hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4 font-bold text-gray-800"><span className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4 text-sky-500" /> Filters</span><button onClick={() => setMobileFilters(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button></div>
          <Filters categories={categories} selectedCategoryId={selectedCategoryId} status={status} onCategory={id => resetPage(() => setSelectedCategoryId(id))} onStatus={value => resetPage(() => setStatus(value))} onApply={() => setMobileFilters(false)} />
        </div>
      </>}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3 pb-4 pt-4 sm:px-6">
        <div className="mb-4 flex flex-shrink-0 flex-col gap-3 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {(['popular', 'recent', 'trending'] as const).map(tab => <button key={tab} onClick={() => resetPage(() => setActiveTab(tab))} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${activeTab === tab ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-900'}`}>{tab}</button>)}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" /><input value={query} onChange={event => resetPage(() => setQuery(event.target.value))} placeholder="Search enrolled courses..." className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-xs transition-all placeholder:text-gray-400 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30" />{query && <button onClick={() => resetPage(() => setQuery(''))} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-100"><X className="h-3 w-3" /></button>}</div>
            <button onClick={() => setMobileFilters(true)} className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:border-sky-300 hover:shadow-sm lg:hidden"><SlidersHorizontal className="h-3.5 w-3.5 text-sky-500" /><span className="hidden sm:inline">Filters</span></button>
          </div>
        </div>

        <div className="mb-3 flex flex-shrink-0 items-center justify-between gap-3 text-xs text-gray-400">
          <span>{filtered.length} {filtered.length === 1 ? 'course' : 'courses'} enrolled{filtered.length > ITEMS_PER_PAGE && ` — Page ${currentPage} of ${totalPages}`}</span>
          <select value={sortBy} onChange={event => resetPage(() => setSortBy(event.target.value as typeof sortBy))} className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 outline-none focus:border-sky-400"><option value="default">Sort: Default</option><option value="progress">Sort: Progress</option><option value="title">Sort: Title</option></select>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {visible.length > 0 ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{visible.map(item => <CourseCard key={item.id} id={item.id} title={item.title} price={item.price} imageUrl={item.imageUrl} progress={item.progress} category={item.category?.name || 'General'} chaptersLength={item.chapters.length} />)}</div> : <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white p-8 py-20 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100"><BookOpen className="h-7 w-7 text-gray-300" /></div><p className="mt-3 text-base font-bold text-gray-700">No enrolled courses match</p><p className="mt-1 text-xs text-gray-400">Try another search or reset the filters.</p><button onClick={() => { setQuery(''); setSelectedCategoryId(undefined); setStatus('all'); setPage(1) }} className="mt-2 text-xs font-semibold text-sky-600 hover:underline">Reset all filters</button></div>}

          {totalPages > 1 && <div className="flex items-center justify-center gap-3 py-8"><button onClick={() => setPage(value => Math.max(1, value - 1))} disabled={currentPage <= 1} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" /> Prev</button><span className="text-xs text-gray-500">{currentPage} / {totalPages}</span><button onClick={() => setPage(value => Math.min(totalPages, value + 1))} disabled={currentPage >= totalPages} className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40">Next <ChevronRight className="h-4 w-4" /></button></div>}
        </div>
      </div>
    </section>
  )
}
