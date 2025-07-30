
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
