export default function CourseLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#f5f7fb] px-4 py-6 sm:px-8 lg:pl-80">
      <div className="mx-auto max-w-[1100px]">
        <div className="h-4 w-48 rounded-full bg-slate-200" />
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-[clamp(220px,42vw,560px)] bg-[#dfe5ee]" />
          <div className="border-b border-slate-200 p-6">
            <div className="h-3 w-24 rounded-full bg-slate-200" />
            <div className="mt-3 h-8 w-2/3 rounded-lg bg-slate-200" />
          </div>
          <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="h-52 rounded-xl bg-slate-100" />
            <div className="h-44 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
