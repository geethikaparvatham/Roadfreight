import { useState } from "react";
import { Search, Package, MapPin, CheckCircle, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CustomerPortal() {
  const [search, setSearch] = useState("");
  const [searched, setSearched] = useState(false);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Track Your Shipment</h1>
          <p className="text-lg text-muted-foreground">Enter your Consignment ID or Mobile Number to get real-time status.</p>
          
          <div className="flex max-w-md mx-auto mt-8">
            <Input 
              type="text" 
              placeholder="e.g. CN-12345 or +1 234 567 8900" 
              className="rounded-r-none h-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button className="rounded-l-none h-12 px-8" onClick={() => setSearched(true)}>
              <Search className="h-5 w-5 mr-2" /> Track
            </Button>
          </div>
        </div>

        {searched && (
          <div className="mt-12 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Shipment CN-2023-445</CardTitle>
                  <CardDescription>Expected Delivery: Tomorrow, by 6:00 PM</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">In Transit</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6 mb-8">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">From</p>
                    <p className="font-medium">Mumbai, MH</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">To</p>
                    <p className="font-medium">Delhi, DL</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Current Status</p>
                    <p className="font-medium text-blue-600">Arrived at Ahmedabad Hub</p>
                  </div>
                </div>

                <div className="relative pt-8">
                  <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800"></div>
                  
                  <div className="space-y-8 relative">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center border-4 border-white dark:border-zinc-950 z-10">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="font-medium">Shipment Picked Up</p>
                        <p className="text-sm text-muted-foreground">Mumbai, MH • Yesterday, 10:00 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white dark:border-zinc-950 z-10">
                        <Package className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="font-medium">In Transit</p>
                        <p className="text-sm text-muted-foreground">Arrived at Ahmedabad Hub • Today, 2:30 PM</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-zinc-950 z-10">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="font-medium text-zinc-400">Out for Delivery</p>
                        <p className="text-sm text-zinc-400">Pending</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end space-x-4">
              <Button variant="outline">Download Invoice</Button>
              <Button variant="outline">Email Updates</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
