import { BarChart2, Users2, CreditCard, Settings } from "lucide-react";
import logo from "../../assets/logo.jpg";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  
  const activeLink = (path) =>
    location.pathname === path
      ? "bg-white/25 text-white shadow-lg backdrop-blur-sm"
      : "text-white/90 hover:bg-white/15 hover:text-white";

  return (
   <aside className="fixed top-[80px] left-0 w-64 h-[calc(100vh-80px)] bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] border-r border-white/10 shadow-2xl p-5 z-40 transition-all
  backdrop-blur-[2px] bg-opacity-90
  before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.2)_0%,_transparent_40%)] before:pointer-events-none">
      {/* Logo - Enhanced with better glow */}
      <div className="flex items-center gap-3 mb-8">
        <img 
          src={logo} 
          alt="Logo" 
          className="w-10 h-10 rounded-full border-2 border-white/40 shadow-md hover:border-white/60 transition-all bg-black" 
        />
        
 <div>
 
  <h2 className="text-xl font-bold text-white/90 hover:text-white transition-colors">
    My Dashboard
  </h2>

</div>
</div>

      {/* Navigation - Smoother hover effects */}
      <nav className="flex flex-col gap-1.5 text-sm font-medium">
        <Link
          to="/distribution"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeLink("/distribution")}`}
        >
          <BarChart2 className={`h-5 w-5 ${location.pathname === "/distribution" ? "text-white" : "text-white/70"}`} />
          Distribution Module
        </Link>

        <a
          href="#"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeLink("#")}`}
        >
          <Users2 className={`h-5 w-5 ${location.pathname === "#" ? "text-white" : "text-white/70"}`} />
          HR Module
        </a>

        <a
          href="#"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeLink("#")}`}
        >
          <CreditCard className={`h-5 w-5 ${location.pathname === "#" ? "text-white" : "text-white/70"}`} />
          Accounts Module
        </a>

        <a
          href="#"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeLink("#")}`}
        >
          <Settings className={`h-5 w-5 ${location.pathname === "#" ? "text-white" : "text-white/70"}`} />
          System Admin
        </a>
      </nav>

      {/* Logout - Better hover effect */}
      <div className="absolute bottom-5 left-5 right-5">
        <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
          <Settings className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}