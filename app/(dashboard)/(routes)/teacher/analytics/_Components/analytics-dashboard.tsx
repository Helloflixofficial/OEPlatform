"use client";

import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  DollarSign,
  FileText,
  Info,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnalyticsSnapshot } from "@/Actions/get-analytics";
import { formatPrice } from "@/lib/formet";

const chartColors = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1"];

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));

const MetricCard = ({
  label,
  value,
  detail,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof DollarSign;
  tone?: "slate" | "green" | "blue" | "amber";
}) => {
  const toneClasses = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-sky-50 text-sky-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">{detail}</p>
    </div>
  );
};

const Panel = ({
  title,
  description,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-bold text-slate-950">{title}</h2>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
    <BarChart3 className="h-8 w-8 text-slate-300" />
    <p className="mt-3 text-sm font-semibold text-slate-600">{label}</p>
    <p className="mt-1 max-w-xs text-xs text-slate-400">New activity will appear here as learners enroll and watch lessons.</p>
  </div>
);

export const AnalyticsDashboard = ({ analytics }: { analytics: AnalyticsSnapshot }) => {
  const hasSales = analytics.totalSales > 0;
  const hasActivity = analytics.lessonActivity.length > 0;
  const topCategory = analytics.categoryData[0];

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              <Activity className="h-4 w-4" /> Teacher analytics
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Know what is happening in your classroom</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Revenue, learner demand, course progress, and content engagement from your live course records.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live from your database
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard label="Total revenue" value={formatPrice(analytics.totalRevenue)} detail="Gross value of recorded purchases" icon={DollarSign} tone="green" />
          <MetricCard label="Total sales" value={analytics.totalSales.toLocaleString()} detail={`${analytics.uniqueLearners} unique learners`} icon={ShoppingCart} tone="blue" />
          <MetricCard label="Active learners" value={analytics.activeLearners.toLocaleString()} detail="Progress updated in the last 30 days" icon={Activity} />
          <MetricCard label="Average progress" value={`${analytics.averageProgress}%`} detail="Across enrolled learners" icon={BookOpen} tone="amber" />
          <MetricCard label="Completion rate" value={`${analytics.completionRate}%`} detail="Enrollments reaching every lesson" icon={CheckCircle2} tone="green" />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <Panel title="Revenue and sales trend" description="Recorded purchases by month · last 6 months">
            {hasSales ? (
              <ResponsiveContainer width="100%" height={310}>
                <ComposedChart data={analytics.monthly} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.7} />
                      <stop offset="100%" stopColor="#f8fafc" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <YAxis yAxisId="revenue" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(value) => `$${value}`} />
                  <YAxis yAxisId="sales" orientation="right" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "0 8px 24px rgba(15,23,42,.08)" }}
                    formatter={(value: number, name: string) => [name === "revenue" ? formatPrice(value) : value, name === "revenue" ? "Revenue" : "Sales"]}
                  />
                  <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fill="url(#revenueFill)" />
                  <Bar yAxisId="sales" dataKey="sales" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : <EmptyState label="No sales data yet" />}
          </Panel>

          <Panel title="Audience snapshot" description="The learners behind your enrollments">
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-3"><Users className="h-5 w-5 text-slate-500" /><span className="text-sm font-medium text-slate-600">Unique learners</span></div>
                <span className="text-xl font-bold text-slate-950">{analytics.uniqueLearners}</span>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-600">Average course progress</span><span className="font-bold text-slate-950">{analytics.averageProgress}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.min(analytics.averageProgress, 100)}%` }} /></div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs"><span className="font-semibold text-slate-600">Full completion rate</span><span className="font-bold text-emerald-600">{analytics.completionRate}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(analytics.completionRate, 100)}%` }} /></div>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Catalog health</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="font-bold text-slate-950">{analytics.publishedCourses}</p><p className="text-xs text-slate-500">Published courses</p></div><div><p className="font-bold text-slate-950">{analytics.publishedChapters}/{analytics.totalChapters}</p><p className="text-xs text-slate-500">Lessons published</p></div><div><p className="font-bold text-slate-950">{analytics.draftCourses}</p><p className="text-xs text-slate-500">Draft courses</p></div><div><p className="font-bold text-slate-950">{analytics.totalAttachments}</p><p className="text-xs text-slate-500">Files shared</p></div></div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Panel title="What learners are interested in" description="Demand grouped by the categories on your courses">
            {analytics.categoryData.length ? (
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.categoryData.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#475569" }} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} formatter={(value: number) => [`${value} sales`, "Demand"]} />
                    <Bar dataKey="sales" fill="#334155" radius={[0, 5, 5, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={210}>
                    <PieChart>
                      <Pie data={analytics.categoryData.slice(0, 5)} dataKey="sales" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={3} strokeWidth={0}>
                        {analytics.categoryData.slice(0, 5).map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0" }} formatter={(value: number) => [`${value} sales`, "Demand"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : <EmptyState label="No learner interests recorded yet" />}
            {topCategory && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600"><span className="font-bold text-slate-950">{topCategory.name}</span> is currently your strongest category with {topCategory.sales} recorded sale{topCategory.sales === 1 ? "" : "s"}.</p>}
          </Panel>

          <Panel title="Most engaged lessons" description="Lessons with the most tracked progress and completions">
            {hasActivity ? <div className="space-y-3">{analytics.lessonActivity.map((lesson, index) => <div key={`${lesson.courseTitle}-${lesson.title}`} className="rounded-xl border border-slate-100 p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{index + 1}. {lesson.title}</p><p className="mt-1 truncate text-xs text-slate-400">{lesson.courseTitle}</p></div><span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{lesson.learners} learner{lesson.learners === 1 ? "" : "s"}</span></div><div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500"><span>{lesson.progressRecords} tracked</span><span>•</span><span>{lesson.completions} completed</span><div className="ml-auto h-1.5 w-20 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-700" style={{ width: `${lesson.progressRecords ? Math.min((lesson.completions / lesson.progressRecords) * 100, 100) : 0}%` }} /></div></div></div>)}</div> : <EmptyState label="No lesson progress recorded yet" />}
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
          <Panel title="Course performance" description="Compare demand, content depth, and learner progress">
            <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead><tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400"><th className="pb-3 pr-4">Course</th><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">Sales</th><th className="pb-3 pr-4">Revenue</th><th className="pb-3 pr-4">Progress</th><th className="pb-3">Files</th></tr></thead><tbody>{analytics.coursePerformance.map((course) => <tr key={course.id} className="border-b border-slate-50 last:border-0"><td className="max-w-[220px] truncate py-4 pr-4 font-semibold text-slate-800">{course.title}<span className="mt-1 block text-xs font-normal text-slate-400">{course.category} · {course.publishedChapterCount || course.chapterCount} lessons</span></td><td className="py-4 pr-4"><span className={`rounded-full px-2 py-1 text-[11px] font-bold ${course.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{course.isPublished ? "Published" : "Draft"}</span></td><td className="py-4 pr-4 font-semibold text-slate-700">{course.sales}</td><td className="py-4 pr-4 font-semibold text-slate-700">{formatPrice(course.revenue)}</td><td className="py-4 pr-4"><div className="flex min-w-[100px] items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-slate-700" style={{ width: `${Math.min(course.averageProgress, 100)}%` }} /></div><span className="text-xs text-slate-500">{course.averageProgress}%</span></div></td><td className="py-4 text-slate-600">{course.attachmentCount}</td></tr>)}</tbody></table>{!analytics.coursePerformance.length && <EmptyState label="Create a course to see performance" />}</div>
          </Panel>

          <Panel title="Recent enrollments" description="Latest recorded purchases">
            {analytics.recentSales.length ? <div className="space-y-3">{analytics.recentSales.map((sale, index) => <div key={`${sale.courseTitle}-${sale.createdAt}-${index}`} className="flex items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100"><ArrowUpRight className="h-4 w-4 text-slate-600" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-700">{sale.courseTitle}</p><p className="text-xs text-slate-400">{formatDate(sale.createdAt)}</p></div><span className="text-sm font-bold text-slate-800">{formatPrice(sale.amount)}</span></div>)}</div> : <EmptyState label="No enrollments yet" />}
          </Panel>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-amber-700 shadow-sm"><Info className="h-5 w-5" /></div><div><h2 className="text-sm font-bold text-amber-950">What your app tracks today</h2><p className="mt-1 text-xs leading-5 text-amber-900/70">This dashboard uses purchases, course categories, lesson progress, completions, attachments, and publish state. These are real records from your platform.</p><div className="mt-3 flex flex-wrap gap-2">{["Enrollments", "Revenue", "Progress", "Completions", "Categories"].map((item) => <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-amber-900 shadow-sm">{item}</span>)}</div></div></div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><AlertCircle className="h-5 w-5" /></div><div><h2 className="text-sm font-bold text-slate-900">Data not tracked yet</h2><p className="mt-1 text-xs leading-5 text-slate-500">Traffic source, location, device, search terms, and learner survey answers are not stored in the current database, so this page does not guess them.</p><p className="mt-3 text-xs font-semibold text-slate-700">Add event tracking later to answer “where did they come from?” with UTM and referral data.</p></div></div></div>
        </div>
      </div>
    </div>
  );
};
