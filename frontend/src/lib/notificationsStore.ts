// ─── Notification Store ────────────────────────────────────────────────────────
const NOTIFICATIONS_KEY = "freight_os_notifications";

export type NotificationType = "alert" | "warning" | "success" | "info";

export type AppNotification = {
  id: number;
  type: NotificationType;
  title: string;
  desc: string;
  time: string; // ISO string
  read: boolean;
};

const initialNotifications: AppNotification[] = [
  { id: 1, type: "alert", title: "Vehicle Break Down", desc: "Truck MH12AB3456 reported a breakdown near Pune Highway.", time: new Date(Date.now() - 10 * 60000).toISOString(), read: false },
  { id: 2, type: "warning", title: "Traffic Delay", desc: "Shipment CN987 delayed by 2 hours due to heavy congestion.", time: new Date(Date.now() - 45 * 60000).toISOString(), read: false },
  { id: 3, type: "success", title: "Delivery Complete", desc: "Consignment CN456 successfully delivered to client.", time: new Date(Date.now() - 120 * 60000).toISOString(), read: false },
  { id: 4, type: "alert", title: "Compliance Warning", desc: "Driver DL expiry in 5 days for driver Raj Kumar.", time: new Date(Date.now() - 300 * 60000).toISOString(), read: false },
  { id: 5, type: "info", title: "System Update", desc: "FreightTrack OS will undergo scheduled maintenance at 02:00 AM.", time: new Date(Date.now() - 1440 * 60000).toISOString(), read: true },
];

const loadNotifications = (): AppNotification[] => {
  try {
    const saved = localStorage.getItem(NOTIFICATIONS_KEY);
    return saved ? JSON.parse(saved) : initialNotifications;
  } catch {
    return initialNotifications;
  }
};

const saveNotifications = (notes: AppNotification[]) => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notes));
  } catch {}
  window.dispatchEvent(new CustomEvent("notificationsChanged"));
};

export const notificationStore = {
  getAll: loadNotifications,

  add: (type: NotificationType, title: string, desc: string) => {
    const all = loadNotifications();
    const newNote: AppNotification = {
      id: Date.now(),
      type,
      title,
      desc,
      time: new Date().toISOString(),
      read: false,
    };
    all.unshift(newNote);
    saveNotifications(all);
  },

  markAsRead: (id: number) => {
    const all = loadNotifications();
    saveNotifications(all.map((n) => (n.id === id ? { ...n, read: true } : n)));
  },

  markAllAsRead: () => {
    const all = loadNotifications();
    saveNotifications(all.map((n) => ({ ...n, read: true })));
  },
};

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === NOTIFICATIONS_KEY) {
      window.dispatchEvent(new CustomEvent("notificationsChanged"));
    }
  });
}
