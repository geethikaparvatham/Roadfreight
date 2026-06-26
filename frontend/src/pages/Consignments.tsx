import { useState, useEffect } from "react";
import { dbData, saveMockData } from "../lib/mockData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Filter, Plus, X, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Consignments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [shipments, setShipments] = useState(dbData.shipments);

  // Sync shipments list in real-time when data changes (e.g., cross-tab or cross-portal)
  useEffect(() => {
    const handler = () => {
      setShipments([...dbData.shipments]);
    };
    window.addEventListener("dbDataChanged", handler);
    return () => window.removeEventListener("dbDataChanged", handler);
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 15;
  
  // Create Shipment Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState("");
  const [newOrigin, setNewOrigin] = useState("");
  const [newDest, setNewDest] = useState("");

  // Edit Shipment Modal state
  const [editingShipment, setEditingShipment] = useState<any>(null);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this shipment?")) {
      const updated = shipments.filter(s => s.id !== id);
      setShipments(updated);
      dbData.shipments = updated;
      saveMockData();
    }
  };

  const handleDownloadInvoice = (shipment: any) => {
    const invoiceContent = `=========================================
INVOICE / RECEIPT
=========================================
Consignment ID: ${shipment.id}
Date: ${new Date().toLocaleDateString()}
Status: ${shipment.status}

CUSTOMER DETAILS
-----------------------------------------
Name: ${shipment.customerName}

SHIPMENT DETAILS
-----------------------------------------
Origin: ${shipment.pickupAddress}
Destination: ${shipment.dropAddress}
ETA: ${new Date(shipment.eta).toLocaleDateString()}

BILLING
-----------------------------------------
Freight Amount: $${shipment.freightAmount.toLocaleString()}

=========================================
Thank you for doing business with us!`;

    const blob = new Blob([invoiceContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${shipment.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;
    const updated = shipments.map(s => s.id === editingShipment.id ? editingShipment : s);
    setShipments(updated);
    dbData.shipments = updated;
    saveMockData();
    setEditingShipment(null);
  };

  const filtered = shipments.filter(
    (s) => {
      const matchesSearch = s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            s.status.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      case "In Transit": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Delayed": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Out For Delivery": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Cancelled": return "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
      case "Assigned": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default: return "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300";
    }
  };

  const handleExportCSV = () => {
    const headers = ["CN ID", "Customer", "Origin", "Destination", "ETA", "Status", "Amount"];
    const rows = filtered.map(s => [
      s.id,
      `"${s.customerName}"`,
      `"${s.pickupAddress}"`,
      `"${s.dropAddress}"`,
      new Date(s.eta).toLocaleDateString(),
      s.status,
      s.freightAmount
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "consignments_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer || !newOrigin || !newDest) return;
    
    const maxShipmentId = dbData.shipments.reduce((max, s) => {
      const num = parseInt(s.id.replace("CN", ""), 10);
      return isNaN(num) ? max : (num > max ? num : max);
    }, 0);

    const newShipment = {
      id: `CN${String(maxShipmentId + 1).padStart(4, '0')}`,
      customerName: newCustomer,
      pickupAddress: newOrigin,
      dropAddress: newDest,
      eta: new Date().toISOString(),
      status: "In Transit",
      freightAmount: Math.floor(Math.random() * 5000) + 500,
      assignedTruckId: "Pending",
      assignedDriverId: "Pending"
    };

    dbData.shipments.unshift(newShipment);
    saveMockData();

    // Add to the top of the list
    setShipments([newShipment, ...shipments]);
    
    // Reset and close
    setShowCreateModal(false);
    setNewCustomer(""); setNewOrigin(""); setNewDest("");
  };

  return (
    <div className="space-y-4 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Consignments</h2>
          <p className="text-muted-foreground">Manage all your active and past shipments. <span className="font-medium text-zinc-700 dark:text-zinc-300">({filtered.length} shipments)</span></p>
        </div>
        <div className="flex gap-2">
          <Button variant={showFilters ? "secondary" : "outline"} onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Shipment
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center max-w-2xl">
        <div className="flex items-center w-full sm:w-96 relative">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search ID, Customer, or Status..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {showFilters && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Filter Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300"
            >
              <option value="All">All</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
              <option value="Delayed">Delayed</option>
              <option value="Out For Delivery">Out For Delivery</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Assigned">Assigned</option>
            </select>
          </div>
        )}
      </div>

      <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CN ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Origin - Destination</TableHead>
              <TableHead>ETA</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE).map((shipment) => (
              <TableRow key={shipment.id}>
                <TableCell className="font-medium text-blue-600 dark:text-blue-400">{shipment.id}</TableCell>
                <TableCell>{shipment.customerName}</TableCell>
                <TableCell>
                  {shipment.pickupAddress} &rarr; {shipment.dropAddress}
                </TableCell>
                <TableCell>{new Date(shipment.eta).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(shipment.status)}>
                    {shipment.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">${shipment.freightAmount.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950" 
                      onClick={() => handleDownloadInvoice(shipment)}
                      title="Download Invoice"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => setEditingShipment(shipment)} title="Edit Shipment">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDelete(shipment.id)} title="Delete Shipment">
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
            No consignments found matching your criteria.
          </div>
        )}
      </div>

      {/* Pagination */}
      {Math.ceil(filtered.length / ROWS_PER_PAGE) > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ROWS_PER_PAGE + 1}–{Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} shipments
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            {Array.from({ length: Math.min(Math.ceil(filtered.length / ROWS_PER_PAGE), 7) }, (_, i) => i + 1).map(page => (
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
            {Math.ceil(filtered.length / ROWS_PER_PAGE) > 7 && (
              <span className="text-sm text-muted-foreground">...{Math.ceil(filtered.length / ROWS_PER_PAGE)}</span>
            )}
            <Button variant="outline" size="sm" disabled={currentPage === Math.ceil(filtered.length / ROWS_PER_PAGE)} onClick={() => setCurrentPage(p => p + 1)}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Shipment Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Create New Shipment</h3>
            <form onSubmit={handleCreateShipment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name</label>
                <Input value={newCustomer} onChange={(e) => setNewCustomer(e.target.value)} placeholder="e.g. Acme Corp" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Origin Address</label>
                <Input value={newOrigin} onChange={(e) => setNewOrigin(e.target.value)} placeholder="e.g. Mumbai Hub" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination Address</label>
                <Input value={newDest} onChange={(e) => setNewDest(e.target.value)} placeholder="e.g. Delhi Warehouse" required />
              </div>
              <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                Generate Consignment
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Shipment Modal Overlay */}
      {editingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button 
              onClick={() => setEditingShipment(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">Edit Shipment</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name</label>
                <Input value={editingShipment.customerName} onChange={(e) => setEditingShipment({...editingShipment, customerName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Origin Address</label>
                <Input value={editingShipment.pickupAddress} onChange={(e) => setEditingShipment({...editingShipment, pickupAddress: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Destination Address</label>
                <Input value={editingShipment.dropAddress} onChange={(e) => setEditingShipment({...editingShipment, dropAddress: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select 
                  className="flex h-10 w-full items-center rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                  value={editingShipment.status}
                  onChange={(e) => setEditingShipment({...editingShipment, status: e.target.value})}
                >
                  <option value="Booked">Booked</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Out For Delivery">Out For Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <Button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                Save Changes
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
