-- Habilitar la extensión UUID si no está habilitada
create extension if not exists "uuid-ossp" with schema extensions;

-- Crear un tipo enumerado para los estados de las órdenes de trabajo
create type work_order_status as enum ('pending', 'in_progress', 'completed', 'billed', 'cancelled');

-- Tabla de usuarios (extiende la tabla auth.users de Supabase)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  role text default 'user'::text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Habilitar RLS (Row Level Security) en la tabla profiles
alter table public.profiles enable row level security;

-- Crear políticas de seguridad para la tabla profiles
create policy "Los usuarios pueden ver su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Tabla de clientes
create table public.clients (
  id uuid default uuid_generate_v4() primary key,
  first_name text not null,
  last_name text not null,
  email text unique,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Habilitar RLS en la tabla clients
alter table public.clients enable row level security;

-- Crear políticas de seguridad para la tabla clients
create policy "Los usuarios pueden ver sus propios clientes"
  on public.clients for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar sus propios clientes"
  on public.clients for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propios clientes"
  on public.clients for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propios clientes"
  on public.clients for delete
  using (auth.uid() = user_id);

-- Tabla de productos/servicios
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  sku text unique,
  category text,
  price decimal(10, 2) not null,
  cost decimal(10, 2),
  stock_quantity integer default 0,
  min_stock_level integer default 5,
  is_service boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Habilitar RLS en la tabla products
alter table public.products enable row level security;

-- Crear políticas de seguridad para la tabla products
create policy "Los usuarios pueden ver sus propios productos"
  on public.products for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar sus propios productos"
  on public.products for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propios productos"
  on public.products for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propios productos"
  on public.products for delete
  using (auth.uid() = user_id);

-- Tabla de órdenes de trabajo
create table public.work_orders (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.clients(id) on delete cascade not null,
  vehicle_identification text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  odometer_reading integer,
  fuel_level text,
  status work_order_status default 'pending'::work_order_status,
  priority text default 'medium',
  problem_description text,
  diagnostic_notes text,
  total decimal(10, 2) default 0,
  tax_rate decimal(5, 2) default 0,
  tax_amount decimal(10, 2) default 0,
  discount_amount decimal(10, 2) default 0,
  grand_total decimal(10, 2) default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Habilitar RLS en la tabla work_orders
alter table public.work_orders enable row level security;

-- Crear políticas de seguridad para la tabla work_orders
create policy "Los usuarios pueden ver sus propias órdenes de trabajo"
  on public.work_orders for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar sus propias órdenes de trabajo"
  on public.work_orders for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar sus propias órdenes de trabajo"
  on public.work_orders for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar sus propias órdenes de trabajo"
  on public.work_orders for delete
  using (auth.uid() = user_id);

-- Tabla de ítems de órdenes de trabajo (productos/servicios asociados a una orden)
create table public.work_order_items (
  id uuid default uuid_generate_v4() primary key,
  work_order_id uuid references public.work_orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  description text,
  quantity decimal(10, 2) default 1,
  unit_price decimal(10, 2) not null,
  discount_percent decimal(5, 2) default 0,
  tax_percent decimal(5, 2) default 0,
  total_price decimal(10, 2) generated always as (quantity * unit_price * (1 - discount_percent/100)) stored,
  is_service boolean default false,
  created_at timestamp with time zone default now(),
  user_id uuid references auth.users(id) on delete cascade not null
);

-- Habilitar RLS en la tabla work_order_items
alter table public.work_order_items enable row level security;

-- Crear políticas de seguridad para la tabla work_order_items
create policy "Los usuarios pueden ver los ítems de sus propias órdenes"
  on public.work_order_items for select
  using (auth.uid() = user_id);

create policy "Los usuarios pueden insertar ítems en sus propias órdenes"
  on public.work_order_items for insert
  with check (auth.uid() = user_id);

create policy "Los usuarios pueden actualizar ítems en sus propias órdenes"
  on public.work_order_items for update
  using (auth.uid() = user_id);

create policy "Los usuarios pueden eliminar ítems de sus propias órdenes"
  on public.work_order_items for delete
  using (auth.uid() = user_id);

-- Función para actualizar automáticamente el campo updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Crear triggers para actualizar automáticamente los campos updated_at
create trigger update_profiles_updated_at
before update on public.profiles
for each row execute function update_updated_at_column();

create trigger update_clients_updated_at
before update on public.clients
for each row execute function update_updated_at_column();

create trigger update_products_updated_at
before update on public.products
for each row execute function update_updated_at_column();

create trigger update_work_orders_updated_at
before update on public.work_orders
for each row execute function update_updated_at_column();

-- Función para actualizar el total de una orden de trabajo
create or replace function update_work_order_total(work_order_uuid uuid)
returns void as $$
begin
  update public.work_orders wo
  set 
    total = subquery.subtotal,
    tax_amount = subquery.subtotal * (wo.tax_rate / 100),
    grand_total = subquery.subtotal * (1 + wo.tax_rate / 100) - wo.discount_amount
  from (
    select 
      sum(woi.total_price) as subtotal
    from 
      public.work_order_items woi
    where 
      woi.work_order_id = work_order_uuid
  ) as subquery
  where wo.id = work_order_uuid;
end;
$$ language plpgsql;

-- Trigger para actualizar el total de la orden cuando se actualiza un ítem
create or replace function update_work_order_on_item_change()
returns trigger as $$
begin
  if (tg_op = 'DELETE') then
    perform update_work_order_total(old.work_order_id);
    return old;
  else
    perform update_work_order_total(new.work_order_id);
    return new;
  end if;
end;
$$ language plpgsql;

create trigger update_work_order_on_item_change
after insert or update or delete on public.work_order_items
for each row execute function update_work_order_on_item_change();

-- Crear índices para mejorar el rendimiento de las consultas
create index idx_work_orders_client_id on public.work_orders(client_id);
create index idx_work_orders_status on public.work_orders(status);
create index idx_work_order_items_work_order_id on public.work_order_items(work_order_id);
create index idx_work_order_items_product_id on public.work_order_items(product_id);

-- Función para buscar clientes
create or replace function search_clients(search_term text, user_uuid uuid)
returns setof public.clients as $$
begin
  return query
  select *
  from public.clients c
  where 
    c.user_id = user_uuid
    and (
      c.first_name ilike '%' || search_term || '%'
      or c.last_name ilike '%' || search_term || '%'
      or c.email ilike '%' || search_term || '%'
      or c.phone ilike '%' || search_term || '%'
    );
end;
$$ language plpgsql security definer;

-- Función para buscar productos
create or replace function search_products(search_term text, user_uuid uuid)
returns setof public.products as $$
begin
  return query
  select *
  from public.products p
  where 
    p.user_id = user_uuid
    and (
      p.name ilike '%' || search_term || '%'
      or p.description ilike '%' || search_term || '%'
      or p.sku ilike '%' || search_term || '%'
    )
    and p.stock_quantity > 0;
end;
$$ language plpgsql security definer;


-- Con Role ---------------------------------

-- Crear tabla de roles
create table public.roles (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insertar roles por defecto
insert into public.roles (name, description) values 
  ('admin', 'Administrador del sistema con acceso total'),
  ('manager', 'Gerente con acceso a todas las operaciones excepto configuración del sistema'),
  ('staff', 'Personal con acceso limitado a funciones básicas');

-- Agregar columna role_id a la tabla profiles
alter table public.profiles 
  add column role_id uuid references public.roles(id) on delete set null;

-- Crear índice para mejorar el rendimiento de búsquedas por rol
create index idx_profiles_role_id on public.profiles(role_id);

-- Actualizar la función de búsqueda de perfiles para incluir el rol
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role_id)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    -- Asignar rol de 'staff' por defecto a los nuevos usuarios
    (select id from public.roles where name = 'staff' limit 1)
  );
  return new;
end;
$$ language plpgsql security definer;
