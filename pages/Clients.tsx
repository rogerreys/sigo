import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Client } from '../types';
import Button from '../components/common/Button';
import { PlusIcon, SearchIcon, EditIcon, DeleteIcon, BuildingOfficeIcon, UserIcon, FilterIcon } from '../utils/icons';
import { useNavigate } from 'react-router-dom';
import { useGroup } from '../components/common/GroupContext';
import { clientService } from '../services/supabase';
import GroupGuard from '../components/common/GroupGuard';
import Swal from 'sweetalert2';

const Clients: React.FC = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [clientTypeFilter, setClientTypeFilter] = useState<'all' | 'C' | 'P'>('all');
    const { selectedGroup, canEdit, canDelete } = useGroup();

    const fetchClients = useCallback(async () => {
        setLoading(true);
        if (!selectedGroup) return;
        const { data, error } = await clientService.getAll(selectedGroup.id);
        if (error) {
            console.error('Error fetching clients:', error);
        } else if (data) {
            setClients(data as Client[]);
        }
        setLoading(false);
    }, [selectedGroup]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const matchesSearch = 
                client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesType = clientTypeFilter === 'all' || client.subtype === clientTypeFilter;
            
            return matchesSearch && matchesType;
        });
    }, [clients, searchTerm, clientTypeFilter]);

    const handleDelete = async (id: string) => {
        try {
            const { isConfirmed } = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });
            if (!isConfirmed) return;
            if (!selectedGroup) return;
            await clientService.delete(id, selectedGroup.id);
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    return (
        <div>
            <GroupGuard>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Clientes</h1>
                {canEdit() && <Button onClick={() => navigate('/clients/new')} icon={<PlusIcon className="h-5 w-5" />}>
                    Nuevo Cliente
                </Button>}
            </div>

            <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="relative w-full max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                        <label htmlFor="clientTypeFilter" className="text-sm text-gray-500">Filtrar:</label>
                        <div className="relative">
                            <select
                                id="clientTypeFilter"
                                value={clientTypeFilter}
                                onChange={(e) => setClientTypeFilter(e.target.value as 'all' | 'C' | 'P')}
                                className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="all">Todos</option>
                                <option value="P">Personas</option>
                                <option value="C">Empresas</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <p>Cargando clientes...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <span>Nombre</span>
                                            {clientTypeFilter === 'C' && <BuildingOfficeIcon className="ml-1 h-4 w-4 text-gray-400" />}
                                            {clientTypeFilter === 'P' && <UserIcon className="ml-1 h-4 w-4 text-gray-400" />}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado</th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Acciones</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.subtype === 'C' ? client.first_name : client.first_name + ' ' + client.last_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(client.created_at!).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {canEdit() && <button className="text-primary-600 hover:text-primary-900 mr-4" onClick={() => navigate(`/clients/new/${client.id}`)}><EditIcon className="h-5 w-5" /></button>}
                                            {canDelete() && <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(client.id!)}><DeleteIcon className="h-5 w-5" /></button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            </GroupGuard>
        </div>
    );
};

export default Clients;
