/*
  # Installation Standards Schema

  1. New Tables
    - `installation_standards`
      - Standard definitions (e.g., "Warm Installation", "Standard Installation")
    - `installation_materials`
      - Material requirements for each standard
    - `installation_labor`
      - Labor requirements for each standard
    - `installation_methods`
      - Recommended installation methods
    - `construction_standards`
      - Links construction types to applicable standards

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Installation Standards
CREATE TABLE IF NOT EXISTS installation_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  is_predefined boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Installation Materials
CREATE TABLE IF NOT EXISTS installation_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id uuid REFERENCES installation_standards(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity_per_meter numeric(10,2) NOT NULL,
  unit text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Installation Labor
CREATE TABLE IF NOT EXISTS installation_labor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id uuid REFERENCES installation_standards(id) ON DELETE CASCADE,
  hours_per_unit numeric(10,2) NOT NULL,
  hourly_rate numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Installation Methods
CREATE TABLE IF NOT EXISTS installation_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id uuid REFERENCES installation_standards(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Construction Standards
CREATE TABLE IF NOT EXISTS construction_standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_id uuid REFERENCES installation_standards(id) ON DELETE CASCADE,
  construction_type text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE installation_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_labor ENABLE ROW LEVEL SECURITY;
ALTER TABLE installation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE construction_standards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all installation standards"
  ON installation_standards FOR SELECT
  USING (true);

CREATE POLICY "Users can create installation standards"
  ON installation_standards FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own installation standards"
  ON installation_standards FOR UPDATE
  USING (auth.uid() = created_by AND NOT is_predefined);

-- Similar policies for other tables
CREATE POLICY "Users can view all installation materials"
  ON installation_materials FOR SELECT
  USING (true);

CREATE POLICY "Users can manage installation materials"
  ON installation_materials FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all installation labor"
  ON installation_labor FOR SELECT
  USING (true);

CREATE POLICY "Users can manage installation labor"
  ON installation_labor FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all installation methods"
  ON installation_methods FOR SELECT
  USING (true);

CREATE POLICY "Users can manage installation methods"
  ON installation_methods FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view all construction standards"
  ON construction_standards FOR SELECT
  USING (true);

CREATE POLICY "Users can manage construction standards"
  ON construction_standards FOR ALL
  USING (auth.role() = 'authenticated');

-- Insert predefined standards
DO $$ 
BEGIN
  -- Warm Installation
  INSERT INTO installation_standards (name, description, is_predefined)
  VALUES (
    'Warm Installation',
    'Enhanced thermal insulation installation method suitable for energy-efficient buildings',
    true
  );

  -- Standard Installation
  INSERT INTO installation_standards (name, description, is_predefined)
  VALUES (
    'Standard Installation',
    'Basic installation method suitable for most construction types',
    true
  );

  -- In Insulation Layer
  INSERT INTO installation_standards (name, description, is_predefined)
  VALUES (
    'In Insulation Layer',
    'Installation method optimized for buildings with external insulation systems',
    true
  );
END $$;