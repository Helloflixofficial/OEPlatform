'use client'
import axios from 'axios'
import { useState } from 'react'
import type { CSSProperties } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, Lock } from 'lucide-react'
import MuxPlayer from '@mux/mux-player-react'
import { cn } from '@/lib/utils'
import { useConfettiStore } from '@/hooks/use-confetti-store'

interface VideoPlayerProps {
  title: string
  courseId: string
  isLocked: boolean
  chapterId: string
  playbackId: string
  completeOnEnd: boolean
  nextChapterId?: string
}

export const VideoPlayer = ({
  title,
  isLocked,
  courseId,
  chapterId,
  playbackId,
  completeOnEnd,
  nextChapterId,
}: VideoPlayerProps) => {
  const router = useRouter()
  const { onOpen } = useConfettiStore()
  const [isReady, setIsReady] = useState(false)
  const onEnded = async () => {
    try {
      toast.loading('Updating progress...', {
        id: 'progress-toast',
      })

      if (completeOnEnd) await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, { isCompleted: true })

      if (!nextChapterId) {
        toast.success('Course completed!')
        onOpen()
      }

      toast.success('Progress updated')
      router.refresh()

      if (nextChapterId) router.push(`/course/${courseId}/chapters/${nextChapterId}`)
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      toast.dismiss('progress-toast')
    }
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-950 ring-1 ring-white/10 sm:rounded-2xl">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      )}

      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 gap-y-2 text-secondary">
          <Lock className="w-8 h-8 text-secondary" />
          <p className="text-sm">This chapter is locked.</p>
        </div>
      )}

      {!isLocked && playbackId && (
        <MuxPlayer
          title={title}
          className={cn('absolute inset-0 block h-full w-full', !isReady && 'hidden')}
          style={{ '--media-object-fit': 'contain', '--media-object-position': 'center' } as CSSProperties}
          onCanPlay={() => setIsReady(true)}
          onEnded={onEnded}
          autoPlay
          playsInline
          playbackId={playbackId}
        />
      )}

      {!isLocked && !playbackId && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 text-slate-300">
          <AlertCircle className="h-8 w-8 text-amber-400" />
          <p className="text-sm">This lesson video is not available yet.</p>
        </div>
      )}
    </div>
  )
}
