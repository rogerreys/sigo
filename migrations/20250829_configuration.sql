-- Crear tabla de configurations
CREATE TABLE configurations (
    id SERIAL PRIMARY KEY,
    option_name VARCHAR(255) NOT NULL,
    option_value TEXT,
    description TEXT,
    data_type VARCHAR(50) DEFAULT 'string',
    group_id uuid,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Clave foránea hacia la tabla groups
    CONSTRAINT fk_configurations_group_id 
        FOREIGN KEY (group_id) 
        REFERENCES groups(id) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

-- Crear índice para búsquedas rápidas por nombre de opción
CREATE INDEX idx_configurations_option_name ON configurations(option_name);
CREATE INDEX idx_configurations_group_id ON configurations(group_id);

-- Crear función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_configurations_updated_at
    BEFORE UPDATE ON configurations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ejemplos de inserción de datos
INSERT INTO configurations (option_name, option_value, description, data_type, group_id) VALUES
('iva_value', '15', 'Valor del iva del país', 'integer', '2bb0c0e7-2062-42c9-a0bc-2cf2a4d56cdd'),
('enable_notifications', 'false', 'Habilitar notificaciones', 'boolean', '2bb0c0e7-2062-42c9-a0bc-2cf2a4d56cdd');

-- Consultas útiles
-- Obtener todas las configurations
-- SELECT * FROM configurations ORDER BY option_name;

-- Obtener una configuración específica
-- SELECT option_value FROM configurations WHERE option_name = 'site_title';

-- Actualizar una configuración
-- UPDATE configurations SET option_value = 'Nuevo Valor' WHERE option_name = 'site_title';

-- Insertar o actualizar una configuración (UPSERT)
-- INSERT INTO configurations (option_name, option_value, description, data_type)
-- VALUES ('nueva_config', 'valor', 'descripción', 'string')
-- ON CONFLICT (option_name) 
-- DO UPDATE SET 
--     option_value = EXCLUDED.option_value,
--     description = EXCLUDED.description,
--     data_type = EXCLUDED.data_type,
--     updated_at = CURRENT_TIMESTAMP;


-- TRIGGER
-- Crear función que se ejecutará cuando se inserte un nuevo grupo
CREATE OR REPLACE FUNCTION insert_default_configurations()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar configuración de IVA
    INSERT INTO configurations (
        option_name, 
        option_value, 
        description, 
        data_type, 
        group_id,
        created_at,
        updated_at
    ) VALUES (
        'iva_value',
        '15',
        'Valor del iva del país',
        'integer',
        NEW.id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    -- Insertar configuración de notificaciones
    INSERT INTO configurations (
        option_name, 
        option_value, 
        description, 
        data_type, 
        group_id,
        created_at,
        updated_at
    ) VALUES (
        'enable_notifications',
        'false',
        'Habilitar notificaciones',
        'boolean',
        NEW.id,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    -- Retornar el registro NEW para que el INSERT original continúe
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger que se ejecuta DESPUÉS de insertar en groups
CREATE TRIGGER trigger_insert_default_configurations
    AFTER INSERT ON groups
    FOR EACH ROW
    EXECUTE FUNCTION insert_default_configurations();

-- Ejemplo de uso: insertar un nuevo grupo
-- INSERT INTO groups (name, description, created_by) 
-- VALUES ('Ventas', 'Configuraciones del módulo de ventas', 'admin');

-- Verificar que se crearon las configuraciones automáticamente
-- SELECT g.name as group_name, c.option_name, c.option_value, c.description 
-- FROM groups g 
-- INNER JOIN configurations c ON g.id = c.group_id 
-- ORDER BY g.name, c.option_name;