-- Database schema for Dark Store Dashboard
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create doctors table
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'doctor' CHECK (role = 'doctor'),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT,
  specialization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create patients table
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  prostheses TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('stable', 'warning', 'moving')),
  last_visit DATE NOT NULL,
  clinical_history TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create measurements table
CREATE TABLE IF NOT EXISTS measurements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  prosthesis_name TEXT NOT NULL,
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('acceleration', 'micromovement')),
  value DECIMAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  patient_id TEXT REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_measurements_patient_id ON measurements(patient_id);
CREATE INDEX IF NOT EXISTS idx_measurements_timestamp ON measurements(timestamp);
CREATE INDEX IF NOT EXISTS idx_notifications_patient_id ON notifications(patient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Enable Row Level Security
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
-- For now, allowing all operations - you should implement proper authentication
CREATE POLICY "Allow all operations on doctors" ON doctors FOR ALL USING (true);
CREATE POLICY "Allow all operations on patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow all operations on measurements" ON measurements FOR ALL USING (true);
CREATE POLICY "Allow all operations on notifications" ON notifications FOR ALL USING (true);

-- Insert sample data
INSERT INTO doctors (name, role, email, phone, avatar, specialization) VALUES
('Dra. Sarah Johnson', 'doctor', 'sarah.johnson@hospital.com', '+1 (555) 123-4567', '/placeholder.svg?height=80&width=80', 'Cardiología')
ON CONFLICT (email) DO NOTHING;

INSERT INTO patients (id, name, age, prostheses, status, last_visit, clinical_history) VALUES
('P001', 'Juan Smith', 45, ARRAY['Prótesis de Rodilla'], 'stable', '2024-01-15', '123456'),
('P002', 'Emma Davis', 32, ARRAY['Prótesis de Cadera', 'Prótesis de Rodilla'], 'warning', '2024-01-14', '234567'),
('P003', 'Michael Brown', 58, ARRAY['Prótesis de Hombro'], 'moving', '2024-01-16', '345678'),
('P004', 'Lisa Wilson', 41, ARRAY['Prótesis de Tobillo'], 'stable', '2024-01-13', '456789')
ON CONFLICT (id) DO NOTHING;

-- Insert sample measurements
INSERT INTO measurements (patient_id, prosthesis_name, measurement_type, value, timestamp) VALUES
('P001', 'Prótesis de Rodilla', 'acceleration', 2.1, NOW() - INTERVAL '6 hours'),
('P001', 'Prótesis de Rodilla', 'acceleration', 2.3, NOW() - INTERVAL '5 hours'),
('P001', 'Prótesis de Rodilla', 'acceleration', 1.9, NOW() - INTERVAL '4 hours'),
('P001', 'Prótesis de Rodilla', 'acceleration', 2.5, NOW() - INTERVAL '3 hours'),
('P001', 'Prótesis de Rodilla', 'acceleration', 2.2, NOW() - INTERVAL '2 hours'),
('P001', 'Prótesis de Rodilla', 'acceleration', 2.0, NOW() - INTERVAL '1 hour'),
('P001', 'Prótesis de Rodilla', 'acceleration', 2.4, NOW()),
('P001', 'Prótesis de Rodilla', 'micromovement', 15.2, NOW() - INTERVAL '6 hours'),
('P001', 'Prótesis de Rodilla', 'micromovement', 14.8, NOW() - INTERVAL '5 hours'),
('P001', 'Prótesis de Rodilla', 'micromovement', 16.1, NOW() - INTERVAL '4 hours'),
('P001', 'Prótesis de Rodilla', 'micromovement', 15.5, NOW() - INTERVAL '3 hours'),
('P001', 'Prótesis de Rodilla', 'micromovement', 14.9, NOW() - INTERVAL '2 hours'),
('P001', 'Prótesis de Rodilla', 'micromovement', 15.8, NOW() - INTERVAL '1 hour'),
('P001', 'Prótesis de Rodilla', 'micromovement', 15.3, NOW());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

