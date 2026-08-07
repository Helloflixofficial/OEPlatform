'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Lock, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CourseSidebarItemProps {
  id: string
  label: string
  courseId: string
  isLocked: boolean
  isCompleted: boolean
}

export const CourseSidebarItem = ({
  id,
  label,
  courseId,
  isLocked,
  isCompleted,
}: CourseSidebarItemProps) => {
  const pathname = usePathname()

  const Icon = isLocked ? Lock : isCompleted ? CheckCircle : PlayCircle
  const isActive = pathname?.includes(id)

  return (
    <Link
      href={`/course/${courseId}/chapters/${id}`}
      prefetch
      className={cn(
        'group flex w-full items-start gap-x-2 border-l-2 border-transparent px-5 py-3 text-left text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-slate-900',
        isActive &&
        'border-sky-600 bg-sky-50 text-slate-900',
        isCompleted && 'text-emerald-700',
      )}
    >
      <div className="flex min-w-0 items-start gap-x-2">
        <Icon
          size={18}
          className={cn(
            'mt-0.5 flex-shrink-0 text-slate-400',
            isActive && 'text-sky-700',
            isCompleted && 'text-emerald-700',
          )}
        />
        <span className="line-clamp-2 leading-5">{label}</span>
      </div>
    </Link>
  )
}
