-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS offers CASCADE;

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id),
  number text NOT NULL,
  client_id text NOT NULL,
  location text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'accepted', 'rejected')),
  detail_level text NOT NULL CHECK (detail_level IN ('detailed', 'summary')),
  materials_cost numeric NOT NULL DEFAULT 0,
  labor_cost numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  constructions jsonb NOT NULL DEFAULT '[]',
  documents jsonb NOT NULL DEFAULT '[]',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own offers" ON offers;
  DROP POLICY IF EXISTS "Users can create offers" ON offers;
  DROP POLICY IF EXISTS "Users can update their own offers" ON offers;
  DROP POLICY IF EXISTS "Users can delete their own offers" ON offers;

  -- Create new policies
  CREATE POLICY "Users can view their own offers"
    ON offers FOR SELECT
    USING (auth.uid() = created_by);

  CREATE POLICY "Users can create offers"
    ON offers FOR INSERT
    WITH CHECK (auth.uid() = created_by);

  CREATE POLICY "Users can update their own offers"
    ON offers FOR UPDATE
    USING (auth.uid() = created_by);

  CREATE POLICY "Users can delete their own offers"
    ON offers FOR DELETE
    USING (auth.uid() = created_by);
END $$;

-- Create indexes
CREATE INDEX idx_offers_created_by ON offers(created_by);
CREATE INDEX idx_offers_created_at ON offers(created_at);
CREATE INDEX idx_offers_number ON offers(number);
CREATE INDEX idx_offers_client_id ON offers(client_id);
CREATE INDEX idx_offers_status ON offers(status);