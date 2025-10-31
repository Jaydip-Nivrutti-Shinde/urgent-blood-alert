import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bloodGroup, latitude, longitude } = await req.json();

    console.log('Blood request received:', { bloodGroup, latitude, longitude });

    if (!bloodGroup || !latitude || !longitude) {
      throw new Error('Missing required parameters: bloodGroup, latitude, longitude');
    }

    const RADIUS_KM = 5; // 5km radius
    let hospitalsNotified = 0;
    let donorsNotified = 0;

    // 1. Find nearby hospitals with the required blood group
    const { data: hospitals, error: hospitalsError } = await supabase
      .from('hospital_profiles')
      .select('*')
      .eq('is_available', true);

    if (hospitalsError) {
      console.error('Error fetching hospitals:', hospitalsError);
    } else if (hospitals) {
      console.log(`Found ${hospitals.length} hospitals`);
      
      // Filter hospitals by distance and blood group availability
      const nearbyHospitals = hospitals.filter(hospital => {
        const distance = calculateDistance(
          latitude,
          longitude,
          hospital.latitude,
          hospital.longitude
        );
        const hasBloodGroup = hospital.blood_groups_available?.includes(bloodGroup);
        return distance <= RADIUS_KM && hasBloodGroup;
      });

      console.log(`Found ${nearbyHospitals.length} nearby hospitals with ${bloodGroup}`);
      hospitalsNotified = nearbyHospitals.length;

      // Log notification (in production, this would send actual notifications via email/SMS)
      for (const hospital of nearbyHospitals) {
        console.log(`Notifying hospital: ${hospital.hospital_name} (${hospital.email})`);
        // TODO: Implement actual notification system (email/SMS/push)
      }
    }

    // 2. Find nearby donors with the required blood group
    const { data: donors, error: donorsError } = await supabase
      .from('profiles')
      .select('*')
      .eq('blood_group', bloodGroup)
      .eq('is_donor', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (donorsError) {
      console.error('Error fetching donors:', donorsError);
    } else if (donors) {
      console.log(`Found ${donors.length} potential donors with ${bloodGroup}`);
      
      // Filter donors by distance
      const nearbyDonors = donors.filter(donor => {
        const distance = calculateDistance(
          latitude,
          longitude,
          Number(donor.latitude),
          Number(donor.longitude)
        );
        return distance <= RADIUS_KM;
      });

      console.log(`Found ${nearbyDonors.length} nearby donors`);
      donorsNotified = nearbyDonors.length;

      // Log notification (in production, this would send actual notifications)
      for (const donor of nearbyDonors) {
        console.log(`Notifying donor: ${donor.first_name} ${donor.last_name} (${donor.phone})`);
        // TODO: Implement actual notification system (email/SMS/push)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        hospitalsNotified,
        donorsNotified,
        message: `Notified ${hospitalsNotified} hospitals and ${donorsNotified} donors`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in notify-blood-request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
