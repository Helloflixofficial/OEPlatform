"use client";

import axios from "axios";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Edit3,
  LayoutGrid,
  ListFilter,
  Plus,
  Search,
  Sparkles,
  Users,
  Video,
  X,
} from "lucide-react";

export type TeacherCourse = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category: { name: string } | null;
  chapters: { id: string; isPublished: boolean }[];
  attachments: { id: string }[];
  purchases: { id: string; userId: string }[];
  completedFields: number;
  totalFields: number;
  isReadyToPublish: boolean;
};

type StatusFilter = "all" | "published" | "draft";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);

const formatUpdated = (date: string) => {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (days <= 0) return "Updated today";
  if (days === 1) return "Updated yesterday";
  if (days < 30) return `Updated ${days} days ago`;
  return `Updated ${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date))}`;
};

const PublishButton = ({ course }: { course: TeacherCourse }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const togglePublish = async () => {
    if (!course.isPublished && !course.isReadyToPublish) {
      toast.error("Complete the course setup before publishing");
      return;
    }

    try {
      setIsLoading(true);
      await axios.patch(`/api/courses/${course.id}/${course.isPublished ? "unpublish" : "publish"}`);
      toast.success(course.isPublished ? "Course unpublished" : "Course published");
      router.refresh();
    } catch {
      toast.error("Could not update the course status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={togglePublish}
      disabled={isLoading}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold transition disabled:cursor-wait disabled:opacity-60 ${course.isPublished ? "border border-[#eadbc9] bg-white text-[#8b6340] hover:bg-[#FBF6EE]" : "bg-[#9c6b3e] text-white shadow-sm hover:bg-[#865a32]"}`}
    >
      {course.isPublished ? "Unpublish" : isLoading ? "Publishing..." : "Publish"}
    </button>
  );
};

const Metric = ({ icon: Icon, label, value, detail }: { icon: typeof BookOpen; label: string; value: string; detail: string }) => (
  <div className="rounded-2xl border border-[#eadbc9] bg-white p-4 shadow-[0_5px_18px_rgba(151,111,69,0.05)]">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#a17b59]">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-[#3d3026]">{value}</p></div>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FBF6EE] text-[#a87546]"><Icon className="h-4 w-4" /></div>
    </div>
    <p className="mt-2 text-[11px] text-[#927b65]">{detail}</p>
  </div>
);

const CourseCard = ({ course, list = false }: { course: TeacherCourse; list?: boolean }) => {
  const setupPercent = Math.round((course.completedFields / course.totalFields) * 100);
  const publishedLessons = course.chapters.filter((chapter) => chapter.isPublished).length;

  return (
    <article className={`group overflow-hidden rounded-2xl border border-[#eadbc9] bg-white shadow-[0_5px_18px_rgba(151,111,69,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(151,111,69,0.12)] ${list ? "sm:flex" : ""}`}>
      <div className={`relative h-36 overflow-hidden bg-[#f3e7d7] ${list ? "sm:h-auto sm:min-h-[220px] sm:w-56 sm:shrink-0" : ""}`}>
        {course.imageUrl ? <div className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: `url(${course.imageUrl})` }} /> : <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_20%_20%,#fff_0,#f4e7d6_45%,#e6c8a6_100%)]"><BookOpen className="h-12 w-12 text-[#b7834f]/50" /></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2d2118]/55 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] ${course.isPublished ? "bg-white text-[#5f452f]" : "bg-[#fff8ef] text-[#9b6539]"}`}>{course.isPublished ? "Published" : "Draft"}</span>{!course.isPublished && course.isReadyToPublish && <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">Ready</span>}</div>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/25 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">{course.category?.name || "General"}</span>
      </div>

      <div className={`p-4 ${list ? "min-w-0 flex-1" : ""}`}>
        <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate text-base font-bold text-[#3d3026]">{course.title || "Untitled course"}</h2><p className="mt-1 line-clamp-2 min-h-[32px] text-xs leading-4 text-[#927b65]">{course.description || "Add a description so learners know what they will learn."}</p></div><span className="shrink-0 text-sm font-bold text-[#8f633e]">{formatPrice(course.price || 0)}</span></div>

        <div className="mt-4 grid grid-cols-3 divide-x divide-[#eee2d4] rounded-xl bg-[#FBF6EE] py-2.5"><div className="px-2 text-center"><p className="text-sm font-bold text-[#4b3829]">{publishedLessons}/{course.chapters.length}</p><p className="mt-0.5 text-[10px] text-[#927b65]">Lessons</p></div><div className="px-2 text-center"><p className="text-sm font-bold text-[#4b3829]">{course.purchases.length}</p><p className="mt-0.5 text-[10px] text-[#927b65]">Learners</p></div><div className="px-2 text-center"><p className="text-sm font-bold text-[#4b3829]">{course.attachments.length}</p><p className="mt-0.5 text-[10px] text-[#927b65]">Files</p></div></div>

        {!course.isPublished && <div className="mt-4"><div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-[#927b65]"><span>Setup progress</span><span>{course.completedFields}/{course.totalFields}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#f1e6d9]"><div className={`h-full rounded-full ${course.isReadyToPublish ? "bg-emerald-500" : "bg-[#c58c58]"}`} style={{ width: `${setupPercent}%` }} /></div></div>}

        <div className="mt-4 flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[11px] text-[#a08a76]"><Clock3 className="h-3.5 w-3.5" /> {formatUpdated(course.updatedAt)}</span><div className="flex items-center gap-1.5"><Link href={`/teacher/courses/${course.id}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#eadbc9] px-3 text-xs font-bold text-[#6f5138] transition hover:bg-[#FBF6EE]"><Edit3 className="h-3.5 w-3.5" /> Edit</Link><PublishButton course={course} /></div></div>
        {course.isPublished && <Link href={`/course/${course.id}`} className="mt-3 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-xs font-semibold text-[#a87546] transition hover:bg-[#FBF6EE]"><ArrowUpRight className="h-3.5 w-3.5" /> Preview course</Link>}
      </div>
    </article>
  );
};

export const CourseManagement = ({ courses }: { courses: TeacherCourse[] }) => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState("updated");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filteredCourses = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...courses]
      .filter((course) => status === "all" || (status === "published" ? course.isPublished : !course.isPublished))
      .filter((course) => !normalized || `${course.title} ${course.category?.name || ""}`.toLowerCase().includes(normalized))
      .sort((a, b) => {
        if (sort === "title") return a.title.localeCompare(b.title);
        if (sort === "learners") return b.purchases.length - a.purchases.length;
        if (sort === "revenue") return (b.price || 0) * b.purchases.length - (a.price || 0) * a.purchases.length;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [courses, query, sort, status]);

  const published = courses.filter((course) => course.isPublished).length;
  const drafts = courses.length - published;
  const learners = new Set(courses.flatMap((course) => course.purchases.map((purchase) => purchase.userId))).size;
  const revenue = courses.reduce((sum, course) => sum + (course.price || 0) * course.purchases.length, 0);
  const readyDrafts = courses.filter((course) => !course.isPublished && course.isReadyToPublish).length;

  return (
    <div className="min-h-full bg-[#FBF6EE] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1480px]">
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><div className="mb-2 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#a17b59]"><LayoutGrid className="h-3.5 w-3.5" /> Teaching workspace</div><h1 className="text-3xl font-bold tracking-tight text-[#3d3026]">Your courses</h1><p className="mt-2 text-sm text-[#927b65]">Build, organize, and publish the learning experiences you share with students.</p></div><Link href="/teacher/create" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#9c6b3e] px-4 text-sm font-bold text-white shadow-[0_8px_18px_rgba(156,107,62,0.2)] transition hover:bg-[#865a32]"><Plus className="h-4 w-4" /> Create course</Link></header>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={BookOpen} label="Total courses" value={courses.length.toString()} detail={`${published} published · ${drafts} drafts`} /><Metric icon={Users} label="Learners" value={learners.toString()} detail="Across your course catalog" /><Metric icon={CircleDollarSign} label="Recorded revenue" value={formatPrice(revenue)} detail="Based on course price × sales" /><Metric icon={Sparkles} label="Ready to publish" value={readyDrafts.toString()} detail={readyDrafts ? "Drafts can go live now" : "Complete a draft to unlock publishing"} /></div>

        <section className="mt-6 rounded-2xl border border-[#eadbc9] bg-white p-3 shadow-[0_5px_18px_rgba(151,111,69,0.05)]"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="relative min-w-0 flex-1"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#ae7b4a]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by course title or category..." className="h-11 w-full rounded-xl border border-[#eadbc9] bg-[#FBF6EE]/60 pl-10 pr-10 text-sm text-[#3d3026] outline-none placeholder:text-[#a49383] focus:border-[#c99a69] focus:ring-2 focus:ring-[#d7b28b]/30" />{query && <button type="button" onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a17b59] hover:text-[#6f5138]" aria-label="Clear search"><X className="h-4 w-4" /></button>}</div><div className="flex items-center gap-2 overflow-x-auto"><div className="flex shrink-0 rounded-xl bg-[#FBF6EE] p-1">{(["all", "published", "draft"] as StatusFilter[]).map((item) => <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-lg px-3 py-2 text-xs font-bold capitalize transition ${status === item ? "bg-white text-[#6f5138] shadow-sm" : "text-[#a17b59] hover:text-[#6f5138]"}`}>{item === "all" ? "All courses" : item}</button>)}</div><div className="relative shrink-0"><ListFilter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a17b59]" /><select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 appearance-none rounded-xl border border-[#eadbc9] bg-white pl-9 pr-8 text-xs font-semibold text-[#6f5138] outline-none focus:border-[#c99a69]"><option value="updated">Recently updated</option><option value="title">Title A–Z</option><option value="learners">Most learners</option><option value="revenue">Highest revenue</option></select><ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a17b59]" /></div><div className="hidden shrink-0 items-center rounded-xl border border-[#eadbc9] bg-white p-1 sm:flex"><button type="button" aria-label="Grid view" onClick={() => setView("grid")} className={`rounded-lg p-2 ${view === "grid" ? "bg-[#FBF6EE] text-[#6f5138]" : "text-[#a17b59]"}`}><LayoutGrid className="h-4 w-4" /></button><button type="button" aria-label="List view" onClick={() => setView("list")} className={`rounded-lg p-2 ${view === "list" ? "bg-[#FBF6EE] text-[#6f5138]" : "text-[#a17b59]"}`}><ListFilter className="h-4 w-4" /></button></div></div></div></section>

        <div className="mt-4 flex items-center justify-between text-xs text-[#a17b59]"><span>{filteredCourses.length} {filteredCourses.length === 1 ? "course" : "courses"} shown</span>{query || status !== "all" ? <button type="button" onClick={() => { setQuery(""); setStatus("all"); }} className="font-bold text-[#8f633e] hover:underline">Reset filters</button> : <span className="hidden items-center gap-1.5 sm:flex"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Changes save as you edit</span>}</div>

        {filteredCourses.length ? <div className={view === "grid" ? "mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "mt-3 space-y-3"}>{filteredCourses.map((course) => <CourseCard key={course.id} course={course} list={view === "list"} />)}</div> : <div className="mt-3 flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dfcdb8] bg-white/70 px-6 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#b7834f] shadow-sm"><Video className="h-7 w-7" /></div><h2 className="mt-4 text-lg font-bold text-[#4b3829]">{courses.length ? "No courses match your filters" : "Your teaching library is empty"}</h2><p className="mt-1 max-w-md text-sm text-[#927b65]">{courses.length ? "Try a different search or status filter." : "Create your first course and start building something learners can finish."}</p><Link href={courses.length ? "/teacher/courses" : "/teacher/create"} onClick={courses.length ? (event) => { event.preventDefault(); setQuery(""); setStatus("all"); } : undefined} className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#9c6b3e] px-4 text-sm font-bold text-white hover:bg-[#865a32]">{courses.length ? "Clear filters" : <><Plus className="h-4 w-4" /> Create your first course</>}</Link></div>}
      </div>
    </div>
  );
};
