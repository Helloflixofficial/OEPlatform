"use client";

import { useState, useCallback, useTransition, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Category } from "@prisma/client";
import { IconType } from "react-icons";
import {
  FcEngineering, FcFilmReel, FcMultipleDevices,
  FcMusic, FcOldTimeCamera, FcSalesPerformance, FcSportsMode,
} from "react-icons/fc";
import {
  BookOpen, Clock, Star, ChevronRight, Users,
  BarChart2, SlidersHorizontal, X,
} from "lucide-react";
import queryString from "query-string";
import { formatPrice } from "@/lib/formet";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CourseWithProgress {
  id: string;
  title: string;
  imageUrl: string | null;
  price: number | null;
  progress: number | null;
  category: { id: string; name: string } | null;
  chapters: { id: string }[];
}

interface SearchClientProps {
  categories: Category[];
  courses: CourseWithProgress[];
  selectedCategoryId?: string;
  selectedTitle?: string;
}

// ─── Icon map ────────────────────────────────────────────────────────────────

const iconMap: Record<string, IconType> = {
  Music: FcMusic,
  Editing: FcFilmReel,
  Fitness: FcSportsMode,
  Painting: FcFilmReel,
  Photography: FcOldTimeCamera,
  Engineering: FcEngineering,
  "Computer Science": FcMultipleDevices,
  "Website Development": FcSalesPerformance,
};

const CONTENT_TYPES = ["Tutorials", "Courses", "Articles", "Videos", "Podcasts"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

// ─── Star rating ─────────────────────────────────────────────────────────────

const StarRating = memo(function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
});

// ─── Course Card ─────────────────────────────────────────────────────────────

const CourseCard = memo(function CourseCard({ course }: { course: CourseWithProgress }) {
  const chapLen = course.chapters.length;
  const seed = course.id.charCodeAt(0) + course.id.charCodeAt(course.id.length - 1);
  const rating = parseFloat((3.8 + (seed % 12) * 0.1).toFixed(1));
  const durationH = 1 + (seed % 8);
  const durationM = (seed * 7) % 60;
  const students = (seed * 13 + 40) % 900 + 100;

  return (
    <Link href={`/course/${course.id}`} className="group block h-full">
      <div className="h-full flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden bg-gray-100 flex-shrink-0">
          {course.imageUrl ? (
            <Image
              fill
              alt={course.title}
              src={course.imageUrl}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              loading="lazy"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100">
              <BookOpen className="h-10 w-10 text-sky-300" />
            </div>
          )}
          <span className="absolute top-2 left-2 bg-gray-900/85 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {course.category?.name ?? "Course"}
          </span>
          <span className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/55 backdrop-blur-sm text-white text-[10px] rounded-full px-1.5 py-0.5">
            <Clock className="h-2.5 w-2.5" />
            {durationH}h {durationM}m
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-3.5 gap-1.5">
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
            {course.title}
          </h3>
          <p className="text-[11px] text-gray-400 line-clamp-2 flex-1">
            {chapLen} {chapLen === 1 ? "chapter" : "chapters"} • {course.category?.name ?? "General"}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-emerald-500" />{students}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3 text-sky-400" />{chapLen} ch
            </span>
          </div>
          <div className="h-px bg-gray-100 my-1" />
          <div className="flex items-center justify-between">
            <StarRating rating={rating} />
            {course.progress !== null ? (
              <div className="flex flex-col items-end gap-0.5">
                <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-[10px] text-emerald-600 font-semibold">
                  {Math.round(course.progress)}%
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                {course.price
                  ? formatPrice(course.price)
                  : <span className="text-emerald-600 text-xs font-bold">Free</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

// ─── Filter Panel (shared between sidebar and mobile drawer) ─────────────────

const FilterPanel = memo(function FilterPanel({
  categories,
  selectedCategoryId,
  selectedTypes,
  selectedLevels,
  onCategoryClick,
  onToggleType,
  onToggleLevel,
  onApply,
}: {
  categories: Category[];
  selectedCategoryId?: string;
  selectedTypes: string[];
  selectedLevels: string[];
  onCategoryClick: (id: string | null) => void;
  onToggleType: (t: string) => void;
  onToggleLevel: (l: string) => void;
  onApply?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-7">
        {/* Categories */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Categories
          </p>
          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => onCategoryClick(null)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  !selectedCategoryId
                    ? "text-sky-600 bg-sky-50 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                All Categories
              </button>
            </li>
            {categories.map((cat) => {
              const Icon = iconMap[cat.name];
              const active = selectedCategoryId === cat.id;
              return (
                <li key={cat.id}>
                  <button
                    onClick={() => onCategoryClick(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                      active
                        ? "text-sky-600 bg-sky-50 font-semibold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {Icon && <Icon size={17} />}
                    {cat.name}
                    {active && <ChevronRight className="h-3 w-3 ml-auto text-sky-400" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Content Type */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Content Type
          </p>
          <div className="space-y-2.5">
            {CONTENT_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(t)}
                  onChange={() => onToggleType(t)}
                  className="h-4 w-4 rounded border-gray-300 accent-sky-600"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {t}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
            Level
          </p>
          <div className="space-y-2.5">
            {LEVELS.map((l) => (
              <label key={l} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(l)}
                  onChange={() => onToggleLevel(l)}
                  className="h-4 w-4 rounded border-gray-300 accent-sky-600"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {l}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Apply button */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={onApply}
          className="w-full bg-gray-900 hover:bg-gray-800 active:bg-black text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
});

// ─── Main SearchClient ────────────────────────────────────────────────────────

export function SearchClient({
  categories,
  courses,
  selectedCategoryId,
}: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Tutorials", "Courses", "Articles", "Videos"]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"popular" | "recent" | "trending">("popular");

  // Mobile filter drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const onCategoryClick = useCallback(
    (catId: string | null) => {
      const url = queryString.stringifyUrl(
        {
          url: pathname,
          query: { title: searchParams.get("title"), categoryId: catId },
        },
        { skipNull: true, skipEmptyString: true }
      );
      startTransition(() => router.push(url));
    },
    [pathname, router, searchParams]
  );

  const toggleType = useCallback(
    (t: string) => setSelectedTypes((p) => p.includes(t) ? p.filter((x) => x !== t) : [...p, t]),
    []
  );
  const toggleLevel = useCallback(
    (l: string) => setSelectedLevels((p) => p.includes(l) ? p.filter((x) => x !== l) : [...p, l]),
    []
  );

  // useMemo: only re-sort when courses array or tab changes
  const sorted = useMemo(() =>
    [...courses].sort((a, b) =>
      activeTab === "popular" ? b.chapters.length - a.chapters.length :
      activeTab === "recent"  ? b.id.localeCompare(a.id) :
      a.title.localeCompare(b.title) // trending = alphabetical (stable, not random)
    ),
    [courses, activeTab]
  );

  const filterPanelProps = {
    categories,
    selectedCategoryId,
    selectedTypes,
    selectedLevels,
    onCategoryClick,
    onToggleType: toggleType,
    onToggleLevel: toggleLevel,
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">

      {/* ── DESKTOP SIDEBAR (lg+) ────────────────────────────────────────── */}
      <aside className="hidden lg:block w-60 flex-shrink-0 border-r border-gray-200 bg-white">
        <div className="sticky top-[80px] h-[calc(100vh-80px)] overflow-y-auto">
          <FilterPanel
            {...filterPanelProps}
          />
        </div>
      </aside>

      {/* ── MOBILE FILTER DRAWER (< lg) ────────────────────────────────────── */}
      {mobileFilterOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 font-bold text-gray-800">
                <SlidersHorizontal className="h-4 w-4 text-sky-500" />
                Filters
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FilterPanel
              {...filterPanelProps}
              onApply={() => setMobileFilterOpen(false)}
            />
          </div>
        </>
      )}

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 px-3 sm:px-6 pt-4 sm:pt-5 pb-12">

        {/* Category pills (horizontal scroll, all screen sizes) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide -mx-1 px-1">
          {categories.map((cat) => {
            const Icon = iconMap[cat.name];
            const active = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onCategoryClick(active ? null : cat.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-all whitespace-nowrap ${
                  active
                    ? "border-sky-500 bg-sky-50 text-sky-700 font-semibold shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-sky-300 hover:text-sky-600"
                }`}
              >
                {Icon && <Icon size={16} />}
                <span className="hidden xs:inline sm:inline">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Sort tabs + mobile filter button */}
        <div className="flex items-center justify-between mb-4 gap-2">
          {/* Sort tabs */}
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm overflow-x-auto">
            {(["popular", "recent", "trending"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "bg-gray-900 text-white shadow"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Mobile/tablet filter button — hidden on lg where sidebar is always visible */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 font-medium border border-gray-200 rounded-xl bg-white hover:shadow-sm hover:border-sky-300 transition-all"
            >
              <SlidersHorizontal className="h-4 w-4 text-sky-500" />
              <span className="hidden sm:inline">Filters</span>
              {(selectedCategoryId || selectedLevels.length > 0) && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              )}
            </button>

            {/* Sort button */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-xl">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Sort</span>
            </div>
          </div>
        </div>

        {/* Results count */}
        {!isPending && (
          <p className="text-xs text-gray-400 mb-3">
            {sorted.length} {sorted.length === 1 ? "course" : "courses"} found
            {selectedCategoryId && categories.find(c => c.id === selectedCategoryId)
              ? ` in ${categories.find(c => c.id === selectedCategoryId)?.name}`
              : ""}
          </p>
        )}

        {/* Course grid */}
        {isPending ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-white border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : sorted.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {sorted.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-lg font-semibold text-gray-600">No courses found</p>
            <p className="text-sm text-gray-400">
              Try a different category or search term
            </p>
            <button
              onClick={() => onCategoryClick(null)}
              className="text-sm text-sky-600 hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
