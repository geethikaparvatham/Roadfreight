import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, XCircle, Clock, MapPin, Truck } from "lucide-react";
import { tripRequestStore } from "../lib/tripRequests";
import type { TripRequest } from "../lib/tripRequests";
import { dbData, saveMockData } from "../lib/mockData";

export function TripRequestNotifications() {
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "approve" | "deny" } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => setRequests(tripRequestStore.getAll());

  useEffect(() => {
    refresh();
    window.addEventListener("tripRequestsChanged", refresh);
    return () => window.removeEventListener("tripRequestsChanged", refresh);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pending = requests.filter((r) => r.status === "pending");

  const handle = (id: string, action: "approved" | "denied") => {
    // Find the request details before updating status
    const req = requests.find((r) => r.id === id);

    tripRequestStore.updateStatus(id, action);

    // When APPROVED → update truck status, driver status, and create a new shipment
    if (action === "approved" && req) {
      // 1. Change truck status: Available → Assigned
      const truck = dbData.trucks.find((t: any) => t.id === req.truckId);
      if (truck) {
        truck.status = "Assigned";
      }

      // 2. Change driver status: Available → On Trip
      const driver = dbData.drivers.find((d: any) => d.id === req.driverId);
      if (driver) {
        driver.status = "On Trip";
      }

      // 3. Create a new shipment for this trip
      const newShipment = {
        id: `CN${String(dbData.shipments.length + 1).padStart(4, "0")}`,
        customerId: "CUST0001",
        customerName: req.driverName,
        pickupAddress: req.origin,
        dropAddress: req.destination,
        truckId: req.truckId,
        driverId: req.driverId,
        status: "Assigned",
        freightAmount: Math.floor(1000 + Math.random() * 4000),
        companyId: "c1",
        eta: new Date(Date.now() + Math.random() * 86400000 * 5).toISOString(),
      };
      dbData.shipments.push(newShipment);

      // 4. Save everything to localStorage and notify all components
      saveMockData();
    }

    refresh();
    setToast({
      msg: action === "approved" ? "Trip request approved! Truck & driver updated." : "Trip request denied.",
      type: action === "approved" ? "approve" : "deny",
    });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        title="Trip Request Notifications"
      >
        <Bell className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
        {pending.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white dark:border-zinc-900 animate-pulse">
            {pending.length > 9 ? "9+" : pending.length}
          </span>
        )}
      </button>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[200] flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${
            toast.type === "approve"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300"
          }`}
        >
          {toast.type === "approve"
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <XCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-11 w-[420px] max-h-[540px] overflow-y-auto z-[100] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Trip Requests</p>
              <p className="text-xs text-muted-foreground">
                {pending.length} pending approval
              </p>
            </div>
            {pending.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold border border-red-200 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300">
                {pending.length} NEW
              </span>
            )}
          </div>

          {/* Request List */}
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No trip requests yet.</p>
              </div>
            ) : (
              requests.map((req) => (
                <div
                  key={req.id}
                  className={`px-4 py-3.5 transition-colors ${
                    req.status === "pending"
                      ? "bg-amber-50/50 dark:bg-amber-900/5 hover:bg-amber-50 dark:hover:bg-amber-900/10"
                      : "bg-white dark:bg-zinc-900 opacity-70"
                  }`}
                >
                  {/* Top row: status badge + time */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        req.status === "pending"
                          ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                          : req.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700"
                          : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                      }`}
                    >
                      {req.status === "pending" ? <Clock className="w-3 h-3" /> :
                       req.status === "approved" ? <CheckCircle2 className="w-3 h-3" /> :
                       <XCircle className="w-3 h-3" />}
                      {req.status.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(req.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    {req.origin}
                    <span className="text-zinc-400 font-normal">→</span>
                    {req.destination}
                  </div>

                  {/* Driver + Truck */}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-1">
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-zinc-600 dark:text-zinc-300">Driver:</span> {req.driverName} ({req.driverId})
                    </span>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" /> {req.truckId}
                    </span>
                  </div>

                  {req.cargo && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      Cargo: <span className="font-medium">{req.cargo}</span>
                    </p>
                  )}
                  {req.note && (
                    <p className="text-xs italic text-zinc-400 dark:text-zinc-500 mb-2">"{req.note}"</p>
                  )}

                  {/* Approve / Deny (only for pending) */}
                  {req.status === "pending" && (
                    <div className="flex gap-2 mt-2.5">
                      <button
                        onClick={() => handle(req.id, "approved")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Allow
                      </button>
                      <button
                        onClick={() => handle(req.id, "denied")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Deny
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
