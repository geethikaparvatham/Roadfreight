import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Map, 
  Truck, 
  Users, 
  UserCircle, 
  FileText, 
  ShieldCheck, 
  Bell, 
  BarChart3, 
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Consignments", href: "/dashboard/consignments", icon: Package },
  { name: "Live Tracking", href: "/dashboard/tracking", icon: Map },
  { name: "Fleet Management", href: "/dashboard/fleet", icon: Truck },
  { name: "Drivers", href: "/dashboard/drivers", icon: Users },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-300 border-r border-zinc-200 dark:border-zinc-800">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <Package className="h-6 w-6 text-blue-600 mr-3" />
        <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-wide">FreightTrack OS</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-600/10 dark:text-blue-500"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white",
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-blue-700 dark:text-blue-500" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white",
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs mr-3">
              RF
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate max-w-[120px]">Roadfreight</p>
              <p className="text-xs font-medium text-zinc-500 uppercase">
                Super Admin
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.location.href = "/"}
            className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-zinc-900 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
