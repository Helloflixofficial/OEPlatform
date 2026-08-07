"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Chapter } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Loader2, Pencil } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { Editor } from "@/components/editor";
import { Preview } from "@/components/preview";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormField,
  FormMessage,
  FormControl,
} from "@/components/ui/form";

interface ChapterDescriptionFormProps {
  courseId: string;
  chapterId: string;
  initialData: Chapter;
}

const formSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
});

export const ChapterDescriptionForm = ({
  courseId,
  chapterId,
  initialData,
}: ChapterDescriptionFormProps) => {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

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
    <div className="relative mt-6 rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-[0_8px_30px_rgba(113,83,52,0.05)] sm:p-6">
      {form.formState.isSubmitting && (
        <div className="absolute right-0 top-0 z-10 flex h-full w-full items-center justify-center rounded-2xl bg-[#6f5138]/10">
          <Loader2 className="h-6 w-6 animate-spin text-[#6f5138]" />
        </div>
      )}

      <div className="flex items-center justify-between font-extrabold text-[#4d3929]">
        <span>Chapter description</span>

        <Button variant="ghost" className="rounded-xl px-3 text-xs font-bold text-[#80644d] hover:bg-[#faf3eb] hover:text-[#5d422e]" onClick={toggleEdit}>
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="w-4 h-4 mr-2" />
              Edit description
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div
          className={cn(
            "mt-3 text-sm leading-6 text-[#6b5c50]",
            !initialData.description && "italic text-[#a18e7d]"
          )}
        >
          {initialData.description ? (
            <Preview value={initialData.description} />
          ) : (
            "No description"
          )}
        </div>
      )}

      {isEditing && (
        <Form {...form}>
          <form
            className="mt-4 space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="description"
              control={form.control}
              render={({ field: { value, onChange } }) => (
                <FormItem>
                  <FormControl>
                    <Editor value={value} onChange={onChange} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2">
              <Button className="rounded-xl bg-[#6f5138] font-bold text-white hover:bg-[#5d422e]" disabled={isSubmitting || !isValid} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
