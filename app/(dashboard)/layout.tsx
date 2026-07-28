import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full">
      {/* Navbar — on mobile: full width. On md+: offset by collapsed sidebar (w-16 = 64px) */}
      <div className="h-[80px] fixed inset-y-0 w-full z-50 md:pl-16">
        <Navbar />
      </div>

      {/* Desktop sidebar — hidden on mobile, shows collapsed icon strip on md+ */}
      <div className="hidden md:flex h-full flex-col fixed inset-y-0 z-50">
        <Sidebar />
      </div>

      {/* Main content — no left padding on mobile, collapsed sidebar width on md+ */}
      <main className="pt-[80px] min-h-screen md:pl-16">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
