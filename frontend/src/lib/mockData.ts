import { useState, useEffect } from "react";

const STORAGE_KEY = "freight_os_mock_data";

export const generateMockData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Failed to load mock data from local storage", e);
  }

  const companies = [
    { id: "c1", name: "ABC Logistics" },
    { id: "c2", name: "XYZ Transport" },
    { id: "c3", name: "National Freight" },
    { id: "c4", name: "Speed Cargo" },
    { id: "c5", name: "FastTrack Logistics" },
  ];

  const statuses = ["Booked", "Assigned", "Picked Up", "In Transit", "Delayed", "Out For Delivery", "Delivered", "Cancelled"];
  
  const generateId = (prefix: string, i: number) => `${prefix}${String(i).padStart(4, '0')}`;
  
  // ── 50 Customers ──
  const customers = Array.from({ length: 50 }).map((_, i) => ({
    id: generateId("CUST", i + 1),
    name: `Customer ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    mobile: `+91${Math.floor(7000000000 + Math.random() * 3000000000)}`,
    companyId: companies[i % 5].id,
  }));

  // ── 50 Drivers ──
  const driverNames = [
    "Rahul Sharma", "Vikram Singh", "Arjun Patel", "Suresh Kumar", "Ravi Verma",
    "Amit Yadav", "Karan Malhotra", "Deepak Joshi", "Manoj Tiwari", "Rohit Gupta",
    "Sanjay Mishra", "Anil Chauhan", "Rajesh Nair", "Pradeep Reddy", "Nikhil Mehta",
    "Ajay Thakur", "Vijay Rathore", "Prakash Dubey", "Sunil Pandey", "Gaurav Saxena",
    "Harsh Agarwal", "Mohit Bhatia", "Vishal Kapoor", "Sachin Rana", "Naveen Pillai",
    "Akash Iyer", "Tarun Jha", "Pankaj Soni", "Bharat Choudhary", "Dinesh Menon",
    "Yogesh Patil", "Ashish Bansal", "Ramesh Hegde", "Tushar Kulkarni", "Ankit Das",
    "Sumit Sethi", "Vivek Sinha", "Manish Goel", "Kunal Bose", "Arun Naidu",
    "Siddharth Rao", "Abhishek Jain", "Dhiraj Khanna", "Nitin Arora", "Hemant Prasad",
    "Rakesh Pal", "Varun Bajaj", "Omkar Desai", "Sandip Pawar", "Chetan More"
  ];
  const drivers = Array.from({ length: 50 }).map((_, i) => ({
    id: generateId("DRV", i + 1),
    name: driverNames[i],
    phone: `+91${Math.floor(7000000000 + Math.random() * 3000000000)}`,
    licenseNumber: `LIC${Math.floor(10000000 + Math.random() * 90000000)}`,
    status: i % 3 === 0 ? "Available" : (i % 3 === 1 ? "On Trip" : "Inactive"),
    rating: (Math.random() * 2 + 3).toFixed(1),
    companyId: companies[i % 5].id,
  }));

  // ── 50 Trucks ──
  const stateCodes = ["MH", "DL", "KA", "TN", "WB", "GJ", "UP", "TS", "RJ", "MP"];
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  const trucks = Array.from({ length: 50 }).map((_, i) => {
    const state = stateCodes[Math.floor(Math.random() * stateCodes.length)];
    const series = chars[Math.floor(Math.random() * 26)] + chars[Math.floor(Math.random() * 26)];
    
    return {
      id: generateId("TRK", i + 1),
      vehicleNumber: `${state}${Math.floor(10 + Math.random() * 90)}${series}${Math.floor(1000 + Math.random() * 9000)}`,
      type: i % 2 === 0 ? "Heavy" : "Light",
      capacity: i % 2 === 0 ? 20000 : 5000,
      status: i % 4 === 0 ? "Available" : (i % 4 === 1 ? "Assigned" : "Maintenance"),
      companyId: companies[i % 5].id,
    };
  });

  const cities = [
    "Mumbai, MH", "Delhi, DL", "Bangalore, KA", "Chennai, TN", 
    "Kolkata, WB", "Pune, MH", "Hyderabad, TS", "Ahmedabad, GJ",
    "Jaipur, RJ", "Surat, GJ", "Lucknow, UP", "Kanpur, UP"
  ];

  // ── Shipments: each of the 50 trucks has one shipment assigned ──
  const shipments = Array.from({ length: 50 }).map((_, i) => {
    const cust = customers[i % 50];
    const truck = trucks[i % 50];
    const driver = drivers[i % 50];
    
    // Pick two random distinct cities
    const originIdx = Math.floor(Math.random() * cities.length);
    let destIdx = Math.floor(Math.random() * cities.length);
    while (destIdx === originIdx) {
      destIdx = Math.floor(Math.random() * cities.length);
    }
    
    return {
      id: generateId("CN", i + 1),
      customerId: cust.id,
      customerName: cust.name,
      pickupAddress: cities[originIdx],
      dropAddress: cities[destIdx],
      truckId: truck.id,
      driverId: driver.id,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      freightAmount: Math.floor(500 + Math.random() * 5000),
      companyId: cust.companyId,
      eta: new Date(Date.now() + Math.random() * 86400000 * 5).toISOString(),
    };
  });

  const data = { companies, customers, drivers, trucks, shipments };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
  
  return data;
};

export const dbData = generateMockData();

export const reloadMockData = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Mutate dbData in-place so all files importing it instantly see the changes
      Object.keys(dbData).forEach(key => {
        delete (dbData as any)[key];
      });
      Object.assign(dbData, parsed);
    }
  } catch (e) {
    console.error("Failed to reload mock data from local storage", e);
  }
};

export const saveMockData = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dbData));
  } catch (e) {}
  // Dispatch a custom event so all components in the app can react to data changes instantly
  window.dispatchEvent(new CustomEvent("dbDataChanged"));
};

// Listen for storage events from other tabs to sync in real time
if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      reloadMockData();
      window.dispatchEvent(new CustomEvent("dbDataChanged"));
    }
  });
}

export const useMockData = () => {
  const [data, setData] = useState(dbData);
  useEffect(() => {
    const handler = () => {
      // Create a shallow copy to trigger state update
      setData({ ...dbData });
    };
    window.addEventListener("dbDataChanged", handler);
    return () => window.removeEventListener("dbDataChanged", handler);
  }, []);
  return data;
};
