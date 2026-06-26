import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { Activity, TrendingUp, Truck, Package } from "lucide-react";

const initialDailyData = [
  { time: "00:00", shipments: 12, revenue: 1200 },
  { time: "04:00", shipments: 18, revenue: 1800 },
  { time: "08:00", shipments: 45, revenue: 4500 },
  { time: "12:00", shipments: 85, revenue: 8500 },
  { time: "16:00", shipments: 65, revenue: 6500 },
  { time: "20:00", shipments: 34, revenue: 3400 },
];

const monthlyData = [
  { name: "Jan", volume: 4000, revenue: 24000, expenses: 14000 },
  { name: "Feb", volume: 3000, revenue: 13980, expenses: 9000 },
  { name: "Mar", volume: 2000, revenue: 9800, expenses: 6000 },
  { name: "Apr", volume: 2780, revenue: 39080, expenses: 20000 },
  { name: "May", volume: 1890, revenue: 48000, expenses: 21810 },
  { name: "Jun", volume: 2390, revenue: 38000, expenses: 25000 },
  { name: "Jul", volume: 3490, revenue: 43000, expenses: 21000 },
];

export default function Analytics() {
  const [dailyData, setDailyData] = useState(initialDailyData);
  const [activeShipments, setActiveShipments] = useState(245);
  const [liveRevenue, setLiveRevenue] = useState(25900);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly increase shipments and revenue slightly
      const newShipment = Math.floor(Math.random() * 3);
      const newRev = newShipment * (Math.floor(Math.random() * 50) + 100);
      
      if (newShipment > 0) {
        setActiveShipments(prev => prev + newShipment);
        setLiveRevenue(prev => prev + newRev);
        
        // Update the last data point in the daily chart to show real-time movement
        setDailyData(prev => {
          const newData = [...prev];
          const lastIdx = newData.length - 1;
          newData[lastIdx] = {
            ...newData[lastIdx],
            shipments: newData[lastIdx].shipments + newShipment,
            revenue: newData[lastIdx].revenue + newRev
          };
          return newData;
        });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics</h2>
        <p className="text-muted-foreground">Real-time daily monitoring and historical monthly analysis.</p>
      </div>

      {/* Real-time KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Live Active Shipments</CardTitle>
            <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{activeShipments}</div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mt-1">Updating in real-time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              ${liveRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">Live ticker</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fleet Utilization</CardTitle>
            <Truck className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.4%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.1% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Delivery Success Rate</CardTitle>
            <Package className="h-4 w-4 text-zinc-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.8%</div>
            <p className="text-xs text-muted-foreground mt-1">0.2% below target</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Real-time Daily Chart */}
        <Card className="col-span-1 border-blue-100 dark:border-blue-900/30 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          </div>
          <CardHeader>
            <CardTitle>Daily Real-Time Operations</CardTitle>
            <CardDescription>Live shipment volume tracking throughout today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Area 
                    type="monotone" 
                    dataKey="shipments" 
                    name="Shipment Volume"
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorShipments)" 
                    isAnimationActive={false} // Disable animation so real-time updates look like a ticker
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Historical Chart */}
        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Revenue vs Expenses</CardTitle>
            <CardDescription>Historical financial performance (YTD)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `$${value/1000}k`} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, undefined]}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="revenue" name="Gross Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Operating Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
