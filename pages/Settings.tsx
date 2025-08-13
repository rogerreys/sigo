
import React, { useState, useEffect, FormEvent } from 'react';
import { profileService, groupsService } from '../services/supabase';
import { Database } from '../types/supabase';
import Button from '../components/common/Button';
import { PlusIcon } from '../utils/icons';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { toast } from 'react-toastify';
import { useGroup } from '../components/common/GroupContext';
import { Group } from '../types/supabase';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// User type is defined but not used in this component

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { selectedGroup } = useGroup();
    type User = Database['public']['Tables']['profiles']['Row'];
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroup, setNewGroup] = useState({
        name: '',
        description: ''
    });
    const [groups, setGroups] = useState<Group[]>([]);

    const fetchGroups = async () => {
        const { data, error } = await groupsService.getCreatedBy();
        if (error) {
            console.error('Error fetching groups:', error);
            toast.error('Error al cargar los grupos');
        } else {
            setGroups(data || []);
        }
    };

    const handleCreateGroup = async (e: FormEvent) => {
        e.preventDefault();
        if (!newGroup.name.trim()) {
            toast.error('El nombre del grupo es requerido');
            return;
        }

        try {
            const { error } = await groupsService.create({
                name: newGroup.name,
                description: newGroup.description || null
            });

            if (error) {
                alert(error.message || 'Error al crear el grupo');
                return;
            }
            
            alert('Grupo creado exitosamente');
            setShowGroupModal(false);
            setNewGroup({ name: '', description: '' });
            fetchGroups();
        } catch (error) {
            console.error('Error creating group:', error);
            alert('Error al crear el grupo');
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await profileService.getAll();
        if (error) {
            console.error("Error fetching users:", error);
            toast.error('Error al cargar los usuarios');
        } else if (data) {
            setUsers(data as User[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
        fetchGroups();
    }, []);

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Configuración</h1>
                <div className="flex gap-4">
                    <Button 
                        type="button"
                        onClick={() => setShowGroupModal(true)}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Nuevo Grupo
                    </Button>
                    <Button 
                        type="button" 
                        onClick={() => navigate('/settings/user')}
                        className="flex items-center gap-2"
                        variant="primary"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Nuevo Usuario
                    </Button>
                </div>
            </div>

            {/* Sección de Grupos */}
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Grupos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group: Group) => (
                        <div key={group.id} className="border rounded-lg p-4 shadow-sm">
                            <h3 className="font-medium">{group.name}</h3>
                            {group.description && (
                                <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                                Creado: {new Date(group.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal para crear nuevo grupo */}
            <Modal
                isOpen={showGroupModal}
                onClose={() => {
                    setShowGroupModal(false);
                    setNewGroup({ name: '', description: '' });
                }}
                title="Nuevo Grupo"
            >
                <form onSubmit={(e: React.FormEvent) => handleCreateGroup(e)} className="space-y-4">
                    <Input
                        label="Nombre del Grupo"
                        value={newGroup.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setNewGroup({...newGroup, name: e.target.value})
                        }
                        required
                        placeholder="Ej: Ventas, Soporte, etc."
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={newGroup.description}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                              setNewGroup({...newGroup, description: e.target.value})
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                            placeholder="Descripción del grupo"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowGroupModal(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Crear Grupo
                        </Button>
                    </div>
                </form>
            </Modal>

            <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Gestión de Usuarios y Roles</h2>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {user.full_name || 'No name'}
                                        </td>
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