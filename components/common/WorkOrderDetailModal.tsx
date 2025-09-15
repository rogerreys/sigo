import React, { useState, useEffect } from 'react';
import { WorkOrders, WorkOrderItems, Product, WorkOrderStatus, WorkOrderStatusFront } from '../../types';
import Button from '../common/Button';
import { MdWorkOrderIcon } from "../../utils/icons";
import { workOrderItemService, productService, clientService } from '../../services/supabase';
import { useGroup } from '../common/GroupContext';
import Swal from 'sweetalert2';
import { generateWorkOrderPDF } from '../../utils/pdfGenerator';
import { DocumentPDF, LoadingSpinner } from '../../utils/icons';

interface WorkOrderDetailModalProps {
    order: WorkOrders | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedOrder: WorkOrders) => Promise<void>;
    isLoading: boolean;
}

const WorkOrderDetailModal: React.FC<WorkOrderDetailModalProps> = ({ order, isOpen, onClose, onSave, isLoading, client_name, assignedTo }) => {
    const [editableOrder, setEditableOrder] = useState<WorkOrders | null>(null);
    const [workOrderItems, setWorkOrderItems] = useState<WorkOrderItems[]>([]);
    const [productsItems, setProductsItems] = useState<Product[]>([]);
    const [isDisabledByStatus, setisDisabledByStatus] = useState(false);
    const { selectedGroup, canEdit } = useGroup();
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
    const [hidePrices, setHidePrices] = useState(false);

    const fetchWorkOrderItems = async (order: WorkOrders) => {
        if (!selectedGroup) return;
        try {
            const [workitems, products] = await Promise.all([
                workOrderItemService.getItems(order?.work_order_items_id || '', selectedGroup.id),
                productService.getAll(selectedGroup.id)
            ]);
            if (workitems.data) setWorkOrderItems(workitems.data as WorkOrderItems[] || []);
            if (products.data) setProductsItems(products.data as Product[] || []);
        } catch (error) {
            console.error('Error fetching work order items:', error);
        }
    };

    useEffect(() => {
        if (order) {
            setEditableOrder({ ...order });
            if (order.status === WorkOrderStatus.Completed || order.status === WorkOrderStatus.Billed) {
                setisDisabledByStatus(true);
            }
            fetchWorkOrderItems(order);
        }
    }, [order]);

    const handleGeneratePdf = async (workOrder: WorkOrders) => {
        setGeneratingPdfId(workOrder.id || '');
        try {
            // Give a moment for the UI to update to the loading state
            await new Promise(resolve => setTimeout(resolve, 50));
            generateWorkOrderPDF(workOrder, workOrderItems, productsItems, client_name, assignedTo, selectedGroup?.image_url || '', hidePrices);
        } catch (error) {
            console.error("Error generating PDF:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error as string || 'Error al generar el PDF',
                confirmButtonText: 'Aceptar'
            });
        } finally {
            setGeneratingPdfId(null);
        }
    };

    if (!isOpen || !editableOrder) return null;

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;

        if (Object.values(WorkOrderStatusFront).includes(value as WorkOrderStatusFront)) {
            const statusKey = Object.entries(WorkOrderStatusFront)
                .find(([key, val]) => val === value)?.[0] as keyof typeof WorkOrderStatusFront;

            setEditableOrder(prev => prev ? { ...prev, status: statusKey as WorkOrderStatus } : null);
        }
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditableOrder(prev => prev ? { ...prev, description: e.target.value } : null);
    }

    const handleSaveClick = () => {
        if (editableOrder) {
            onSave(editableOrder);
        }
    };

    const formatCurrency = (amount?: number) => `$${(amount || 0).toFixed(2)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true">
            <div className="bg-surface rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
                <style>{`
                    @keyframes fade-in-scale {
                        0% { opacity: 0; transform: scale(0.95); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    .animate-fade-in-scale {
                        animation: fade-in-scale 0.3s forwards ease-out;
                    }
                `}</style>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-800">
                        Orden de Trabajo: <span className="text-primary-600">{editableOrder.work_order_number}</span>
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                        <MdWorkOrderIcon className="h-6 w-6 text-gray-600" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Cliente</label>
                                <p className="text-lg font-semibold text-gray-900">{client_name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Asignado a</label>
                                <p className="text-base text-gray-800">{assignedTo}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Fecha de Creación</label>
                                <p className="text-base text-gray-800">{editableOrder.created_at?.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                            <div>
                                <label htmlFor="status" className="text-sm font-medium text-gray-500 block mb-1">Estado</label>
                                <select
                                    id="status"
                                    value={WorkOrderStatusFront[editableOrder.status]}
                                    onChange={handleStatusChange}
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                    disabled={isDisabledByStatus}
                                >
                                    {Object.values(WorkOrderStatusFront).map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="description" className="text-sm font-medium text-gray-500 block mb-1">Descripción</label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    value={editableOrder.diagnostic_notes}
                                    onChange={handleDescriptionChange}
                                    disabled={isDisabledByStatus}
                                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">Servicios</h3>
                            {

                                workOrderItems.length > 0 ? (
                                    <ul className="space-y-2">
                                        {workOrderItems.map(orderItem => (
                                            orderItem.service_price !== null && orderItem.service_price !== undefined && (
                                                <li key={orderItem.id} className="flex justify-between items-center text-sm p-2 bg-white border rounded-md">
                                                    <span>{orderItem.service_description}</span>
                                                    <span className="font-medium">{formatCurrency(orderItem.service_price)}</span>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                ) : <p className="text-sm text-gray-500 p-2">No hay servicios asociados.</p>
                            }
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2 border-b pb-2">Repuestos / Items</h3>
                            {workOrderItems.length > 0 ? (
                                <ul className="space-y-2">
                                    {workOrderItems.map((item, index) => (
                                        item.product_quantity !== null && item.product_quantity !== undefined && item.product_unit_price !== null && item.product_unit_price !== undefined && (
                                            <li key={`${item.product_id}-${index}`} className="flex justify-between items-center text-sm p-2 bg-white border rounded-md">
                                                <span>{item.product_quantity} x {productsItems.find(p => p.id === item.product_id)?.name}</span>
                                                <span className="font-medium">{formatCurrency(item.product_quantity * item.product_unit_price)}</span>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-gray-500 p-2">No hay repuestos asociados.</p>}
                        </div>
                    </div>

                    {!hidePrices && <div className="mt-6 pt-4 border-t text-right">
                        <p className="text-lg font-semibold text-gray-600">Subtotal</p>
                        <p className="text-3xl font-bold text-gray-800">{formatCurrency(editableOrder.grand_total)}</p>

                        <p className="text-lg font-semibold text-gray-600">Total (IVA {editableOrder.tax_rate}% incluido)</p>
                        <p className="text-3xl font-bold text-gray-800">{formatCurrency(editableOrder.total)}</p>
                    </div>}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => handleGeneratePdf(editableOrder)}
                            disabled={generatingPdfId === editableOrder.id}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {generatingPdfId === editableOrder.id ? (
                                <>
                                    <LoadingSpinner className="h-4 w-4 mr-2" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <DocumentPDF className="h-4 w-4 mr-2" />
                                    Generar PDF
                                </>
                            )}
                        </Button>
                    </div>
                    
                    <div className="flex items-center">
                        <div className="flex items-center h-5">
                            <input
                                id="hide-prices"
                                name="hide-prices"
                                type="checkbox"
                                checked={hidePrices}
                                onChange={(e) => setHidePrices(e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                        </div>
                        <label htmlFor="hide-prices" className="ml-2 block text-sm text-gray-700">
                            Ocultar precios en PDF
                        </label>
                    </div>
                </div>

                <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <div />
                    <div className="flex items-center">
                        <Button variant="secondary" onClick={onClose} className="mr-4" disabled={isLoading}>
                            Cancelar
                        </Button>
                        {!isDisabledByStatus && canEdit() && (
                            <Button onClick={handleSaveClick} isLoading={isLoading}>
                                Guardar Cambios
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkOrderDetailModal;
