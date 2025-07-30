
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Client, Product, User, Service, WorkOrderItem, WorkOrderStatus } from '../types';
import Button from '../components/common/Button';
import { XCircleIcon } from '../utils/icons';
import { clientService, productService, userService } from '../services/supabase';

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
    const [users, setUsers] = useState<User[]>([]);

    // Loading states
    const [loadingData, setLoadingData] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [vehicleInfo, setVehicleInfo] = useState('');
    const [problemDescription, setProblemDescription] = useState('');
    const [assignedToId, setAssignedToId] = useState<string>('');
    const [addedServices, setAddedServices] = useState<Service[]>([]);
    const [addedItems, setAddedItems] = useState<(WorkOrderItem & { productName: string })[]>([]);

    // State for adding new items/services
    const [newServiceDesc, setNewServiceDesc] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {

                const [clientsRes, productsRes, usersRes] = await Promise.all([
                    clientService.getAll(),
                    productService.getAll(),
                    userService.getAll(),
                ]);
                console.log("clientsRes: ", clientsRes.data);
                console.log("productsRes: ", productsRes.data);
                console.log("usersRes: ", usersRes.data);

                if (clientsRes.data) setClients(clientsRes.data as Client[]);
                if (productsRes.data) setProducts(productsRes.data as Product[]);
                if (usersRes.data) {
                    const mechanics = (usersRes.data as User[]).filter((u: User) => u.role === 'Mecánico');
                    setUsers(mechanics);
                    if (mechanics.length > 0) setAssignedToId(mechanics[0].id);
                }

            } catch (error) {
                console.error("Error fetching data for new work order:", error);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

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

    const quoteTotals = useMemo(() => {
        const servicesTotal = addedServices.reduce((acc, service) => acc + service.price, 0);
        const itemsTotal = addedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
        const subtotal = servicesTotal + itemsTotal;
        const taxRate = 0.12; // Example 12% tax
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        return { servicesTotal, itemsTotal, subtotal, tax, total, taxRate };
    }, [addedServices, addedItems]);

    const handleSubmit = async () => {
        if (!selectedClientId) {
            alert('Por favor, seleccione un cliente.');
            return;
        }
        if (addedServices.length === 0 && addedItems.length === 0) {
            alert('Por favor, añada al menos un servicio o repuesto.');
            return;
        }

        setIsSubmitting(true);
        const newWorkOrderData = {
            clientId: selectedClientId,
            assignedTo: assignedToId,
            status: WorkOrderStatus.Pending,
            description: `${vehicleInfo ? `Vehículo: ${vehicleInfo}. ` : ''}${problemDescription}`,
            services: addedServices.map(({ id, ...rest }) => ({ ...rest, description: rest.description, price: rest.price })),
            items: addedItems.map(({ productName, ...rest }) => ({ ...rest, productId: rest.productId, quantity: rest.quantity, unitPrice: rest.unitPrice })),
            total: quoteTotals.total,
        };

        const { error } = await supabase.from('work_orders').insert(newWorkOrderData);

        setIsSubmitting(false);
        if (error) {
            console.error('Error creating work order:', error);
            alert(`Error al crear la orden: ${error.message}`);
        } else {
            alert('Orden de trabajo creada con éxito.');
            navigate('/work-orders');
        }
    };

    const commonInputClass = "block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500";

    if (loadingData) {
        return <div className="text-center p-8">Cargando...</div>;
    }

    return (
        <div>
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
                        <FormRow label="Información del Vehículo (Opcional)">
                            <input type="text" placeholder="Ej: Toyota Hilux 2021" value={vehicleInfo} onChange={e => setVehicleInfo(e.target.value)} className={commonInputClass} />
                        </FormRow>
                        <FormRow label="Descripción del Problema / Trabajo a Realizar">
                            <textarea value={problemDescription} onChange={e => setProblemDescription(e.target.value)} className={commonInputClass} rows={3} placeholder="El cliente reporta un ruido en el motor..."></textarea>
                        </FormRow>
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
                        <FormRow label="Asignar a Mecánico">
                            <select value={assignedToId} onChange={e => setAssignedToId(e.target.value)} className={commonInputClass} required>
                                {users.length > 0 ? users.map(user => <option key={user.id} value={user.id}>{user.name}</option>) : <option disabled>No hay mecánicos disponibles</option>}
                            </select>
                        </FormRow>
                        <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full" disabled={!selectedClientId || (addedServices.length === 0 && addedItems.length === 0)}>
                            Guardar Orden de Trabajo
                        </Button>
                    </div>
                </div>
            </div>
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