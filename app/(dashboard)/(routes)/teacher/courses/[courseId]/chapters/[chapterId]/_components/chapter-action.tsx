"use client";
import { ConfirmModel } from "@/components/confirm-model";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
interface chapterActionProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
}
export const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: chapterActionProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/courses/${courseId}/chapters/${chapterId}`);
      toast.success("chapter deleted successfullly");
      router.refresh();
      router.push(`/tercher/courses/${courseId}`);
    } catch (error) {
      toast.error("something is wrong");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onDelete}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "unPublish" : "publish"}
      </Button>
      <ConfirmModel onConfirm={() => {}}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModel>
    </div>
  );
};
