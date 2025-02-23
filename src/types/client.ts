export interface Client {
  id: string;
  created_by: string;
  type: 'company' | 'individual';
  name: string;
  status: 'active' | 'potential' | 'inactive';
  // Address
  address?: string | null;
  postal_code?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  website?: string | null;
  // Billing address
  billing_address?: string | null;
  billing_postal_code?: string | null;
  billing_city?: string | null;
  // Company data
  nip?: string | null;
  regon?: string | null;
  // Contact person
  contact_person?: string | null;
  contact_position?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  created_at: string;
  updated_at: string;
}