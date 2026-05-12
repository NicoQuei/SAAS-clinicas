-- ==========================================
-- SUPABASE SCHEMA - CLINIC SAAS
-- ==========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TENANT (CLINICAS)
-- ==========================================
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  document VARCHAR(20), -- CNPJ/CPF
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. USERS (PROFISSIONAIS E RECEPCIONISTAS)
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id), -- Maps to Supabase Auth
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'DOCTOR', 'RECEPTIONIST')),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  professional_document VARCHAR(50), -- CRM, CRO, CRP, etc.
  specialty VARCHAR(100),
  color_code VARCHAR(7) DEFAULT '#6366f1',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. PATIENTS (PACIENTES)
-- ==========================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  document VARCHAR(20), -- CPF
  birth_date DATE,
  gender VARCHAR(20),
  address TEXT,
  medical_history TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. APPOINTMENTS (AGENDAMENTOS)
-- ==========================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' 
    CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELED', 'NO_SHOW')),
  type VARCHAR(100) DEFAULT 'CONSULTATION',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. MEDICAL RECORDS (PRONTUÁRIOS)
-- ==========================================
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES users(id),
  appointment_id UUID REFERENCES appointments(id),
  type VARCHAR(50) NOT NULL DEFAULT 'EVOLUTION' 
    CHECK (type IN ('EVOLUTION', 'PRESCRIPTION', 'EXAM_REQUEST', 'ATTACHMENT', 'NOTE')),
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 6. FINANCE (FINANCEIRO)
-- ==========================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID REFERENCES patients(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING' 
    CHECK (status IN ('PENDING', 'PAID', 'CANCELED')),
  due_date DATE NOT NULL,
  payment_date DATE,
  payment_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================
CREATE INDEX idx_users_clinic ON users(clinic_id);
CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_appointments_clinic ON appointments(clinic_id);
CREATE INDEX idx_appointments_dates ON appointments(start_time, end_time);
CREATE INDEX idx_records_patient ON medical_records(patient_id);
CREATE INDEX idx_transactions_clinic ON transactions(clinic_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's clinic_id
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. CLINICS POLICY (Users can only see and update their own clinic)
CREATE POLICY "Users can view their own clinic" ON clinics
  FOR SELECT USING (id = get_user_clinic_id());
CREATE POLICY "Admins can update their own clinic" ON clinics
  FOR UPDATE USING (id = get_user_clinic_id() AND (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

-- 2. USERS POLICY (Users can only see users from their own clinic)
CREATE POLICY "Users can view users in same clinic" ON users
  FOR SELECT USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Admins can insert/update users in same clinic" ON users
  FOR ALL USING (clinic_id = get_user_clinic_id() AND (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

-- 3. PATIENTS POLICY (Isolation by clinic)
CREATE POLICY "Users can view patients in their clinic" ON patients
  FOR SELECT USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users can insert patients in their clinic" ON patients
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());
CREATE POLICY "Users can update patients in their clinic" ON patients
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

-- 4. APPOINTMENTS POLICY (Isolation by clinic)
CREATE POLICY "Users can view appointments in their clinic" ON appointments
  FOR SELECT USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Users can manage appointments in their clinic" ON appointments
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- 5. MEDICAL RECORDS POLICY (Isolation by clinic)
CREATE POLICY "Users can view records in their clinic" ON medical_records
  FOR SELECT USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Doctors can manage records in their clinic" ON medical_records
  FOR ALL USING (clinic_id = get_user_clinic_id() AND (SELECT role FROM users WHERE id = auth.uid()) IN ('ADMIN', 'DOCTOR'));

-- 6. TRANSACTIONS POLICY (Isolation by clinic)
CREATE POLICY "Users can view transactions in their clinic" ON transactions
  FOR SELECT USING (clinic_id = get_user_clinic_id());
CREATE POLICY "Admins can manage transactions" ON transactions
  FOR ALL USING (clinic_id = get_user_clinic_id() AND (SELECT role FROM users WHERE id = auth.uid()) = 'ADMIN');

-- ==========================================
-- TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
