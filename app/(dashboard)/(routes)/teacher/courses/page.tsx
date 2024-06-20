import { Button } from "@/components/ui/button";
import { columns } from "./[courseId]/_components/columns";
import { DataTable } from "./[courseId]/_components/data-table";
import Link from "next/link";
async function getData(): Promise<any[]> {
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "hellolixofficial@gmail.com",
    },
  ];
}

const TeacherPage = async () => {
  const data = await getData();

  return (
    <div className="p-6">
      <Link href="/teacher/create">
        <Button>Button</Button>
      </Link>
      <DataTable columns={columns} data={data} />
    </div>
  );
};
export default TeacherPage;
