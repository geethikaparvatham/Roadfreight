import { useState, useEffect } from "react";
import { dbData, saveMockData } from "../lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const ROWS_PER_PAGE = 15;

export default function Fleet() {
  const [searchTerm, setSearchTerm] = useState("");
  const [trucks, setTrucks] = useState(dbData.trucks);

  // Sync trucks list in real-time when data changes (e.g., cross-tab or cross-portal)
  useEffect(() => {
    const handler = () => {
      setTrucks([...dbData.trucks]);
    };
    window.addEventListener("dbDataChanged", handler);
    return () => window.removeEventListener("dbDataChanged", handler);
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ registration: "", type: "Heavy", capacity: "" });
  const [editingTruck, setEditingTruck] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear errors when modals toggle
  useEffect(() => {
    setErrorMessage(null);
  }, [isAddModalOpen, editingTruck]);

  const handleDeleteTruck = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      const updated = trucks.filter(t => t.id !== id);
      setTrucks(updated);
      dbData.trucks = updated;
      saveMockData();
    }
  };

  const handleEditTruck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTruck) return;

    // Check if registration number already exists for another truck
    const regExists = dbData.trucks.some(t => t.id !== editingTruck.id && t.vehicleNumber.trim().toUpperCase() === editingTruck.vehicleNumber.trim().toUpperCase());
    if (regExists) {
      setErrorMessage("Registration/vehicle number is already registered to another truck.");
      return;
    }

    const updated = trucks.map(t => t.id === editingTruck.id ? editingTruck : t);
    setTrucks(updated);
    dbData.trucks = updated;
    saveMockData();
    setEditingTruck(null);
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.registration || !newVehicle.capacity) return;

    // Check if registration number already exists
    const regExists = dbData.trucks.some(t => t.vehicleNumber.trim().toUpperCase() === newVehicle.registration.trim().toUpperCase());
    if (regExists) {
      setErrorMessage("Registration/vehicle number is already registered to another truck.");
      return;
    }
    
    const maxTruckId = dbData.trucks.reduce((max, t) => {
      const num = parseInt(t.id.replace("TRK", ""), 10);
      return isNaN(num) ? max : (num > max ? num : max);
    }, 0);

    const newTruck = {
      id: `TRK${String(maxTruckId + 1).padStart(4, '0')}`,
      vehicleNumber: newVehicle.registration,
      type: newVehicle.type,
      capacity: Number(newVehicle.capacity),
      status: "Available"
    };

    const maxShipmentId = dbData.shipments.reduce((max, s) => {
      const num = parseInt(s.id.replace("CN", ""), 10);
      return isNaN(num) ? max : (num > max ? num : max);
    }, 0);

    const newShipment = {
      id: `CN${String(maxShipmentId + 1).padStart(4, '0')}`,
      customerId: "CUST0001",
      customerName: "Onboarding Customer",
      pickupAddress: "Mumbai, MH",
      dropAddress: "Delhi, DL",
      truckId: newTruck.id,
      driverId: "DRV0001",
      status: "Booked",
      freightAmount: 3500,
      companyId: "c1",
      eta: new Date(Date.now() + 86400000).toISOString(),
    };
    dbData.shipments.unshift(newShipment);
    
    dbData.trucks.unshift(newTruck);
    saveMockData();
    setTrucks([newTruck, ...trucks]);
    setIsAddModalOpen(false);
    setNewVehicle({ registration: "", type: "Heavy", capacity: "" });
  };

  const filtered = trucks.filter(
    (t) => {
      const matchesSearch = t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  // Reset page when filters change
  const handleSearchChange = (val: string) => { setSearchTerm(val); setCurrentPage(1); };
  const handleStatusChange = (val: string) => { setStatusFilter(val); setCurrentPage(1); };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "Assigned": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Maintenance": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default: return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Management</h2>
          <p className="text-muted-foreground">Manage your vehicles and their statuses. <span className="font-medium text-zinc-700 dark:text-zinc-300">({filtered.length} vehicles)</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Vehicle</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center max-w-2xl">
        <div className="flex items-center w-full sm:w-96 relative">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Vehicle No..."
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
              <option value="Assigned">Assigned</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        )}
      </div>

      <div className="rounded-md border bg-white dark:bg-zinc-950 dark:border-zinc-800 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle ID</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((truck) => (
              <TableRow key={truck.id}>
                <TableCell className="font-medium text-blue-600 dark:text-blue-400">{truck.id}</TableCell>
                <TableCell className="font-mono">{truck.vehicleNumber}</TableCell>
                <TableCell>{truck.type}</TableCell>
                <TableCell>{truck.capacity} kg</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(truck.status)}>
                    {truck.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => setEditingTruck({...truck})}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDeleteTruck(truck.id)}>
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
            No vehicles found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} vehicles
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

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-zinc-950 rounded-xl shadow-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Add New Vehicle</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Registration Number</label>
                <Input 
                  placeholder="e.g. MH12AB1234" 
                  value={newVehicle.registration}
                  onChange={e => setNewVehicle({...newVehicle, registration: e.target.value.toUpperCase()})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Vehicle Type</label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                  value={newVehicle.type}
                  onChange={e => setNewVehicle({...newVehicle, type: e.target.value})}
                >
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Capacity (kg)</label>
                <Input 
                  type="number"
                  placeholder="e.g. 5000" 
                  value={newVehicle.capacity}
                  onChange={e => setNewVehicle({...newVehicle, capacity: e.target.value})}
                  required
                  min="500"
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
                  Add Vehicle
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Vehicle Modal */}
      {editingTruck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingTruck(null)}></div>
          <div className="relative bg-white dark:bg-zinc-950 rounded-xl shadow-2xl w-full max-w-md p-6 border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Edit Vehicle</h3>
              <button onClick={() => setEditingTruck(null)} className="p-1 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleEditTruck} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Registration Number</label>
                <Input value={editingTruck.vehicleNumber} onChange={e => setEditingTruck({...editingTruck, vehicleNumber: e.target.value.toUpperCase()})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Vehicle Type</label>
                <select className="flex h-10 w-full items-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950" value={editingTruck.type} onChange={e => setEditingTruck({...editingTruck, type: e.target.value})}>
                  <option value="Light">Light</option>
                  <option value="Medium">Medium</option>
                  <option value="Heavy">Heavy</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Capacity (kg)</label>
                <Input type="number" value={editingTruck.capacity} onChange={e => setEditingTruck({...editingTruck, capacity: Number(e.target.value)})} required min="500" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
                <select className="flex h-10 w-full items-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950" value={editingTruck.status} onChange={e => setEditingTruck({...editingTruck, status: e.target.value})}>
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              {errorMessage && (
                <div className="text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900/50">
                  {errorMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
                <Button type="button" variant="outline" onClick={() => setEditingTruck(null)}>Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
