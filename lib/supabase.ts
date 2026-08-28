import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables are missing. Database features will not work.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export type Establishment = {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  state: string;
  district: string;
  license_number: string;
  gstin: string | null;
  created_at: string;
};

export type Officer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: 'LMO' | 'GATC_OFFICER' | 'STATE_ADMIN';
  employee_id: string;
  region: string;
  state: string;
  created_at: string;
};

export type Device = {
  id: string;
  establishment_id: string;
  device_type: string;
  serial_number: string;
  manufacturer: string;
  model: string | null;
  nominal_capacity: string;
  accuracy_class: string | null;
  last_verified_at: string | null;
  next_renewal_at: string | null;
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'EXPIRED' | 'REJECTED';
  created_at: string;
};

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SCHEDULED'
  | 'INSPECTION'
  | 'APPROVED'
  | 'REJECTED'
  | 'CERTIFICATE_ISSUED';

export type Application = {
  id: string;
  application_number: string;
  establishment_id: string;
  device_id: string;
  application_type: 'NEW_VERIFICATION' | 'RE_VERIFICATION';
  assigned_officer_id: string | null;
  status: ApplicationStatus;
  submitted_at: string | null;
  scheduled_date: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Inspection = {
  id: string;
  application_id: string;
  officer_id: string;
  inspection_date: string;
  nominal_value: number;
  observed_value: number;
  error_value: number;
  mpe_allowed: number;
  result: 'PASSED' | 'FAILED';
  remarks: string | null;
  photo_urls: string[];
  created_at: string;
};

export type Certificate = {
  id: string;
  certificate_number: string;
  application_id: string;
  device_id: string;
  establishment_id: string;
  officer_id: string;
  inspection_id: string;
  issued_date: string;
  valid_until: string;
  hmac_signature: string;
  qr_payload: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  created_at: string;
};

export type ApplicationWithRelations = Application & {
  establishments: Establishment | null;
  devices: Device | null;
  officers: Officer | null;
  inspections: Inspection | null;
  certificates: Certificate | null;
};

export type CertificateWithRelations = Certificate & {
  establishments: Establishment | null;
  devices: Device | null;
  officers: Officer | null;
  inspections: Inspection | null;
  applications: Application | null;
};
