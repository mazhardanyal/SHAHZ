import { useState, useRef, useEffect } from "react";
import { Mail, ChevronDown } from "lucide-react";
import logo from "../../assets/logo.jpg";
import avatar from "../../assets/admin.png";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentUser = {
    name: "Abdur Rehman",
    avatar: avatar,
  };

  return (
   <header className="fixed top-0 left-0 w-full h-[80px] bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] border-b border-white/10 shadow-2xl z-40 transition-all
  backdrop-blur-[2px] bg-opacity-90
  before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.2)_0%,_transparent_40%)] before:pointer-events-none
  flex items-center justify-between px-6">
  

      {/* Left: Logo + Title - Enhanced with better glow */}
      <div className="flex items-center gap-3 bg-bla">
        <img
          src={logo}
          alt="Logo"
          className="h-[48px] w-[48px] rounded-md bg-black ring-2 ring-white/40 shadow-lg transition-all hover:scale-105 hover:ring-white/60"
        />
        <h1 className="text-xl font-bold tracking-wide uppercase text-white/90 hover:text-white transition-colors">
          Shahz Marketing Associate
        </h1>
      </div>

      {/* Right: Icons + User - Enhanced interactions */}
      <div className="flex items-center gap-6">

        {/* Notification - More polished badge */}
        <button className="relative group p-1 rounded-full hover:bg-white/10 transition">
          <Mail className="h-6 w-6 text-white/90 group-hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md group-hover:bg-red-400 transition-all">
            3
          </span>
        </button>

        {/* User Dropdown - More elegant styling */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 transition-all border border-white/10 hover:border-white/20"
          >
            <img
              src={currentUser.avatar}
              alt="User"
              className="h-8 w-8 rounded-full object-cover border-2 border-white/30 hover:border-white/50 transition-all"
            />
            <span className="text-sm font-medium text-white/90 hover:text-white transition-colors">
              {currentUser.name}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-white/70 transition-all duration-200 ${
                menuOpen ? "rotate-180 text-white" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu - More refined appearance */}
         {/* Dropdown Menu */}
{menuOpen && (
  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 border border-gray-200 rounded-lg shadow-2xl z-50 overflow-hidden">
    <div className="px-4 py-2 text-xs text-gray-500 uppercase bg-gray-50">
      Admin
    </div>
    <div className="border-t border-gray-100"></div>

    {/* Settings Button */}
    <button
      onClick={() => window.location.href = "/settings"} // later we use React Router
      className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2"
    >
       Settings
    </button>

    {/* Logout */}
    <button className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-all flex items-center gap-2">
      <ChevronDown className="h-4 w-4 rotate-90" />
      Log out
    </button>
  </div>
)}

        </div>
      </div>
    </header>
  );
}