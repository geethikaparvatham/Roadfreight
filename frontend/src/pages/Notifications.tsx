import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Truck, Package, ShieldAlert, CheckCircle2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationStore } from "../lib/notificationsStore";
import type { AppNotification } from "../lib/notificationsStore";

// Utility to format ISO dates to "X min ago"
function formatTimeAgo(isoString: string) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refresh = () => setNotifications(notificationStore.getAll());

  useEffect(() => {
    refresh();
    window.addEventListener("notificationsChanged", refresh);
    return () => window.removeEventListener("notificationsChanged", refresh);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    notificationStore.markAsRead(id);
    refresh();
  };

  const markAllAsRead = () => {
    notificationStore.markAllAsRead();
    refresh();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notification Inbox</h2>
          <p className="text-muted-foreground">View all system alerts, updates, and shipment notifications.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-500" />
            Recent Notifications
          </CardTitle>
          <CardDescription>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}.` : "All notifications are read. ✅"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`flex p-4 border rounded-lg items-start space-x-4 transition-all duration-300 ${
                  notif.read ? "bg-white border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 opacity-80" : "bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/50"
                }`}
              >
                <div className={`p-2 rounded-full mt-1 shrink-0 ${
                  notif.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                  notif.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' :
                  notif.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' :
                  'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                }`}>
                  {notif.type === 'alert' ? <ShieldAlert className="w-5 h-5" /> : 
                   notif.type === 'warning' ? <Truck className="w-5 h-5" /> : 
                   notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
                   <Package className="w-5 h-5" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${!notif.read ? "text-blue-900 dark:text-blue-100" : ""}`}>
                      {notif.title}
                    </p>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(notif.time)}</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{notif.desc}</p>
                </div>
                {!notif.read ? (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="mt-1 shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors whitespace-nowrap"
                  >
                    Mark as Read
                  </button>
                ) : (
                  <CheckCheck className="h-4 w-4 text-zinc-400 mt-2 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
