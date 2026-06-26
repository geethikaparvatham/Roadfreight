import { Outlet, Navigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DriverSidebar } from "./DriverSidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { useAuth } from "../../contexts/AuthContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useState } from "react";

export function DashboardLayout() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">Loading...</div>;
  }

  // Require auth
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const isDriver = user.role === "Driver";
  const ActiveSidebar = isDriver ? DriverSidebar : Sidebar;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <ActiveSidebar />
      </div>

      {/* Mobile Sidebar via Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-zinc-950 border-r-zinc-800">
          <ActiveSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileMenuOpen(true)} />
        
        {/* Added pb-20 on mobile to clear the bottom nav */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 bg-zinc-50 dark:bg-zinc-950">
          <Outlet />
        </main>
        
        <BottomNav />
      </div>
    </div>
  );
}
