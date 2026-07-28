import Link from 'next/link'
import { ArrowRight, BookOpen, CheckCircle2, Download, ExternalLink, File, FolderOpen } from 'lucide-react'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import { Banner } from '@/components/banner'
import { Preview } from '@/components/preview'
import { getChapter } from '@/Actions/get-chapters'
import { VideoPlayer } from './_components/video-player'
import { CurseEnrollButton } from './_components/curse-enroll-button'
import { CourseProgressButton } from './_components/course-progress-button'

const isSourceFile = (name: string) => /\.(zip|rar|7z|tar|gz|js|jsx|ts|tsx|py|java|c|cpp|html|css|json|md)$/i.test(name)

export default async function ChapterIdPage({
  params,
}: {
  params: { courseId: string; chapterId: string }
}) {
  const { userId } = auth()
  if (!userId) return redirect('/')

  const { course, chapter, muxData, purchase, attachments, nextChapter, userProgress } = await getChapter({
    userId,
    courseId: params.courseId,
    chapterId: params.chapterId,
  })

  if (!course || !chapter) return redirect('/')

  const isLocked = !chapter.isFree && !purchase
  const completeOnEnd = !!purchase && !userProgress?.isCompleted

  return (
    <div className="min-h-full bg-[#f5f7fb]">
      {userProgress?.isCompleted && <Banner variant="success" label="You already completed this chapter." />}
      {isLocked && <Banner variant="warning" label="You need to purchase this course to watch this chapter." />}

      <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-6 sm:py-6 lg:px-10">
        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-slate-500">
          <BookOpen className="h-4 w-4 text-sky-600" />
          <span className="truncate">Course learning space</span>
          <span className="text-slate-300">/</span>
          <span className="truncate text-slate-700">{chapter.title}</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#172236] p-2 sm:p-4 lg:p-5">
            <VideoPlayer
              isLocked={isLocked}
              title={chapter.title}
              courseId={params.courseId}
              chapterId={params.chapterId}
              completeOnEnd={completeOnEnd}
              nextChapterId={nextChapter?.id}
              playbackId={muxData?.playbackId || ''}
            />
          </div>

          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-5 sm:px-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-sky-600">Current lesson</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">{chapter.title}</h1>
            </div>
            {purchase ? (
              <CourseProgressButton courseId={params.courseId} chapterId={params.chapterId} nextChapterId={nextChapter?.id} isCompleted={!!userProgress?.isCompleted} />
            ) : (
              <CurseEnrollButton price={course.price!} courseId={params.courseId} />
            )}
          </div>

          <div className="grid gap-6 p-4 sm:p-7 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
              <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                <h2 className="mb-4 text-lg font-bold text-slate-900">About this lesson</h2>
                <div className="prose prose-slate max-w-none text-sm leading-7">
                  <Preview value={chapter.description || 'No lesson description has been added yet.'} />
                </div>
              </section>

              {!!attachments.length && (
                <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-sky-600" />
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Files & source code</h2>
                      <p className="text-xs text-slate-500">Download the resources attached to this course.</p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {attachments.map(attachment => (
                      <div key={attachment.id} className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-sky-300 hover:bg-sky-50">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700"><File className="h-4 w-4" /></div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800">{attachment.name}</p>
                          <p className="text-[11px] text-slate-500">{isSourceFile(attachment.name) ? 'Source code' : 'Course resource'}</p>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-1">
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer nofollow" title="Open file" className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-sky-700"><ExternalLink className="h-4 w-4" /></a>
                          <a href={`/api/courses/${params.courseId}/attachments/${attachment.id}/download`} download title="Download file" className="rounded-lg p-2 text-sky-700 hover:bg-white"><Download className="h-4 w-4" /></a>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="h-fit space-y-4 lg:sticky lg:top-24">
              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Course navigation</p>
                <h2 className="mb-4 text-base font-bold text-slate-900">Continue learning</h2>
                {nextChapter ? (
                  <Link href={`/course/${params.courseId}/chapters/${nextChapter.id}`} className="group flex items-center gap-3 rounded-xl border border-sky-100 bg-sky-50 p-3 transition hover:border-sky-300 hover:bg-sky-100">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-sky-700 shadow-sm"><ArrowRight className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Next lesson</p><p className="truncate text-sm font-semibold text-slate-800 group-hover:text-sky-800">{nextChapter.title}</p></div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700"><CheckCircle2 className="h-5 w-5" /> You reached the end of the course.</div>
                )}
              </section>

              {!!attachments.length && <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Download className="h-4 w-4 text-sky-600" /> {attachments.length} downloadable {attachments.length === 1 ? 'file' : 'files'}</div><p className="mt-2 text-xs leading-5 text-slate-500">Source code and course resources are available below the lesson description.</p></section>}
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
