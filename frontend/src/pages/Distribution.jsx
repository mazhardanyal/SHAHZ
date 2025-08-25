import { Link } from "react-router-dom";
import {
  FileText,
  ShoppingCart,
  Package,
  Building2,
  BarChart2,
  AlertTriangle,
  MapPin,
  CreditCard,
  Truck,
  BookUser,
  ArrowRight
} from "lucide-react";

const tabs = [
  { 
    label: "Sales Invoice", 
    icon: <FileText className="h-5 w-5" />, 
    link: "/distribution/sales-invoice",
    color: "from-blue-50 to-blue-100",
    iconColor: "text-blue-600"
  },
  { 
    label: "Purchase Invoice", 
    icon: <ShoppingCart className="h-5 w-5" />, 
    link: "/distribution/purchaseinvoice",
    color: "from-amber-50 to-amber-100",
    iconColor: "text-amber-600"
  },
  { 
    label: "Items Information", 
    icon: <Package className="h-5 w-5" />, 
    link: "/distribution/ItemsList",
    color: "from-purple-50 to-purple-100",
    iconColor: "text-purple-600"
  },
  {
  label: "Company Information", 
  icon: <Building2 className="h-5 w-5" />,
  link: "/distribution/CompanyInfo", // 🔥 Fixed spelling
  color: "from-indigo-50 to-indigo-100",
  iconColor: "text-indigo-600"
},

  {
  label: "Distribution Report",
  icon: <FileText className="h-5 w-5" />,
  link: "/distribution/DistributionReport",
  color: "from-green-50 to-green-100",
  iconColor: "text-green-600"
},

  { 
  label: "Damages/Claim", 
  icon: <AlertTriangle className="h-5 w-5" />,
  link: "/distribution/Damage", // This is correct
  color: "from-red-50 to-red-100",
  iconColor: "text-red-600"
},
  { 
  label: "Region Info", 
  icon: <MapPin className="h-5 w-5" />,
  link: "/distribution/region-info", // Add this link
  color: "from-orange-50 to-orange-100",
  iconColor: "text-orange-600"
},
  { 
    label: "Account Information", 
    icon: <CreditCard className="h-5 w-5" />, 
    link: "/distribution/accountInfo",
    color: "from-emerald-50 to-emerald-100",
    iconColor: "text-emerald-600"
  },
  { 
  label: "Van Information", 
  icon: <Truck className="h-5 w-5" />,
  link: "/distribution/van-info", // Make sure this matches your route
  color: "from-cyan-50 to-cyan-100",
  iconColor: "text-cyan-600"
},
  { 
    label: "Khata Account", 
    icon: <BookUser className="h-5 w-5" />,
    color: "from-rose-50 to-rose-100",
    iconColor: "text-rose-600"
  }
];

export default function Distribution() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Distribution Module</h1>
          <p className="text-gray-600 max-w-3xl">
            Central hub for all distribution operations including sales, purchases, inventory, and logistics management.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tabs.map((tab, index) => {
            const CardContent = (
              <div className={`group relative h-full bg-gradient-to-br ${tab.color} border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}>
                <div className="p-5 h-full flex flex-col">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg bg-white shadow-sm ${tab.iconColor}`}>
                      {tab.icon}
                    </div>
                    {tab.link && (
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900">
                      {tab.label}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 group-hover:text-gray-600">
                      Manage {tab.label.toLowerCase()} and related operations
                    </p>
                  </div>
                </div>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              </div>
            );

            return tab.link ? (
              <Link 
                key={index} 
                to={tab.link}
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl"
              >
                {CardContent}
              </Link>
            ) : (
              <div 
                key={index}
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-xl cursor-pointer"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}