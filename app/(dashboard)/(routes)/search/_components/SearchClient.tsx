"use client";

import { useState, useCallback, useMemo, memo, useEffect, useRef } from "react";
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
  BookOpen, Clock, Star, ChevronRight, ChevronLeft, Users,
  SlidersHorizontal, X, Search, BarChart2,
} from "lucide-react";
import queryString from "query-string";
import { formatPrice } from "@/lib/formet";
import { useDebounce } from "@/hooks/use.debounce";

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

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 12;

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
          className={`h-2.5 w-2.5 ${
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-gray-200 fill-gray-200"
          }`}
        />
      ))}
      <span className="ml-1 text-[10px] font-semibold text-gray-500">{rating.toFixed(1)}</span>
    </div>
  );
});

// ─── Course Card (Compact 4-per-row grid item) ───────────────────────────────

const CourseCard = memo(function CourseCard({ course }: { course: CourseWithProgress }) {
  const chapLen = course.chapters?.length ?? 0;
  const idStr = course.id || "course";
  const seed = idStr.charCodeAt(0) + idStr.charCodeAt(idStr.length - 1);
  const rating = parseFloat((3.8 + (seed % 12) * 0.1).toFixed(1));
  const durationH = 1 + (seed % 8);
  const durationM = (seed * 7) % 60;
  const students = (seed * 13 + 40) % 900 + 100;

  return (
    <Link href={`/course/${course.id}`} className="group block h-full">
      <div className="h-full flex flex-col rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden bg-gray-100 flex-shrink-0">
          {course.imageUrl ? (
            <Image
              fill
              alt={course.title}
              src={course.imageUrl}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              loading="lazy"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100">
              <BookOpen className="h-8 w-8 text-sky-300" />
            </div>
          )}
          <span className="absolute top-1.5 left-1.5 bg-gray-900/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {course.category?.name ?? "Course"}
          </span>
          <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/55 text-white text-[9px] rounded-full px-1.5 py-0.5">
            <Clock className="h-2 w-2" />
            {durationH}h {durationM}m
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-3 gap-1">
          <h3 className="text-xs font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-sky-700 transition-colors">
            {course.title}
          </h3>
          <p className="text-[10px] text-gray-400 line-clamp-1 flex-1">
            {chapLen} {chapLen === 1 ? "chapter" : "chapters"} • {course.category?.name ?? "General"}
          </p>
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            <span className="flex items-center gap-0.5">
              <Users className="h-2.5 w-2.5 text-emerald-500" />{students}
            </span>
            <span className="flex items-center gap-0.5">
              <BookOpen className="h-2.5 w-2.5 text-sky-400" />{chapLen}
            </span>
          </div>
          <div className="h-px bg-gray-100 my-0.5" />
          <div className="flex items-center justify-between">
            <StarRating rating={rating} />
            {course.progress !== null ? (
              <div className="flex flex-col items-end gap-0.5">
                <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className="text-[9px] text-emerald-600 font-semibold">
                  {Math.round(course.progress)}%
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-gray-900">
                {course.price
                  ? formatPrice(course.price)
                  : <span className="text-emerald-600 text-[10px] font-bold">Free</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});

// ─── Filter Sidebar Panel ────────────────────────────────────────────────────

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
  const safeCategories = categories || [];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Categories (Scrollable sub-container) */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Categories
          </p>
          <div className="max-h-[240px] overflow-y-auto pr-1 -mr-1 scrollbar-thin">
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
              {safeCategories.map((cat) => {
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
        </div>

        {/* Content Type */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Content Type
          </p>
          <div className="space-y-2">
            {CONTENT_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(t)}
                  onChange={() => onToggleType(t)}
                  className="h-3.5 w-3.5 rounded border-gray-300 accent-sky-600"
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
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Level
          </p>
          <div className="space-y-2">
            {LEVELS.map((l) => (
              <label key={l} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedLevels.includes(l)}
                  onChange={() => onToggleLevel(l)}
                  className="h-3.5 w-3.5 rounded border-gray-300 accent-sky-600"
                />
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  {l}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Apply button (mobile drawer only) */}
      {onApply && (
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <button
            onClick={onApply}
            className="w-full bg-gray-900 hover:bg-gray-800 active:bg-black text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
});

// ─── Main SearchClient ────────────────────────────────────────────────────────

export function SearchClient({
  categories = [],
  courses = [],
  selectedCategoryId: initialCategoryId,
  selectedTitle: initialTitle = "",
}: SearchClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Active Category state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(
    initialCategoryId || searchParams?.get("categoryId") || undefined
  );

  // Search input state
  const [searchValue, setSearchValue] = useState(
    initialTitle || searchParams?.get("title") || ""
  );

  // Filter state
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Tutorials", "Courses", "Articles", "Videos"]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"popular" | "recent" | "trending">("popular");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Debounced URL sync (non-blocking, doesn't delay local search)
  const debouncedSearch = useDebounce(searchValue, 500);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const url = queryString.stringifyUrl(
      { url: pathname, query: { title: debouncedSearch || null, categoryId: selectedCategoryId || null } },
      { skipNull: true, skipEmptyString: true }
    );
    router.replace(url, { scroll: false });
  }, [debouncedSearch, pathname, router, selectedCategoryId]);

  const onCategoryClick = useCallback((catId: string | null) => {
    setSelectedCategoryId(catId || undefined);
    setCurrentPage(1);
  }, []);

  const toggleType = useCallback(
    (t: string) => setSelectedTypes((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t])),
    []
  );
  const toggleLevel = useCallback(
    (l: string) => setSelectedLevels((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l])),
    []
  );

  // ⚡ INSTANT CLIENT-SIDE FILTER & SORT (0ms delay)
  const filteredAndSorted = useMemo(() => {
    let result = [...(courses || [])];

    // Filter by search text
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category?.name.toLowerCase().includes(q)
      );
    }

    // Filter by category
    if (selectedCategoryId) {
      result = result.filter((c) => c.category?.id === selectedCategoryId);
    }

    // Sort
    return result.sort((a, b) => {
      const aLen = a.chapters?.length || 0;
      const bLen = b.chapters?.length || 0;
      if (activeTab === "popular") return bLen - aLen;
      if (activeTab === "recent") return (b.id || "").localeCompare(a.id || "");
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [courses, searchValue, selectedCategoryId, activeTab]);

  // Paginate 12 items per page
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filteredAndSorted.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  // Reset page when tab/category/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedCategoryId, searchValue]);

  const filterPanelProps = {
    categories: categories || [],
    selectedCategoryId,
    selectedTypes,
    selectedLevels,
    onCategoryClick,
    onToggleType: toggleType,
    onToggleLevel: toggleLevel,
  };

  return (
    <div className="flex h-[calc(100vh-80px)] min-h-0 overflow-hidden bg-gray-50">

      {/* Hidden icon reference to ensure Turbopack HMR icon chunk inclusion */}
      <span className="hidden"><BarChart2 className="h-0 w-0" /></span>

      {/* ── 1. STICKY FIXED SIDEBAR (Desktop lg+) ────────────────────────── */}
      <aside className="hidden lg:block h-full w-60 flex-shrink-0 border-r border-gray-200 bg-white">
        <div className="h-full overflow-hidden">
          <FilterPanel {...filterPanelProps} />
        </div>
      </aside>

      {/* ── MOBILE FILTER DRAWER (<lg) ───────────────────────────────────── */}
      {mobileFilterOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden flex flex-col">
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
            <FilterPanel {...filterPanelProps} onApply={() => setMobileFilterOpen(false)} />
          </div>
        </>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="flex h-full min-w-0 flex-1 min-h-0 flex-col overflow-hidden px-3 sm:px-6 pt-4 pb-12">

        {/* ── 2. TOOLBAR: Sort Tabs + Integrated Search Bar ─────────────── */}
        <div className="flex flex-shrink-0 flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 pb-3 mb-4">
          {/* Sort Tabs */}
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl p-1 shadow-sm flex-shrink-0">
            {(["popular", "recent", "trending"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "bg-gray-900 text-white shadow"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Integrated Search Bar + Mobile Filter Button */}
          <div className="flex items-center gap-2 flex-1 sm:flex-initial">
            <div className="relative flex-1 sm:w-64 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-all placeholder:text-gray-400"
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm text-gray-600 font-medium border border-gray-200 rounded-xl bg-white hover:shadow-sm hover:border-sky-300 transition-all flex-shrink-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-sky-500" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Cards scroll area: controls above remain fixed in the viewport. */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {/* Results Counter */}
        <p className="text-xs text-gray-400 mb-3">
          {filteredAndSorted.length} {filteredAndSorted.length === 1 ? "course" : "courses"} found
          {selectedCategoryId && (categories || []).find((c) => c.id === selectedCategoryId)
            ? ` in ${(categories || []).find((c) => c.id === selectedCategoryId)?.name}`
            : ""}
          {filteredAndSorted.length > ITEMS_PER_PAGE && (
            <span className="text-gray-400 font-medium ml-1">
              — Page {safePage} of {totalPages}
            </span>
          )}
        </p>

        {/* ── 3. 4-COLUMN COURSE GRID (xl:grid-cols-4) ────────────────────── */}
        {paginated.length > 0 ? (
          <>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginated.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* ── 4. PAGINATION CONTROLS (12 PER PAGE) ────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>

                {/* Page Number Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                        page === safePage
                          ? "bg-gray-900 text-white shadow"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white border border-gray-100 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-700">No courses match your filter</p>
            <p className="text-xs text-gray-400">
              Try typing a different search query or select another category.
            </p>
            <button
              onClick={() => {
                setSelectedCategoryId(undefined);
                setSearchValue("");
              }}
              className="text-xs font-semibold text-sky-600 hover:underline mt-1"
            >
              Reset all filters
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
