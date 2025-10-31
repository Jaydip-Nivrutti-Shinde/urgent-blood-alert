import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Droplet, MapPin, Loader2 } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const BloodConnect = () => {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user's location on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError(null);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Unable to get your location. Please enable location services.");
          toast({
            title: "Location Error",
            description: "Please enable location services to use BloodConnect.",
            variant: "destructive",
          });
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, [toast]);

  const handleBloodGroupSelect = async (bloodGroup: string) => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "Please enable location services to send blood requests.",
        variant: "destructive",
      });
      return;
    }

    setSelectedBloodGroup(bloodGroup);
    setIsLoading(true);

    try {
      // Call edge function to handle notifications
      const { data, error } = await supabase.functions.invoke("notify-blood-request", {
        body: {
          bloodGroup,
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        },
      });

      if (error) throw error;

      toast({
        title: "Request Sent Successfully",
        description: `Notified ${data.hospitalsNotified || 0} hospitals and ${data.donorsNotified || 0} donors about ${bloodGroup} blood requirement.`,
      });
    } catch (error) {
      console.error("Error sending blood request:", error);
      toast({
        title: "Error",
        description: "Failed to send blood request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setSelectedBloodGroup(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-4 shadow-[var(--shadow-blood)]">
            <Droplet className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            BloodConnect
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with nearby hospitals and donors instantly. Select the blood group you need.
          </p>
        </div>

        {/* Location Status */}
        <Card className="mb-6 border-border/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MapPin className={`w-5 h-5 ${userLocation ? "text-accent" : "text-destructive"}`} />
              <div>
                <p className="text-sm font-medium">
                  {userLocation
                    ? "Location detected - Ready to connect"
                    : locationError || "Detecting your location..."}
                </p>
                {userLocation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Searching within 5km radius
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Group Selection */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">Select Blood Group Required</CardTitle>
            <CardDescription>
              Click on the blood group you need. We'll notify nearby hospitals and registered donors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {BLOOD_GROUPS.map((bloodGroup) => (
                <Button
                  key={bloodGroup}
                  variant="blood"
                  size="lg"
                  disabled={isLoading || !userLocation}
                  onClick={() => handleBloodGroupSelect(bloodGroup)}
                  className="h-20 md:h-24 text-xl md:text-2xl font-bold relative overflow-hidden group"
                >
                  {isLoading && selectedBloodGroup === bloodGroup ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Droplet className="absolute top-2 right-2 w-4 h-4 md:w-5 md:h-5 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span>{bloodGroup}</span>
                    </>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>1. Select the blood group you need</p>
              <p>2. We find nearby hospitals with availability</p>
              <p>3. Registered donors in your area are notified</p>
              <p>4. Connect directly for urgent requirements</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Emergency Protocol
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Only nearby contacts within 5km are notified</p>
              <p>• Hospitals receive priority notifications</p>
              <p>• Registered donors get instant alerts</p>
              <p>• Response time: typically under 5 minutes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BloodConnect;
