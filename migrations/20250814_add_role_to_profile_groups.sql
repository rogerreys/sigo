-- Add role column to profile_groups table
ALTER TABLE public.profile_groups 
ADD COLUMN role TEXT 
CHECK (
  role = 'Administrador' OR 
  role = 'Gerente' OR 
  role = 'Personal'
) 
DEFAULT 'Personal';

-- Add a comment to document the column
COMMENT ON COLUMN public.profile_groups.role IS 'Rol del usuario en el grupo, basado en el enum RoleService';

-- Update existing rows to have a default role
UPDATE public.profile_groups 
SET role = 'Personal' 
WHERE role IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE public.profile_groups ALTER COLUMN role SET NOT NULL;
