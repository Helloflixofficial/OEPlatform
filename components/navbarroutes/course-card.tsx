import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Clock, Star, Users } from 'lucide-react'
import { formatPrice } from '@/lib/formet'

interface CourseCardProps {
  id: string
  title: string
  imageUrl: string | null
  chaptersLength: number
  price: number | null
  progress: number | null
  category: string
}

export const CourseCard = ({ id, title, price, chaptersLength, imageUrl, progress, category }: CourseCardProps) => {
  const seed = (id.charCodeAt(0) + id.charCodeAt(id.length - 1)) || 1
  const rating = Number((3.8 + (seed % 12) * 0.1).toFixed(1))
  const durationH = 1 + (seed % 8)
  const durationM = (seed * 7) % 60
  const students = (seed * 13 + 40) % 900 + 100

  return (
    <Link href={`/course/${id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          {imageUrl ? (
            <Image fill alt={title} src={imageUrl} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100">
              <BookOpen className="h-8 w-8 text-sky-300" />
            </div>
          )}
          <span className="absolute left-1.5 top-1.5 rounded-full bg-gray-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white">
            {category || 'Course'}
          </span>
          <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[9px] text-white">
            <Clock className="h-2 w-2" /> {durationH}h {durationM}m
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-1 p-3">
          <div className="line-clamp-2 text-xs font-bold leading-snug text-gray-900 transition-colors group-hover:text-sky-700">
            {title}
          </div>
          <p className="line-clamp-1 flex-1 text-[10px] text-gray-400">
            {chaptersLength} {chaptersLength === 1 ? 'chapter' : 'chapters'} • {category || 'General'}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-0.5"><Users className="h-2.5 w-2.5 text-emerald-500" />{students}</span>
            <span className="flex items-center gap-0.5"><BookOpen className="h-2.5 w-2.5 text-sky-400" />{chaptersLength}</span>
          </div>
          <div className="my-0.5 h-px bg-gray-100" />
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-2.5 w-2.5 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />)}
              <span className="ml-1 text-[10px] font-semibold text-gray-500">{rating.toFixed(1)}</span>
            </div>
            {progress !== null ? (
              <div className="flex flex-col items-end gap-0.5">
                <div className="h-1 w-12 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} /></div>
                <span className="text-[9px] font-semibold text-emerald-600">{Math.round(progress)}%</span>
              </div>
            ) : (
              <span className="text-xs font-bold text-gray-900">{price ? formatPrice(price) : <span className="text-[10px] font-bold text-emerald-600">Free</span>}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
