import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShieldCheck, Truck, Eye, EyeOff } from "lucide-react";
import { dbData, saveMockData } from "../lib/mockData";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"admin" | "driver">("admin");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (role === "admin") {
      if (email !== "Roadfreight" || password !== "RF@888") {
        setError("Invalid Admin credentials.");
        setLoading(false);
        return;
      }
      // Successful Admin login bypasses Firebase for custom username
      sessionStorage.setItem("mock_user_email", email);
      navigate("/dashboard");
      return;
    }

    const destination = "/driver-portal";
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      
      // Auto-add new driver to the admin portal list
      if (role === "driver") {
        const name = userCred.user.displayName || email.split('@')[0] || "Unknown Driver";
        const exists = dbData.drivers.some(d => d.name === name);
        if (!exists) {
          dbData.drivers.unshift({
            id: `DRV${String(dbData.drivers.length + 1).padStart(4, '0')}`,
            name: name,
            phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
            licenseNumber: `LIC${Math.floor(10000000 + Math.random() * 90000000)}`,
            status: "Available",
            rating: "5.0",
            companyId: "c1"
          });
          saveMockData();
        }
      }

      navigate(destination);
    } catch (err: any) {
      const msg = err.message || "";
      // If Firebase auth providers aren't configured, go to destination anyway
      if (msg.includes("configuration-not-found") || msg.includes("operation-not-allowed") || err.code === "auth/configuration-not-found") {
        sessionStorage.setItem("mock_user_email", email);
        navigate(destination);
      } else {
        setError(msg || "Failed to login. Check credentials.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <Card className="w-full max-w-md shadow-lg border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Package size={28} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">FreightTrack OS</CardTitle>
          <CardDescription>
            Enter your credentials to access the enterprise portal.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-5">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setRole("admin"); setEmail(""); setPassword(""); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  role === "admin"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`p-2.5 rounded-full ${role === "admin" ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className={`text-sm font-semibold ${role === "admin" ? "text-blue-700 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"}`}>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => { setRole("driver"); setEmail(""); setPassword(""); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  role === "driver"
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/30 shadow-sm"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <div className={`p-2.5 rounded-full ${role === "driver" ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                  <Truck className="h-5 w-5" />
                </div>
                <span className={`text-sm font-semibold ${role === "driver" ? "text-blue-700 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"}`}>Driver</span>
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{role === "admin" ? "Username" : "Email address"}</Label>
              <Input
                id="email"
                type={role === "admin" ? "text" : "email"}
                placeholder={role === "admin" ? "Username" : "name@company.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* Social Login Options (Drivers Only) */}
            {role === "driver" && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-zinc-950 px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    className="h-11 w-11 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors hover:shadow-md"
                    title="Sign in with Google"
                    onClick={async () => {
                      setLoading(true);
                      setError("");
                      try {
                        const result = await signInWithPopup(auth, googleProvider);
                        if (role === "driver") {
                          const name = result.user.displayName || result.user.email?.split('@')[0] || "Unknown Driver";
                          const exists = dbData.drivers.some(d => d.name === name);
                          if (!exists) {
                            dbData.drivers.unshift({
                              id: `DRV${String(dbData.drivers.length + 1).padStart(4, '0')}`,
                              name: name,
                              phone: result.user.phoneNumber || `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
                              licenseNumber: `LIC${Math.floor(10000000 + Math.random() * 90000000)}`,
                              status: "Available",
                              rating: "5.0",
                              companyId: "c1"
                            });
                            saveMockData();
                          }
                        }
                        navigate("/driver-portal");
                      } catch (err: any) {
                        const msg = err.message || "";
                        if (msg.includes("configuration-not-found") || msg.includes("operation-not-allowed")) {
                          setError("To use real Google emails, please enable Google Sign-In in your Firebase Console (Authentication > Sign-in method > Add new provider > Google).");
                          setLoading(false);
                        } else if (msg.includes("popup-closed-by-user") || err.code === "auth/popup-closed-by-user") {
                          setLoading(false);
                        } else {
                          setError(msg || "Google sign-in failed.");
                          setLoading(false);
                        }
                      }
                    }}
                    disabled={loading}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="h-11 w-11 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    title="Sign in with Facebook"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="h-11 w-11 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                    title="Sign in with Twitter"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
