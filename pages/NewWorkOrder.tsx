
import React, { useState, useEffect, useMemo } from 'react';
import { Form, useNavigate } from 'react-router-dom';
import { Client, Product, Profiles, Service, WorkOrderItem } from '../types';
import Button from '../components/common/Button';
import { XCircleIcon } from '../utils/icons';
import { clientService, productService, userService, workOrderItemService, workOrderService } from '../services/supabase';
import { WorkOrderStatus, WorkOrders, WorkOrderItems } from '../types';
import { useGroup } from '../components/common/GroupContext';
import GroupGuard from '../components/common/GroupGuard';

// A small helper component for form rows
const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);

const NewWorkOrder: React.FC = () => {
    const navigate = useNavigate();

    // Data from DB
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<Profiles[]>([]);

    // Loading states
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [vehicleYear, setVehicleYear] = useState<string>('');
    const [vehicleMake, setVehicleMake] = useState<string>('');
    const [vehicleModel, setVehicleModel] = useState<string>('');
    const [vehicleMileage, setVehicleMileage] = useState<string>('');
    const [problemDescription, setProblemDescription] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [fuelLevel, setFuelLevel] = useState('');
    const [assignedToId, setAssignedToId] = useState<string>('');
    const [addedServices, setAddedServices] = useState<Service[]>([]);
    const [addedItems, setAddedItems] = useState<(WorkOrderItem & { productName: string })[]>([]);

    // State for adding new items/services
    const [newServiceDesc, setNewServiceDesc] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);

    const { selectedGroup } = useGroup();
    useEffect(() => {
        fetchData();
    }, [selectedGroup]);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            if (!selectedGroup) return;
            const [clientsRes, productsRes, usersRes] = await Promise.all([
                clientService.getAll(selectedGroup.id),
                productService.getAll(selectedGroup.id),
                userService.getAll(selectedGroup.id),
            ]);

            if (clientsRes.data) setClients(clientsRes.data as Client[]);
            if (productsRes.data) setProducts(productsRes.data as Product[]);
            if (usersRes.data) {
                const mechanics = (usersRes.data as Profiles[]).filter((u: Profiles) => u.role === 'staff');
                setUsers(mechanics as Profiles[]);
                if (mechanics.length > 0) setAssignedToId(mechanics[0].id.toString());
            }

        } catch (error) {
            console.error("Error fetching data for new work order:", error);
        } finally {
            setLoadingData(false);
        }
    };
    const handleAddService = (e: React.FormEvent) => {
        e.preventDefault();
        if (newServiceDesc && newServicePrice) {
            const price = parseFloat(newServicePrice);
            if (!isNaN(price)) {
                setAddedServices([...addedServices, {
                    id: `service-${Date.now()}`,
                    description: newServiceDesc,
                    price: price
                }]);
                setNewServiceDesc('');
                setNewServicePrice('');
            }
        }
    };

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        const product = products.find(p => p.id === selectedProductId);
        if (product && selectedProductQuantity > 0) {
            const existingItemIndex = addedItems.findIndex(item => item.productId === product.id);
            if (existingItemIndex > -1) {
                const updatedItems = [...addedItems];
                updatedItems[existingItemIndex].quantity += selectedProductQuantity;
                setAddedItems(updatedItems);
            } else {
                setAddedItems([...addedItems, {
                    productId: product.id,
                    quantity: selectedProductQuantity,
                    unitPrice: product.price,
                    productName: product.name,
                }]);
            }
            setSelectedProductId('');
            setSelectedProductQuantity(1);
        }
    };

    const handleRemoveService = (id: string) => {
        setAddedServices(addedServices.filter(s => s.id !== id));
    };

    const handleRemoveItem = (productId: string) => {
        setAddedItems(addedItems.filter((i: WorkOrderItem) => i.productId !== productId));
    };

    const handleAssignToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        console.log("e.target.value: ", e.target.value);
        setAssignedToId(e.target.value);
    };

    const quoteTotals = useMemo(() => {
        const servicesTotal = addedServices.reduce((acc, service) => acc + service.price, 0);
        const itemsTotal = addedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        const subtotal = servicesTotal + itemsTotal;
        const taxRate = 0.15; // Example 15% tax
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        return { servicesTotal, itemsTotal, subtotal, tax, total, taxRate };
    }, [addedServices, addedItems]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedClientId) {
            alert('Por favor, seleccione un cliente.');
            return;
        }
        if (addedServices.length === 0 && addedItems.length === 0) {
            alert('Por favor, añada al menos un servicio o repuesto.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 2. Create the work order data with proper types
            const newWorkOrderData: WorkOrders = {
                client_id: selectedClientId,
                profile_id: assignedToId,
                vehicle_year: vehicleYear ? parseInt(vehicleYear, 10) : 0,
                odometer_reading: Number(vehicleMileage) || 0,
                vehicle_make: vehicleMake || '',
                status: WorkOrderStatus.Pending || 'pending',
                vehicle_model: vehicleModel || '',
                fuel_level: fuelLevel || '',
                problem_description: problemDescription || '',
                diagnostic_notes: diagnosis || '',
                tax_rate: quoteTotals.taxRate,
                tax_amount: quoteTotals.tax,
                grand_total: quoteTotals.subtotal,
                total: quoteTotals.total,
                //work_order_items_id: workOrderId
            };

            // 3. Create the work order
            const { data: workOrder, error: workOrderError } = await workOrderService.create(newWorkOrderData);
            
            if (workOrderError) {
                throw workOrderError;
            }

            if (!workOrder) {
                throw new Error('No se pudo crear la orden de trabajo');
            }
            
            // 1. First, create the work order with a unique ID
            const workOrderItemId = crypto.randomUUID();
            const workOrderId = workOrder.id;                        

            // 4. Add services to the work order
            for (const service of addedServices) {
                const serviceItem: WorkOrderItems = {
                    service_description: service.description,
                    service_price: service.price,
                    work_order_id: workOrderItemId,
                    product_id: null,
                    product_quantity: null,
                    product_unit_price: null
                };

                const { error } = await workOrderItemService.addItem(serviceItem);

                if (error) {
                    console.error('Error adding service to work order:', error);
                    throw new Error(`Error al añadir el servicio: ${error.message}`);
                }
            }

            // 5. Add items to the work order
            for (const item of addedItems) {
                const productItem = {
                    product_id: item.productId,
                    product_quantity: item.quantity,
                    product_unit_price: item.unitPrice,
                    work_order_id: workOrderItemId,
                    service_description: null,
                    service_price: null
                };

                const { error } = await workOrderItemService.addItem(productItem);

                if (error) {
                    console.error('Error adding item to work order:', error);
                    throw new Error(`Error al añadir el repuesto: ${error.message}`);
                }
            }

            const { error } = await workOrderService.update(workOrderId, { work_order_items_id: workOrderItemId });
            if (error) {
                console.error('Error updating work order:', error);
                throw new Error(`Error al actualizar la orden de trabajo: ${error.message}`);
            }

            // 6. Show success message and navigate
            alert('Orden de trabajo creada exitosamente');
            navigate('/work-orders');

        } catch (error) {
            console.error('Error creating work order:', error);
            alert(`Error al crear la orden de trabajo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setIsSubmitting(false);
        }
        /*
        const { error } = await workOrderService.create(newWorkOrderData);
        if (error) {
            console.error('Error creating work order:', error);
            alert(`Error al crear la orden: ${error.message}`);
            return;
        }

        setIsSubmitting(false);
        if (error) {
            console.error('Error creating work order:', error);
            alert(`Error al crear la orden: ${error.message}`);
        } else {
            alert('Orden de trabajo creada con éxito.');
            navigate('/work-orders');
        }
            */
    };

    const commonInputClass = "block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500";

    if (loadingData) {
        return <div className="text-center p-8">Cargando...</div>;
    }

    return (
        <div>
            <GroupGuard>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Nueva Orden de Trabajo / Presupuesto</h1>
                <Button onClick={() => navigate('/work-orders')} variant="secondary">
                    Cancelar
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface rounded-xl shadow-lg p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Información General</h2>
                        <FormRow label="Cliente">
                            <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className={commonInputClass} required>
                                <option value="" disabled>Seleccione un cliente...</option>
                                {clients.map(client => <option key={client.id} value={client.id}>{client.first_name} {client.last_name}</option>)}
                            </select>
                        </FormRow>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormRow label="Año del Vehículo">
                                    <input
                                        type="number"
                                        placeholder="Ej: 2021"
                                        value={vehicleYear}
                                        onChange={e => setVehicleYear(e.target.value)}
                                        className={commonInputClass}
                                    />
                                </FormRow>
                                <FormRow label="Marca">
                                    <input
                                        type="text"
                                        placeholder="Ej: Toyota"
                                        value={vehicleMake}
                                        onChange={e => setVehicleMake(e.target.value)}
                                        className={commonInputClass}
                                    />
                                </FormRow>
                                <FormRow label="Modelo">
                                    <input
                                        type="text"
                                        placeholder="Ej: Hilux"
                                        value={vehicleModel}
                                        onChange={e => setVehicleModel(e.target.value)}
                                        className={commonInputClass}
                                    />
                                </FormRow>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormRow label="Kilometraje">
                                    <input
                                        type="number"
                                        placeholder="Ej: 12345"
                                        value={vehicleMileage}
                                        onChange={e => setVehicleMileage(e.target.value)}
                                        className={commonInputClass}
                                    />
                                </FormRow>
                                <FormRow label="Nivel de gasolina">
                                    <select
                                        value={fuelLevel}
                                        onChange={e => setFuelLevel(e.target.value)}
                                        className={commonInputClass}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="empty">Vacío</option>
                                        <option value="quarter">1/4</option>
                                        <option value="half">1/2</option>
                                        <option value="three-quarters">3/4</option>
                                        <option value="full">Lleno</option>
                                    </select>
                                </FormRow>
                            </div>

                            <FormRow label="Descripción del Problema / Trabajo a Realizar">
                                <textarea
                                    value={problemDescription}
                                    onChange={e => setProblemDescription(e.target.value)}
                                    className={commonInputClass}
                                    rows={3}
                                    placeholder="El cliente reporta un ruido en el motor..."
                                />
                            </FormRow>

                            <FormRow label="Diagnóstico Inicial">
                                <textarea
                                    value={diagnosis}
                                    onChange={e => setDiagnosis(e.target.value)}
                                    className={commonInputClass}
                                    rows={2}
                                    placeholder="Diagnóstico preliminar..."
                                />
                            </FormRow>
                        </div>
                    </div>

                    <div className="bg-surface rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Servicios</h2>
                        <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                <input type="text" placeholder="Ej: Cambio de aceite" value={newServiceDesc} onChange={e => setNewServiceDesc(e.target.value)} className={commonInputClass} required />
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                <input type="number" placeholder="50.00" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} className={commonInputClass} required />
                            </div>
                            <Button type="submit" className="w-full h-fit">Agregar</Button>
                        </form>
                        <ItemList items={addedServices} onRemove={handleRemoveService} headers={['Descripción', 'Precio']} renderRow={(service) => (<><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.description}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${service.price.toFixed(2)}</td></>)} />
                    </div>

                    <div className="bg-surface rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Repuestos / Productos</h2>
                        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4">
                            <div className="md:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                                <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className={commonInputClass} required>
                                    <option value="" disabled>Seleccione un producto...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                <input type="number" value={selectedProductQuantity} onChange={e => setSelectedProductQuantity(parseInt(e.target.value, 10))} min="1" className={commonInputClass} required />
                            </div>
                            <Button type="submit" className="w-full h-fit">Agregar</Button>
                        </form>
                        <ItemList items={addedItems} onRemove={handleRemoveItem} headers={['Producto', 'Cant.', 'P. Unit.', 'Subtotal']} renderRow={(item) => (<><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.unitPrice.toFixed(2)}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">${(item.quantity * item.unitPrice).toFixed(2)}</td></>)} />
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6 sticky top-8">
                    <div className="bg-surface rounded-xl shadow-lg p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Resumen del Presupuesto</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal Servicios:</span> <span className="font-medium">${quoteTotals.servicesTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">Subtotal Repuestos:</span> <span className="font-medium">${quoteTotals.itemsTotal.toFixed(2)}</span></div>
                            <div className="flex justify-between border-t pt-2"><span className="text-gray-600">Subtotal:</span> <span className="font-medium">${quoteTotals.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600">IVA ({(quoteTotals.taxRate * 100).toFixed(0)}%):</span> <span className="font-medium">${quoteTotals.tax.toFixed(2)}</span></div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span className="text-gray-800">Total:</span> <span className="text-primary-600">${quoteTotals.total.toFixed(2)}</span></div>
                        </div>
                    </div>
                    <div className="bg-surface rounded-xl shadow-lg p-6 space-y-4">
                        <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Acciones</h2>
                        <FormRow label="Asignacion de trabajo">
                            <select value={assignedToId} onChange={handleAssignToChange} className={commonInputClass} required>
                                <option value="">Seleccione un colaborador...</option>
                                {users.length > 0 ? users.map(user => <option key={user.id} value={user.id}>{user.full_name}</option>) : <option disabled>No hay colaboradores disponibles</option>}
                            </select>
                        </FormRow>
                        <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full" disabled={!selectedClientId || (addedServices.length === 0 && addedItems.length === 0)}>
                            Guardar Orden de Trabajo
                        </Button>
                    </div>
                </div>
            </div>
            </GroupGuard>
        </div>
    );
};

// Generic list component for services and items
interface ItemListProps<T extends { id?: string; productId?: string }> {
    items: T[];
    onRemove: (id: string) => void;
    headers: string[];
    renderRow: (item: T) => React.ReactNode;
}

const ItemList = <T extends { id?: string; productId?: string }>({ items, onRemove, headers, renderRow }: ItemListProps<T>) => {
    if (items.length === 0) {
        return <p className="text-center text-sm text-gray-500 py-4">No se han agregado elementos.</p>;
    }
    return (
        <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {headers.map(h => <th key={h} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>)}
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Quitar</span></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                        <tr key={item.id || item.productId}>
                            {renderRow(item)}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onRemove(item.id || item.productId!)} className="text-red-500 hover:text-red-700">
                                    <XCircleIcon className="h-5 w-5" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default NewWorkOrder;