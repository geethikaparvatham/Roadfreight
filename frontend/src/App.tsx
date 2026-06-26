import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DriverPortal from "./pages/DriverPortal";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { AuthProvider } from "./contexts/AuthContext";
import Consignments from "./pages/Consignments";
import Fleet from "./pages/Fleet";
import Drivers from "./pages/Drivers";
import LiveTracking from "./pages/LiveTracking";
import Analytics from "./pages/Analytics";
import CustomerPortal from "./pages/CustomerPortal";
import Settings from "./pages/Settings";
import Alerts from "./pages/Alerts";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/track" element={<CustomerPortal />} />
        
        {/* Driver Portal — standalone, NO dashboard layout */}
        <Route path="/driver-portal" element={<DriverPortal />} />

        {/* Admin Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="consignments" element={<Consignments />} />
          <Route path="tracking" element={<LiveTracking />} />
          <Route path="fleet" element={<Fleet />} />
          <Route path="drivers" element={<Drivers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
