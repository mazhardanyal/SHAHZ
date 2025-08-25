import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-6 mt-[80px] ml-[260px] overflow-y-auto">
          
          {children}
        </main>
      </div>
    </div>
  );
}
