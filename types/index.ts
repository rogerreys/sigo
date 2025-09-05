export interface User {
  id: string;
  email: string;
  role: "Administrador" | "Mecánico" | "Cajero";
  name: string;
}

export interface Group {
  id: string;
  name: string;
  description: string | null;
  image_url?: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
}
/*
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}*/
export interface Client {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  group_id: string;
}
/* Se comento por no estar completo
export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  barcode?: string;
}*/

export interface Product {
  id?: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock_quantity: number;
  min_stock_level: number;
  is_service: boolean;
  group_id?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceItem {
  id?: string;
  work_order_id?: string;
  service_description: string;
  service_price: number;
}

export interface ProductItem {
  id?: string;
  work_order_id?: string;
  product_id?: string;
  product_quantity?: number;
  product_unit_price?: number;
  product_name?: string;
}

export interface WorkOrderItems {
  id?: string;
  product_id?: string | null;
  user_id?: string;
  group_id?: string;
  work_order_id?: string;
  product_quantity?: number | null;
  product_unit_price?: number | null;
  service_price?: number | null;
  service_description?: string | null;
}
export interface WorkOrders {
  id?: string;
  client_id: string;
  profile_id: string;
  grand_total: number;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
  user_id?: string;
  group_id?: string;
  work_order_items_id?: string;
  vehicle_year: number;
  odometer_reading: number;
  status: WorkOrderStatus;
  total: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount?: number;
  vehicle_identification?: string;
  vehicle_make: string;
  vehicle_model: string;
  priority?: string;
  problem_description: string;
  fuel_level: string;
  diagnostic_notes: string;
}

export interface Profiles {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
  role_id: string | null;
  user_id: string | null;
  phone: string | null;
  group_id?: string | null;
}

export enum WorkOrderStatus {
  Pending = "pending",
  InProgress = "in_progress",
  Completed = "completed",
  Billed = "billed",
  Cancelled = "cancelled",
}
export enum WorkOrderStatusFront {
  pending = "Pendiente",
  in_progress = "En Proceso",
  completed = "Completado",
  billed = "Facturado",
  cancelled = "Cancelado",
}
export enum RoleService {
  administrador = "Administrador",
  gerente = "Gerente",
  personal = "Personal",
}
export interface ProfileGroup {
  id: string;
  profile_id: string;
  group_id: string;
  is_admin?: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}
export interface Configurations {
  id: number;
  group_id: string;
  option_name: string;
  option_value: string;
  description: string;
  data_type: string;
  created_at: string;
  updated_at: string;
}