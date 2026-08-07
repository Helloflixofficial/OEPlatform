export default function DashboardLoading() {
  return (
    <div className="min-h-screen animate-pulse bg-[#fbf8f4] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="h-4 w-32 rounded-full bg-[#eadfd3]" />
        <div className="mt-4 h-9 w-64 rounded-xl bg-[#e8dccf]" />
        <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-[#eee5dc]" />
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <div className="h-44 rounded-2xl border border-[#eadfd3] bg-white" />
          <div className="h-44 rounded-2xl border border-[#eadfd3] bg-white" />
          <div className="h-44 rounded-2xl border border-[#eadfd3] bg-white" />
        </div>
        <div className="mt-6 h-96 rounded-2xl border border-[#eadfd3] bg-white" />
      </div>
    </div>
  );
}
