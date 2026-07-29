import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { getAnalytics } from "@/Actions/get-analytics";
import { AnalyticsDashboard } from "./_Components/analytics-dashboard";

const AnalyticsPage = async () => {
  const { userId } = auth();

  if (!userId) return redirect("/");

  const analytics = await getAnalytics(userId);

  return <AnalyticsDashboard analytics={analytics} />;
};

export default AnalyticsPage;
