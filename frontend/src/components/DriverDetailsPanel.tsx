import { useState, useEffect, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, Truck, Activity, TrendingUp, Star } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dbData } from "../lib/mockData";

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

const fluctuate = (base: number, range: number) => base + Math.floor(Math.random() * range * 2) - range;

const generatePerformanceData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(name => ({
    name,
    deliveries: Math.max(0, fluctuate(5, 3)),
    efficiency: Math.max(60, fluctuate(85, 10)),
  }));
};

interface DriverDetailsPanelProps {
  driverId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DriverDetailsPanel({ driverId, isOpen, onClose }: DriverDetailsPanelProps) {
  const [speed, setSpeed] = useState(65);
  const [eta, setEta] = useState(14);
  const [progress, setProgress] = useState(0.3);
  const [performanceData, setPerformanceData] = useState(generatePerformanceData());

  const driver = useMemo(() => {
    return driverId ? dbData.drivers.find(d => d.id === driverId) : null;
  }, [driverId]);

  // Find linked shipment and truck
  const linkedShipment = useMemo(() => {
    if (!driver) return null;
    return dbData.shipments.find(s => s.driverId === driver.id && s.status !== "Delivered");
  }, [driver]);

  const linkedTruck = useMemo(() => {
    if (!linkedShipment) return null;
    return dbData.trucks.find(t => t.id === linkedShipment.truckId);
  }, [linkedShipment]);

  // Generate new performance data when driver changes
  useEffect(() => {
    if (isOpen) {
      setPerformanceData(generatePerformanceData());
      setProgress(0.15 + Math.random() * 0.4);
      setSpeed(Math.floor(55 + Math.random() * 30));
      setEta(Math.floor(3 + Math.random() * 18));
    }
  }, [driverId, isOpen]);

  // Route coordinates for the active shipment
  const routeCoordinates = useMemo(() => {
    if (!linkedShipment) return [];
    const origin = cityCoords[linkedShipment.pickupAddress];
    const dest = cityCoords[linkedShipment.dropAddress];
    if (!origin || !dest) return [];

    const mid: [number, number] = [(origin[0] + dest[0]) / 2 + (Math.random() * 2 - 1), (origin[1] + dest[1]) / 2 + (Math.random() * 2 - 1)];
    return [origin, mid, dest];
  }, [linkedShipment]);

  // Current truck position
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
    if (!linkedTruck || !isOpen) return;
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + 0.02, 0.95));
      setSpeed(Math.floor(55 + Math.random() * 30));
      setEta(prev => Math.max(1, prev - 0.3 + (Math.random() * 0.2 - 0.1)));
    }, 3000);
    return () => clearInterval(interval);
  }, [linkedTruck, isOpen]);

  if (!driver) return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
        <Truck className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Select a Driver</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">Click on any driver in the table to view their real-time performance analytics and live location tracking.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 rounded-xl border border-white/50 dark:border-zinc-800 overflow-hidden shadow-xl relative">
      {/* Decorative background blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="p-4 px-6 border-b border-white/20 dark:border-zinc-800/50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent pb-0.5">
              {driver.name}
              <Badge className={`ml-2 px-2 py-0 h-5 text-[10px] shadow-sm ${driver.status === "Available" ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none" : driver.status === "On Trip" ? "bg-blue-500 hover:bg-blue-600 text-white border-none" : "bg-zinc-500 hover:bg-zinc-600 text-white border-none"}`}>
                {driver.status}
              </Badge>
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
              ID: <span className="text-zinc-900 dark:text-zinc-100 font-bold">{driver.id}</span> <span className="mx-2 text-zinc-300">|</span> License: <span className="font-mono bg-white/50 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded-md">{driver.licenseNumber}</span> <span className="mx-2 text-zinc-300">|</span> Phone: {driver.phone}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 overflow-y-auto flex-1 relative z-10 h-full">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full">
          {/* Left Column: Live Location Tracking */}
          <div className="xl:col-span-5 flex flex-col h-full min-h-[400px]">
            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mb-3 ml-1 shrink-0">
              <Navigation className="h-3.5 w-3.5 text-indigo-500" /> Live Location Tracking
            </h3>
            {driver.status === "On Trip" && linkedShipment && linkedTruck ? (
              <Card className="overflow-hidden shadow-lg border-white/50 dark:border-zinc-800 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex flex-col flex-1">
                <div className="flex-1 w-full relative z-0 min-h-[250px]">
                  <MapContainer 
                    center={currentPosition} 
                    zoom={6} 
                    style={{ height: '100%', width: '100%' }}
                    key={driver.id}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />
                    {routeCoordinates.length > 0 && (
                      <>
                        <Polyline positions={routeCoordinates} color="#4f46e5" weight={4} opacity={0.8} dashArray="8, 8" />
                        <Marker position={routeCoordinates[0]}>
                          <Popup>
                            <div className="font-bold text-indigo-900 text-xs">📍 Origin</div>
                            <div className="text-xs">{linkedShipment.pickupAddress}</div>
                          </Popup>
                        </Marker>
                        <Marker position={routeCoordinates[routeCoordinates.length - 1]}>
                          <Popup>
                            <div className="font-bold text-emerald-900 text-xs">🏁 Destination</div>
                            <div className="text-xs">{linkedShipment.dropAddress}</div>
                          </Popup>
                        </Marker>
                        <Marker position={currentPosition} icon={truckIcon}>
                          <Popup className="rounded-lg overflow-hidden shadow-lg text-xs">
                            <div className="font-bold text-blue-900 bg-blue-50 px-2 py-1 -mx-3 -mt-2 mb-1.5 border-b border-blue-100">{linkedTruck.id} — {linkedTruck.vehicleNumber}</div>
                            <div className="font-medium flex items-center gap-1.5"><Navigation className="h-3 w-3 text-blue-500" /> Speed: <span className="text-blue-700">{speed} km/h</span></div>
                            <div className="font-medium flex items-center gap-1.5 mt-0.5"><Clock className="h-3 w-3 text-amber-500" /> ETA: <span className="text-amber-700">{eta.toFixed(1)} hrs</span></div>
                          </Popup>
                        </Marker>
                      </>
                    )}
                  </MapContainer>
                  {/* Overlay gradient for map depth */}
                  <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] pointer-events-none z-[400]" />
                </div>
                <CardContent className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 p-4 border-t border-white/50 dark:border-blue-900/50 backdrop-blur-md shrink-0">
                  <div className="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/50 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400 relative z-10 transition-transform group-hover:scale-110" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{linkedTruck.vehicleNumber}</p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="bg-white/80 dark:bg-zinc-800/80 text-blue-700 dark:text-blue-300 font-semibold border-blue-200 dark:border-blue-800 shadow-sm px-2 py-0 text-[10px]">
                            {speed} km/h
                          </Badge>
                          <Badge variant="outline" className="bg-white/80 dark:bg-zinc-800/80 text-amber-700 dark:text-amber-300 font-semibold border-amber-200 dark:border-amber-800 shadow-sm px-2 py-0 text-[10px]">
                            ~{eta.toFixed(1)}h ETA
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="w-full 2xl:w-auto text-left 2xl:text-right bg-white/80 dark:bg-zinc-800/80 p-3 rounded-xl border border-white/50 dark:border-blue-900/50 shadow-sm min-w-[150px]">
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-[0.15em] uppercase mb-0.5">Active Shipment</p>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{linkedShipment.id}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[150px] mt-0.5">{linkedShipment.dropAddress}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-xl shadow-sm flex-1 flex flex-col justify-center items-center">
                <CardContent className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="p-4 bg-white dark:bg-zinc-800 rounded-full mb-4 shadow-sm border border-zinc-100 dark:border-zinc-700">
                    <MapPin className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                  </div>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200 tracking-tight">No Active Trip</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-xs font-medium leading-relaxed">This driver is currently not assigned to an active route.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: KPIs and Chart */}
          <div className="xl:col-span-7 flex flex-col space-y-4 h-full min-h-[400px]">
            {/* Performance KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
              <Card className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-white/40 dark:border-zinc-800 shadow hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative group rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-4 flex flex-col items-center justify-center text-center relative z-10">
                  <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-xl mb-2 shadow-sm transition-transform group-hover:scale-110">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  </div>
                  <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{driver.rating}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] font-bold mt-1">Driver Rating</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-white/40 dark:border-zinc-800 shadow hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative group rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-4 flex flex-col items-center justify-center text-center relative z-10">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl mb-2 shadow-sm transition-transform group-hover:scale-110">
                    <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">{Math.floor(driver.rating * 42)}</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] font-bold mt-1">Total Trips</p>
                </CardContent>
              </Card>

              <Card className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border-white/40 dark:border-zinc-800 shadow hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative group rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-4 flex flex-col items-center justify-center text-center relative z-10">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl mb-2 shadow-sm transition-transform group-hover:scale-110">
                    <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-2xl font-black text-zinc-800 dark:text-zinc-100 tracking-tight">94%</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.15em] font-bold mt-1">On-Time Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Real-time Analysis Chart */}
            <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-white/40 dark:border-zinc-800 shadow-lg overflow-hidden rounded-xl flex-1 flex flex-col min-h-[200px]">
              <CardHeader className="pb-3 border-b border-white/50 dark:border-zinc-800/50 bg-white/50 dark:bg-zinc-900/50 shrink-0 px-4 pt-4">
                <CardTitle className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-blue-500" /> Weekly Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex-1 relative min-h-[180px]">
                <div className="absolute inset-4">
                  <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                    <AreaChart data={performanceData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEfficiency" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" opacity={0.5} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }} dy={5} />
                      <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }} />
                      <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)', fontSize: '12px' }}
                        itemStyle={{ fontWeight: 600 }}
                      />
                      <Area yAxisId="left" type="monotone" dataKey="deliveries" name="Deliveries" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorDeliveries)" activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }} />
                      <Area yAxisId="right" type="monotone" dataKey="efficiency" name="Efficiency (%)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEfficiency)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
