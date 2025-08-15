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
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  stock: number;
  minStock: number;
  barcode?: string;
}

export interface Service {
  id: string;
  description: string;
  price: number;
}

export interface WorkOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
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
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  role_id: number;
  user_id: number;
  group_id: number;
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