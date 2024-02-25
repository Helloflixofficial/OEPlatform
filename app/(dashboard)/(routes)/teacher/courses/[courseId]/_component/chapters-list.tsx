"use client";
import { Chapter } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

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
  const [isMounted, setIsMounted] = useState(false);
  const [chapter, setChapter] = useState(items);

  useEffect(() => {
    setChapter(items);
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <div>
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="chapter">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {chapter.map((chapter, index) => (
                <Draggable
                  key={chapter.id}
                  draggableId={chapter.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      className={cn("flex items-center gap-x-2 bg-slate-200")}
                    ></div>
                  )}
                </Draggable>
              ))}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
