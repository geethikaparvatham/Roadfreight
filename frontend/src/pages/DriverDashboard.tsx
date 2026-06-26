import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation, Package, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { dbData } from "../lib/mockData";

export default function DriverDashboard() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"On Trip" | "Available" | "Offline">("On Trip");

  // Mock finding a trip for this driver
  const myShipments = dbData.shipments.slice(0, 2);
  const activeShipment = myShipments[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, {user?.displayName || "Driver"}!</h2>
          <p className="text-muted-foreground">
            Here's your current delivery schedule and route information.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-sm font-medium pl-2">Status:</span>
          <select 
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="text-sm border-none bg-zinc-50 dark:bg-zinc-900 rounded-lg px-3 py-1.5 focus:ring-0 cursor-pointer font-medium"
          >
            <option value="On Trip">🟢 On Trip</option>
            <option value="Available">🔵 Available</option>
            <option value="Offline">⚫ Offline</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status === "On Trip" ? "1" : "0"}</div>
            <p className="text-xs text-muted-foreground">Currently in transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Trips</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Scheduled for this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">Total successful deliveries</p>
          </CardContent>
        </Card>
      </div>

      {status === "On Trip" && (
        <Card className="border-blue-200 dark:border-blue-900 shadow-md">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Navigation className="h-5 w-5" />
                Current Active Trip
              </CardTitle>
              <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full">
                {activeShipment.id}
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="relative pl-6 space-y-8 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-zinc-200 dark:before:bg-zinc-800">
                  <div className="relative">
                    <div className="absolute -left-[30px] p-1 bg-white dark:bg-zinc-950 border-2 border-emerald-500 rounded-full z-10">
                      <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                    </div>
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">PICKUP</p>
                    <p className="font-semibold">{activeShipment.origin}</p>
                    <p className="text-sm text-muted-foreground mt-1">Dispatched at 08:30 AM</p>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute -left-[30px] p-1 bg-white dark:bg-zinc-950 border-2 border-blue-500 rounded-full z-10">
                      <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    </div>
                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">DROPOFF</p>
                    <p className="font-semibold">{activeShipment.destination}</p>
                    <p className="text-sm text-muted-foreground mt-1">Estimated Arrival: 04:15 PM</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-zinc-100 dark:border-zinc-800">
                  <h4 className="font-medium mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-zinc-500" />
                    Consignment Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium">{activeShipment.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance</span>
                      <span className="font-medium">450 km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight</span>
                      <span className="font-medium">12.5 Tons</span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Open Navigation
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
