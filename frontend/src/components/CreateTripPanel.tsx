import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { tripRequestStore } from "../lib/tripRequests";
import type { TripRequest } from "../lib/tripRequests";
import { dbData } from "../lib/mockData";
import {
  MapPin, Truck, Send, CheckCircle2, XCircle, Clock,
  Plus, ChevronDown, ChevronUp, Edit, Trash2, X, Check
} from "lucide-react";

export function CreateTripPanel() {
  const [form, setForm] = useState({
    driverName: "",
    driverId: "",
    origin: "",
    destination: "",
    truckId: "",
    cargo: "",
    note: "",
  });
  const [myRequests, setMyRequests] = useState<TripRequest[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  const drivers = dbData.drivers;
  const trucks = dbData.trucks;

  const refresh = () => setMyRequests(tripRequestStore.getAll());

  useEffect(() => {
    refresh();
    window.addEventListener("tripRequestsChanged", refresh);
    return () => window.removeEventListener("tripRequestsChanged", refresh);
  }, []);

  const handleDriverChange = (id: string) => {
    const d = drivers.find((dr) => dr.id === id);
    setForm((f) => ({ ...f, driverId: id, driverName: d?.name ?? "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.driverId || !form.origin || !form.destination || !form.truckId) return;
    tripRequestStore.add(form);
    setForm({ driverName: "", driverId: "", origin: "", destination: "", truckId: "", cargo: "", note: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    refresh();
  };

  // ── Edit / Delete ──
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ origin: "", destination: "", cargo: "", note: "" });

  const handleStartEdit = (req: TripRequest) => {
    setEditingId(req.id);
    setEditForm({ origin: req.origin, destination: req.destination, cargo: req.cargo, note: req.note });
  };

  const handleSaveEdit = (id: string) => {
    if (!editForm.origin || !editForm.destination) return;
    tripRequestStore.update(id, editForm);
    setEditingId(null);
    refresh();
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this trip request?")) {
      tripRequestStore.remove(id);
      refresh();
    }
  };

  const statusConfig = {
    pending:  { label: "Pending Review", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    approved: { label: "Approved",       color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
    denied:   { label: "Denied",         color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  };

  const CITIES = [
    "Agra, UP", "Ahmedabad, GJ", "Ajmer, RJ", "Aligarh, UP", "Allahabad, UP", "Ambattur, TN", "Amravati, MH", "Amritsar, PB", 
    "Asansol, WB", "Aurangabad, MH", "Bangalore, KA", "Bareilly, UP", "Belgaum, KA", "Bhavnagar, GJ", "Bhilai, CG", "Bhiwandi, MH", 
    "Bhopal, MP", "Bhubaneswar, OD", "Bikaner, RJ", "Chandigarh, CH", "Chennai, TN", "Chimakurthy, AP", "Coimbatore, TN", "Cuttack, OD", "Dehradun, UK", 
    "Delhi, DL", "Dhanbad, JH", "Durgapur, WB", "Erode, TN", "Faridabad, HR", "Firozabad, UP", "Gaya, BR", "Ghaziabad, UP", 
    "Gulbarga, KA", "Guntur, AP", "Gurgaon, HR", "Guwahati, AS", "Gwalior, MP", "Howrah, WB", "Hubli-Dharwad, KA", "Hyderabad, TS", 
    "Indore, MP", "Jabalpur, MP", "Jaipur, RJ", "Jalandhar, PB", "Jalgaon, MH", "Jammu, JK", "Jamnagar, GJ", "Jamshedpur, JH", 
    "Jhansi, UP", "Jodhpur, RJ", "Kalyan-Dombivli, MH", "Kanpur, UP", "Kochi, KL", "Kolhapur, MH", "Kolkata, WB", "Kota, RJ", 
    "Kurnool, AP", "Loni, UP", "Lucknow, UP", "Ludhiana, PB", "Madurai, TN", "Maheshtala, WB", "Malegaon, MH", "Mangalore, KA", "Meerut, UP", 
    "Mira-Bhayandar, MH", "Moradabad, UP", "Mumbai, MH", "Mysore, KA", "Nagpur, MH", "Nanded, MH", "Nashik, MH", "Navi Mumbai, MH", 
    "Nellore, AP", "Noida, UP", "Ongole, AP", "Patna, BR", "Pimpri-Chinchwad, MH", "Pune, MH", "Raipur, CG", "Rajkot, GJ", "Ranchi, JH", "Saharanpur, UP", 
    "Salem, TN", "Sangli-Miraj & Kupwad, MH", "Siliguri, WB", "Solapur, MH", "Srinagar, JK", "Surat, GJ", "Thane, MH", 
    "Thiruvananthapuram, KL", "Tirupati, AP", "Tiruchirappalli, TN", "Tirunelveli, TN", "Udaipur, RJ", "Ujjain, MP", "Ulhasnagar, MH", 
    "Vadodara, GJ", "Varanasi, UP", "Vasai-Virar, MH", "Vijayawada, AP", "Visakhapatnam, AP"
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Trip Request</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Submit a new trip request. Admin will review and approve or deny it.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* ── Form ── */}
        <Card className="lg:col-span-2 border-blue-100 dark:border-blue-900/50 shadow-md h-fit">
          <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900/50 pb-3">
            <CardTitle className="flex items-center text-base gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              New Trip Request
            </CardTitle>
            <CardDescription className="text-xs">Fill in the details and submit for admin approval.</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3 pt-4">
              {/* Driver */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Driver</label>
                <select
                  required
                  value={form.driverId}
                  onChange={(e) => handleDriverChange(e.target.value)}
                  className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Select driver…</option>
                  {drivers.map((d) => {
                    const isAvailable = d.status === "Available";
                    return (
                      <option key={d.id} value={d.id} disabled={!isAvailable}>
                        {d.name} ({d.id}) {isAvailable ? "✅ Available" : `❌ ${d.status}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Truck */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  Truck
                  <span className="ml-1 normal-case font-normal text-zinc-500 dark:text-zinc-400">(Unavailable trucks disabled)</span>
                </label>
                <select
                  required
                  value={form.truckId}
                  onChange={(e) => setForm((f) => ({ ...f, truckId: e.target.value }))}
                  className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Select truck…</option>
                  {trucks.map((t: any) => {
                    const isAvailable = t.status === "Available";
                    return (
                      <option key={t.id} value={t.id} disabled={!isAvailable}>
                        {t.id} — {t.vehicleNumber} ({t.type}) {isAvailable ? "✅ Available" : `❌ ${t.status}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Origin */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  <MapPin className="inline w-3 h-3 mr-1" />Origin
                </label>
                <select
                  required
                  value={form.origin}
                  onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                  className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Select origin city…</option>
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Destination */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">
                  <MapPin className="inline w-3 h-3 mr-1 text-red-500" />Destination
                </label>
                <select
                  required
                  value={form.destination}
                  onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                  className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Select destination city…</option>
                  {CITIES.filter((c) => c !== form.origin).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Cargo */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Cargo Type</label>
                <select
                  required
                  value={form.cargo}
                  onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
                  className="w-full h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-950"
                >
                  <option value="">Select cargo type…</option>
                  <option value="General cargo">General cargo</option>
                  <option value="Bulk cargo">Bulk cargo</option>
                  <option value="Containerized cargo">Containerized cargo</option>
                  <option value="Refrigerated cargo (reefer cargo)">Refrigerated cargo (reefer cargo)</option>
                  <option value="Hazardous cargo (dangerous goods)">Hazardous cargo (dangerous goods)</option>
                  <option value="Breakbulk cargo">Breakbulk cargo</option>
                  <option value="Project cargo / Heavy-lift cargo">Project cargo / Heavy-lift cargo</option>
                  <option value="Roll-on/Roll-off (RoRo) cargo">Roll-on/Roll-off (RoRo) cargo</option>
                </select>
              </div>

              {/* Note */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wide">Additional Notes</label>
                <Textarea
                  placeholder="Any special instructions for admin…"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  className="resize-none min-h-[70px] text-sm"
                />
              </div>

              {submitted && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Request submitted! Awaiting admin approval.
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Send className="w-4 h-4" /> Submit Trip Request
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* ── My Request History ── */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">My Trip Requests</CardTitle>
                <CardDescription className="text-xs">Track the status of all your submitted requests.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-medium">
                  {myRequests.length} total
                </span>
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
                >
                  {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </CardHeader>

          {showHistory && (
            <CardContent>
              {myRequests.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Truck className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No trip requests yet. Submit one!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {myRequests.map((req) => {
                    const cfg = statusConfig[req.status];
                    const StatusIcon = cfg.icon;
                    const isEditing = editingId === req.id;

                    return (
                      <div
                        key={req.id}
                        className={`rounded-xl border p-4 bg-white dark:bg-zinc-950 space-y-2 transition-all ${
                          isEditing
                            ? "ring-2 ring-blue-500 border-blue-300 dark:border-blue-700"
                            : "border-zinc-200 dark:border-zinc-800 hover:shadow-sm"
                        }`}
                      >
                        {isEditing ? (
                          /* ── Edit Mode ── */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Editing Request</p>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${cfg.color}`}>
                                <StatusIcon className="w-3 h-3" />{cfg.label}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Origin</label>
                                <select
                                  value={editForm.origin}
                                  onChange={(e) => setEditForm((f) => ({ ...f, origin: e.target.value }))}
                                  className="w-full h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                                >
                                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Destination</label>
                                <select
                                  value={editForm.destination}
                                  onChange={(e) => setEditForm((f) => ({ ...f, destination: e.target.value }))}
                                  className="w-full h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900"
                                >
                                  {CITIES.filter((c) => c !== editForm.origin).map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Cargo</label>
                              <Input
                                value={editForm.cargo}
                                onChange={(e) => setEditForm((f) => ({ ...f, cargo: e.target.value }))}
                                className="h-8 text-xs"
                                placeholder="Cargo type…"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Note</label>
                              <Textarea
                                value={editForm.note}
                                onChange={(e) => setEditForm((f) => ({ ...f, note: e.target.value }))}
                                className="resize-none min-h-[50px] text-xs"
                                placeholder="Additional notes…"
                              />
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <Button type="button" variant="outline" size="sm" onClick={handleCancelEdit} className="gap-1 text-xs h-7">
                                <X className="w-3 h-3" /> Cancel
                              </Button>
                              <Button type="button" size="sm" onClick={() => handleSaveEdit(req.id)} className="gap-1 text-xs h-7 bg-blue-600 hover:bg-blue-700 text-white">
                                <Check className="w-3 h-3" /> Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* ── View Mode ── */
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5">
                                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                  {req.origin}  →  {req.destination}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Driver: {req.driverName} ({req.driverId}) · Truck: {req.truckId}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                                  <StatusIcon className="w-3.5 h-3.5" />
                                  {cfg.label}
                                </span>
                                {/* Edit — only for pending requests */}
                                {req.status === "pending" && (
                                  <button
                                    onClick={() => handleStartEdit(req)}
                                    className="p-1.5 rounded-md text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                    title="Edit request"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                {/* Delete */}
                                <button
                                  onClick={() => handleDelete(req.id)}
                                  className="p-1.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  title="Delete request"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {req.cargo && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="font-medium">Cargo:</span> {req.cargo}
                              </p>
                            )}
                            {req.note && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 italic">"{req.note}"</p>
                            )}
                            <p className="text-[10px] text-muted-foreground">
                              Submitted: {new Date(req.createdAt).toLocaleString()}
                            </p>

                            {req.status === "approved" && (
                              <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Admin approved your trip. You're good to go!
                              </div>
                            )}
                            {req.status === "denied" && (
                              <div className="text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-1">
                                <XCircle className="w-3.5 h-3.5" /> Admin denied this request. Please contact admin for details.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
