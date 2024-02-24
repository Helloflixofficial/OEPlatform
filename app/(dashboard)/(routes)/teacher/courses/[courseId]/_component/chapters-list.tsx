"use client";
import { Chapter } from "@prisma/client";
interface ChapterListProps {
  items: Chapter[];
  onReorder: (
    updateData: {
      id: string;
      position: number;
    }[]
  ) => void;
  onEdit: (id: string) => void;
}

export const ChaptersList = ({
  items,
  onReorder,
  onEdit,
}: ChapterListProps) => {
  return <div>Lists</div>;
};
