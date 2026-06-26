import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Navigation, Package, Search, ArrowUp, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { dbData, saveMockData } from "../lib/mockData";
import { notificationStore } from "../lib/notificationsStore";

const ACTIVE_SHIPMENT_STATUSES = ["Booked", "Picked Up", "In Transit", "Out For Delivery"];

export function DriverTripsHistory({ driverId }: { driverId: string | null }) {
  const driver = dbData.drivers.find(d => d.id === driverId);
  const [searchTerm, setSearchTerm] = useState("");

  const activeShipment = driverId
    ? dbData.shipments.find(s => s.driverId === driverId && ACTIVE_SHIPMENT_STATUSES.includes(s.status))
    : null;

  const handleUpdateStatus = (status: "Delayed" | "Cancelled" | "Delivered") => {
    if (!activeShipment) return;

    activeShipment.status = status;

    if (status === "Cancelled" || status === "Delivered") {
      // Free up the driver
      if (driver) driver.status = "Available";
      // Free up the truck
      const truck = dbData.trucks.find(t => t.id === activeShipment.truckId);
      if (truck) truck.status = "Available";
    }

    saveMockData();

    // Send notification to Admin
    let notifType: "warning" | "alert" | "success" = "success";
    if (status === "Delayed") notifType = "warning";
    if (status === "Cancelled") notifType = "alert";

    notificationStore.add(
      notifType,
      `Shipment ${status}`,
      `Driver ${driver?.name} marked shipment ${activeShipment.id} as ${status}.`
    );

    // Force re-render locally by triggering an event if needed, but since we are changing dbData directly,
    // and rely on parent passing driverId, we can just force update or let the parent re-render.
    // For simplicity, we can dispatch the event here so everything syncs.
    window.dispatchEvent(new CustomEvent("dbDataChanged"));
  };

  // Generate some deterministic mock past trips based on driverId
  const pastTrips = useMemo(() => {
    if (!driverId) return [];
    
    // Seed random generation with driverId so it's consistent
    const seed = driverId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const numTrips = (seed % 15) + 5; // 5 to 20 past trips
    
    const statuses = ["Delivered", "Delivered", "Delivered", "Cancelled", "Delayed"];
    const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Pune", "Hyderabad", "Ahmedabad", "Jaipur", "Surat"];
    
    return Array.from({ length: numTrips }).map((_, i) => {
      const tripSeed = seed + i;
      const status = statuses[tripSeed % statuses.length];
      const originIdx = tripSeed % cities.length;
      let destIdx = (tripSeed * 3) % cities.length;
      if (destIdx === originIdx) destIdx = (destIdx + 1) % cities.length;
      
      const date = new Date(Date.now() - (tripSeed % 60) * 86400000 - i * 86400000 * 3); // some past date
      
      return {
        id: `TRP${String(tripSeed * 17).padStart(5, '0')}`,
        date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        origin: cities[originIdx],
        destination: cities[destIdx],
        status,
        amount: `₹${(Math.floor(5000 + (tripSeed % 10000)))}`,
        distance: `${Math.floor(100 + (tripSeed % 900))} km`
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [driverId]);

  const filteredTrips = pastTrips.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-400";
      case "Cancelled": return "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400";
      case "Delayed": return "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400";
      default: return "bg-zinc-100 text-zinc-800";
    }
  };

  if (!driver) return <div className="p-8 text-center text-zinc-500">No driver selected. Please select a driver to view their history.</div>;

  return (
    <div className="space-y-6">
      {/* ── Active Trip Card ── */}
      {activeShipment && (
        <Card className="border-blue-100 dark:border-blue-900/50 shadow-md bg-blue-50/30 dark:bg-blue-900/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
          <CardHeader className="pb-3 border-b border-blue-100/50 dark:border-blue-900/30">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <Package className="h-5 w-5 text-blue-500" /> Current Active Trip
                </CardTitle>
                <p className="text-sm text-blue-700/80 dark:text-blue-300/80 mt-1">
                  Update the status of your ongoing shipment: <span className="font-semibold">{activeShipment.id}</span>
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200">
                {activeShipment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-base">
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeShipment.pickupAddress}</span>
                <Navigation className="h-4 w-4 text-blue-400 rotate-90" />
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{activeShipment.dropAddress}</span>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 sm:flex-none border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                  onClick={() => handleUpdateStatus("Delayed")}
                >
                  <AlertTriangle className="w-4 h-4 mr-1.5" /> Delayed
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1 sm:flex-none border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => handleUpdateStatus("Cancelled")}
                >
                  <XCircle className="w-4 h-4 mr-1.5" /> Cancelled
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleUpdateStatus("Delivered")}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Delivered
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Past Trips ── */}
      <Card className="border-white/50 dark:border-zinc-800 shadow-xl bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl">
      <CardHeader className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-500" /> Trip History
          </CardTitle>
          <p className="text-sm text-zinc-500 mt-1">Viewing all past trips for <span className="font-semibold text-zinc-900 dark:text-zinc-100">{driver.name}</span></p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search trips, cities..." 
            className="pl-8 bg-white dark:bg-zinc-950"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
              <TableRow>
                <TableHead className="w-[120px] px-6">Trip ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right px-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                    No past trips found matching your search.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((trip) => (
                  <TableRow key={trip.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <TableCell className="font-medium text-indigo-600 dark:text-indigo-400 px-6">{trip.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                        <Calendar className="h-3.5 w-3.5" /> {trip.date}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{trip.origin}</span>
                        <Navigation className="h-3 w-3 text-indigo-400 rotate-90" />
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{trip.destination}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-600 dark:text-zinc-400 font-medium">{trip.distance}</TableCell>
                    <TableCell className="font-bold text-zinc-700 dark:text-zinc-300">{trip.amount}</TableCell>
                    <TableCell className="text-right px-6">
                      <Badge variant="secondary" className={`${getStatusColor(trip.status)} border-none shadow-sm`}>
                        {trip.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden flex flex-col divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {filteredTrips.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">
              No past trips found matching your search.
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div key={trip.id} className="p-4 flex flex-col gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{trip.id}</span>
                  <Badge variant="secondary" className={`${getStatusColor(trip.status)} border-none shadow-sm`}>
                    {trip.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-base">
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{trip.origin}</span>
                  <Navigation className="h-4 w-4 text-indigo-400 rotate-90" />
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{trip.destination}</span>
                </div>
                
                <div className="flex justify-between items-center mt-1">
                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
                    <Calendar className="h-3.5 w-3.5" /> {trip.date}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 dark:text-zinc-400 text-sm font-medium">{trip.distance}</span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{trip.amount}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Back to Top Button (Mobile) */}
        {filteredTrips.length > 0 && (
          <div className="md:hidden p-6 flex justify-center border-t border-zinc-100 dark:border-zinc-800/50">
            <Button 
              variant="outline" 
              onClick={() => {
                const mainEl = document.querySelector('main');
                if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="rounded-full shadow-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Back to Top
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
