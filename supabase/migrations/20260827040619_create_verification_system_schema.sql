/*
# Online Verification System for Weighing and Measuring Instruments

## Summary
Creates the full schema for a Legal Metrology Act (2009) verification platform under the Department of Consumer Affairs. It models establishments (device owners), legal metrology officers / GATC field officers, state administrators, weighing/measuring devices, verification applications, field inspection calculations, and QR-enabled digital verification certificates.

## Tables

1. `establishments` - Commercial entities that own weighing/measuring instruments. Columns: id, name, owner_name, email, phone, address, state, district, license_number, gstin, created_at.
2. `officers` - Legal Metrology Officers and GATC field officers. Columns: id, name, email, phone, designation (LMO / GATC_OFFICER / STATE_ADMIN), employee_id, region, state, created_at.
3. `devices` - Weighing/measuring instruments owned by an establishment. Columns: id, establishment_id (FK), device_type, serial_number, manufacturer, model, nominal_capacity, accuracy_class, last_verified_at, next_renewal_at, status, created_at.
4. `applications` - Verification / re-verification applications submitted by an establishment for a device. Columns: id, application_number, establishment_id (FK), device_id (FK), application_type (NEW_VERIFICATION / RE_VERIFICATION), assigned_officer_id (FK officers, nullable), status (DRAFT / SUBMITTED / UNDER_REVIEW / SCHEDULED / INSPECTION / APPROVED / REJECTED / CERTIFICATE_ISSUED), submitted_at, scheduled_date, reviewed_at, created_at.
5. `inspections` - Field inspection records created by an officer for an application. Columns: id, application_id (FK), officer_id (FK), inspection_date, nominal_value, observed_value, error_value, mpe_allowed, result (PASSED / FAILED), remarks, photo_urls (text[]), created_at.
6. `certificates` - Digital verification certificates issued after an approved inspection. Columns: id, certificate_number, application_id (FK), device_id (FK), establishment_id (FK), officer_id (FK), inspection_id (FK), issued_date, valid_until, hmac_signature, qr_payload, status (ACTIVE / EXPIRED / REVOKED), created_at.

## Security
- RLS enabled on every table.
- This is a demo / no-auth government portal: all data is intentionally shared and publicly readable (the /verify page must read certificates without a session). Policies use `TO anon, authenticated` with `USING (true)` / `WITH CHECK (true)` because the data is intentionally public and there is no per-user ownership concept in this demo.

## Notes
1. All foreign keys use ON DELETE CASCADE so removing a parent cleans up children.
2. `photo_urls` is a text array for inspection evidence URLs.
3. `hmac_signature` stores a tamper-evident HMAC-SHA256 signature over certificate metadata, generated server-side.
4. `qr_payload` stores the signed payload embedded in the certificate QR code.
*/

CREATE TABLE IF NOT EXISTS establishments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  state text NOT NULL,
  district text NOT NULL,
  license_number text NOT NULL,
  gstin text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS officers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  designation text NOT NULL CHECK (designation IN ('LMO', 'GATC_OFFICER', 'STATE_ADMIN')),
  employee_id text NOT NULL,
  region text NOT NULL,
  state text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  device_type text NOT NULL,
  serial_number text NOT NULL,
  manufacturer text NOT NULL,
  model text,
  nominal_capacity text NOT NULL,
  accuracy_class text,
  last_verified_at date,
  next_renewal_at date,
  status text NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (status IN ('PENDING_VERIFICATION','VERIFIED','EXPIRED','REJECTED')),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number text UNIQUE NOT NULL,
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  application_type text NOT NULL CHECK (application_type IN ('NEW_VERIFICATION','RE_VERIFICATION')),
  assigned_officer_id uuid REFERENCES officers(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','SCHEDULED','INSPECTION','APPROVED','REJECTED','CERTIFICATE_ISSUED')),
  submitted_at timestamptz,
  scheduled_date date,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  officer_id uuid NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  inspection_date date NOT NULL,
  nominal_value numeric(12,3) NOT NULL,
  observed_value numeric(12,3) NOT NULL,
  error_value numeric(12,3) NOT NULL,
  mpe_allowed numeric(12,3) NOT NULL,
  result text NOT NULL CHECK (result IN ('PASSED','FAILED')),
  remarks text,
  photo_urls text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number text UNIQUE NOT NULL,
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  establishment_id uuid NOT NULL REFERENCES establishments(id) ON DELETE CASCADE,
  officer_id uuid NOT NULL REFERENCES officers(id) ON DELETE CASCADE,
  inspection_id uuid NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  issued_date date NOT NULL,
  valid_until date NOT NULL,
  hmac_signature text NOT NULL,
  qr_payload text NOT NULL,
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','EXPIRED','REVOKED')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Establishments: public read/write (demo, no auth)
DROP POLICY IF EXISTS "anon_read_establishments" ON establishments;
CREATE POLICY "anon_read_establishments" ON establishments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_establishments" ON establishments;
CREATE POLICY "anon_insert_establishments" ON establishments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_establishments" ON establishments;
CREATE POLICY "anon_update_establishments" ON establishments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_establishments" ON establishments;
CREATE POLICY "anon_delete_establishments" ON establishments FOR DELETE TO anon, authenticated USING (true);

-- Officers: public read/write
DROP POLICY IF EXISTS "anon_read_officers" ON officers;
CREATE POLICY "anon_read_officers" ON officers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_officers" ON officers;
CREATE POLICY "anon_insert_officers" ON officers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_officers" ON officers;
CREATE POLICY "anon_update_officers" ON officers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_officers" ON officers;
CREATE POLICY "anon_delete_officers" ON officers FOR DELETE TO anon, authenticated USING (true);

-- Devices: public read/write
DROP POLICY IF EXISTS "anon_read_devices" ON devices;
CREATE POLICY "anon_read_devices" ON devices FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_devices" ON devices;
CREATE POLICY "anon_insert_devices" ON devices FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_devices" ON devices;
CREATE POLICY "anon_update_devices" ON devices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_devices" ON devices;
CREATE POLICY "anon_delete_devices" ON devices FOR DELETE TO anon, authenticated USING (true);

-- Applications: public read/write
DROP POLICY IF EXISTS "anon_read_applications" ON applications;
CREATE POLICY "anon_read_applications" ON applications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_applications" ON applications;
CREATE POLICY "anon_insert_applications" ON applications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_applications" ON applications;
CREATE POLICY "anon_update_applications" ON applications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_applications" ON applications;
CREATE POLICY "anon_delete_applications" ON applications FOR DELETE TO anon, authenticated USING (true);

-- Inspections: public read/write
DROP POLICY IF EXISTS "anon_read_inspections" ON inspections;
CREATE POLICY "anon_read_inspections" ON inspections FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_inspections" ON inspections;
CREATE POLICY "anon_insert_inspections" ON inspections FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_inspections" ON inspections;
CREATE POLICY "anon_update_inspections" ON inspections FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_inspections" ON inspections;
CREATE POLICY "anon_delete_inspections" ON inspections FOR DELETE TO anon, authenticated USING (true);

-- Certificates: public read/write (verify page must read without auth)
DROP POLICY IF EXISTS "anon_read_certificates" ON certificates;
CREATE POLICY "anon_read_certificates" ON certificates FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_certificates" ON certificates;
CREATE POLICY "anon_insert_certificates" ON certificates FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_certificates" ON certificates;
CREATE POLICY "anon_update_certificates" ON certificates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_certificates" ON certificates;
CREATE POLICY "anon_delete_certificates" ON certificates FOR DELETE TO anon, authenticated USING (true);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_devices_establishment ON devices(establishment_id);
CREATE INDEX IF NOT EXISTS idx_applications_establishment ON applications(establishment_id);
CREATE INDEX IF NOT EXISTS idx_applications_device ON applications(device_id);
CREATE INDEX IF NOT EXISTS idx_applications_officer ON applications(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_inspections_application ON inspections(application_id);
CREATE INDEX IF NOT EXISTS idx_certificates_application ON certificates(application_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
