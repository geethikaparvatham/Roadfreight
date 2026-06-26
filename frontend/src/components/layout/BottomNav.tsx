import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Map, Truck, Settings } from "lucide-react";

export function BottomNav() {
  const navItems = [
    { name: "Home", path: "/dashboard", icon: LayoutDashboard },
    { name: "Drivers", path: "/dashboard/drivers", icon: Users },
    { name: "Tracking", path: "/dashboard/tracking", icon: Map },
    { name: "Fleet", path: "/dashboard/fleet", icon: Truck },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
