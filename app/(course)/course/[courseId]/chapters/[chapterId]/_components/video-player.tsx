'use client'

import axios from 'axios'
import { use, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import MuxPlayer from '@mux/mux-player-react'

import { cn } from '@/lib/utils'
import { useConfettiStore } from '@/hooks/use-confetti-store'
import Router from 'next/router'

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
  const confetti = useConfettiStore();
  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(`/api/courses/${courseId}/chaters/${chapterId}}/progress`, {
          isCompleted: true,
        });

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Progress Updated sire")
        router.refresh();
        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${chapterId}/${nextChapterId}`)
        }

      }
    } catch (error) {
      toast.error("something went Wrong");
    }
  }




  const onEnded = async () => {
    try {
      toast.loading('Updating progress...', {
        id: 'progress-toast',
      })

      if (completeOnEnd) {
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            isCompleted: true,
          },
        )
      }

      if (!nextChapterId) {
        toast.success('Course completed!')
        onOpen()
      }

      toast.success('Progress updated')
      router.refresh()

      if (nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      toast.dismiss('progress-toast')
    }
  }

  return (
    <div className="relative aspect-video">
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

      {!isLocked && (
        <MuxPlayer
          title={title}
          className={cn(!isReady && 'hidden')}
          onCanPlay={() => setIsReady(true)}
          onEnded={onEnd}
          autoPlay
          playbackId={playbackId}
        />
      )}
    </div>
  )
}
