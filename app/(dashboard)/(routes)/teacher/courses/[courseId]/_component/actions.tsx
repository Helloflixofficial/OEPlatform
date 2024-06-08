"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/models/confirm-model";
interface ActionsProps {
  courseId: string;
  disabled: boolean;
  isPublished: boolean;
}
export const Actions = ({ courseId, disabled, isPublished }: ActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const togglePublish = async () => {
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.patch(`/api/courses/${courseId}/unpublish`);
        toast.success("course unpublished");
      } else {
        await axios.patch(`/api/courses/${courseId}/publish`);
        toast.success("course Published");
      }
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const onClick = async () => {
    toast.promise(togglePublish(), {
      loading: "Updating course...",
      error: "Something went wrong",
      success: isPublished ? "Course unpublished" : "Course published",
    });
  };

  const removeCourse = async () => {
    try {
      setIsLoading(true);
      await axios.delete(`/api/courses/${courseId}`);
      toast.success("course deleted sire");
      router.refresh();
      router.push("/teacher/courses");
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    toast.promise(removeCourse(), {
      loading: "Deleting course...",
      success: "Course deleted",
      error: "Something went wrong",
    });
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        size="sm"
        variant="outline"
        onClick={onClick}
        disabled={disabled || isLoading}
      >
        {isPublished ? "Unpublish" : "Publish"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="w-4 h-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
