import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkOrderStatus, WorkOrders, WorkOrderItems, Client, Product, Profiles, ServiceItem, ProductItem, Configurations, Sequence } from '../types';
import Button from '../components/common/Button';
import { XCircleIcon } from '../utils/icons';
import { clientService, productService, userService, workOrderItemService, workOrderService, configurationsService, sequenceService } from '../services/supabase';
import { useGroup } from '../components/common/GroupContext';
import GroupGuard from '../components/common/GroupGuard';
import Swal from 'sweetalert2';

// A small helper component for form rows
const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);

const NewWorkOrder: React.FC = () => {
    const navigate = useNavigate();
    // Get the id from the URL
    const { id } = useParams();
    // Include tax
    const [includeTax, setIncludeTax] = useState(true);
    // Data from DB
    const [clients, setClients] = useState<Client[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<Profiles[]>([]);
    const [configurationsData, setConfigurationsData] = useState<Configurations[]>([]);
    // Work order items id (En actualizacion es necesaria guardarlo)
    const [workOrderItemsId, setWorkOrderItemsId] = useState<string[]>([crypto.randomUUID()]);
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
    const [addedServices, setAddedServices] = useState<ServiceItem[]>([]);
    const [addedProducItems, setAddedProducItems] = useState<(ProductItem)[]>([]);
    const [ivaValue, setIvaValue] = useState(0);
    // State for adding new items/services
    const [newServiceDesc, setNewServiceDesc] = useState('');
    const [newServicePrice, setNewServicePrice] = useState('');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedProductQuantity, setSelectedProductQuantity] = useState(1);
    // Secuencial
    const [sequence, setSequence] = useState<Sequence>({} as Sequence);
    // Grupo
    const { selectedGroup, canEdit } = useGroup();

    useEffect(() => {
        const fetchInitialData = async () => {
            // Cargamos los datos iniciales
            const resp = await fetchData();
            if (resp) {
                // Cargamos la orden de trabajo
                await fetchWorkOrder();
            }
        };
        fetchInitialData();
    }, [selectedGroup]);

    const fetchWorkOrder = async () => {
        if (id && selectedGroup) {
            const servicesToAdd: ServiceItem[] = [];
            const workOrderIds: string[] = [];
            const productItemsToAdd: ProductItem[] = [];

            const [woData, productsData] = await Promise.all([
                workOrderService.getById(id, selectedGroup.id),
                productService.getByGroupId(selectedGroup.id),
                configurationsService.getByGroupId(selectedGroup.id)
            ]);
            if (woData.error) throw woData.error;
            if (!woData.data) return;
            if (productsData.error) throw productsData.error;
            if (!productsData.data) return;
            setProducts(productsData.data as Product[]);

            /*setWorkOrder(woData as WorkOrders[]);*/
            setSelectedClientId(woData.data.client_id);
            setAssignedToId(woData.data.profile_id);
            setVehicleYear(woData.data.vehicle_year?.toString() || '');
            setVehicleMake(woData.data.vehicle_make || '');
            setVehicleModel(woData.data.vehicle_model || '');
            setVehicleMileage(woData.data.odometer_reading?.toString() || '');
            setFuelLevel(woData.data.fuel_level || '');
            setProblemDescription(woData.data.problem_description || '');
            setDiagnosis(woData.data.diagnostic_notes || '');

            const { data: items, error: itemsError } = await workOrderItemService.getItems(woData.data.work_order_items_id!, selectedGroup.id);
            if (itemsError) throw itemsError;
            if (!items) return;
            for (const item of items) {
                // Obtiene los servicios
                if (item.service_description) {
                    const serviceItem: ServiceItem = {
                        id: item.id!,
                        work_order_id: item.work_order_id!,
                        service_description: item.service_description,
                        service_price: Number(item.service_price)
                    };
                    servicesToAdd.push(serviceItem);
                    workOrderIds.push(item.work_order_id!);
                }
                // Obtiene los productos
                if (item.product_id && item.product_quantity && item.product_unit_price) {
                    const product = productsData.data.find(p => p.id === item.product_id);
                    if (!product) return;
                    const productItem: ProductItem = {
                        id: item.id!,
                        work_order_id: item.work_order_id!,
                        product_id: item.product_id,
                        product_quantity: Number(item.product_quantity),
                        product_unit_price: Number(item.product_unit_price),
                        product_name: product.name
                    };
                    productItemsToAdd.push(productItem);
                    workOrderIds.push(item.work_order_id!);
                }
            }
            if (servicesToAdd.length > 0) {
                setAddedServices(servicesToAdd);
            }
            if (productItemsToAdd.length > 0) {
                setAddedProducItems(productItemsToAdd);
            }
            setWorkOrderItemsId(workOrderIds);
        }
    };

    const fetchData = async () => {
        setLoadingData(true);
        try {
            if (!selectedGroup) return;
            const [clientsRes, productsRes, usersRes, configurationsData] = await Promise.all([
                clientService.getAll(selectedGroup.id),
                productService.getAll(selectedGroup.id),
                userService.getAll(selectedGroup.id),
                configurationsService.getByGroupId(selectedGroup.id)
            ]);
            if (clientsRes.data) setClients(clientsRes.data as Client[]);
            if (productsRes.data) setProducts(productsRes.data as Product[]);
            if (usersRes.data) setUsers(usersRes.data as Profiles[]);
            if (configurationsData.error) throw configurationsData.error;
            if (!configurationsData.data) return;
            setConfigurationsData(configurationsData.data as Configurations[]);

            setIvaValue(Number(configurationsData.data.find(c => c.option_name === 'iva_value')?.option_value));
            return true;
        } catch (error) {
            console.error("Error fetching data for new work order:", error);
            return false;
        }
        finally {
            setLoadingData(false);
        }
    };

    const handleAddService = (e: React.FormEvent) => {
        e.preventDefault();
        if (newServiceDesc && newServicePrice) {
            const price = parseFloat(newServicePrice);
            if (!isNaN(price)) {
                setAddedServices([...addedServices, {
                    service_description: newServiceDesc,
                    service_price: price
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
            // Generate a temporary unique ID for the new item
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

            // Check if we already have this product in the list
            const existingItemIndex = addedProducItems.findIndex(item =>
                item.product_id === selectedProductId
            );

            if (existingItemIndex > -1) {
                // If product exists, update its quantity
                const updatedItems = [...addedProducItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    product_quantity: updatedItems[existingItemIndex].product_quantity + selectedProductQuantity
                };
                setAddedProducItems(updatedItems);
            } else {
                // If product doesn't exist, add it with a unique ID
                setAddedProducItems(prevItems => [
                    ...prevItems,
                    {
                        id: tempId,
                        product_id: product.id,
                        product_quantity: selectedProductQuantity,
                        product_unit_price: product.price,
                        product_name: product.name,
                    }
                ]);
            }
            setSelectedProductId('');
            setSelectedProductQuantity(1);
        }
    };

    const handleRemoveService = async (id: string) => {
        const { data, error } = await workOrderItemService.getServiceItems(id, workOrderItemsId[0], selectedGroup!.id)
        if (error) throw error;
        if (data) {
            const { error } = await workOrderItemService.deleteItem(id, workOrderItemsId[0], selectedGroup!.id)
            if (error) throw error;
        }
        setAddedServices(addedServices.filter(s => s.id !== id));
    };

    const handleRemoveItem = async (id: string) => {
        // If it's a temporary ID (starts with 'temp-'), just remove it from state
        if (id.startsWith('temp-')) {
            setAddedProducItems(prevItems => prevItems.filter(item => item.id !== id));
            return;
        }
        try {
            const { data, error } = await workOrderItemService.getServiceItems(id, workOrderItemsId[0], selectedGroup!.id)
            if (error) throw error;
            if (data) {
                const { error } = await workOrderItemService.deleteItem(id, workOrderItemsId[0], selectedGroup!.id)
                if (error) throw error;
            }
            setAddedProducItems(addedProducItems.filter((i: ProductItem) => i.id !== id));
        } catch (error) {
            console.error("Error removing item:", error);
        }
    };

    const handleAssignToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAssignedToId(e.target.value);
    };

    const subtotalServices = useMemo(() => {
        return addedServices.reduce((sum, service) => sum + (service.service_price || 0), 0);
    }, [addedServices]);

    const subtotalProducts = useMemo(() => {
        return addedProducItems.reduce((sum, item) =>
            sum + (item.product_unit_price * item.product_quantity), 0);
    }, [addedProducItems]);

    const iva = useMemo(() => {
        const subtotal = subtotalServices + subtotalProducts;
        return includeTax ? subtotal * ivaValue / 100 : 0;
    }, [subtotalServices, subtotalProducts, includeTax, ivaValue]);

    const total = useMemo(() => {
        return subtotalServices + subtotalProducts + iva;
    }, [subtotalServices, subtotalProducts, iva]);

    const toggleIncludeTax = () => {
        setIncludeTax(!includeTax);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedGroup) return;
        if (!selectedClientId) {
            Swal.fire("Por favor, seleccione un cliente.");
            return;
        }
        if (addedServices.length === 0 && addedProducItems.length === 0) {
            Swal.fire("Por favor, añada al menos un servicio o repuesto.");
            return;
        }

        setIsSubmitting(true);

        // Crear orden de trabajo
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
                tax_rate: includeTax ? ivaValue : 0,
                tax_amount: iva,
                grand_total: subtotalServices + subtotalProducts,
                total: total,
                //work_order_items_id: workOrderId
            };

            // 3. Create the work order
            let workOrderId: string;
            if (id) {
                workOrderId = id;
                const { data: workOrder, error: workOrderError } = await workOrderService.update(workOrderId, selectedGroup.id, newWorkOrderData);
                if (workOrderError) throw workOrderError;
                if (!workOrder) throw new Error('No se pudo actualizar la orden de trabajo');
                // workOrderItemsId.push(workOrder.work_order_items_id!); // Use the existing ID when updating
                setWorkOrderItemsId([workOrder.work_order_items_id!]);
            } else {
                // Conseguir secuencial
                let secuential: Sequence | null = null;
                const sequenceData = await sequenceService.getByGroup(selectedGroup.id);
                if (sequenceData.error) throw sequenceData.error;
                if (sequenceData.data?.length === 0) {
                    const result = await sequenceService.create(selectedGroup.id);
                    if (result.error) throw result.error;
                    setSequence(result.data as Sequence);
                    secuential = result?.data || {} as Sequence;
                } else {
                    // Incrementar secuencial
                    const result = await sequenceService.increment(selectedGroup.id);
                    if (result?.error) throw result.error;
                    setSequence(result?.data || {} as Sequence);
                    secuential = result?.data || {} as Sequence;
                }
                newWorkOrderData.work_order_number = `${selectedGroup.name.slice(0, 3).toUpperCase()}-${secuential?.sequential.toString().padStart(4, '0')}`;
                
                // Crear orden de trabajo
                const { data: workOrder, error: workOrderError } = await workOrderService.create(newWorkOrderData, selectedGroup.id);
                if (workOrderError) throw workOrderError;
                if (!workOrder) throw new Error('No se pudo crear la orden de trabajo');
                workOrderId = workOrder.id;
                // 1. First, create the work order with a unique ID
                // TODO - Probar si toma el valor por defecto al crear la orden
                //workOrderItemsId.push(crypto.randomUUID());
            }

            // 4. Add services to the work order
            for (const service of addedServices) {
                const serviceItem: WorkOrderItems = {
                    service_description: service.service_description,
                    service_price: service.service_price,
                    work_order_id: workOrderItemsId[0],
                    product_id: null,
                    product_quantity: null,
                    product_unit_price: null
                };
                if (id && service.id && !service.id.startsWith('temp-')) {
                    const { error } = await workOrderItemService.updateItem(service.id, selectedGroup.id, workOrderItemsId[0], serviceItem);
                    if (error) throw error;
                }
                else {
                    const { error } = await workOrderItemService.addItem(serviceItem, selectedGroup.id);
                    if (error) throw error;
                }
            }

            // 5. Add items to the work order
            for (const item of addedProducItems) {
                const productItem: WorkOrderItems = {
                    product_id: item.product_id,
                    product_quantity: item.product_quantity,
                    product_unit_price: item.product_unit_price,
                    work_order_id: workOrderItemsId[0],
                    service_description: null,
                    service_price: null
                };
                // Obtenemos el producto
                const product = products.find(p => p.id === item.product_id);
                if (!product) return;
                if (id && item.id && !item.id.startsWith('temp-')) {
                    // For existing items, we need to handle stock adjustment carefully
                    const { data: existingItem, error: fetchError } = await workOrderItemService.getServiceItems(item.id, workOrderItemsId[0], selectedGroup!.id);
                    if (fetchError) throw fetchError;

                    // Update the work order item
                    const { error } = await workOrderItemService.updateItem(item.id, selectedGroup.id, workOrderItemsId[0], productItem);
                    if (error) throw error;

                    // If quantity changed, update the stock
                    if (existingItem && existingItem.length > 0 && existingItem[0].product_quantity !== item.product_quantity) {
                        const quantityDiff = (existingItem[0].product_quantity || 0) - (item.product_quantity || 0);
                        const { error: updateError } = await productService.updateStock(
                            item.product_id || '',
                            product.stock_quantity + quantityDiff,
                            selectedGroup.id
                        );
                        if (updateError) throw updateError;
                    }
                }
                else {
                    const { error } = await workOrderItemService.addItem(productItem, selectedGroup.id);
                    if (error) throw error;

                    // Update the product stock
                    const { error: updateError } = await productService.updateStock(
                        item.product_id || '',
                        product.stock_quantity - (item.product_quantity || 0),
                        selectedGroup.id
                    );
                    if (updateError) throw updateError;
                }
            }
            if (!id) {
                const { error } = await workOrderService.update(workOrderId, selectedGroup.id, { work_order_items_id: workOrderItemsId[0] });
                if (error) throw new Error(`Error al actualizar la orden de trabajo: ${error.message}`);
            }

            // 6. Show success message and navigate
            Swal.fire({
                title: id ? "Orden de trabajo actualizada exitosamente" : "Orden de trabajo creada exitosamente",
                icon: "success",
                draggable: true
            });
            navigate('/work-orders');

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: `Error al crear la orden de trabajo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                footer: '<a href="#">Why do I have this issue?</a>'
            });
        } finally {
            setIsSubmitting(false);
        }
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
                            <ItemList items={addedServices} onRemove={handleRemoveService} headers={['Descripción', 'Precio']} renderRow={(service) => (
                                <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{service.service_description}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${service.service_price}</td>
                                </>
                            )} />
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
                            <ItemList items={addedProducItems} onRemove={handleRemoveItem} headers={['Producto', 'Cant.', 'P. Unit.', 'Subtotal']} renderRow={(item) => (
                                <>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.product_quantity!}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.product_unit_price!.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">${(item.product_quantity! * item.product_unit_price!).toFixed(2)}</td>
                                </>
                            )} />
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-6 sticky top-8">
                        <div className="bg-surface rounded-xl shadow-lg p-6 space-y-4">
                            <h2 className="text-xl font-semibold text-gray-700 border-b pb-3 mb-4">Resumen del Presupuesto</h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600">Subtotal Servicios:</span> <span className="font-medium">${subtotalServices.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Subtotal Productos:</span> <span className="font-medium">${subtotalProducts.toFixed(2)}</span></div>
                                <div className="flex justify-between border-t pt-2"><span className="text-gray-600">Subtotal:</span> <span className="font-medium">${(subtotalServices + subtotalProducts).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">IVA ({ivaValue}%):</span> <span className="font-medium">${iva.toFixed(2)}</span></div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span className="text-gray-800">Total:</span> <span className="text-primary-600">${total.toFixed(2)}</span></div>
                            </div>
                            <div className="mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center space-x-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={includeTax}
                                                onChange={toggleIncludeTax}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Incluir IVA ({ivaValue}%)</span>
                                        </label>
                                    </div>
                                </div>
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
                            <div className="row">
                                {canEdit() && <Button onClick={handleSubmit} isLoading={isSubmitting} className="w-full mt-4 gap-2" disabled={!selectedClientId || (addedServices.length === 0 && addedProducItems.length === 0)}>
                                    Guardar Orden de Trabajo
                                </Button>}
                                <Button onClick={() => navigate('/work-orders')} isLoading={isSubmitting} className="w-full mt-4 gap-2">
                                    Cancelar
                                </Button>
                            </div>
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
                    {items.map((item, index) => (
                        <tr key={item.id || `${item.id}-${index}`}>
                            {renderRow(item)}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button onClick={() => onRemove(item.id!)} className="text-red-500 hover:text-red-700">
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