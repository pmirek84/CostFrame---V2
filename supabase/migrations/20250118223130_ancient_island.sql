-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own constructions" ON constructions;
DROP POLICY IF EXISTS "Users can create constructions" ON constructions;
DROP POLICY IF EXISTS "Users can update their own constructions" ON constructions;
DROP POLICY IF EXISTS "Users can delete their own constructions" ON constructions;

-- Add created_by column to existing table
ALTER TABLE constructions 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

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

-- Create index for created_by column
CREATE INDEX IF NOT EXISTS idx_constructions_created_by ON constructions(created_by);