import Link from 'next/link'
import Image from 'next/image'
import { IconBadge } from '../icon-badge'
import { BookOpen } from 'lucide-react'
import { formatPrice } from '@/lib/formet'

interface CourseCardProps {
  id: string,
  title: string,
  imageUrl: string,
  chaptersLength: number,
  price: number,
  progress: number | null,
  category: string,
}

export const CourseCard = ({ id, title, price, chaptersLength, imageUrl, progress, category }: CourseCardProps) => {
  return (

    <Link href={`/course/${id}`}>
      <div className="h-full p-3 overflow-hidden transition border rounded-lg group hover:shadow-sm">
        <div className="relative w-full overflow-hidden rounded-md aspect-video">
          <Image fill alt={title} src={imageUrl} className="object-cover" />
        </div>


        <div className="flex flex-col pt-2">
          <div className="text-lg font-medium transition md:text-base group-hover:text-sky-700 line-clamp-2">
            {title}
          </div>

          <p className="text-xs text-muted-foreground">{category}</p>
          <div className="flex items-center my-3 text-sm gap-x-2 md:text-xs">
            <div className="flex items-center gap-x-1 text-slate-500">
              <IconBadge size="sm" icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? 'chapter' : 'chapters'}
              </span>
            </div>
          </div>
        </div>


        {progress !== null ? (
          <div>
            TODO : Progress Comonent
          </div>
        ) : (
          <p className='text-md md:text-sm font-medium  text-slate-700'>{formatPrice(price)}</p>
        )}






      </div>
    </Link>

  )
}