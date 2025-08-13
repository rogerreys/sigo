-- Crear la tabla de relación profile_groups
CREATE TABLE public.profile_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    profile_id UUID NOT NULL,
    group_id UUID NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones de clave foránea
    CONSTRAINT fk_profile
        FOREIGN KEY (profile_id)
        REFERENCES public.profiles(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_group
        FOREIGN KEY (group_id)
        REFERENCES public.groups(id)
        ON DELETE CASCADE,
    
    -- Restricción para evitar duplicados
    CONSTRAINT unique_profile_group
        UNIQUE (profile_id, group_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_profile_groups_profile_id ON public.profile_groups(profile_id);
CREATE INDEX idx_profile_groups_group_id ON public.profile_groups(group_id);

-- Crear un disparador para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_groups_updated_at
BEFORE UPDATE ON public.profile_groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();