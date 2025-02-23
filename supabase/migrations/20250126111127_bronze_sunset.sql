-- Add priority column to calendar_events table
ALTER TABLE calendar_events
ADD COLUMN IF NOT EXISTS priority text CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal';

-- Create index for priority
CREATE INDEX IF NOT EXISTS idx_calendar_events_priority ON calendar_events(priority);