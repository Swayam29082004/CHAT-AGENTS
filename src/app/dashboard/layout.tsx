import Sidebar from "@/components/dashboard/Sidebar";
import Navbar from "@/components/dashboard/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-20 md:ml-64 transition-all duration-300">
        <Navbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
