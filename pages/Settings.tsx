import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { userService, groupsService, profileGroupService, configurationsService } from '../services/supabase';
import { Database } from '../types/supabase';
import { Group, Configurations } from '../types';
import Button from '../components/common/Button';
import { PlusIcon, EditIcon, DeleteIcon } from '../utils/icons';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { useGroup } from '../components/common/GroupContext';
import Swal from 'sweetalert2';
import { EditConfigurationModal } from '../components/common/EditConfigurationModal';

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
    const { fetchGroups, selectedGroup } = useGroup();
    type User = Database['public']['Tables']['profiles']['Row'];
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [newGroup, setNewGroup] = useState({
        id: '',
        name: '',
        description: '',
        imageFile: null as File | null,
        imagePreview: ''
    });
    const [groups, setGroups] = useState<Group[]>([]);
    const [configurations, setConfigurations] = useState<Configurations[]>([]);
    const [editingConfig, setEditingConfig] = useState<Configurations | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchGroupsCreated = async () => {
        const { data, error } = await groupsService.getCreatedBy();
        if (error) {
            console.error('Error fetching groups:', error);
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Error al cargar los grupos"
            });
        } else {
            setGroups(data || []);
        }
    };

    const handleCreateGroup = async (e: FormEvent) => {
        e.preventDefault();

        if (!newGroup.name.trim()) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "El nombre del grupo es requerido"
            });
            return;
        }

        const isEditing = !!newGroup.id;
        const loadingMessage = isEditing ? 'Actualizando grupo...' : 'Creando grupo...';
        const successMessage = isEditing ? 'Grupo actualizado exitosamente' : 'Grupo creado exitosamente';
        const errorMessage = isEditing ? 'Error al actualizar el grupo' : 'Error al crear el grupo';

        const loadingSwal = Swal.fire({
            title: loadingMessage,
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            let error;
            let imageUrl = null;

            // Subir imagen si existe
            if (newGroup.imageFile) {
                const uploadedImageUrl = await uploadImage(newGroup.imageFile, newGroup.name.trim(), isEditing);
                if (uploadedImageUrl) {
                    imageUrl = uploadedImageUrl;
                }
            }

            if (isEditing) {
                const result = await groupsService.update(newGroup.id, {
                    name: newGroup.name.trim(),
                    description: newGroup.description?.trim() || null,
                    image_url: imageUrl || undefined
                });
                error = result.error;
            } else {
                const result = await groupsService.create({
                    name: newGroup.name.trim(),
                    description: newGroup.description?.trim() || null,
                    image_url: imageUrl || null
                });
                error = result.error;
            }

            if (error) throw new Error(error.message || errorMessage);

            await loadingSwal.close();

            Swal.fire({
                icon: "success",
                title: "¡Éxito!",
                text: successMessage,
                timer: 2000,
                showConfirmButton: false
            });

            setShowGroupModal(false);
            setNewGroup({ id: '', name: '', description: '', imageFile: null, imagePreview: '' });
            fetchGroupsCreated();
        } catch (error) {
            console.error('Error:', error);
            await loadingSwal.close();

            Swal.fire({
                icon: "error",
                title: "Error",
                text: errorMessage,
                footer: error instanceof Error ? error.message : ''
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Validar tipo de archivo
            if (!file.type.match('image.*')) {
                Swal.fire({
                    icon: "error",
                    title: "Formato no soportado",
                    text: "Por favor, sube una imagen válida (JPEG, PNG, etc.)"
                });
                return;
            }

            // Validar tamaño (máximo 1MB)
            if (file.size > 1 * 1024 * 1024) {
                Swal.fire({
                    icon: "error",
                    title: "Archivo demasiado grande",
                    text: "La imagen no debe superar los 1MB"
                });
                return;
            }

            // Crear vista previa
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewGroup(prev => ({
                    ...prev,
                    imageFile: file,
                    imagePreview: reader.result as string
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async (file: File, groupName: string, isEditing: boolean): Promise<string | null> => {
        try {
            // Crear un nombre único para el archivo
            const fileExt = file.name.split('.').pop();
            const fileName = `avatar-${groupName}.${fileExt}`;
            const filePath = `group-avatars/${fileName}`;

            if (isEditing) {
                // Subir el archivo a Supabase Storage
                const { error: uploadError } = await groupsService.storageOverwritingLoadImg(file, filePath);

                if (uploadError) throw uploadError;
            } else {
                // Subir el archivo a Supabase Storage
                const { error: uploadError } = await groupsService.storageLoadImg(file, filePath);

                if (uploadError) throw uploadError;
            }

            // Obtener la URL pública
            const { data } = await groupsService.storageGetPublicUrl(filePath);
            if (!data) throw new Error('Error al obtener la URL pública');
            return data.publicUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            return null;
        }
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        if (!selectedGroup) return;

        try {
            const { data, error } = await userService.getAll(selectedGroup.id);
            if (error) throw error;
            if (!data) return;

            const [profileGroupsData, configurationsData] = await Promise.all([
                profileGroupService.getProfilesGroupsRoleByIds(data.map((user: User) => user.id), selectedGroup.id),
                configurationsService.getByGroupId(selectedGroup.id)
            ])
            //const { data: profileGroups, error: profileGroupsError } = await profileGroupService.getProfilesGroupsRoleByIds(data.map((user: User) => user.id), selectedGroup.id);
            if (profileGroupsData.error) throw profileGroupsData.error;
            if (!profileGroupsData.data) throw profileGroupsData.error;

            setUsers(profileGroupsData.data as User[]);
            setConfigurations(configurationsData.data as Configurations[]);
        } catch (error) {
            console.error("Error fetching users:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error as string || 'Error al cargar los usuarios',
                confirmButtonText: 'Aceptar'
            });
        } finally {
            setLoading(false);
        }
    }, [selectedGroup]);

    useEffect(() => {
        fetchUsers();
        fetchGroupsCreated();
    }, [fetchUsers]);

    const handleDelete = async (id: string | number, option: string) => {
        try {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `¿Deseas eliminar este ${option === 'group' ? 'grupo' : 'usuario'}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (!result.isConfirmed) return;

            if (option === 'group') {
                const { error } = await groupsService.delete(id);
                if (error) throw error;
                // Actualizar la lista de grupos después de eliminar
                await Promise.all([fetchGroupsCreated(), fetchGroups()]);
            } else if (option === 'staff') {
                if (!selectedGroup) return;
                // Obtenemos el id del profile_group
                const { data, error } = await profileGroupService.getByIdaGroup(id, selectedGroup.id);
                if (error) throw error;
                if (!data) throw error;
                const profileGroup = data[0];
                const { error: deleteError } = await profileGroupService.delete(profileGroup.id);
                if (deleteError) throw deleteError;
                // Actualizar la lista de usuarios si es necesario
                await Promise.all([fetchGroupsCreated(), fetchGroups()]);
            }

            await Swal.fire({
                title: "¡Éxito!",
                text: `${option === 'group' ? 'Grupo' : 'Usuario'} eliminado exitosamente`,
                icon: "success",
                confirmButtonText: 'Aceptar'
            });
        } catch (error) {
            console.error('Error deleting client:', error);
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: error as string || 'Error al eliminar el cliente',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const handleEdit = async (group: Group) => {
        try {
            setShowGroupModal(true);
            setNewGroup({ id: group.id, name: group.name, description: group.description || '', imagePreview: group.image_url || '' });

        } catch (error) {
            console.error('Error editing group:', error);
            await Swal.fire({
                icon: "error",
                title: "Error",
                text: error as string || 'Error al editar el grupo',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const handleUpdateConfig = async (id: number, data: Configurations) => {
        try {
            if (!selectedGroup) return;
            const { error } = await configurationsService.update(id, selectedGroup.id, data);
            if (error) throw error;

            // Update the local state
            setConfigurations(configs =>
                configs.map(config =>
                    config.id === id
                        ? { ...config, option_value: data.option_value }
                        : config
                )
            );

            Swal.fire({
                icon: 'success',
                title: '¡Configuración actualizada!',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            console.error('Error updating configuration:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar la configuración',
                confirmButtonText: 'Aceptar'
            });
            throw error; // Re-throw to handle in the modal
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Configuración</h1>
            </div>

            {/* Sección de Grupos */}
            <div className="bg-surface rounded-xl shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-xl font-semibold mb-4">Grupos</h2>
                    <Button
                        type="button"
                        onClick={() => setShowGroupModal(true)}
                        variant="primary"
                        className="flex items-center gap-2"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Nuevo Grupo
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group: Group) => (
                        <div key={group.id} className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    {group.image_url ? (
                                        <img
                                            src={group.image_url}
                                            alt={group.name}
                                            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                            {group.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-medium">{group.name}</h3>
                                        {group.description && (
                                            <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                                        )}
                                        <div className="text-xs text-gray-500 mt-2">
                                            Creado: {new Date(group.created_at || '').toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <Button
                                        type="button"
                                        onClick={() => handleEdit(group)}
                                        variant="primary"
                                        className="p-1 flex items-center justify-center"
                                        title="Editar grupo"
                                    >
                                        <EditIcon />
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() => handleDelete(group.id, 'group')}
                                        variant="danger"
                                        className="p-1 flex items-center justify-center"
                                        title="Eliminar grupo"
                                    >
                                        <DeleteIcon />
                                    </Button>
                                </div>
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
                    setNewGroup({ id: '', name: '', description: '', imageFile: null, imagePreview: '' });
                }}
                title={newGroup.id ? "Editar Grupo" : "Nuevo Grupo"}
            >
                <form onSubmit={(e: React.FormEvent) => handleCreateGroup(e)} className="space-y-4">
                    <Input
                        label="Nombre del Grupo"
                        value={newGroup.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewGroup({ ...newGroup, name: e.target.value })
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
                                setNewGroup({ ...newGroup, description: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                            placeholder="Descripción del grupo"
                        />
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Imagen del Grupo
                        </label>
                        <div className="mt-1 flex items-center">
                            <label
                                htmlFor="group-image"
                                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Seleccionar Imagen
                            </label>
                            <input
                                id="group-image"
                                name="group-image"
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={handleImageChange}
                            />
                            {newGroup.imagePreview ? (
                                <div className="ml-4 relative group">
                                    <img
                                        src={newGroup.imagePreview}
                                        alt="Vista previa"
                                        className="h-12 w-12 rounded-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setNewGroup(prev => ({ ...prev, imageFile: null, imagePreview: '' }));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Eliminar imagen"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <span className="ml-4 text-sm text-gray-500">
                                    {newGroup.imageFile ? newGroup.imageFile.name : 'Ninguna imagen seleccionada'}
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Tamaño máximo: 5MB. Formatos: JPG, PNG, GIF.
                        </p>
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
                            {newGroup.id ? "Actualizar Grupo" : "Crear Grupo"}
                        </Button>
                    </div>
                </form>
            </Modal>

            <div className="bg-surface rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4 border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-700">Gestión de Personal y Roles</h2>
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

                {loading ? <p>Seleccione un grupo para continuar...</p> : (
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
                                            <button className="text-primary-600 hover:text-primary-900 mr-4" onClick={() => navigate(`/settings/user/${user.id}`)}><EditIcon className="h-5 w-5" /></button>
                                            <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(user.id, 'staff')}><DeleteIcon className="h-5 w-5" /></button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-8 bg-surface rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Otras Configuraciones</h2>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-12 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-5">Opción</div>
                        <div className="col-span-5">Valor</div>
                        <div className="col-span-2 text-right">Acciones</div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {configurations.map((configuration) => (
                            <div key={configuration.id} className="grid grid-cols-12 items-center px-6 py-4 hover:bg-gray-50">
                                <div className="col-span-5">
                                    {configuration.description && (
                                        <div className="text-sm font-medium text-gray-900">
                                            {configuration.description}
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-5">
                                    <div className="text-sm text-gray-900">
                                        {configuration.option_value}
                                    </div>
                                </div>
                                <div className="col-span-2 flex justify-end space-x-2">
                                    <button
                                        className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                                        onClick={() => {
                                            setEditingConfig(configuration);
                                            setIsModalOpen(true);
                                        }}
                                        title="Editar"
                                    >
                                        <EditIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {configurations.length === 0 && (
                            <div className="px-6 py-8 text-center text-gray-500">
                                No hay configuraciones disponibles.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Configuration Modal */}
            <EditConfigurationModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingConfig(null);
                }}
                configuration={editingConfig}
                onSave={handleUpdateConfig}
            />
        </div>
    );
};

export default Settings;