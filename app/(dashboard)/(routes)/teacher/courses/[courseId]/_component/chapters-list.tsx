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
import { Badge, Grip, Pencil } from "lucide-react";

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

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(chapter);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(result.source.index, result.destination.index);
    const endIndex = Math.max(result.source.index, result.destination.index);

    const updateChapter = items.slice(startIndex, endIndex + 1);
    setChapter(items);
    const bulkUpdatedData = updateChapter.map((chapter) => ({
      id: chapter.id,
      position: items.findIndex((item) => item.id === chapter.id),
    }));
    onReorder(bulkUpdatedData);
  };

  if (!isMounted) {
    return null;
  }
  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
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
                      className={cn(
                        "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                        chapter.isPublished && "bg-sky-100 border-sky-200"
                      )}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div
                        className={cn(
                          "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                          chapter.isPublished &&
                            "border-r-sky-200  hover:bg-sky-200"
                        )}
                        {...provided.dragHandleProps}
                      >
                        <Grip className="h-5 w-5" />
                      </div>
                      {chapter.title}
                      <div className="ml-auto pr-2 flex items-center gap-x-2">
                        {chapter.isFree && <Badge>Free</Badge>}
                        <Badge
                          className={cn(
                            "bg-slate-500",
                            chapter.isPublished && "bg-sky-700"
                          )}
                        >
                          {chapter.isPublished ? "Published" : "BATMAN"}
                        </Badge>
                        <Pencil
                          onClick={() => onEdit(chapter.id)}
                          className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                        />
                      </div>
                    </div>
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
