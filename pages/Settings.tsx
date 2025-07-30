
import React, { useState, useEffect } from 'react';
import { profileService } from '../services/supabase';
import { Database } from '../types/supabase';
import Button from '../components/common/Button';
import { PlusIcon } from '../utils/icons';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
    const navigate = useNavigate();
    type User = Database['public']['Tables']['profiles']['Row'];
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await profileService.getAll();
        if (error) {
            console.error("Error fetching users:", error);
        } else if (data) {
            setUsers(data as User[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Configuración</h1>

            <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Gestión de Usuarios y Roles</h2>
                    <Button icon={<PlusIcon className="h-5 w-5" />} onClick={() => navigate('/settings/user')}>
                        Nuevo Usuario
                    </Button>
                </div>

                {loading ? <p>Cargando usuarios...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a href="#" className="text-primary-600 hover:text-primary-900">Editar</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-8 bg-surface rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-4">Otras Configuraciones</h2>
                <p className="text-gray-600">
                    Esta sección puede ser expandida para incluir configuraciones de facturación, integraciones, notificaciones y más.
                </p>
            </div>
        </div>
    );
};

export default Settings;