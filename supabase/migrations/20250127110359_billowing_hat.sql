-- First, modify offers table to remove dependency
ALTER TABLE IF EXISTS offers
  DROP CONSTRAINT IF EXISTS offers_client_id_fkey;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can create clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_clients_created_by;
DROP INDEX IF EXISTS idx_clients_name;
DROP INDEX IF EXISTS idx_clients_status;

-- Drop existing table if exists
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table with all required fields
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('company', 'individual')),
  name text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'potential', 'inactive')),
  address text,
  phone text,
  email text,
  notes text,
  website text,
  -- Dane firmowe
  nip text,
  regon text,
  -- Osoba kontaktowa
  contact_person text,
  contact_position text,
  contact_phone text,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create clients"
  ON clients FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_clients_created_by ON clients(created_by);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_status ON clients(status);