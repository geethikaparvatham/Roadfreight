import { useState, useEffect } from "react";
import { dbData, saveMockData } from "../lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Star, Filter, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROWS_PER_PAGE = 15;

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState(dbData.drivers);

  // Sync drivers list in real-time when data changes (e.g., cross-tab or cross-portal)
  useEffect(() => {
    const handler = () => {
      setDrivers([...dbData.drivers]);
    };
    window.addEventListener("dbDataChanged", handler);
    return () => window.removeEventListener("dbDataChanged", handler);
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({ name: "", phone: "", licenseNumber: "" });
  const [editingDriver, setEditingDriver] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear errors when modals toggle
  useEffect(() => {
    setErrorMessage(null);
  }, [isAddModalOpen, editingDriver]);

  const formatPhoneInput = (value: string) => {
    // Strip all non-numeric characters
    let digits = value.replace(/\D/g, "");
    // If it starts with 91 and is longer than 10, assume they pasted country code
    if (digits.startsWith("91") && digits.length > 10) {
      digits = digits.substring(2);
    }
    // Must start with 6, 7, 8, or 9
    if (digits.length > 0 && !/^[6-9]/.test(digits)) {
      digits = "";
    }
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  const handleDeleteDriver = (id: string) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      const updated = drivers.filter(d => d.id !== id);
      setDrivers(updated);
      dbData.drivers = updated;
      saveMockData();
    }
  };

  const handleEditDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    if (editingDriver.phone.length !== 10) {
      setErrorMessage("Phone number must be exactly 10 digits.");
      return;
    }

    const formattedPhone = `+91${editingDriver.phone}`;
    const phoneExists = dbData.drivers.some(d => d.id !== editingDriver.id && d.phone.replace(/\D/g, "").slice(-10) === editingDriver.phone);
    const licenseExists = dbData.drivers.some(d => d.id !== editingDriver.id && d.licenseNumber.trim().toUpperCase() === editingDriver.licenseNumber.trim().toUpperCase());

    if (phoneExists) {
      setErrorMessage("Phone number is already registered to another driver.");
      return;
    }
    if (licenseExists) {
      setErrorMessage("License number is already registered to another driver.");
      return;
    }

    const updatedDriver = { ...editingDriver, phone: formattedPhone };
    const updated = drivers.map(d => d.id === editingDriver.id ? updatedDriver : d);
    setDrivers(updated);
    dbData.drivers = updated;
    saveMockData();
    setEditingDriver(null);
  };

  const handleOnboardDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.name || !newDriver.phone || !newDriver.licenseNumber) return;

    if (newDriver.phone.length !== 10) {
      setErrorMessage("Phone number must be exactly 10 digits.");
      return;
    }

    const formattedPhone = `+91${newDriver.phone}`;

    // Check if phone or license already exists
    const phoneExists = dbData.drivers.some(d => d.phone.replace(/\D/g, "").slice(-10) === newDriver.phone);
    const licenseExists = dbData.drivers.some(d => d.licenseNumber.trim().toUpperCase() === newDriver.licenseNumber.trim().toUpperCase());

    if (phoneExists) {
      setErrorMessage("Phone number is already registered to another driver.");
      return;
    }
    if (licenseExists) {
      setErrorMessage("License number is already registered to another driver.");
      return;
    }
    
    const maxDriverId = dbData.drivers.reduce((max, d) => {
      const num = parseInt(d.id.replace("DRV", ""), 10);
      return isNaN(num) ? max : (num > max ? num : max);
    }, 0);

    const newDriverObj = {
      id: `DRV${String(maxDriverId + 1).padStart(4, '0')}`,
      name: newDriver.name,
      phone: formattedPhone,
      licenseNumber: newDriver.licenseNumber.toUpperCase(),
      rating: "5.0",
      status: "Available"
    };
    
    dbData.drivers.push(newDriverObj);
    saveMockData();
    setDrivers([...drivers, newDriverObj]);
    setIsAddModalOpen(false);
    setNewDriver({ name: "", phone: "", licenseNumber: "" });
  };

  const filtered = drivers.filter(
    (d) => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

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

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Driver Management</h2>
          <p className="text-muted-foreground">Manage your drivers, performance, and assignments. <span className="font-medium text-zinc-700 dark:text-zinc-300">({filtered.length} drivers)</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Onboard Driver</Button>
        </div>
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

      <div className="rounded-md border bg-white dark:bg-zinc-950 dark:border-zinc-800 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>License No</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-medium text-blue-600 dark:text-blue-400">{driver.id}</TableCell>
                <TableCell>{driver.name}</TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell className="font-mono">{driver.licenseNumber}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {driver.rating} <Star className="h-3 w-3 text-amber-500 ml-1 fill-amber-500" />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(driver.status)}>
                    {driver.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => {
                      // Strip +91 for editing
                      const editablePhone = driver.phone.replace(/\D/g, "").slice(-10);
                      setEditingDriver({...driver, phone: editablePhone});
                    }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDeleteDriver(driver.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
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
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
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
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Onboard Driver Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-zinc-950 rounded-xl shadow-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Onboard New Driver</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleOnboardDriver} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                <Input 
                  placeholder="e.g. Rahul Sharma" 
                  value={newDriver.name}
                  onChange={e => setNewDriver({...newDriver, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                    +91
                  </div>
                  <Input 
                    placeholder="9876543210" 
                    value={newDriver.phone}
                    onChange={e => setNewDriver({...newDriver, phone: formatPhoneInput(e.target.value)})}
                    className="pl-10 font-mono"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">License Number</label>
                <Input 
                  placeholder="e.g. LIC12345678" 
                  value={newDriver.licenseNumber}
                  onChange={e => setNewDriver({...newDriver, licenseNumber: e.target.value})}
                  required
                />
              </div>
              
              {errorMessage && (
                <div className="text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
                  {errorMessage}
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Onboard Driver
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Driver Modal */}
      {editingDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingDriver(null)}></div>
          <div className="relative bg-white dark:bg-zinc-950 rounded-xl shadow-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Edit Driver</h3>
              <button onClick={() => setEditingDriver(null)} className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleEditDriver} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                <Input value={editingDriver.name} onChange={e => setEditingDriver({...editingDriver, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
                    +91
                  </div>
                  <Input 
                    className="pl-10 font-mono"
                    value={editingDriver.phone} 
                    onChange={e => setEditingDriver({...editingDriver, phone: formatPhoneInput(e.target.value)})} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">License Number</label>
                <Input value={editingDriver.licenseNumber} onChange={e => setEditingDriver({...editingDriver, licenseNumber: e.target.value.toUpperCase()})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                <select className="flex h-10 w-full items-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950" value={editingDriver.status} onChange={e => setEditingDriver({...editingDriver, status: e.target.value})}>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              {errorMessage && (
                <div className="text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setEditingDriver(null)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
