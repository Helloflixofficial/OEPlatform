import { Button } from "@/components/ui/button";
import Link from "next/link";
const TeacherPage = () => {
  return (
    <div className="p-6">
      <Link href="/teacher/create">
        <Button>Button</Button>
      </Link>
    </div>
  );
};
export default TeacherPage;
