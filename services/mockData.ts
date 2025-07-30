
import { User, Client, Product, WorkOrder, WorkOrderStatus, Service } from '../types';

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Admin User', email: 'admin@sigvs.com', role: 'Administrador' },
  { id: 'user-2', name: 'Juan Perez', email: 'juan.perez@sigvs.com', role: 'Mecánico' },
  { id: 'user-3', name: 'Maria Garcia', email: 'maria.garcia@sigvs.com', role: 'Cajero' },
];

export const mockClients: Client[] = [
  { id: 'client-1', name: 'Empresa ABC', email: 'contacto@empresaabc.com', phone: '555-1234', address: 'Calle Falsa 123', createdAt: new Date().toISOString() },
  { id: 'client-2', name: 'Comercial XYZ', email: 'info@comercialxyz.com', phone: '555-5678', address: 'Av. Siempre Viva 742', createdAt: new Date().toISOString() },
  { id: 'client-3', name: 'Juan Consumidor Final', email: 'juan.cf@email.com', phone: '555-9999', address: 'Su Casa', createdAt: new Date().toISOString() },
];

export const mockProducts: Product[] = [
  { id: 'prod-1', name: 'Filtro de Aceite', brand: 'Bosch', description: 'Filtro de aceite para motor 1.6L', price: 15.50, stock: 50, minStock: 10, barcode: '7891023456789' },
  { id: 'prod-2', name: 'Pastillas de Freno Delanteras', brand: 'Brembo', description: 'Juego de pastillas de freno cerámicas', price: 75.00, stock: 8, minStock: 5, barcode: '7891023456790' },
  { id: 'prod-3', name: 'Aceite Sintético 5W-30 (1L)', brand: 'Mobil', description: 'Aceite sintético para motor', price: 22.00, stock: 100, minStock: 20, barcode: '7891023456791' },
  { id: 'prod-4', name: 'Bujía de Iridio', brand: 'NGK', description: 'Bujía de alto rendimiento', price: 12.00, stock: 150, minStock: 30, barcode: '7891023456792' },
];

const mockServices: Service[] = [
    { id: 'serv-1', description: 'Cambio de aceite y filtro', price: 50.00 },
    { id: 'serv-2', description: 'Diagnóstico con scanner', price: 40.00 },
];

export const mockWorkOrders: WorkOrder[] = [
  { 
    id: 'wo-1', 
    orderNumber: 'OT-2024-001', 
    clientId: 'client-1', 
    assignedTo: 'user-2', 
    status: WorkOrderStatus.Completed, 
    description: 'Mantenimiento preventivo de flota de vehículos.',
    services: [mockServices[0]],
    items: [{ productId: 'prod-1', quantity: 5, unitPrice: 15.50 }, { productId: 'prod-3', quantity: 25, unitPrice: 22.00 }],
    createdAt: new Date(2024, 6, 10).toISOString(),
    completedAt: new Date(2024, 6, 12).toISOString(),
    total: 627.50
  },
  { 
    id: 'wo-2', 
    orderNumber: 'OT-2024-002', 
    clientId: 'client-3', 
    assignedTo: 'user-2', 
    status: WorkOrderStatus.InProgress, 
    description: 'Revisión de frenos y cambio de pastillas.',
    services: [mockServices[1]],
    items: [{ productId: 'prod-2', quantity: 1, unitPrice: 75.00 }],
    createdAt: new Date(2024, 6, 15).toISOString(),
    total: 115.00
  },
  { 
    id: 'wo-3', 
    orderNumber: 'OT-2024-003', 
    clientId: 'client-2', 
    assignedTo: 'user-2', 
    status: WorkOrderStatus.Pending, 
    description: 'Diagnóstico de falla de motor.',
    services: [],
    items: [],
    createdAt: new Date().toISOString(),
    total: 0
  },
];
