export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] p-8">
      {/* Hero Heading */}
      <div className="mb-14">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] text-transparent bg-clip-text">
          Welcome Back, <span className="font-extrabold">Sir</span>
        </h1>
        <p className="mt-4 text-[#475569] text-sm md:text-base max-w-xl leading-relaxed">
          All core systems operational at <span className="font-medium text-[#2563eb]">peak performance</span>. 
          Navigate your control modules using the left sidebar.
        </p>
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module Navigator Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-[#06b6d4]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#ecfeff] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#1e293b] group-hover:text-[#0891b2] transition-colors">
              Module Navigator
            </h2>
          </div>
          <p className="text-[#475569] text-sm leading-relaxed">
            Access <span className="font-medium">Distribution</span>, <span className="font-medium">HR</span>, <span className="font-medium">Finance</span>, 
            and <span className="font-medium">Administration</span> modules. Each section is optimized for precision and reliability.
          </p>
          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex justify-end">
            <button className="text-xs font-medium text-[#0891b2] hover:text-[#0e7490] flex items-center gap-1 transition-colors">
              Explore Modules
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* System Overview Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-[#3b82f6]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#eff6ff] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[#1e293b] group-hover:text-[#2563eb] transition-colors">
              System Overview
            </h2>
          </div>
          <ul className="text-[#475569] text-sm space-y-3">
            <li className="flex items-start">
              <span className="text-[#10b981] mr-2 mt-0.5">●</span>
              <div>
                <span className="font-medium">Server Status:</span> 
                <span className="ml-1 text-[#059669] font-medium">Online</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-[#3b82f6] mr-2 mt-0.5">●</span>
              <div>
                <span className="font-medium">Sync Time:</span> 
                <span className="ml-1">{new Date().toLocaleTimeString()}</span>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-[#f59e0b] mr-2 mt-0.5">●</span>
              <div>
                <span className="font-medium">Uptime:</span> 
                <span className="ml-1 text-[#d97706] font-medium">99.99%</span>
              </div>
            </li>
          </ul>
          <div className="mt-4 pt-3 border-t border-[#f1f5f9]">
            <div className="flex items-center justify-between text-xs text-[#64748b]">
              <span>Last updated: Just now</span>
              <button className="text-[#2563eb] hover:text-[#1e40af] font-medium">
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-20 text-center">
        <p className="text-xs text-[#94a3b8] tracking-wide">
          ENGINEERED BY <span className="font-semibold text-[#475569]">MAZHAR DANYAL</span> • 
          ADAPTIVE INTERFACE <span className="text-[#2563eb] font-medium">v2.1</span> • 
          <span className="mx-2 text-[#cbd5e1]">|</span> 
          SECURE CONNECTION <span className="text-[#10b981]">✓</span>
        </p>
      </div>
    </div>
  );
}