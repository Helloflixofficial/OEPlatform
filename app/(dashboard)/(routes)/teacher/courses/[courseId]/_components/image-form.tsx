"use client";
import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, ImageIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
interface ImageFormProps {
  initialData: Course
  courseId: string;
};

const formSchema = z.object({
  imageUrl: z.string().min(1, {
    message: "Image is required",
  }),
});

export const ImageForm = ({
  initialData,
  courseId
}: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

const form =  useForm<z.infer<typeof formSchema>>({
   resolver : zodResolver(formSchema),
   defaultValues:{
    imageUrl : initialData?.imageUrl || "",
   }
})


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/courses/${courseId}`, values);
      toast.success("Course updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-[0_8px_30px_rgba(113,83,52,0.05)] sm:p-6">
      <div className="flex items-center justify-between font-extrabold text-[#4d3929]">
        Course image
        <Button onClick={toggleEdit} variant="ghost" className="rounded-xl px-3 text-xs font-bold text-[#80644d] hover:bg-[#faf3eb] hover:text-[#5d422e]">
          {isEditing && (
            <>Cancel</>
          )}
          {!isEditing && !initialData.imageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add an image
            </>
          )}
          {!isEditing && initialData.imageUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit image
            </>
          )}
        </Button>

        {/* not editing */}
      </div>
      {!isEditing && (
        !initialData.imageUrl ? (
            <div className="mt-3 flex h-60 items-center justify-center rounded-xl border border-dashed border-[#dfcdbb] bg-[#fbf7f1]">
            <ImageIcon className="h-10 w-10 text-[#c5a17e]" />
          </div>
        ) : (
            <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border border-[#eadfd3]">
            <Image
              alt="Upload"
              fill
              className="object-cover rounded-md"
              src={initialData.imageUrl}
            />
          </div>
        )
      )}
      {isEditing && (
        <div>
          <FileUpload
            endpoint="courseImage"
            onChange={(url) => {
              if (url) {
                onSubmit({ imageUrl: url });
              }
            }}
          />
          <div className="mt-4 text-xs text-[#9d8b7a]">
            16:9 aspect ratio recommended
          </div>
        </div>
      )}
    </div>
  )
}
