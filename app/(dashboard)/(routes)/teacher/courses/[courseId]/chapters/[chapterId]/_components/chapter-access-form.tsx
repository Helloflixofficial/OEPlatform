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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormItem,
  FormField,
  FormControl,
  FormDescription,
} from "@/components/ui/form";

interface ChapterAccessFormProps {
  courseId: string;
  chapterId: string;
  initialData: Chapter;
}

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

export const ChapterAccessForm = ({
  courseId,
  chapterId,
  initialData,
}: ChapterAccessFormProps) => {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!initialData?.isFree,
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
        <span>Chapter access</span>

        <Button variant="ghost" className="rounded-xl px-3 text-xs font-bold text-[#80644d] hover:bg-[#faf3eb] hover:text-[#5d422e]" onClick={toggleEdit}>
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="w-4 h-4 mr-2" />
              Edit access
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <div
          className={cn(
            "mt-3 text-sm leading-6",
            !initialData.isFree && "italic text-[#a18e7d]"
          )}
        >
          {initialData.isFree ? (
            <>This chapter is free for preview</>
          ) : (
            <>This chapter is not free</>
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
              name="isFree"
              control={form.control}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-[#eadfd3] bg-[#fffdf9] p-4">
                  <FormControl>
                    <Checkbox
                      ref={field.ref}
                      name={field.name}
                      checked={field.value}
                      onBlur={field.onBlur}
                      disabled={field.disabled}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>

                  <div className="space-y-1 leading-none">
                    <FormDescription>
                      Check this if you want to make this chapter free for
                      preview
                    </FormDescription>
                  </div>
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
