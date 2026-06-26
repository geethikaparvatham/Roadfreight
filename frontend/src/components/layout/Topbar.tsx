import { useState, useRef, useEffect } from "react";
import { Bell, Search, Menu, LogOut, User, Bot, Truck, MapPin, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { AIAssistantPanel } from "../AIAssistantPanel";
import { dbData } from "../../lib/mockData";
import { useAuth } from "../../contexts/AuthContext";
import { TripRequestNotifications } from "../TripRequestNotifications";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getSearchResults = () => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    
    const consignments = dbData.shipments
      .filter(s => s.id.toLowerCase().includes(term) || s.customerName.toLowerCase().includes(term))
      .map(s => ({ id: s.id, title: `${s.id} - ${s.customerName}`, type: "Consignment", icon: Package, path: "/dashboard/consignments" }));
      
    const trucks = dbData.trucks
      .filter(t => t.id.toLowerCase().includes(term) || t.vehicleNumber.toLowerCase().includes(term))
      .map(t => ({ id: t.id, title: `${t.id} (${t.vehicleNumber})`, type: "Truck", icon: Truck, path: "/dashboard/fleet" }));
      
    const drivers = dbData.drivers
      .filter(d => d.id.toLowerCase().includes(term) || d.name.toLowerCase().includes(term))
      .map(d => ({ id: d.id, title: `${d.name} (${d.id})`, type: "Driver", icon: User, path: "/dashboard/drivers" }));
      
    return [...consignments, ...trucks, ...drivers].slice(0, 6);
  };

  const results = getSearchResults();

  const handleResultClick = (path: string) => {
    navigate(path);
    setShowResults(false);
    setSearchTerm("");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="hidden md:flex w-full max-w-md items-center relative" ref={searchRef}>
            <Search className="absolute left-2.5 h-4 w-4 text-zinc-500" />
            <Input
              type="search"
              placeholder="Search consignments, trucks, or drivers..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 pl-9 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
            />
            
            {/* Search Autocomplete Dropdown */}
            {showResults && searchTerm.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg overflow-hidden z-50">
                {results.length > 0 ? (
                  <ul className="py-2">
                    {results.map((result) => (
                      <li key={result.id}>
                        <button
                          onClick={() => handleResultClick(result.path)}
                          className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-3 transition-colors"
                        >
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            <result.icon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                              {result.title}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {result.type}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-sm text-center text-zinc-500">
                    No matching results found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6 gap-4">
          <Sheet>
            <SheetTrigger 
              render={
                <Button variant="outline" size="icon" className="relative h-9 w-9 rounded-full border-zinc-200 dark:border-zinc-800 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40" />
              }
            >
              <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] p-0 flex flex-col border-l-zinc-200 dark:border-l-zinc-800">
              <SheetHeader className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-900 m-0">
                <SheetTitle className="flex items-center text-white text-base">
                  <Bot className="h-5 w-5 mr-2 text-blue-400" />
                  AI Logistics Assistant
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden">
                <AIAssistantPanel />
              </div>
            </SheetContent>
          </Sheet>

          <TripRequestNotifications />

          <DropdownMenu>
            <DropdownMenuTrigger 
              render={<Button variant="ghost" className="relative h-9 w-9 rounded-full" />}
            >
              <Avatar className="h-9 w-9 border border-zinc-200 dark:border-zinc-800">
                <AvatarFallback className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 uppercase font-bold text-xs">
                  RF
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Roadfreight</p>
                  <p className="text-xs leading-none text-muted-foreground">Admin Account</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="hidden sm:flex text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2 font-medium"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
