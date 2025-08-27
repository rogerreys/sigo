import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WorkOrders, WorkOrderItems, Product } from '../types';

export const generateWorkOrderPDF = (workOrder: WorkOrders, workOrderItems: WorkOrderItems[], productsItems: Product[], clientName: string, assignedToName: string) => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Orden de Trabajo', 14, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('SIGVS - Sistema de Gestión de Ventas y Servicios', 14, 30);

    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);

    // Order Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° Orden: ${workOrder.id}`, 14, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date(workOrder.created_at!).toLocaleDateString()}`, 130, 45);
    doc.text(`Estado: ${workOrder.status}`, 130, 52);

    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', 14, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(clientName || 'N/A', 16, 62);

    doc.setFont('helvetica', 'bold');
    doc.text('Asignado a:', 14, 72);
    doc.setFont('helvetica', 'normal');
    doc.text(assignedToName || 'N/A', 16, 79);

    doc.line(14, 85, 196, 85);

    // Description
    doc.setFont('helvetica', 'bold');
    doc.text('Descripción del Trabajo:', 14, 95);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(workOrder.problem_description, 180);
    doc.text(descriptionLines, 14, 102);

    let startY = 102 + (descriptionLines.length * 5) + 5;

    for (let item of workOrderItems) {
        // Services Table
        if (item.service_description && item.service_price) {
            autoTable(doc, {
                startY: startY,
                head: [['Servicios', 'Precio']],
                body: [[item.service_description, `$${item.service_price.toFixed(2)}`]],
                theme: 'striped',
                headStyles: { fillColor: '#1d4ed8' }, // primary-700
            });
            startY = (doc as any).lastAutoTable.finalY + 10;
        }

        // Items/Products Table
        if (item.product_id && item.product_quantity && item.product_unit_price) {
            autoTable(doc, {
                startY: startY,
                head: [['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal']],
                body: [[
                    productsItems.find(p => p.id === item.product_id)?.name || 'Producto no encontrado',
                    item.product_quantity,
                    `$${item.product_unit_price.toFixed(2)}`,
                    `$${(item.product_quantity * item.product_unit_price!).toFixed(2)}`
                ]],
                theme: 'striped',
                headStyles: { fillColor: '#1d4ed8' }, // primary-700
                didDrawPage: (data) => {
                    startY = data.cursor?.y ?? startY;
                }
            });
            startY = (doc as any).lastAutoTable.finalY;
        }
    }


    // Total
    const totalY = startY + 15 > 270 ? 20 : startY + 15; // check if new page is needed for total
    if (totalY === 20) {
        doc.addPage();
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${workOrder.total?.toFixed(2) || '0.00'}`, 140, totalY, { align: 'left' });


    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.width / 2, 287, { align: 'center' });
    }

    doc.save(`OT-${workOrder.id}.pdf`);
};