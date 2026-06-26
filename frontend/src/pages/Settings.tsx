import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, Clock, ShieldCheck, Mail, Key, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Settings() {
  const { user } = useAuth();
  
  // State for editable fields
  const [email, setEmail] = useState("Roadfreight");
  const [role, setRole] = useState("Super Admin");
  const [password, setPassword] = useState("RF@888");
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [loginTime] = useState(() => new Date().toLocaleString('en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }));

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      // Here we would typically show a success toast
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
        <p className="text-muted-foreground">Manage your account credentials and active sessions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-500" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal account details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Username / Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500 z-10" />
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2 pl-9 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Fleet Manager">Fleet Manager</option>
                  <option value="Dispatch Officer">Dispatch Officer</option>
                  <option value="Support Agent">Support Agent</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2 text-zinc-500" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
              <label className="text-sm font-medium text-muted-foreground flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Current Session Login Date & Time
              </label>
              <div className="text-sm bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-md border border-zinc-100 dark:border-zinc-800">
                {loginTime}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
