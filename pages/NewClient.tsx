import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../services/supabase';
import Button from '../components/common/Button';
import { useParams } from 'react-router-dom';
import { useGroup } from '../components/common/GroupContext';
import GroupGuard from '@/components/common/GroupGuard';
import { Client } from '../types';
import Swal from 'sweetalert2';

const defaultClient: Client = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    group_id: '',
    subtype: 'P' // Default to 'P' for individual
};

const NewClient: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState<Client>({ ...defaultClient });
    const { selectedGroup } = useGroup();

    useEffect(() => {
        if (id) {
            const fetchClient = async () => {
                const { data, error } = await clientService.getById(id);
                if (error) throw error;
                setFormData(data as Client);
            };
            fetchClient();
        }
    }, [id]);

    const handleClientTypeChange = (type: 'C' | 'P') => {
        setFormData(prev => ({
            ...prev,
            subtype: type,
            // Reset name fields when changing type
            first_name: '',
            last_name: ''
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!selectedGroup) throw new Error('No se seleccionó un grupo');
            if (id) {
                const { error } = await clientService.update(id, formData, selectedGroup.id);
                if (error) throw error;
            } else {
                const { error } = await clientService.create(formData, selectedGroup.id);
                if (error) throw error;
            }
            await Swal.fire({
                title: '¡Éxito!',
                text: id ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
            navigate('/clients');
        } catch (err: any) {
            setError(err.message || 'Error al crear el cliente');
            await Swal.fire({
                title: '¡Error!',
                text: 'Error al crear el cliente. Por favor intenta de nuevo.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        } finally {
            setLoading(false);
        }
    };

    // Determine field labels based on client type
    const firstNameLabel = formData.subtype === 'C' ? 'Nombre de la Empresa' : 'Nombre';
    const lastNameLabel = formData.subtype === 'C' ? 'Nombre del Contacto' : 'Apellido';

    return (
        <div className="max-w-4xl mx-auto p-6">
            <GroupGuard>
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                    >
                        {/*<ArrowLeftIcon className="h-5 w-5 text-gray-600" />*/}
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Nuevo Cliente</h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client Type and Registration Date - Two Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Client Type Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Cliente
                            </label>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleClientTypeChange('P')}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${formData.subtype === 'P'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Persona
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleClientTypeChange('C')}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${formData.subtype === 'C'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Empresa
                                </button>
                            </div>
                        </div>

                        {/* Registration Date */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha de Registro
                            </label>
                            <div className="relative">
                                <div className="flex items-center h-10 px-3 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm">
                                    {new Date().toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                            <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                                {firstNameLabel} *
                            </label>
                            <input
                                type="text"
                                name="first_name"
                                id="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                                {lastNameLabel} *
                            </label>
                            <input
                                type="text"
                                name="last_name"
                                id="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Correo Electrónico *
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            maxLength={10}
                            minLength={10}
                            required
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dirección
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ciudad
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código Postal
                        </label>
                        <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observaciones
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => navigate('/clients')}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Cancelar
                        </button>
                        <Button
                            type="submit"
                            className="px-4 py-2"
                            isLoading={loading}
                        >
                            {id ? 'Actualizar' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </GroupGuard>
        </div>
    );
};

export default NewClient;