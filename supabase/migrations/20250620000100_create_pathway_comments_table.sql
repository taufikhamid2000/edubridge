-- Create the pathway_comments table
CREATE TABLE IF NOT EXISTS public.pathway_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id VARCHAR NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  author_name VARCHAR NOT NULL,
  comment TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.pathway_comments ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read comments
CREATE POLICY "Anyone can read pathway comments" 
  ON public.pathway_comments
  FOR SELECT USING (true);

-- Policy to allow authenticated users to create comments
CREATE POLICY "Authenticated users can create pathway comments" 
  ON public.pathway_comments
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Policy to allow users to update their own comments
CREATE POLICY "Users can update their own pathway comments" 
  ON public.pathway_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Policy to allow users to delete their own comments
CREATE POLICY "Users can delete their own pathway comments" 
  ON public.pathway_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_pathway_comments_pathway_id ON public.pathway_comments(pathway_id);
CREATE INDEX IF NOT EXISTS idx_pathway_comments_user_id ON public.pathway_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_pathway_comments_created_at ON public.pathway_comments(created_at);

-- Add function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update the updated_at timestamp
CREATE TRIGGER update_pathway_comments_updated_at
  BEFORE UPDATE ON public.pathway_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
