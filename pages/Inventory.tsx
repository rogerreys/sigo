import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Database } from '../types/supabase';
import Button from '../components/common/Button';
import { PlusIcon, SearchIcon, EditIcon, DeleteIcon } from '../utils/icons';
import { productService } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useGroup } from '../components/common/GroupContext';
import GroupGuard from '../components/common/GroupGuard';
import Swal from 'sweetalert2';

const Inventory: React.FC = () => {
    type Product = Database['public']['Tables']['products']['Row'];
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { selectedGroup, canEdit, canDelete } = useGroup();
    
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        if (!selectedGroup) return;
        const { data, error } = await productService.getAll(selectedGroup.id);
        if (error) {
            console.error('Error fetching products:', error);
        } else if (data) {
            setProducts(data as Product[]);
        }
        setLoading(false);
    }, [selectedGroup]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = useMemo(() => {
        return products.filter((product: Product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const getStockClass = (stock: number, minStock: number) => {
        if (stock === 0) return 'text-red-600 font-bold bg-red-100';
        if (stock <= minStock) return 'text-yellow-600 font-bold bg-yellow-100';
        return 'text-green-600 bg-green-100';
    };

    const handleDelete = async (id: string) => {
        setLoading(true);
        try {
            Swal.fire({
                title: '¿Estás seguro?',
                text: 'Esta acción no se puede deshacer.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    if (!selectedGroup) return;
                    const { error } = await productService.delete(id, selectedGroup.id);
                    if (error) throw error;
                    fetchProducts();
                }
            });
        } catch (error) {
            console.error(error);
            Swal.fire({
                title: 'Error',
                text: 'Error deleting product',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <GroupGuard>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Control de Inventario</h1>
                    {canEdit() && (
                        <Button icon={<PlusIcon className="h-5 w-5" />} onClick={() => navigate('/inventory/new')}>
                            Nuevo Producto
                        </Button>
                    )}
                </div>

                <div className="bg-surface rounded-xl shadow-lg p-6">
                    <div className="flex items-center mb-4">
                        <div className="relative w-full max-w-xs">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full bg-gray-50 border border-gray-300 rounded-md py-2 pl-10 pr-4 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <p>Cargando productos...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.map((product: Product) => (
                                        <tr key={product.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.description}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockClass(product.stock_quantity, product.min_stock_level)}`}>
                                                    {product.stock_quantity} / {product.min_stock_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    {canEdit() && (
                                                        <button
                                                            onClick={() => navigate(`/inventory/new/${product.id}`)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <EditIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                    {canDelete() && (
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <DeleteIcon className="h-5 w-5" />
                                                        </button>
                                                    )}
                                                </div>
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

export default Inventory;
