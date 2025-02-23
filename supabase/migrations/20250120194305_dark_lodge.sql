-- Drop existing table if exists
DROP TABLE IF EXISTS constructions CASCADE;

-- Create constructions table with snake_case column names
CREATE TABLE IF NOT EXISTS constructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id),
  number integer NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  width numeric NOT NULL,
  height numeric NOT NULL,
  quantity integer NOT NULL,
  area numeric NOT NULL,
  total_area numeric NOT NULL,
  perimeter numeric NOT NULL,
  total_perimeter numeric NOT NULL,
  installation_location text NOT NULL,
  weight numeric NOT NULL,
  material_costs jsonb NOT NULL,
  installation_costs jsonb NOT NULL,
  total_cost numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE constructions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own constructions"
  ON constructions FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create constructions"
  ON constructions FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own constructions"
  ON constructions FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own constructions"
  ON constructions FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_constructions_created_by ON constructions(created_by);
CREATE INDEX idx_constructions_created_at ON constructions(created_at);
CREATE INDEX idx_constructions_number ON constructions(number);