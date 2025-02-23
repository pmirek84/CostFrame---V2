/*
  # Calendar Events Schema

  1. New Tables
    - `calendar_events`
      - `id` (uuid, primary key)
      - `created_by` (uuid, references auth.users)
      - `title` (text)
      - `type` (text)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `description` (text)
      - `location` (text)
      - `client` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `calendar_events` table
    - Add policies for authenticated users to manage their own events
*/

-- Create calendar_events table
CREATE TABLE calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('Oferta', 'Zlecenie', 'Spotkanie', 'Montaż', 'Inne')),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  description text,
  location text,
  client text,
  status text CHECK (status IN ('planned', 'in-progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own calendar events"
  ON calendar_events FOR SELECT
  USING (auth.uid() = created_by);

CREATE POLICY "Users can create calendar events"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own calendar events"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own calendar events"
  ON calendar_events FOR DELETE
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_calendar_events_created_by ON calendar_events(created_by);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(start_time);
CREATE INDEX idx_calendar_events_type ON calendar_events(type);
CREATE INDEX idx_calendar_events_status ON calendar_events(status);