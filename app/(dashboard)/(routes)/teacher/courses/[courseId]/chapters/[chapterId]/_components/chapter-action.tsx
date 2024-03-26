"use client";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
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
  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={() => {}}
        disabled={disabled}
        variant="outline"
        size="sm"
      >
        {isPublished ? "unPublish" : "publish"}
      </Button>
      <Button>
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};
