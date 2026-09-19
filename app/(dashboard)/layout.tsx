import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-[100dvh]">
      {/* Navbar — on mobile: full width. On md+: offset by collapsed sidebar (w-16 = 64px) */}
      <div className="fixed inset-x-0 top-0 z-40 h-[80px] w-full md:pl-16">
        <Navbar />
      </div>

      {/* Desktop sidebar — hidden on mobile, shows collapsed icon strip on md+ */}
      <div className="fixed inset-y-0 left-0 z-50 hidden h-[100dvh] flex-col md:flex">
        <Sidebar />
      </div>

      {/* Main content — no left padding on mobile, collapsed sidebar width on md+ */}
      <main className="min-h-[100dvh] overflow-x-hidden pt-[80px] md:pl-16">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
