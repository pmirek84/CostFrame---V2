export interface Client {
  id: string;
  created_by: string;
  type: 'company' | 'individual';
  name: string;
  status: 'active' | 'potential' | 'inactive';
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}