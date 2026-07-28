import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { getAnalytics } from "@/Actions/get-analytics"
import { DataCard } from "./_Components/data-cards"
import { Chart } from "./_Components/Chart"
const AnalyticsPage = async () => {
  const { userId } = auth()
  if (!userId) {
    return redirect("/");
  }
  const { data, totalRevenue, totalSales } = await getAnalytics(userId);
  return (
    <div className="p-6">
      <div className="grid grid-cols-1   md:grid-cols-2 gap-4 mb-4 ">
        <DataCard label="total Revenue"
          value={totalRevenue}
          shouldFormet />
        <DataCard label="total Sales"
          value={totalSales}
        />
      </div>
      <Chart data={data} />
    </div>
  )
}
export default AnalyticsPage