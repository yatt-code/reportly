-- Create user_stats table for tracking XP and levels
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security (RLS) policies
-- Enable RLS on the table
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own stats
CREATE POLICY "Users can view their own stats"
  ON user_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to update their own stats
CREATE POLICY "Users can update their own stats"
  ON user_stats
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Restrict INSERT operations to service role only (backend-only)
-- This policy will be empty, effectively blocking all inserts through normal client
CREATE POLICY "Only backend can insert stats"
  ON user_stats
  FOR INSERT
  WITH CHECK (false);

-- Note: The service role client bypasses RLS and can perform all operations
