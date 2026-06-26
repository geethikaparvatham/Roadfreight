import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, BellRing, ShieldAlert, Edit, Trash2, X, Check } from "lucide-react";

type AlertType = 'critical' | 'warning' | 'info';

type AlertMsg = {
  id: number;
  target: string;
  message: string;
  time: string;
  type: AlertType;
};

const initialAlerts: AlertMsg[] = [
  { id: 1, target: "All Drivers", message: "Heavy rain alert in Maharashtra region. Please drive safely and maintain speed limits.", time: "10 mins ago", type: 'warning' },
  { id: 2, target: "Admin Team", message: "Server maintenance scheduled for 02:00 AM tonight.", time: "1 hour ago", type: 'info' },
  { id: 3, target: "Driver: Raj Kumar (MH-12-AB-1234)", message: "Your route has been updated to avoid traffic on NH-48. Please check your app.", time: "3 hours ago", type: 'critical' }
];

const TARGETS = [
  "All Drivers",
  "Admin Team",
  "Active Drivers (En Route)",
  "Specific Driver...",
];

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertMsg[]>(initialAlerts);
  const [target, setTarget] = useState("All Drivers");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<AlertType>('info');

  // Edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState("");
  const [editMessage, setEditMessage] = useState("");
  const [editType, setEditType] = useState<AlertType>('info');

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newAlert: AlertMsg = {
      id: Date.now(),
      target,
      message,
      time: "Just now",
      type
    };

    setAlerts([newAlert, ...alerts]);
    setMessage("");
  };

  const handleStartEdit = (alert: AlertMsg) => {
    setEditingId(alert.id);
    setEditTarget(alert.target);
    setEditMessage(alert.message);
    setEditType(alert.type);
  };

  const handleSaveEdit = (id: number) => {
    if (!editMessage.trim()) return;
    setAlerts(alerts.map(a =>
      a.id === id
        ? { ...a, target: editTarget, message: editMessage, type: editType }
        : a
    ));
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      setAlerts(alerts.filter(a => a.id !== id));
    }
  };

  const typeStyles: Record<AlertType, { badge: string; icon: string; bg: string }> = {
    critical: {
      badge: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
      icon: "bg-red-100 text-red-600 dark:bg-red-900/30",
      bg: "border-red-100 dark:border-red-900/30",
    },
    warning: {
      badge: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
      icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
      bg: "border-amber-100 dark:border-amber-900/30",
    },
    info: {
      badge: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
      icon: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
      bg: "border-blue-100 dark:border-blue-900/30",
    },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Alert Dispatch Center</h2>
        <p className="text-muted-foreground">Broadcast critical alerts and messages to drivers and admin staff.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose Alert Form */}
        <Card className="lg:col-span-1 h-fit border-blue-100 dark:border-blue-900/50 shadow-md">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/50">
            <CardTitle className="flex items-center text-lg">
              <BellRing className="w-5 h-5 mr-2 text-blue-600" />
              New Alert
            </CardTitle>
            <CardDescription>Send an instant push notification.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSendAlert}>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Recipient Target</label>
                <select
                  className="w-full flex h-10 items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Alert Priority</label>
                <div className="flex gap-2">
                  <Badge
                    variant={type === 'info' ? 'default' : 'outline'}
                    className={`cursor-pointer ${type === 'info' ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                    onClick={() => setType('info')}
                  >Info</Badge>
                  <Badge
                    variant={type === 'warning' ? 'default' : 'outline'}
                    className={`cursor-pointer ${type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
                    onClick={() => setType('warning')}
                  >Warning</Badge>
                  <Badge
                    variant={type === 'critical' ? 'default' : 'outline'}
                    className={`cursor-pointer ${type === 'critical' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                    onClick={() => setType('critical')}
                  >Critical</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message Body</label>
                <Textarea
                  placeholder="Type your alert message here..."
                  className="min-h-[120px] resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 py-3 border-t border-zinc-100 dark:border-zinc-800">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 mr-2" />
                Dispatch Alert
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Alert History */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Broadcast History</CardTitle>
                <CardDescription>Recently dispatched alerts and their delivery status.</CardDescription>
              </div>
              <span className="text-xs text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full font-medium">{alerts.length} alerts</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BellRing className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No alerts dispatched yet.</p>
                </div>
              )}

              {alerts.map((alert) => {
                const styles = typeStyles[alert.type];
                const isEditing = editingId === alert.id;

                return (
                  <div
                    key={alert.id}
                    className={`flex p-4 border rounded-xl bg-white dark:bg-zinc-950 items-start space-x-4 transition-all duration-200 ${isEditing ? 'ring-2 ring-blue-500 border-blue-300' : `border-zinc-200 dark:border-zinc-800 hover:shadow-sm`}`}
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-full mt-1 shrink-0 ${styles.icon}`}>
                      {alert.type === 'critical' ? <ShieldAlert className="w-5 h-5" /> :
                        alert.type === 'warning' ? <BellRing className="w-5 h-5" /> :
                          <Send className="w-5 h-5" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2 min-w-0">
                      {isEditing ? (
                        /* ── Edit Mode ── */
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row gap-2">
                            {/* Target */}
                            <select
                              value={editTarget}
                              onChange={e => setEditTarget(e.target.value)}
                              className="flex h-9 flex-1 items-center rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                            >
                              {TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>

                            {/* Type badges */}
                            <div className="flex gap-1.5 items-center">
                              {(['info', 'warning', 'critical'] as AlertType[]).map(t => (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() => setEditType(t)}
                                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${editType === t
                                    ? t === 'critical' ? 'bg-red-500 text-white border-red-500' :
                                      t === 'warning' ? 'bg-amber-500 text-white border-amber-500' :
                                        'bg-blue-500 text-white border-blue-500'
                                    : 'bg-transparent text-zinc-500 border-zinc-300 dark:border-zinc-600 hover:border-zinc-400'
                                    }`}
                                >
                                  {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Message */}
                          <Textarea
                            value={editMessage}
                            onChange={e => setEditMessage(e.target.value)}
                            className="min-h-[80px] resize-none text-sm"
                            placeholder="Edit your alert message..."
                          />

                          {/* Save / Cancel */}
                          <div className="flex gap-2 justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                              className="gap-1.5"
                            >
                              <X className="w-3.5 h-3.5" /> Cancel
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleSaveEdit(alert.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" /> Save Changes
                            </Button>
                          </div>
                        </div>
                      ) : (
                        /* ── View Mode ── */
                        <>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-sm truncate">{alert.target}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${styles.badge}`}>
                                {alert.type.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground">{alert.time}</span>
                              {/* Edit Button */}
                              <button
                                onClick={() => handleStartEdit(alert)}
                                className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="Edit alert"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {/* Delete Button */}
                              <button
                                onClick={() => handleDelete(alert.id)}
                                className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Delete alert"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{alert.message}</p>
                          <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-500 font-medium gap-1">
                            <Check className="w-3 h-3" /> Delivered to devices
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
