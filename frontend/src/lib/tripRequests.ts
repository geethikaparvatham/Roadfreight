// ─── Trip Request Store ───────────────────────────────────────────────────────
// Separate localStorage key so it never collides with main mock data
const TRIP_REQ_KEY = "freight_os_trip_requests";

export type TripRequest = {
  id: string;
  driverName: string;
  driverId: string;
  origin: string;
  destination: string;
  truckId: string;
  cargo: string;
  note: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
};

const loadTripRequests = (): TripRequest[] => {
  try {
    const saved = localStorage.getItem(TRIP_REQ_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveTripRequests = (requests: TripRequest[]) => {
  try {
    localStorage.setItem(TRIP_REQ_KEY, JSON.stringify(requests));
  } catch {}
  window.dispatchEvent(new CustomEvent("tripRequestsChanged"));
};

export const tripRequestStore = {
  getAll: loadTripRequests,

  add: (req: Omit<TripRequest, "id" | "status" | "createdAt">) => {
    const all = loadTripRequests();
    const newReq: TripRequest = {
      ...req,
      id: `TR${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    all.unshift(newReq);
    saveTripRequests(all);
    return newReq;
  },

  updateStatus: (id: string, status: "approved" | "denied") => {
    const all = loadTripRequests();
    const updated = all.map((r) => (r.id === id ? { ...r, status } : r));
    saveTripRequests(updated);
  },

  update: (id: string, fields: Partial<Omit<TripRequest, "id" | "status" | "createdAt">>) => {
    const all = loadTripRequests();
    const updated = all.map((r) => (r.id === id ? { ...r, ...fields } : r));
    saveTripRequests(updated);
  },

  remove: (id: string) => {
    const all = loadTripRequests();
    saveTripRequests(all.filter((r) => r.id !== id));
  },

  getPending: () => loadTripRequests().filter((r) => r.status === "pending"),
};

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === TRIP_REQ_KEY) {
      window.dispatchEvent(new CustomEvent("tripRequestsChanged"));
    }
  });
}
