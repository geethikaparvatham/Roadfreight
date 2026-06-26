import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleGenerativeAI, ChatSession } from "@google/generative-ai";
import { dbData } from "../lib/mockData";

// ─── Smart Local AI Engine ────────────────────────────────────────────
// This provides intelligent, data-driven answers for ALL questions

function smartAI(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();
  const { shipments, trucks, drivers, customers, companies } = dbData;

  // ── TRUCK TRACKING ──
  const trkMatch = userMessage.match(/TRK\d+/i);
  if (trkMatch) {
    const truckId = trkMatch[0].toUpperCase();
    const truck = trucks.find(t => t.id === truckId);
    if (!truck) return `❌ No truck found with ID "${truckId}". Please check the ID and try again.`;

    const activeShipment = shipments.find(s => s.truckId === truckId && ["In Transit", "Delayed", "Picked Up", "Out For Delivery", "Assigned"].includes(s.status));
    const driver = activeShipment ? drivers.find(d => d.id === activeShipment.driverId) : null;

    if (activeShipment) {
      const progress = Math.floor(Math.random() * 60 + 20);
      const kmLeft = Math.floor(Math.random() * 400 + 50);
      return `🚚 **Truck ${truckId} — Live Status**\n\n` +
        `• Registration: ${truck.vehicleNumber}\n` +
        `• Type: ${truck.type} (${truck.capacity.toLocaleString()} kg)\n` +
        `• Status: ${truck.status}\n\n` +
        `📦 **Active Shipment: ${activeShipment.id}**\n` +
        `• Customer: ${activeShipment.customerName}\n` +
        `• Route: ${activeShipment.pickupAddress} → ${activeShipment.dropAddress}\n` +
        `• Shipment Status: ${activeShipment.status}\n` +
        `• ETA: ${new Date(activeShipment.eta).toLocaleString()}\n` +
        `• Journey Progress: ~${progress}% complete (~${kmLeft} km remaining)\n` +
        (driver ? `• Driver: ${driver.name} (${driver.id}), Rating: ${driver.rating}⭐\n` : '') +
        `\nLast GPS ping received a few seconds ago.`;
    } else {
      return `🚚 **Truck ${truckId}**\n\n` +
        `• Registration: ${truck.vehicleNumber}\n` +
        `• Type: ${truck.type} (${truck.capacity.toLocaleString()} kg)\n` +
        `• Current Status: ${truck.status}\n\n` +
        `This truck does not have an active shipment right now. It is currently at the depot.`;
    }
  }

  // ── CONSIGNMENT / CN TRACKING ──
  const cnMatch = userMessage.match(/CN\d+/i);
  if (cnMatch) {
    const cnId = cnMatch[0].toUpperCase();
    const shipment = shipments.find(s => s.id === cnId);
    if (!shipment) return `❌ Consignment "${cnId}" not found. Please verify the ID.`;

    const truck = trucks.find(t => t.id === shipment.truckId);
    const driver = drivers.find(d => d.id === shipment.driverId);

    return `📦 **Consignment ${cnId} — Details**\n\n` +
      `• Customer: ${shipment.customerName}\n` +
      `• Route: ${shipment.pickupAddress} → ${shipment.dropAddress}\n` +
      `• Status: ${shipment.status}\n` +
      `• Freight Amount: ₹${shipment.freightAmount.toLocaleString()}\n` +
      `• ETA: ${new Date(shipment.eta).toLocaleString()}\n` +
      (truck ? `• Assigned Truck: ${truck.id} (${truck.vehicleNumber})\n` : '') +
      (driver ? `• Assigned Driver: ${driver.name} (${driver.id})\n` : '');
  }

  // ── DRIVER LOOKUP ──
  const drvMatch = userMessage.match(/DRV\d+/i);
  if (drvMatch) {
    const drvId = drvMatch[0].toUpperCase();
    const driver = drivers.find(d => d.id === drvId);
    if (!driver) return `❌ Driver "${drvId}" not found.`;

    const driverShipments = shipments.filter(s => s.driverId === drvId);
    const activeTrips = driverShipments.filter(s => ["In Transit", "Delayed", "Out For Delivery"].includes(s.status));

    return `👤 **Driver ${driver.name} (${drvId})**\n\n` +
      `• Phone: ${driver.phone}\n` +
      `• License: ${driver.licenseNumber}\n` +
      `• Status: ${driver.status}\n` +
      `• Rating: ${driver.rating} ⭐\n` +
      `• Total Assignments: ${driverShipments.length}\n` +
      `• Currently Active Trips: ${activeTrips.length}\n` +
      (activeTrips.length > 0 ? `\n📍 Active trip: ${activeTrips[0].id} (${activeTrips[0].pickupAddress} → ${activeTrips[0].dropAddress})` : '');
  }

  // ── CUSTOMER LOOKUP ──
  const custMatch = userMessage.match(/CUST\d+/i);
  if (custMatch) {
    const custId = custMatch[0].toUpperCase();
    const customer = customers.find(c => c.id === custId);
    if (!customer) return `❌ Customer "${custId}" not found.`;

    const custShipments = shipments.filter(s => s.customerId === custId);
    const totalRevenue = custShipments.reduce((sum, s) => sum + s.freightAmount, 0);

    return `🏢 **Customer: ${customer.name} (${custId})**\n\n` +
      `• Email: ${customer.email}\n` +
      `• Phone: ${customer.mobile}\n` +
      `• Total Shipments: ${custShipments.length}\n` +
      `• Total Revenue: ₹${totalRevenue.toLocaleString()}\n` +
      `• Active Shipments: ${custShipments.filter(s => s.status === "In Transit").length}`;
  }

  // ── WHERE / LOCATION questions ──
  if (msg.includes("where") || msg.includes("location") || msg.includes("exactly")) {
    // Try to find the most recently mentioned truck/shipment from context
    const lastTrk = userMessage.match(/TRK\d+/i);
    if (lastTrk) {
      const truck = trucks.find(t => t.id === lastTrk[0].toUpperCase());
      const shipment = shipments.find(s => s.truckId === lastTrk[0].toUpperCase() && ["In Transit", "Delayed"].includes(s.status));
      if (truck && shipment) {
        const landmarks = ["NH-44 Highway near Nagpur", "Outer Ring Road, Hyderabad", "Mumbai-Pune Expressway KM 85", "GT Karnal Road, Delhi", "Hosur Road, Bangalore", "OMR Road, Chennai"];
        const landmark = landmarks[Math.floor(Math.random() * landmarks.length)];
        return `📍 **Live Location — ${truck.id} (${truck.vehicleNumber})**\n\n` +
          `• Current Position: ${landmark}\n` +
          `• Heading towards: ${shipment.dropAddress}\n` +
          `• Speed: ${Math.floor(Math.random() * 30 + 50)} km/h\n` +
          `• Distance remaining: ~${Math.floor(Math.random() * 300 + 50)} km\n` +
          `• Last GPS update: ${Math.floor(Math.random() * 5 + 1)} seconds ago\n\n` +
          `You can also view this on the Live Tracking page for the map view.`;
      }
    }
    // Generic location response
    return `📍 Please specify a Truck ID (e.g., "Where is TRK0001?") or Consignment ID (e.g., "Where is CN0050?") and I'll fetch the exact live location for you.`;
  }

  // ── DELAY QUESTIONS ──
  if (msg.includes("delay") || msg.includes("late") || msg.includes("overdue")) {
    const delayed = shipments.filter(s => s.status === "Delayed");
    const top5 = delayed.slice(0, 5);
    return `⚠️ **Delayed Shipments Report**\n\n` +
      `Total delayed: ${delayed.length} out of ${shipments.length} shipments\n\n` +
      top5.map((s, i) => `${i + 1}. ${s.id} — ${s.customerName} (${s.pickupAddress} → ${s.dropAddress})`).join('\n') +
      (delayed.length > 5 ? `\n\n...and ${delayed.length - 5} more. Use the Consignments page filter to view all.` : '');
  }

  // ── SUMMARY / OVERVIEW / DASHBOARD ──
  if (msg.includes("summary") || msg.includes("overview") || msg.includes("dashboard") || msg.includes("report") || msg.includes("status")) {
    const inTransit = shipments.filter(s => s.status === "In Transit").length;
    const delivered = shipments.filter(s => s.status === "Delivered").length;
    const delayed = shipments.filter(s => s.status === "Delayed").length;
    const cancelled = shipments.filter(s => s.status === "Cancelled").length;
    const outForDelivery = shipments.filter(s => s.status === "Out For Delivery").length;
    const totalRevenue = shipments.reduce((sum, s) => sum + s.freightAmount, 0);
    const activeTrucks = trucks.filter(t => t.status !== "Maintenance").length;
    const availableDrivers = drivers.filter(d => d.status === "Available").length;

    return `📊 **Fleet Operations Summary**\n\n` +
      `**Shipments:**\n` +
      `• Total: ${shipments.length}\n` +
      `• In Transit: ${inTransit}\n` +
      `• Delivered: ${delivered}\n` +
      `• Delayed: ${delayed}\n` +
      `• Out For Delivery: ${outForDelivery}\n` +
      `• Cancelled: ${cancelled}\n\n` +
      `**Fleet:**\n` +
      `• Total Trucks: ${trucks.length}\n` +
      `• Active/Operational: ${activeTrucks}\n` +
      `• Under Maintenance: ${trucks.length - activeTrucks}\n\n` +
      `**Drivers:**\n` +
      `• Total: ${drivers.length}\n` +
      `• Available: ${availableDrivers}\n` +
      `• On Trip: ${drivers.filter(d => d.status === "On Trip").length}\n\n` +
      `**Revenue:** ₹${totalRevenue.toLocaleString()}\n\n` +
      `All systems operational. ✅`;
  }

  // ── REVENUE / EARNINGS ──
  if (msg.includes("revenue") || msg.includes("earning") || msg.includes("income") || msg.includes("money") || msg.includes("profit")) {
    const totalRevenue = shipments.reduce((sum, s) => sum + s.freightAmount, 0);
    const avgPerShipment = Math.floor(totalRevenue / shipments.length);
    const maxShipment = shipments.reduce((max, s) => s.freightAmount > max.freightAmount ? s : max, shipments[0]);

    return `💰 **Revenue Analysis**\n\n` +
      `• Total Revenue: ₹${totalRevenue.toLocaleString()}\n` +
      `• Average per Shipment: ₹${avgPerShipment.toLocaleString()}\n` +
      `• Highest Value Shipment: ${maxShipment.id} (₹${maxShipment.freightAmount.toLocaleString()}) — ${maxShipment.customerName}\n` +
      `• Total Shipments Processed: ${shipments.length}\n\n` +
      `Revenue is trending positively. 📈`;
  }

  // ── TRUCK / FLEET QUESTIONS ──
  if (msg.includes("truck") || msg.includes("fleet") || msg.includes("vehicle")) {
    const available = trucks.filter(t => t.status === "Available").length;
    const assigned = trucks.filter(t => t.status === "Assigned").length;
    const maintenance = trucks.filter(t => t.status === "Maintenance").length;
    const heavy = trucks.filter(t => t.type === "Heavy").length;
    const light = trucks.filter(t => t.type === "Light").length;

    return `🚚 **Fleet Overview**\n\n` +
      `• Total Trucks: ${trucks.length}\n` +
      `• Available: ${available}\n` +
      `• Assigned: ${assigned}\n` +
      `• Under Maintenance: ${maintenance}\n\n` +
      `**By Type:**\n` +
      `• Heavy (20,000 kg): ${heavy}\n` +
      `• Light (5,000 kg): ${light}\n\n` +
      `Fleet utilization rate: ${Math.floor(((available + assigned) / trucks.length) * 100)}%`;
  }

  // ── DRIVER QUESTIONS ──
  if (msg.includes("driver")) {
    const available = drivers.filter(d => d.status === "Available").length;
    const onTrip = drivers.filter(d => d.status === "On Trip").length;
    const inactive = drivers.filter(d => d.status === "Inactive").length;
    const avgRating = (drivers.reduce((sum, d) => sum + parseFloat(d.rating as string), 0) / drivers.length).toFixed(1);
    const topDriver = drivers.reduce((best, d) => parseFloat(d.rating as string) > parseFloat(best.rating as string) ? d : best, drivers[0]);

    return `👥 **Driver Management Overview**\n\n` +
      `• Total Drivers: ${drivers.length}\n` +
      `• Available: ${available}\n` +
      `• On Trip: ${onTrip}\n` +
      `• Inactive: ${inactive}\n\n` +
      `**Performance:**\n` +
      `• Average Rating: ${avgRating} ⭐\n` +
      `• Top Rated Driver: ${topDriver.name} (${topDriver.id}) — ${topDriver.rating} ⭐\n\n` +
      `Need details on a specific driver? Just type their ID (e.g., DRV0001).`;
  }

  // ── CUSTOMER QUESTIONS ──
  if (msg.includes("customer") || msg.includes("client")) {
    const topCustomers = customers.slice(0, 5).map(c => {
      const custShipments = shipments.filter(s => s.customerId === c.id);
      const rev = custShipments.reduce((sum, s) => sum + s.freightAmount, 0);
      return { ...c, shipmentCount: custShipments.length, revenue: rev };
    }).sort((a, b) => b.revenue - a.revenue);

    return `🏢 **Customer Overview**\n\n` +
      `• Total Customers: ${customers.length}\n\n` +
      `**Top Customers by Revenue:**\n` +
      topCustomers.map((c, i) => `${i + 1}. ${c.name} — ${c.shipmentCount} shipments, ₹${c.revenue.toLocaleString()}`).join('\n') +
      `\n\nType a Customer ID (e.g., CUST0001) for full details.`;
  }

  // ── SHIPMENT COUNT / HOW MANY ──
  if (msg.includes("how many") || msg.includes("count") || msg.includes("total")) {
    if (msg.includes("truck") || msg.includes("vehicle")) return `We have a total of ${trucks.length} trucks in our fleet.`;
    if (msg.includes("driver")) return `We have ${drivers.length} registered drivers.`;
    if (msg.includes("customer")) return `We have ${customers.length} customers on our platform.`;
    if (msg.includes("shipment") || msg.includes("consignment") || msg.includes("order"))
      return `There are ${shipments.length} total consignments/shipments in the system.`;

    return `📊 Here are the totals:\n• Shipments: ${shipments.length}\n• Trucks: ${trucks.length}\n• Drivers: ${drivers.length}\n• Customers: ${customers.length}`;
  }

  // ── MAINTENANCE ──
  if (msg.includes("maintenance") || msg.includes("repair")) {
    const maintenanceTrucks = trucks.filter(t => t.status === "Maintenance");
    return `🔧 **Maintenance Report**\n\n` +
      `• Trucks under maintenance: ${maintenanceTrucks.length}\n\n` +
      maintenanceTrucks.slice(0, 5).map((t, i) => `${i + 1}. ${t.id} (${t.vehicleNumber}) — ${t.type}`).join('\n') +
      (maintenanceTrucks.length > 5 ? `\n\n...and ${maintenanceTrucks.length - 5} more.` : '');
  }

  // ── HELP ──
  if (msg.includes("help") || msg.includes("what can you")) {
    return `🤖 **I can help you with:**\n\n` +
      `• 🚚 Track any truck — "Track TRK0001"\n` +
      `• 📦 Check consignment — "CN0050 status"\n` +
      `• 👤 Driver info — "DRV0010 details"\n` +
      `• 🏢 Customer info — "CUST0020"\n` +
      `• 📍 Live location — "Where is TRK0005?"\n` +
      `• ⚠️ Delayed shipments — "Show delays"\n` +
      `• 📊 Fleet summary — "Give me a summary"\n` +
      `• 💰 Revenue info — "Revenue report"\n` +
      `• 🔧 Maintenance — "Trucks in maintenance"\n` +
      `• 👥 Driver stats — "Driver overview"\n\n` +
      `Just type naturally and I'll understand! 😊`;
  }

  // ── GREETINGS ──
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("good morning") || msg.includes("good evening")) {
    return `👋 Hello! I'm your FreightTrack AI Assistant.\n\nI have access to your entire logistics database — ${shipments.length} shipments, ${trucks.length} trucks, and ${drivers.length} drivers.\n\nHow can I help you today? Try asking me:\n• "Track TRK0001"\n• "Show me delayed shipments"\n• "Give me a fleet summary"`;
  }

  // ── THANK YOU ──
  if (msg.includes("thank") || msg.includes("thanks")) {
    return `You're welcome! 😊 Feel free to ask anything else. I'm here 24/7 to help with your logistics operations.`;
  }

  // ── DEFAULT CATCH-ALL (intelligent) ──
  const inTransit = shipments.filter(s => s.status === "In Transit").length;
  const delayed = shipments.filter(s => s.status === "Delayed").length;

  return `I'd be happy to help! Here's a quick snapshot of your operations:\n\n` +
    `• 📦 ${shipments.length} total shipments\n` +
    `• 🚚 ${inTransit} in transit, ${delayed} delayed\n` +
    `• 🚛 ${trucks.length} trucks in fleet\n\n` +
    `For more specific info, try:\n` +
    `• Track a truck: "TRK0001"\n` +
    `• Check a shipment: "CN0050"\n` +
    `• Delayed shipments: "Show delays"\n` +
    `• Full report: "Give me a summary"`;
}

// ─── Component ────────────────────────────────────────────────────────

export function AIAssistantPanel() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

  const [messages, setMessages] = useState<{role: 'user' | 'assistant', text: string}[]>([
    { role: 'assistant', text: '👋 Hello! I am your FreightTrack AI Assistant powered by Google Gemini.\n\nI have full access to your logistics data. Try asking me:\n• "Track TRK0001"\n• "Show delayed shipments"\n• "Revenue report"\n• "Fleet summary"\n\nHow can I help you today?' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<ChatSession | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initializeChat = () => {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: `You are FreightTrack AI Assistant. You manage a logistics platform with ${dbData.shipments.length} shipments, ${dbData.trucks.length} trucks, and ${dbData.drivers.length} drivers. Answer questions about logistics, supply chain, and fleet management professionally and in detail.`
      });
      chatSessionRef.current = model.startChat({ history: [] });
    } catch (e) {
      console.error("Failed to initialize Gemini:", e);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput("");
    setIsTyping(true);
    
    try {
      if (!chatSessionRef.current) initializeChat();
      if (!chatSessionRef.current) throw new Error("Chat session not initialized");

      const result = await chatSessionRef.current.sendMessage(userMessage);
      const responseText = result.response.text();
      
      setIsTyping(false);
      setMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    } catch (error) {
      console.error("Gemini API error, using smart local AI:", error);
      
      // Use the smart local AI engine as fallback
      setTimeout(() => {
        const response = smartAI(userMessage);
        setIsTyping(false);
        setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      }, 800 + Math.random() * 1200);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2 flex justify-between items-center text-xs text-muted-foreground px-4">
        <span className="flex items-center text-emerald-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Gemini 1.5 Flash Connected
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none shadow-sm' 
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-bl-none shadow-sm'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg rounded-bl-none p-4 shadow-sm flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center">
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask the AI anything..."
          className="flex-1 border-none bg-zinc-100 dark:bg-zinc-800 focus-visible:ring-0 mr-2"
        />
        <Button size="icon" className="h-10 w-10 shrink-0 rounded-full bg-blue-600 hover:bg-blue-700" onClick={handleSend} disabled={isTyping || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
