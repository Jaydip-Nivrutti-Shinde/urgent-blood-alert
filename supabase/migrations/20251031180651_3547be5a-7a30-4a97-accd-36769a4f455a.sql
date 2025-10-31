-- Create hospital_profiles table
CREATE TABLE public.hospital_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  capacity INTEGER,
  is_available BOOLEAN DEFAULT true,
  specialties TEXT[],
  blood_groups_available TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospital_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hospital_profiles
CREATE POLICY "Anyone can view hospitals"
  ON public.hospital_profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert hospitals"
  ON public.hospital_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update hospitals"
  ON public.hospital_profiles
  FOR UPDATE
  TO authenticated
  USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_hospital_profiles_updated_at
  BEFORE UPDATE ON public.hospital_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert 10 dummy hospital records
INSERT INTO public.hospital_profiles (hospital_name, address, phone, email, contact_person, latitude, longitude, capacity, blood_groups_available, specialties) VALUES
('City General Hospital', '123 Main St, Delhi', '+91-11-2345-6789', 'contact@citygeneral.com', 'Dr. Rajesh Kumar', 28.6139, 77.2090, 500, ARRAY['A+', 'B+', 'O+', 'AB+'], ARRAY['Cardiology', 'Emergency']),
('Apollo Medical Center', '456 Park Avenue, Mumbai', '+91-22-3456-7890', 'info@apollomed.com', 'Dr. Priya Sharma', 19.0760, 72.8777, 350, ARRAY['A+', 'A-', 'O+', 'O-'], ARRAY['Neurology', 'Orthopedics']),
('Max Healthcare', '789 Ring Road, Bangalore', '+91-80-4567-8901', 'admin@maxhealth.com', 'Dr. Amit Patel', 12.9716, 77.5946, 400, ARRAY['B+', 'B-', 'AB+', 'O+'], ARRAY['Oncology', 'Pediatrics']),
('Fortis Hospital', '321 Lake View, Chennai', '+91-44-5678-9012', 'care@fortis.com', 'Dr. Lakshmi Iyer', 13.0827, 80.2707, 300, ARRAY['A+', 'O+', 'AB-'], ARRAY['Cardiology', 'Gastroenterology']),
('Medanta Clinic', '654 Civil Lines, Hyderabad', '+91-40-6789-0123', 'support@medanta.com', 'Dr. Suresh Reddy', 17.3850, 78.4867, 250, ARRAY['A-', 'B+', 'O-', 'AB+'], ARRAY['Emergency', 'Trauma']),
('AIIMS Delhi', 'Ansari Nagar, New Delhi', '+91-11-2658-8500', 'info@aiims.edu', 'Dr. Meera Singh', 28.5672, 77.2100, 600, ARRAY['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], ARRAY['All Specialties']),
('Lilavati Hospital', 'Bandra West, Mumbai', '+91-22-2640-5000', 'contact@lilavati.com', 'Dr. Anil Mehta', 19.0596, 72.8295, 320, ARRAY['O+', 'O-', 'A+'], ARRAY['Cardiology', 'Neurology']),
('Manipal Hospital', 'HAL Airport Road, Bangalore', '+91-80-2502-4444', 'help@manipal.com', 'Dr. Kavita Rao', 12.9539, 77.6525, 380, ARRAY['A+', 'B+', 'AB+', 'O+'], ARRAY['Orthopedics', 'Urology']),
('Ruby Hall Clinic', 'Grant Road, Pune', '+91-20-6645-8888', 'info@rubyhall.com', 'Dr. Vinay Kulkarni', 18.5204, 73.8567, 280, ARRAY['A-', 'B-', 'O+', 'AB-'], ARRAY['Maternity', 'Pediatrics']),
('Sankara Nethralaya', 'College Road, Chennai', '+91-44-2827-1616', 'care@sankaranethralaya.org', 'Dr. Ramesh Babu', 13.0569, 80.2425, 200, ARRAY['O+', 'A+', 'B+'], ARRAY['Ophthalmology', 'Emergency']);