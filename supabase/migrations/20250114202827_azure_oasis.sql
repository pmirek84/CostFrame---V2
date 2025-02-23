/*
  # Initial schema setup for CostFRAME

  1. New Tables
    - clients (client information)
    - orders (order management)
    - offers (quotes and proposals)
    - tasks (scheduled activities)
    - documents (file attachments)
    - pricing_rates (service pricing)
    - materials_costs (material costs)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add created_by column for ownership
    
  3. Indexes
    - Add indexes for foreign keys and frequently queried columns
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('company', 'individual')),
  name text NOT NULL,
  address text,
  phone text,
  email text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES auth.users(id),
  client_id uuid REFERENCES clients(id),
  name text NOT NULL,
  construction_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  cost decimal(10,2) NOT NULL DEFAULT 0,
  completion_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES auth.users(id),
  client_id uuid REFERENCES clients(id),
  value decimal(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES auth.users(id),
  client_id uuid REFERENCES clients(id),
  type text NOT NULL CHECK (type IN ('phone', 'meeting', 'installation', 'other')),
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')),
  scheduled_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES auth.users(id),
  client_id uuid REFERENCES clients(id),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('invoice', 'photo', 'contract', 'other')),
  file_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Pricing rates table
CREATE TABLE IF NOT EXISTS pricing_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES auth.users(id),
  service_name text NOT NULL,
  unit text NOT NULL,
  price_per_unit decimal(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Materials costs table
CREATE TABLE IF NOT EXISTS materials_costs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by uuid REFERENCES auth.users(id),
  name text NOT NULL,
  category text NOT NULL,
  unit text NOT NULL,
  price_per_unit decimal(10,2) NOT NULL,
  supplier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials_costs ENABLE ROW LEVEL SECURITY;

-- Create policies for clients
CREATE POLICY "Users can view their own clients" 
  ON clients FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create clients" 
  ON clients FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own clients" 
  ON clients FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create policies for orders
CREATE POLICY "Users can view their own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create orders" 
  ON orders FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own orders" 
  ON orders FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create policies for offers
CREATE POLICY "Users can view their own offers" 
  ON offers FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create offers" 
  ON offers FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own offers" 
  ON offers FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks" 
  ON tasks FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create tasks" 
  ON tasks FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own tasks" 
  ON tasks FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create policies for documents
CREATE POLICY "Users can view their own documents" 
  ON documents FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create documents" 
  ON documents FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own documents" 
  ON documents FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create policies for pricing rates
CREATE POLICY "Users can view their own pricing rates" 
  ON pricing_rates FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create pricing rates" 
  ON pricing_rates FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own pricing rates" 
  ON pricing_rates FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create policies for materials costs
CREATE POLICY "Users can view their own materials costs" 
  ON materials_costs FOR SELECT 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create materials costs" 
  ON materials_costs FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own materials costs" 
  ON materials_costs FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_created_by ON clients(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_offers_client_id ON offers(client_id);
CREATE INDEX IF NOT EXISTS idx_offers_created_by ON offers(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_client_id ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_by ON documents(created_by);
CREATE INDEX IF NOT EXISTS idx_pricing_rates_created_by ON pricing_rates(created_by);
CREATE INDEX IF NOT EXISTS idx_materials_costs_created_by ON materials_costs(created_by);