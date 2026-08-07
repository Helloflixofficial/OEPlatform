"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import MuxPlayer from "@mux/mux-player-react";
import { Chapter, MuxData } from "@prisma/client";
import { Pencil, PlusCircle, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";

interface ChapterVideoFormProps {
  courseId: string;
  chapterId: string;
  initialData: Chapter & { muxData?: MuxData | null };
}

const formSchema = z.object({
  videoUrl: z.string().trim().min(1, "Video is required"),
});

export const ChapterVideoForm = ({
  courseId,
  chapterId,
  initialData,
}: ChapterVideoFormProps) => {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        values
      );
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-[0_8px_30px_rgba(113,83,52,0.05)] sm:p-6">
      <div className="flex items-center justify-between font-extrabold text-[#4d3929]">
        <span>Chapter video</span>

        <Button variant="ghost" className="rounded-xl px-3 text-xs font-bold text-[#80644d] hover:bg-[#faf3eb] hover:text-[#5d422e]" onClick={toggleEdit}>
          {isEditing && <>Cancel</>}

          {!isEditing && !initialData.videoUrl && (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add a video
            </>
          )}

          {!isEditing && initialData.videoUrl && (
            <>
              <Pencil className="w-4 h-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </div>

      {!isEditing &&
        (!initialData.videoUrl ? (
          <div className="mt-3 flex h-60 items-center justify-center rounded-xl border border-dashed border-[#dfcdbb] bg-[#fbf7f1]">
            <Video className="h-10 w-10 text-[#c5a17e]" />
          </div>
        ) : (
          <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border border-[#eadfd3]">
            <MuxPlayer playbackId={initialData?.muxData?.playbackId || ""} />
          </div>
        ))}

      {isEditing && (
        <div>
          <FileUpload
            endpoint="chapterVideo"
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url });
              }
            }}
          />

          <div className="mt-4 text-xs text-[#9d8b7a]">
            Upload this chapter&apos;s video.
          </div>
        </div>
      )}

      {initialData.videoUrl && !isEditing && (
        <div className="mt-3 text-xs leading-5 text-[#9d8b7a]">
          Videos can take a few minutes to process. Refresh the page if video
          does not appear.
        </div>
      )}
    </div>
  );
};
