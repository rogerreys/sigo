-- Create groups table
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add group_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL;

-- Create RLS policies for groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own groups
CREATE POLICY "Users can view their own groups" 
ON public.groups
FOR SELECT 
USING (auth.uid() = created_by);

-- Allow admins to do anything with groups
CREATE POLICY "Admins can do everything with groups"
ON public.groups
FOR ALL
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() 
  AND p.role = 'admin'
));

-- Update profiles table to include group permissions
CREATE POLICY "Users can view profiles in their group"
ON public.profiles
FOR SELECT
USING (
  group_id IN (
    SELECT group_id FROM profiles WHERE id = auth.uid()
  )
  OR 
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.id = auth.uid() 
    AND p.role = 'admin'
  )
);

-- LOAD IMG AVATAR BUCKET
-- Con valor por defecto
ALTER TABLE groups 
ADD COLUMN image_url TEXT DEFAULT NULL;
-- Opcional: Agregar un comentario descriptivo a la columna
COMMENT ON COLUMN groups.image_url IS 'URL de la imagen/avatar del grupo';
