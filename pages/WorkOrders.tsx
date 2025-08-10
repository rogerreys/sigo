
import React, { useEffect, useState, useMemo } from 'react';
import { Client, Profiles, WorkOrders, WorkOrderStatus } from '../types';
import Button from '../components/common/Button';
import { PlusIcon, SearchIcon } from '../utils/icons';
import { useNavigate } from 'react-router-dom';
import { workOrderService, clientService, userService } from '../services/supabase';
import WorkOrderDetailModal from '../components/common/WorkOrderDetailModal';

const WorkOrders: React.FC = () => {
    const [workOrders, setWorkOrders] = useState<WorkOrders[]>([]);
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState<Client[]>([]);
    const [users, setUsers] = useState<Profiles[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrders | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkOrders = async () => {
            try {
                setLoading(true);

                const [clientsRes, workOrdersRes, profilesRes] = await Promise.all([
                    clientService.getAll(),
                    workOrderService.getAll(),
                    userService.getAll()
                ]);

                if (clientsRes.data) setClients(clientsRes.data as Client[]);
                if (workOrdersRes.data) setWorkOrders(workOrdersRes.data as WorkOrders[]);
                if (profilesRes.data) {
                    const mechanics = (profilesRes.data as Profiles[]).filter((u: Profiles) => u.role === 'staff');
                    setUsers(mechanics as Profiles[]);
                }
                

            } catch (error) {
                console.error("Error fetching data for work orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkOrders();
    }, []);

    const filteredWorkOrders = useMemo(() => {
        return workOrders.filter(wo =>
            wo.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clients.find(c => c.id === wo.client_id)?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.problem_description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [workOrders, searchTerm]);

    const getStatusClass = (status: WorkOrderStatus) => {
        const classes = {
            [WorkOrderStatus.Pending]: 'bg-gray-200 text-gray-800',
            [WorkOrderStatus.InProgress]: 'bg-blue-200 text-blue-800',
            [WorkOrderStatus.Completed]: 'bg-green-200 text-green-800',
            [WorkOrderStatus.Billed]: 'bg-purple-200 text-purple-800',
            [WorkOrderStatus.Cancelled]: 'bg-red-200 text-red-800',
        };
        return classes[status] || 'bg-gray-200 text-gray-800';
    };

    const handleViewDetails = (order: WorkOrder) => {
        setSelectedWorkOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (isSaving) return;
        setIsModalOpen(false);
        setSelectedWorkOrder(null);
    };

    const handleSaveWorkOrder = async (updatedOrder: WorkOrders) => {
        setIsSaving(true);
        console.log("updatedOrder: ", updatedOrder);
        const { id, status, diagnostic_notes } = updatedOrder;

        // The mock API only needs the changed fields + id
        const { error } = await workOrderService.update(id, { id, status, diagnostic_notes });
        
        if (error) {
            console.error('Error updating work order:', error.message);
            // You could show an error toast/message to the user here
        } else {
            setWorkOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === id ? { ...order, status, diagnostic_notes } : order
                )
            );
            handleCloseModal();
        }
        setIsSaving(false);
    };
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Órdenes de Trabajo</h1>
                <Button
                    icon={<PlusIcon className="h-5 w-5" />}
                    onClick={() => navigate('/work-orders/new')}>
                    Nueva Orden
                </Button>
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                    <div className="relative w-full max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar OT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <p>Cargando órdenes de trabajo...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Orden</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredWorkOrders.map((wo) => (
                                    <tr key={wo.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 hover:underline cursor-pointer" onClick={() => handleViewDetails(wo)}>{wo.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{clients.find(c => c.id === wo.client_id)?.first_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{users.find(u => u.id === wo.profile_id)?.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(wo.status)}`}>
                                                {wo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${wo.total?.toFixed(2) || '0.00'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(wo.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button variant="secondary" className="text-xs py-1 px-3" onClick={() => handleViewDetails(wo)}>Ver</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            <WorkOrderDetailModal
                isOpen={isModalOpen}
                order={selectedWorkOrder}
                onClose={handleCloseModal}
                onSave={handleSaveWorkOrder}
                isLoading={isSaving}
                client_name={clients.find(c => c.id === selectedWorkOrder?.client_id)?.first_name}
                assignedTo={users.find(u => u.id === selectedWorkOrder?.profile_id)?.full_name}
            />
        </div>
    );
};

export default WorkOrders;
