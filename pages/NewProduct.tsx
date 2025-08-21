import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { ArrowLeftIcon, InformationCircleIcon } from '../utils/icons';
import { useParams } from 'react-router-dom';
import GroupGuard from '@/components/common/GroupGuard';
import { useGroup } from '../components/common/GroupContext';
import { Product } from '../types';

const NewProduct: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { selectedGroup } = useGroup();

    const [formData, setFormData] = useState<Omit<Product, 'id' | 'group_id' | 'user_id' | 'created_at' | 'updated_at'>>({
        name: '',
        description: '',
        sku: '',
        category: '',
        price: 0,
        cost: 0,
        stock_quantity: 0,
        min_stock_level: 0,
        is_service: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            if (!selectedGroup) return;
            const { data, error } = await productService.getById([id], selectedGroup.id);
            if (error) throw error;
            if (!data || !data.length) return;
            setFormData(data[0] as Product );
        };
        fetchProduct();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        
        setFormData(prev => {
            if (type === 'checkbox') {
                return { ...prev, [name]: (e.target as HTMLInputElement).checked };
            }
            
            // Convert numeric fields to numbers
            if (['price', 'cost', 'stock_quantity', 'min_stock_level'].includes(name)) {
                const numValue = parseFloat(value) || 0;
                return { ...prev, [name]: numValue };
            }
            
            return { ...prev, [name]: value };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError('No hay un usuario autenticado');
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');

            if (!selectedGroup) {
                setError('No hay un grupo seleccionado');
                return;
            }

            const productData = {
                ...formData,
                price: formData.price || 0,
                cost: formData.cost || 0,
                stock_quantity: formData.is_service ? null : formData.stock_quantity,
                min_stock_level: formData.is_service ? null : formData.min_stock_level,
                user_id: user.id,
                group_id: selectedGroup.id
            };
            if (id) {
                const { error } = await productService.update(id, productData, selectedGroup.id);
                if (error) throw error;
            } else {
                const { error } = await productService.create(productData, selectedGroup.id);
                if (error) throw error;
            }

            navigate('/inventory');
        } catch (err) {
            console.error('Error creating product:', err);
            setError('Error al crear el producto. Por favor, intente de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <GroupGuard>
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-4 p-2 rounded-full hover:bg-gray-100"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Nuevo Producto</h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow rounded-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        SKU
                                    </label>
                                    <div className="group relative">
                                        <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-help" />
                                        <div className="absolute z-10 hidden group-hover:block w-64 p-2 -ml-2 mt-1 text-xs text-gray-600 bg-white border border-gray-200 rounded shadow-lg">
                                            El SKU (Stock Keeping Unit) es un identificador único para cada producto.
                                            Ejemplo: "CAM-ROJ-M" para una camiseta roja talla mediana.
                                        </div>
                                    </div>
                                </div>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Categoría
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Precio de venta <span className="text-red-500">*</span>
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                        className="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Costo
                                </label>
                                <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="cost"
                                        value={formData.cost}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        className="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_service"
                                        checked={formData.is_service}
                                        onChange={handleChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">¿Es un servicio?</span>
                                </label>
                            </div>

                            {!formData.is_service && (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Cantidad en inventario
                                        </label>
                                        <input
                                            type="number"
                                            name="stock_quantity"
                                            value={formData.stock_quantity}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Nivel mínimo de inventario
                                        </label>
                                        <input
                                            type="number"
                                            name="min_stock_level"
                                            value={formData.min_stock_level}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="md:col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Descripción
                                </label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancelar
                            </button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2"
                            >
                                {isSubmitting ? 'Guardando...' : id ? 'Actualizar Producto' : 'Guardar Producto'}
                            </Button>
                        </div>
                    </form>
                </div>
            </GroupGuard>
        </div>
    );
};

export default NewProduct;
