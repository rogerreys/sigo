
export interface User {
  id: string;
  email: string;
  role: 'Administrador' | 'Mecánico' | 'Cajero';
  name: string;
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

export enum WorkOrderStatus {
    Pending = 'Pendiente',
    InProgress = 'En Progreso',
    Completed = 'Completado',
    Billed = 'Facturado',
    Cancelled = 'Cancelado'
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  assignedTo: string; // userId
  status: WorkOrderStatus;
  description: string;
  services: Service[];
  items: WorkOrderItem[];
  createdAt: string;
  completedAt?: string;
  total?: number;
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
