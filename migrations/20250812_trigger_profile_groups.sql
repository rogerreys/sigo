-- Primero, creamos la función que se ejecutará con el trigger
CREATE OR REPLACE FUNCTION public.after_group_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insertar en profile_groups cuando se crea un nuevo grupo
    -- Usamos auth.uid() para obtener el ID del usuario autenticado que creó el grupo
    INSERT INTO public.profile_groups (
        profile_id,
        group_id,
        is_admin,
        created_at,
        updated_at
    ) VALUES (
        auth.uid(),  -- ID del usuario autenticado
        NEW.id,      -- ID del grupo recién creado
        TRUE,        -- Es administrador
        NOW(),       -- Marca de tiempo de creación
        NOW()        -- Marca de tiempo de actualización
    )
    ON CONFLICT (profile_id, group_id) 
    DO UPDATE SET 
        is_admin = TRUE,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$;

-- Creamos el trigger que se activa después de insertar en la tabla groups
CREATE OR REPLACE TRIGGER after_group_created_trigger
AFTER INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.after_group_created();

-- Otorgar permisos necesarios
GRANT EXECUTE ON FUNCTION public.after_group_created() TO authenticated;
GRANT EXECUTE ON FUNCTION public.after_group_created() TO service_role;