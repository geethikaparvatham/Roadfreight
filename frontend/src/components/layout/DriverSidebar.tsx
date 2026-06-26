import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Map, 
  Settings,
  LogOut,
  Navigation
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

const navigation = [
  { name: "Drivers List", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Trips", href: "/dashboard/consignments", icon: Navigation },
  { name: "Live Route", href: "/dashboard/tracking", icon: Map },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DriverSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/";
  };

  return (
    <div className="flex h-full w-64 flex-col bg-zinc-950 text-zinc-300 border-r border-zinc-800">
      <div className="flex h-16 items-center px-6 border-b border-zinc-800 bg-zinc-950">
        <Navigation className="h-6 w-6 text-blue-500 mr-3" />
        <span className="text-lg font-bold text-white tracking-wide">Driver Portal</span>
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
                    ? "bg-blue-600/10 text-blue-500"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-blue-500" : "text-zinc-400 group-hover:text-white",
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
      <div className="p-4 border-t border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs mr-3 uppercase">
              {user?.email?.substring(0, 2) || "D"}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.displayName || "Driver"}</p>
              <p className="text-xs font-medium text-zinc-500 uppercase">
                {user?.role || "Driver"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-md transition-colors"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
