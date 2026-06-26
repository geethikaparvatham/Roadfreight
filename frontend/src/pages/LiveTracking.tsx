import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigation, Clock, MapPin, AlertCircle, Search, Truck, User, Package, ParkingCircle, Wrench } from "lucide-react";
import { dbData, useMockData } from "../lib/mockData";

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/751/751432.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// City coordinates for route mapping
const cityCoords: Record<string, [number, number]> = {
  "Mumbai, MH": [19.0760, 72.8777],
  "Delhi, DL": [28.6139, 77.2090],
  "Bangalore, KA": [12.9716, 77.5946],
  "Chennai, TN": [13.0827, 80.2707],
  "Kolkata, WB": [22.5726, 88.3639],
  "Pune, MH": [18.5204, 73.8567],
  "Hyderabad, TS": [17.3850, 78.4867],
  "Ahmedabad, GJ": [23.0225, 72.5714],
  "Jaipur, RJ": [26.9124, 75.7873],
  "Surat, GJ": [21.1702, 72.8311],
  "Lucknow, UP": [26.8467, 80.9462],
  "Kanpur, UP": [26.4499, 80.3319],
};

const ACTIVE_SHIPMENT_STATUSES = ["Booked", "Assigned", "Picked Up", "In Transit", "Delayed", "Out For Delivery"];

export default function LiveTracking() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [speed, setSpeed] = useState(65);
  const [eta, setEta] = useState(14);
  const [progress, setProgress] = useState(0.3);
  const data = useMockData();

  // Keep selectedTruckId valid if the truck is deleted
  useEffect(() => {
    if (selectedTruckId && !data.trucks.some(t => t.id === selectedTruckId)) {
      setSelectedTruckId(null);
    }
  }, [data, selectedTruckId]);

  // A truck is trackable if its fleet status is "Assigned" — that means it's on a trip
  const isAssigned = (truckId: string) => {
    const truck = data.trucks.find((t: any) => t.id === truckId);
    return truck?.status === "Assigned";
  };

  // Search results — show all trucks but mark which ones are trackable
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return data.trucks.filter(t =>
      t.id.toLowerCase().includes(term) ||
      t.vehicleNumber.toLowerCase().includes(term)
    ).slice(0, 10);
  }, [searchTerm, data]);

  // Selected truck & linked shipment/driver — only link if truck is Assigned
  const selectedTruck = selectedTruckId ? data.trucks.find(t => t.id === selectedTruckId) : null;
  // For Assigned trucks: prefer active shipment, fall back to any shipment linked to this truck
  const linkedShipment = (selectedTruck && selectedTruck.status === "Assigned")
    ? (data.shipments.find((s: any) => s.truckId === selectedTruck.id && ACTIVE_SHIPMENT_STATUSES.includes(s.status))
       || data.shipments.find((s: any) => s.truckId === selectedTruck.id))
    : null;
  const linkedDriver = linkedShipment ? data.drivers.find(d => d.id === linkedShipment.driverId) : null;

  const truckIsOnTrip = selectedTruck?.status === "Assigned";

  // Route coordinates for the selected shipment
  const routeCoordinates = useMemo(() => {
    if (!linkedShipment) return [];
    const origin = cityCoords[linkedShipment.pickupAddress];
    const dest = cityCoords[linkedShipment.dropAddress];
    if (!origin || !dest) return [];

    // Generate intermediate waypoint
    const mid: [number, number] = [(origin[0] + dest[0]) / 2 + (Math.random() * 2 - 1), (origin[1] + dest[1]) / 2 + (Math.random() * 2 - 1)];
    return [origin, mid, dest];
  }, [linkedShipment]);

  // Current truck position along the route
  const currentPosition = useMemo((): [number, number] => {
    if (routeCoordinates.length < 2) return [23.0225, 75.5714];
    const segIndex = Math.min(Math.floor(progress * (routeCoordinates.length - 1)), routeCoordinates.length - 2);
    const segProgress = (progress * (routeCoordinates.length - 1)) - segIndex;
    const start = routeCoordinates[segIndex];
    const end = routeCoordinates[segIndex + 1];
    return [
      start[0] + (end[0] - start[0]) * segProgress,
      start[1] + (end[1] - start[1]) * segProgress,
    ];
  }, [routeCoordinates, progress]);

  // Simulate movement
  useEffect(() => {
    if (!selectedTruck || !truckIsOnTrip) return;
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 0.02, 0.95));
      setSpeed(Math.floor(55 + Math.random() * 30));
      setEta(prev => Math.max(1, prev - 0.3 + (Math.random() * 0.2 - 0.1)));
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedTruck, truckIsOnTrip]);

  // Reset when new truck selected
  const handleSelectTruck = (truckId: string) => {
    setSelectedTruckId(truckId);
    setSearchTerm("");
    setShowDropdown(false);
    setProgress(0.15 + Math.random() * 0.4);
    setSpeed(Math.floor(55 + Math.random() * 30));
    setEta(Math.floor(3 + Math.random() * 18));
  };

  const mapCenter = routeCoordinates.length > 0 ? currentPosition : [23.0225, 75.5714] as [number, number];

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return { bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", label: "Available" };
      case "Assigned":
        return { bg: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", label: "Assigned" };
      case "Maintenance":
        return { bg: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", label: "Maintenance" };
      default:
        return { bg: "bg-zinc-100 text-zinc-700", label: status };
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Tracking Command Center</h2>
          <p className="text-muted-foreground">
            Search an <span className="font-semibold text-blue-600 dark:text-blue-400">Assigned</span> truck to monitor its real-time position and route.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Truck ID or Registration..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && searchTerm.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg z-50 overflow-hidden">
              {searchResults.length > 0 ? (
                <ul className="py-1">
                  {searchResults.map(truck => {
                    const onTrip = isAssigned(truck.id);
                    const shipment = data.shipments.find((s: any) => s.truckId === truck.id && ACTIVE_SHIPMENT_STATUSES.includes(s.status));
                    const badge = getStatusBadge(truck.status);
                    return (
                      <li key={truck.id}>
                        <button
                          onClick={() => handleSelectTruck(truck.id)}
                          className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors ${
                            onTrip
                              ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                              : "opacity-50 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg ${onTrip ? "bg-blue-100 dark:bg-blue-900/30" : "bg-zinc-100 dark:bg-zinc-800"}`}>
                            <Truck className={`h-4 w-4 ${onTrip ? "text-blue-600" : "text-zinc-400"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{truck.id} — {truck.vehicleNumber}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {onTrip && shipment
                                ? `🚚 ${shipment.pickupAddress} → ${shipment.dropAddress}`
                                : truck.status === "Available"
                                  ? "🅿️ Parked — No active trip"
                                  : "🔧 Under maintenance"
                              }
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <Badge variant="secondary" className={`text-[10px] ${badge.bg}`}>
                              {badge.label}
                            </Badge>
                            {onTrip && (
                              <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">📡 LIVE</span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-4 text-sm text-center text-muted-foreground">No trucks found for "{searchTerm}"</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
        {/* Info Panel */}
        <Card className="lg:col-span-1 h-full overflow-y-auto">
          {selectedTruck && truckIsOnTrip && linkedShipment ? (
            /* ── ASSIGNED TRUCK — Full live tracking panel ── */
            <>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-blue-500" />
                  {selectedTruck.id}
                </CardTitle>
                <p className="text-sm font-mono text-muted-foreground">{selectedTruck.vehicleNumber}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="w-fit bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {linkedShipment.status}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-700 animate-pulse">
                    📡 LIVE TRACKING
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Speed & ETA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <Navigation className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Speed</p>
                      <p className="text-lg font-bold">{speed} <span className="text-xs font-normal">km/h</span></p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <Clock className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ETA</p>
                      <p className="text-lg font-bold">{eta.toFixed(0)} <span className="text-xs font-normal">hrs</span></p>
                    </div>
                  </div>
                </div>

                {/* Shipment Details */}
                <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Shipment Details</h4>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Consignment</span><span className="font-medium">{linkedShipment.id}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{linkedShipment.customerName}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Freight</span><span className="font-medium">₹{linkedShipment.freightAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">ETA Date</span><span className="font-medium">{new Date(linkedShipment.eta).toLocaleDateString()}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="font-medium">{selectedTruck.type} ({selectedTruck.capacity.toLocaleString()} kg)</span></div>
                  </div>
                </div>

                {/* Driver Details */}
                {linkedDriver && (
                  <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                    <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-1"><User className="h-3 w-3" /> Driver</h4>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{linkedDriver.name}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{linkedDriver.phone}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">License</span><span className="font-mono text-xs">{linkedDriver.licenseNumber}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-medium">{linkedDriver.rating} ⭐</span></div>
                    </div>
                  </div>
                )}

                {/* Route Timeline */}
                <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Route Timeline</h4>
                  <div className="relative pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-5">
                    <div className="relative">
                      <span className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-zinc-950" />
                      <p className="font-medium text-sm">Origin: {linkedShipment.pickupAddress}</p>
                      <p className="text-xs text-muted-foreground">Dispatched</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-white dark:ring-zinc-950 animate-pulse" />
                      <p className="font-medium text-sm text-amber-700 dark:text-amber-400">In Transit — {Math.floor(progress * 100)}% complete</p>
                      <p className="text-xs text-muted-foreground">Moving at {speed} km/h</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-[25px] top-1 h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-700 ring-4 ring-white dark:ring-zinc-950" />
                      <p className="font-medium text-sm text-muted-foreground">Destination: {linkedShipment.dropAddress}</p>
                      <p className="text-xs text-muted-foreground">ETA: ~{eta.toFixed(0)} hrs</p>
                    </div>
                  </div>
                </div>

                {/* Traffic Alert */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start space-x-3 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                    <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-amber-800 dark:text-amber-300">Traffic Alert</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                        Moderate congestion detected ahead. ETA is being recalculated dynamically.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : selectedTruck && !truckIsOnTrip ? (
            /* ── NOT ASSIGNED — Show truck info but NO tracking ── */
            <CardContent className="flex flex-col items-center justify-center h-full text-center space-y-5 py-12">
              <div className={`p-5 rounded-full ${
                selectedTruck.status === "Available"
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : "bg-amber-100 dark:bg-amber-900/30"
              }`}>
                {selectedTruck.status === "Available"
                  ? <ParkingCircle className="h-10 w-10 text-emerald-500" />
                  : <Wrench className="h-10 w-10 text-amber-500" />
                }
              </div>

              <div>
                <p className="font-semibold text-lg text-zinc-800 dark:text-zinc-100">
                  {selectedTruck.id}
                </p>
                <p className="text-sm font-mono text-muted-foreground">{selectedTruck.vehicleNumber}</p>
              </div>

              <Badge
                variant="secondary"
                className={`text-sm px-3 py-1 ${getStatusBadge(selectedTruck.status).bg}`}
              >
                {selectedTruck.status}
              </Badge>

              <div className={`p-4 rounded-xl border w-full max-w-xs ${
                selectedTruck.status === "Available"
                  ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
                  : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
              }`}>
                {selectedTruck.status === "Available" ? (
                  <>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">🅿️ Parked & Ready</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      This truck is free and parked at the warehouse. It is not currently assigned to any delivery. No live tracking available.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-1">🔧 Under Maintenance</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      This truck is in the service center for repair or inspection. It is not available for trips. No live tracking available.
                    </p>
                  </>
                )}
              </div>

              <p className="text-xs text-muted-foreground max-w-xs">
                Live tracking is only available for trucks that are <strong className="text-blue-600 dark:text-blue-400">Assigned</strong> to an active shipment.
              </p>
            </CardContent>
          ) : (
            /* ── NO TRUCK SELECTED — Default state ── */
            <CardContent className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
              <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">Search a Truck</p>
                <p className="text-sm text-muted-foreground mt-1">Type a Truck ID (e.g. TRK0001) or registration number in the search bar above to see its live location, route, shipment details, and driver info.</p>
              </div>

              {/* Status Legend */}
              <div className="w-full max-w-xs mt-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">Truck Status Guide</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-zinc-700 dark:text-zinc-200">Available</strong> — Parked, no active trip</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-zinc-700 dark:text-zinc-200">Assigned</strong> — On trip, 📡 Live tracking</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-zinc-700 dark:text-zinc-200">Maintenance</strong> — In service center</span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Map */}
        <div className="lg:col-span-3 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 min-h-[400px] relative">
          <MapContainer
            center={mapCenter}
            zoom={6}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
            key={selectedTruckId || "default"}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {truckIsOnTrip && routeCoordinates.length > 0 && (
              <>
                <Polyline positions={routeCoordinates} color="#3b82f6" weight={4} opacity={0.7} />
                <Marker position={routeCoordinates[0]}>
                  <Popup>📍 Origin: {linkedShipment?.pickupAddress}</Popup>
                </Marker>
                <Marker position={routeCoordinates[routeCoordinates.length - 1]}>
                  <Popup>🏁 Destination: {linkedShipment?.dropAddress}</Popup>
                </Marker>
                <Marker position={currentPosition} icon={truckIcon}>
                  <Popup>
                    <div className="font-semibold">{selectedTruck?.id} — {selectedTruck?.vehicleNumber}</div>
                    <div className="text-sm">Speed: {speed} km/h</div>
                    <div className="text-sm">ETA: {eta.toFixed(0)} hours</div>
                    {linkedDriver && <div className="text-sm">Driver: {linkedDriver.name}</div>}
                  </Popup>
                </Marker>
              </>
            )}
          </MapContainer>

          {/* Overlay message when truck is not on trip */}
          {selectedTruck && !truckIsOnTrip && (
            <div className="absolute inset-0 z-10 bg-zinc-900/30 dark:bg-zinc-900/60 backdrop-blur-[1px] flex items-center justify-center">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 max-w-sm text-center space-y-3">
                <div className={`inline-flex p-3 rounded-full mx-auto ${
                  selectedTruck.status === "Available"
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "bg-amber-100 dark:bg-amber-900/30"
                }`}>
                  {selectedTruck.status === "Available"
                    ? <ParkingCircle className="h-6 w-6 text-emerald-500" />
                    : <Wrench className="h-6 w-6 text-amber-500" />}
                </div>
                <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                  No Live Tracking Available
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>{selectedTruck.id}</strong> is currently <strong>{selectedTruck.status}</strong>.
                  Only trucks with <span className="text-blue-600 dark:text-blue-400 font-semibold">Assigned</span> status can be tracked live.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
