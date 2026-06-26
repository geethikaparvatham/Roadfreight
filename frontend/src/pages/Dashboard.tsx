import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Truck, Activity, TrendingUp, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { dbData, useMockData } from "../lib/mockData";

// Helper to generate random fluctuation
const fluctuate = (base: number, range: number) => base + Math.floor(Math.random() * range * 2) - range;

// Generate realistic revenue data
const generateRevenueData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(name => ({
    name,
    revenue: fluctuate(3200, 1500),
    shipments: fluctuate(350, 200),
  }));
};

// Generate dynamic alerts
const generateAlerts = () => {
  const trucks = dbData.trucks;
  const shipments = dbData.shipments;
  const drivers = dbData.drivers;

  const randomTruck = trucks[Math.floor(Math.random() * trucks.length)];
  const randomDelayed = shipments.filter(s => s.status === "Delayed");
  const delayedShipment = randomDelayed.length > 0 ? randomDelayed[Math.floor(Math.random() * randomDelayed.length)] : shipments[0];
  const randomDelivered = shipments.filter(s => s.status === "Delivered");
  const deliveredShipment = randomDelivered.length > 0 ? randomDelivered[Math.floor(Math.random() * randomDelivered.length)] : shipments[1];
  const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];

  const timeOptions = ["Just now", "2 min ago", "5 min ago", "12 min ago", "30 min ago", "1 hour ago", "2 hours ago"];

  return [
    { title: "Vehicle Break Down", desc: `Truck ${randomTruck.vehicleNumber} reported breakdown`, time: timeOptions[Math.floor(Math.random() * 3)], color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/20" },
    { title: "Traffic Delay", desc: `Shipment ${delayedShipment.id} delayed by ${Math.floor(Math.random() * 4) + 1} hours`, time: timeOptions[Math.floor(Math.random() * 4) + 1], color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },
    { title: "Delivery Complete", desc: `${deliveredShipment.id} delivered to ${deliveredShipment.customerName}`, time: timeOptions[Math.floor(Math.random() * 4) + 2], color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/20" },
    { title: "Compliance Warning", desc: `${randomDriver.name}'s license expiring in ${Math.floor(Math.random() * 10) + 1} days`, time: timeOptions[Math.floor(Math.random() * 3) + 4], color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
  ];
};

export default function Dashboard() {
  const data = useMockData();

  const baseShipments = data.shipments.length;
  const baseTrucks = data.trucks.length;
  const baseDelayed = data.shipments.filter(s => s.status === "Delayed").length;
  const baseRevenue = data.shipments.reduce((acc, curr) => acc + curr.freightAmount, 0);

  const [totalShipments, setTotalShipments] = useState(baseShipments);
  const [totalTrucks, setTotalTrucks] = useState(baseTrucks);
  const [delayedDeliveries, setDelayedDeliveries] = useState(baseDelayed);
  const [totalRevenue, setTotalRevenue] = useState(baseRevenue);
  const [revenueData, setRevenueData] = useState(generateRevenueData());
  const [alerts, setAlerts] = useState(generateAlerts());
  const [prevShipments, setPrevShipments] = useState(baseShipments);
  const [prevTrucks, setPrevTrucks] = useState(baseTrucks);
  const [prevDelayed, setPrevDelayed] = useState(baseDelayed);
  const [prevRevenue, setPrevRevenue] = useState(baseRevenue);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Instantly react to data changes from any portal (add/edit/delete)
  useEffect(() => {
    setPrevShipments(totalShipments);
    setPrevTrucks(totalTrucks);
    setPrevDelayed(delayedDeliveries);
    setPrevRevenue(totalRevenue);

    setTotalShipments(data.shipments.length);
    setTotalTrucks(data.trucks.length);
    setDelayedDeliveries(data.shipments.filter(s => s.status === "Delayed").length);
    setTotalRevenue(data.shipments.reduce((acc, curr) => acc + curr.freightAmount, 0));
    setLastUpdated(new Date());
  }, [data]);

  // Simulate real-time KPI updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrevShipments(totalShipments);
      setPrevTrucks(totalTrucks);
      setPrevDelayed(delayedDeliveries);
      setPrevRevenue(totalRevenue);

      setTotalShipments(dbData.shipments.length);
      setTotalTrucks(dbData.trucks.length);
      setDelayedDeliveries(dbData.shipments.filter(s => s.status === "Delayed").length);
      setTotalRevenue(prev => prev + fluctuate(500, 800));
      setLastUpdated(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [totalShipments, totalTrucks, delayedDeliveries, totalRevenue]);

  // Refresh chart data every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRevenueData(generateRevenueData());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Refresh alerts every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAlerts(generateAlerts());
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const getTrend = (current: number, previous: number) => {
    if (current > previous) return { icon: ArrowUp, color: "text-emerald-500", text: `+${current - previous}` };
    if (current < previous) return { icon: ArrowDown, color: "text-red-500", text: `${current - previous}` };
    return { icon: ArrowUp, color: "text-zinc-400", text: "0" };
  };

  const shipmentTrend = getTrend(totalShipments, prevShipments);
  const truckTrend = getTrend(totalTrucks, prevTrucks);
  const delayTrend = getTrend(delayedDeliveries, prevDelayed);
  const revenueTrend = getTrend(totalRevenue, prevRevenue);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Executive Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your logistics operations and fleet performance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">
            Live · Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shipments</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold transition-all duration-300">{totalShipments.toLocaleString()}</div>
              <div className={`flex items-center text-xs font-medium ${shipmentTrend.color}`}>
                <shipmentTrend.icon className="h-3 w-3 mr-0.5" />
                {shipmentTrend.text}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Live shipment count</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trucks</CardTitle>
            <Truck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold transition-all duration-300">{totalTrucks}</div>
              <div className={`flex items-center text-xs font-medium ${truckTrend.color}`}>
                <truckTrend.icon className="h-3 w-3 mr-0.5" />
                {truckTrend.text}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Total registered fleet</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed Deliveries</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold transition-all duration-300">{delayedDeliveries}</div>
              <div className={`flex items-center text-xs font-medium ${delayTrend.color}`}>
                <delayTrend.icon className="h-3 w-3 mr-0.5" />
                {delayTrend.text}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Shipments requiring attention</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold transition-all duration-300">₹{totalRevenue.toLocaleString()}</div>
              <div className={`flex items-center text-xs font-medium ${revenueTrend.color}`}>
                <revenueTrend.icon className="h-3 w-3 mr-0.5" />
                ₹{Math.abs(totalRevenue - prevRevenue).toLocaleString()}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Real-time freight revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={false} animationDuration={800} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-start gap-4 transition-all duration-500">
                  <div className={`p-2 rounded-full ${alert.bg}`}>
                    <Activity className={`h-4 w-4 ${alert.color}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{alert.title}</p>
                    <p className="text-sm text-muted-foreground">{alert.desc}</p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
