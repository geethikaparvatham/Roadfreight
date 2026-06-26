import { useState, useEffect } from "react";
import { dbData, useMockData } from "../lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Filter, ChevronLeft, ChevronRight, LogOut, Users, Activity, History, Settings as SettingsIcon, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { DriverDetailsPanel } from "../components/DriverDetailsPanel";
import { DriverTripsHistory } from "../components/DriverTripsHistory";
import { DriverSettings } from "../components/DriverSettings";
import { CreateTripPanel } from "../components/CreateTripPanel";

const ROWS_PER_PAGE = 15;

type TabType = "list" | "analytics" | "trips" | "settings" | "create-trip";

export default function DriverPortal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const data = useMockData();
  const drivers = data.drivers;
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("list");

  // Keep selectedDriverId valid and initialize it when drivers load
  useEffect(() => {
    if (drivers.length > 0) {
      if (!selectedDriverId || !drivers.some(d => d.id === selectedDriverId)) {
        setSelectedDriverId(drivers[0].id);
      }
    } else {
      setSelectedDriverId(null);
    }
  }, [drivers, selectedDriverId]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const filtered = drivers.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginatedData = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSearchChange = (val: string) => { setSearchTerm(val); setCurrentPage(1); };
  const handleStatusChange = (val: string) => { setStatusFilter(val); setCurrentPage(1); };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "On Trip": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Inactive": return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
      default: return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const handleRowClick = (id: string) => {
    setSelectedDriverId(id);
    setActiveTab("trips");
  };

  const navItems = [
    { id: "list", label: "Driver List", icon: Users },
    { id: "analytics", label: "Live Analytics", icon: Activity },
    { id: "trips", label: "Trips & History", icon: History },
    { id: "create-trip", label: "Create Trip", icon: PlusCircle },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ] as const;

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden sm:flex flex-col w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <Users className="h-6 w-6 text-blue-600 mr-3" />
          <span className="text-lg font-bold tracking-tight">Driver Portal</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-100"
                    : "text-muted-foreground hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0">
          <div className="mb-4 px-2">
            <span className="text-sm text-muted-foreground truncate block">{user?.email}</span>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2 font-medium"
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative min-w-0 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="sm:hidden flex-none bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10 h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            <span className="font-bold">Driver Portal</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30">
            <LogOut className="h-5 w-5" />
          </Button>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 pb-32 sm:pb-8">
          <div className="max-w-7xl mx-auto min-h-full">
            {activeTab === "list" && (
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Driver Management</h2>
                    <p className="text-muted-foreground">
                      Select a driver to view their real-time performance and location tracking.{" "}
                      <span className="font-medium text-zinc-700 dark:text-zinc-300">({filtered.length} drivers)</span>
                    </p>
                  </div>
                  <Button
                    variant={showFilters ? "secondary" : "outline"}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center max-w-2xl">
                  <div className="flex items-center w-full sm:w-96 relative">
                    <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search Name, ID, or License..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>

                  {showFilters && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300"
                      >
                        <option value="All">All</option>
                        <option value="Available">Available</option>
                        <option value="On Trip">On Trip</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-zinc-950 rounded-md shadow-sm border border-zinc-200 dark:border-zinc-800">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Driver ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>License No</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedData.map((driver) => (
                          <TableRow 
                            key={driver.id}
                            onClick={() => handleRowClick(driver.id)}
                            className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                          >
                            <TableCell className="font-medium text-blue-600 dark:text-blue-400">{driver.id}</TableCell>
                            <TableCell>{driver.name}</TableCell>
                            <TableCell>{driver.phone}</TableCell>
                            <TableCell className="font-mono">{driver.licenseNumber}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {driver.rating} <Star className="h-3 w-3 text-amber-500 ml-1 fill-amber-500" />
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary" className={getStatusColor(driver.status)}>
                                {driver.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedData.map((driver) => (
                      <div 
                        key={driver.id} 
                        onClick={() => handleRowClick(driver.id)}
                        className="p-4 flex flex-col gap-3 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-600 dark:text-blue-400">{driver.id}</span>
                          <Badge variant="secondary" className={getStatusColor(driver.status)}>
                            {driver.status}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">{driver.name}</span>
                          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-mono">{driver.licenseNumber}</span>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{driver.phone}</span>
                          <div className="flex items-center font-medium">
                            {driver.rating} <Star className="h-4 w-4 text-amber-500 ml-1 fill-amber-500" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filtered.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground border-t border-zinc-200 dark:border-zinc-800">
                      No drivers found matching your criteria.
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">
                      Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} drivers
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="w-9"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <Button variant="outline" onClick={() => setActiveTab("list")} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back to List
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Select Driver:</span>
                    <select
                      value={selectedDriverId || ""}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 min-w-[200px]"
                    >
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="w-full">
                  <DriverDetailsPanel 
                    driverId={selectedDriverId}
                    isOpen={true}
                    onClose={() => {}}
                  />
                </div>
              </div>
            )}

            {activeTab === "trips" && (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <Button variant="outline" onClick={() => setActiveTab("list")} className="gap-2">
                    <ChevronLeft className="h-4 w-4" /> Back to List
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Select Driver:</span>
                    <select
                      value={selectedDriverId || ""}
                      onChange={(e) => setSelectedDriverId(e.target.value)}
                      className="flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 min-w-[150px] sm:min-w-[200px]"
                    >
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="w-full">
                  <DriverTripsHistory driverId={selectedDriverId} />
                </div>
              </div>
            )}

            {activeTab === "create-trip" && (
              <div className="flex flex-col space-y-4">
                <CreateTripPanel />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="flex flex-col space-y-4">
                <DriverSettings />
              </div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 z-50 flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
