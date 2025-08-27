
import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { WorkOrders, WorkOrderStatus } from '../types';
import Card from '../components/common/Card';
import { UsersIcon, InventoryIcon, WorkOrderIcon } from '../utils/icons';
import { useGroup } from '../components/common/GroupContext';
import { clientService, productService, workOrderService } from '../services/supabase';
import Swal from 'sweetalert2';

const Stats: React.FC = () => {
    const [stats, setStats] = useState({ clients: 0, products: 0, openWorkOrders: 0 });
    const [salesData, setSalesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedGroup } = useGroup();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            if (!selectedGroup?.id) return;
            const [clientsData, productsData, workOrdersData] = await Promise.all([
                clientService.getAll(selectedGroup?.id),
                productService.getAll(selectedGroup?.id),
                workOrderService.getAll(selectedGroup?.id),
            ])
            if (clientsData.error || productsData.error || workOrdersData.error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al cargar los datos',
                });
                return;
            }

            // Obtenemos datos de ordenes de trabajo en estado abierto
            const openWorkOrders = (workOrdersData.data as WorkOrders[] || []).filter(wo => wo.status === WorkOrderStatus.InProgress || wo.status === WorkOrderStatus.Pending).length;
            
            setStats({
                clients: clientsData.data?.length ?? 0,
                products: productsData.data?.length ?? 0,
                openWorkOrders: openWorkOrders,
            });
            
            // Procesamos datos de ventas para el gráfico            
            const monthlySales: { [key: string]: number } = {};
            (workOrdersData.data as WorkOrders[])
                .filter(wo => wo.status === WorkOrderStatus.Completed || wo.status === WorkOrderStatus.Billed)
                .forEach(wo => {
                    const month = new Date(wo.completed_at || '').toLocaleString('es-ES', { month: 'short', year: 'numeric' });
                    if (!monthlySales[month]) {
                        monthlySales[month] = 0;
                    }
                    monthlySales[month] += wo.total || 0;
                });
            
            const chartData = Object.keys(monthlySales).map(month => ({
                name: month.charAt(0).toUpperCase() + month.slice(1),
                ventas: monthlySales[month],
            })).slice(-6); // Last 6 months

            setSalesData(chartData);

        } catch (error) {
            console.error("Error fetching Stats data:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al cargar los datos',
            });
        } finally {
            setLoading(false);
        }
    }, [selectedGroup]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <div className="text-center p-8">Cargando datos del Stats...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Estadísticas & Datos</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <Card title="Clientes Totales" value={stats.clients} icon={<UsersIcon className="h-8 w-8 text-white"/>} color="bg-blue-500" />
                <Card title="Órdenes Abiertas" value={stats.openWorkOrders} icon={<WorkOrderIcon className="h-8 w-8 text-white"/>} color="bg-yellow-500" />
                <Card title="Productos en Stock" value={stats.products} icon={<InventoryIcon className="h-8 w-8 text-white"/>} color="bg-green-500" />
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Ventas Recientes</h2>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                        data={salesData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Bar dataKey="ventas" fill="#3b82f6" name="Ventas ($)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Stats;
