"use Client";
import { UploadDropzone } from "@/lib/uploadthing"; // one imported
import { ourFileRouter } from "@/app/api/uploadthing/core"; // sec imported
interface FileUploadProps {
  onChange: (url?: string) => void;
  endPoint: keyof typeof ourFileRouter;
}

export const FileUpload = ({ onChange, endPoint }: FileUploadProps) => {
  return (<UploadDropzone
   endPoint={endPoint} />)
};
