# SIGO - Sistema Integrado de Gestión de Operaciones

Sistema de gestión integral para talleres automotrices que permite administrar inventario, clientes, órdenes de trabajo y más.

## 🚀 Características

- Gestión de inventario de repuestos y productos
- Administración de clientes y vehículos
- Generación de órdenes de trabajo
- Dashboard con métricas y estadísticas
- Generación de reportes en PDF
- Autenticación y control de acceso basado en roles
- Interfaz responsiva y moderna

## 🛠️ Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior) o yarn
- Cuenta en Supabase

## 🚀 Configuración del Entorno

1. Clonar el repositorio
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd app
   ```

2. Instalar dependencias
   ```bash
   npm install
   ```

3. Configurar variables de entorno
   Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. Ejecutar migraciones de base de datos
   ```bash
   npx supabase db push
   ```

## 🚦 Comandos Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la versión de producción localmente

## 🏗️ Estructura del Proyecto

```
app/
├── components/       # Componentes reutilizables
│   ├── common/      # Componentes comunes
│   └── layout/      # Componentes de diseño
├── contexts/        # Contextos de React
├── hooks/           # Custom hooks
├── pages/           # Páginas de la aplicación
├── services/        # Servicios y APIs
├── types/           # Definiciones de TypeScript
└── utils/           # Utilidades y helpers
```

## 🔒 Autenticación

El sistema utiliza Supabase Auth para la autenticación de usuarios. Los roles disponibles son:
- Administrador: Acceso completo al sistema
- Técnico: Puede crear y gestionar órdenes de trabajo
- Vendedor: Puede gestionar inventario y ventas

## 📦 Dependencias Principales

- React 19
- TypeScript
- Supabase
- React Router DOM
- Recharts (gráficos)
- jsPDF (generación de PDFs)
- SweetAlert2 (notificaciones)

## 📄 Generación de Tipos de Supabase

Para actualizar los tipos de TypeScript basados en tu esquema de Supabase:

```bash
npx supabase gen types typescript --project-id tu_project_id > types/supabase.ts
```

## 🚀 Despliegue

### Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en la configuración del proyecto
3. El despliegue se realizará automáticamente con cada push a la rama principal

### Variables de entorno requeridas

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📝 Notas de Migración

- Las migraciones se encuentran en el directorio `migrations/`
- El trigger `profile_groups` se ejecuta automáticamente después de crear un nuevo grupo

## 📄 Licencia

[Incluir tipo de licencia si es necesario]

---

Desarrollado por [Tu Empresa] - 2024