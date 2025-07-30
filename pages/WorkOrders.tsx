
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { WorkOrder, WorkOrderStatus } from '../types';
import Button from '../components/common/Button';
import { PlusIcon, SearchIcon } from '../utils/icons';
import { useNavigate } from 'react-router-dom';

const WorkOrders: React.FC = () => {
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchWorkOrders = async () => {
            setLoading(true);
            const { data, error } = await supabase.from('work_orders').select('*');
            if (error) {
                console.error('Error fetching work orders:', error);
            } else if (data) {
                setWorkOrders(data as any[]); // The mock returns populated data
            }
            setLoading(false);
        };
        fetchWorkOrders();
    }, []);

    const filteredWorkOrders = useMemo(() => {
        return workOrders.filter(wo =>
            wo.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (wo as any).clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wo.description.toLowerCase().includes(searchTerm.toLowerCase())
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600 hover:underline cursor-pointer">{wo.orderNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(wo as any).clientName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{(wo as any).assignedToName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(wo.status)}`}>
                                                {wo.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${wo.total?.toFixed(2) || '0.00'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(wo.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button variant="secondary" className="text-xs py-1 px-3">Ver</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkOrders;
