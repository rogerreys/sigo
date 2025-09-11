import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WorkOrders, WorkOrderItems, Product } from '../types';
import { TbBackground } from 'react-icons/tb';

interface PDFConfig {
    colors: {
        primary: string;
        secondary: string;
        text: string;
        lightGray: string;
    };
    fonts: {
        title: number;
        subtitle: number;
        normal: number;
        small: number;
    };
    margins: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
}

const PDF_CONFIG: PDFConfig = {
    colors: {
        primary: '#1d4ed8',
        secondary: '#64748b',
        text: '#1f2937',
        lightGray: '#f3f4f6'
    },
    fonts: {
        title: 20,
        subtitle: 14,
        normal: 11,
        small: 9
    },
    margins: {
        left: 14,
        right: 14,
        top: 20,
        bottom: 20
    }
};

export const generateWorkOrderPDF = (
    workOrder: WorkOrders,
    workOrderItems: WorkOrderItems[],
    productsItems: Product[],
    clientName: string,
    assignedToName: string,
    groupImage: string
) => {
    const doc = new jsPDF();
    const { colors, fonts, margins } = PDF_CONFIG;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const contentWidth = pageWidth - margins.left - margins.right;

    let currentY = margins.top;

    // Create table data
    const signatureData = {
        headers: [
            {
                content: ''
            },
            {
                content: ''
            },
            {
                content: ''
            }
        ],
        rows: [
            // Client info row
            [
                {
                    content: `Nombre del Cliente:\n${clientName || '___________________'}`,
                    styles: {
                        fontStyle: 'bold',
                        minCellHeight: 30,
                        valign: 'middle'
                    }
                },
                {
                    content: '\n\n___________________\nFirma del Cliente',
                    styles: {
                        minCellHeight: 40,
                        valign: 'bottom',
                        halign: 'center'
                    }
                },
                {
                    content: '\n\n___________________\nFirma Autorizada',
                    styles: {
                        minCellHeight: 40,
                        valign: 'bottom',
                        halign: 'center'
                    }
                }
            ]
        ]
    };

    // Helper functions
    const addLine = (y: number, color: string = colors.secondary) => {
        doc.setDrawColor(color);
        doc.setLineWidth(0.5);
        doc.line(margins.left, y, pageWidth - margins.right, y);
    };

    const checkPageBreak = (neededHeight: number) => {
        if (currentY + neededHeight > pageHeight - margins.bottom) {
            doc.addPage();
            currentY = margins.top;
            return true;
        }
        return false;
    };

    const formatCurrency = (value: number | null | undefined): string =>
        `$${(value || 0).toFixed(2)}`;

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Header Section
    const renderHeader = () => {
        // Add group image in the top right corner if provided
        if (groupImage) {
            try {
                const maxWidth = 60; // Maximum width for the image
                const maxHeight = 35; // Maximum height for the image

                // Create a temporary image to get dimensions
                const img = new Image();
                img.src = groupImage;

                // Calculate aspect ratio
                const aspectRatio = img.width / img.height;

                // Calculate dimensions maintaining aspect ratio
                let width = maxWidth;
                let height = width / aspectRatio;

                // If height is too large, recalculate based on maxHeight
                if (height > maxHeight) {
                    height = maxHeight;
                    width = height * aspectRatio;
                }

                // Position the image
                const imgX = pageWidth - margins.right - width - 1; // 5px from right margin
                const imgY = margins.top - (margins.top * 0.9);

                doc.addImage(groupImage, 'JPEG', imgX, imgY, width, height);
            } catch (error) {
                console.error('Error loading group image:', error);
            }
        }

        doc.setFontSize(fonts.title);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.primary);
        doc.text('ORDEN DE TRABAJO', margins.left, currentY);

        currentY += 8;
        doc.setFontSize(fonts.small);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.secondary);
        doc.text('SIGO - Sistema Integrado de Gestión de Operaciones', margins.left, currentY);

        currentY += 10;
        addLine(currentY);
        currentY += 15;
    };

    // Work Order Info Section
    const renderWorkOrderInfo = () => {
        const infoData = [
            ['N° Orden:', workOrder.id || 'N/A'],
            ['Fecha Entrega:', formatDate(workOrder.completed_at)],
            ['Estado:', workOrder.status || 'N/A'],
            ['Cliente:', clientName || 'N/A'],
            ['Técnico Asignado:', assignedToName || 'N/A']
        ];

        doc.setFontSize(fonts.normal);

        infoData.forEach(([label, value], index) => {
            const isEven = index % 2 === 0;
            const xPos = isEven ? margins.left : pageWidth / 2 + 10;

            if (isEven && index > 0) currentY += 7;

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.text);
            doc.text(label, xPos, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(colors.secondary);
            const valueText = doc.splitTextToSize(value, contentWidth / 2 - 30);
            doc.text(valueText, xPos + 35, currentY);
        });

        currentY += 15;
        addLine(currentY);
        currentY += 15;
    };

    // Vehicle Info and Problem Description in two columns
    const renderVehicleAndProblemSections = () => {
        const hasVehicleInfo = workOrder.vehicle_make || workOrder.vehicle_model || workOrder.vehicle_year;
        const hasProblemDescription = workOrder.problem_description;

        if (!hasVehicleInfo && !hasProblemDescription) {
            return;
        }

        checkPageBreak(60);

        const columnWidth = (contentWidth - 10) / 2; // 10px gap between columns
        const leftColumnX = margins.left;
        const rightColumnX = margins.left + columnWidth + 10;
        const startY = currentY;

        let leftColumnY = startY;
        let rightColumnY = startY;

        // Left Column - Vehicle Information
        if (hasVehicleInfo) {
            doc.setFontSize(fonts.subtitle);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.primary);
            doc.text('INFORMACIÓN DEL VEHÍCULO', leftColumnX, leftColumnY);
            leftColumnY += 10;

            const vehicleInfo = [
                `${workOrder.vehicle_year || ''} ${workOrder.vehicle_make || ''} ${workOrder.vehicle_model || ''}`.trim(),
                workOrder.odometer_reading ? `Kilometraje: ${workOrder.odometer_reading.toLocaleString()} km` : ''
            ].filter(info => info);

            doc.setFontSize(fonts.normal);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(colors.text);

            vehicleInfo.forEach(info => {
                const infoLines = doc.splitTextToSize(info, columnWidth);
                doc.text(infoLines, leftColumnX, leftColumnY);
                leftColumnY += (infoLines.length * 6);
            });
        }

        // Right Column - Problem Description
        if (hasProblemDescription) {
            doc.setFontSize(fonts.subtitle);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.primary);
            doc.text('DESCRIPCIÓN DEL PROBLEMA', rightColumnX, rightColumnY);
            rightColumnY += 10;

            doc.setFontSize(fonts.normal);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(colors.text);
            const descriptionLines = doc.splitTextToSize(workOrder.problem_description, columnWidth);
            doc.text(descriptionLines, rightColumnX, rightColumnY);
            rightColumnY += (descriptionLines.length * 5);
        }

        // Update currentY to the maximum of both columns
        currentY = Math.max(leftColumnY, rightColumnY) + 15;
    };

    // Services and Products Tables
    const renderItemsTables = () => {
        // Group items by type
        const services = workOrderItems.filter(item =>
            item.service_description && item.service_price
        );
        const products = workOrderItems.filter(item =>
            item.product_id && item.product_quantity && item.product_unit_price
        );

        // Render Services Table
        if (services.length > 0) {
            checkPageBreak(60);

            const servicesData = services.map(service => [
                service.service_description || '',
                formatCurrency(service.service_price)
            ]);

            autoTable(doc, {
                startY: currentY,
                head: [['SERVICIOS REALIZADOS', 'PRECIO']],
                body: servicesData,
                theme: 'striped',
                headStyles: {
                    fillColor: colors.primary,
                    textColor: 255,
                    fontSize: fonts.normal,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: fonts.normal,
                    textColor: colors.text
                },
                alternateRowStyles: {
                    fillColor: colors.lightGray
                },
                margin: { left: margins.left, right: margins.right },
                tableWidth: 'auto'
            });

            currentY = (doc as any).lastAutoTable.finalY + 15;
        }

        // Render Products Table
        if (products.length > 0) {
            checkPageBreak(60);

            const productsData = products.map(item => {
                const product = productsItems.find(p => p.id === item.product_id);
                const subtotal = (item.product_quantity || 0) * (item.product_unit_price || 0);

                return [
                    product?.name || 'Producto no encontrado',
                    item.product_quantity?.toString() || '0',
                    formatCurrency(item.product_unit_price),
                    formatCurrency(subtotal)
                ];
            });

            autoTable(doc, {
                startY: currentY,
                head: [['REPUESTOS Y MATERIALES', 'CANT.', 'PRECIO UNIT.', 'SUBTOTAL']],
                body: productsData,
                theme: 'striped',
                headStyles: {
                    fillColor: colors.primary,
                    textColor: 255,
                    fontSize: fonts.normal,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: fonts.normal,
                    textColor: colors.text
                },
                alternateRowStyles: {
                    fillColor: colors.lightGray
                },
                margin: { left: margins.left, right: margins.right },
                columnStyles: {
                    1: { halign: 'center' },
                    2: { halign: 'right' },
                    3: { halign: 'right' }
                }
            });

            currentY = (doc as any).lastAutoTable.finalY + 15;
        }
    };

    // Totals Section
    const renderTotals = () => {
        checkPageBreak(50);

        const totalsY = currentY;
        const rightAlign = pageWidth - margins.right - 60;

        // Calculate totals
        const subtotal = workOrder.grand_total || 0;
        const taxRate = workOrder.tax_rate || 0;
        const taxAmount = workOrder.tax_amount || (subtotal * taxRate);
        const total = workOrder.total || (subtotal + taxAmount);

        // Totals box background
        doc.setFillColor(colors.lightGray);
        doc.rect(rightAlign - 10, totalsY - 5, 70, 35, 'F');

        doc.setFontSize(fonts.normal);

        doc.setTextColor(colors.text);

        // Subtotal
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', rightAlign, totalsY + 5);
        doc.text(formatCurrency(subtotal), rightAlign + 45, totalsY + 5, { align: 'right' });

        // Tax
        doc.text(`IVA (${(taxRate * 100).toFixed(0)}%):`, rightAlign, totalsY + 12);
        doc.text(formatCurrency(taxAmount), rightAlign + 45, totalsY + 12, { align: 'right' });

        // Total
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fonts.subtitle);
        doc.text('TOTAL:', rightAlign, totalsY + 22);
        doc.text(formatCurrency(total), rightAlign + 45, totalsY + 22, { align: 'right' });

        currentY = totalsY + 40;

        // Add signature section as a borderless table
        const signatureY = currentY;
        const tableX = margins.left;
        const tableWidth = pageWidth - margins.left - margins.right;
        // Update the autoTable configuration at line 393
        (doc as any).autoTable({
            startY: signatureY,
            head: [signatureData.headers.map(h => h.content)],
            body: signatureData.rows.map(row => row.map(cell => cell.content)),
            margin: { left: tableX, right: margins.right },
            tableWidth: tableWidth,
            styles: {
                lineWidth: 0.1,
                lineColor: [255, 255, 255], // Invisible border
                textColor: colors.text,
                fontSize: fonts.small,
                cellPadding: 5,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle',
                fillColor: [5, 255, 255], // Add this line for white background
                fillStyle: 'F' // Add this to ensure the fill is applied
            },
            headStyles: {
                fillColor: [255, 255, 255], // Transparent background
                textColor: colors.primary,
                fontStyle: 'bold',
                lineWidth: 0,
                cellPadding: { top: 0, right: 5, bottom: 0, left: 5 }
            },
            bodyStyles: {
                fillColor: [255, 255, 255], // Transparent background
                lineWidth: 0,
                cellPadding: { top: 0, right: 5, bottom: 0, left: 5 }
            },
            columnStyles: {
                0: {
                    cellWidth: '40%',
                    halign: 'left',
                    valign: 'middle'
                },
                1: {
                    cellWidth: '30%',
                    halign: 'center',
                    valign: 'bottom'
                },
                2: {
                    cellWidth: '30%',
                    halign: 'center',
                    valign: 'bottom'
                }
            },
            didParseCell: (data: any) => {
                // Apply custom styles to header cells
                if (data.section === 'head') {
                    const header = signatureData.headers[data.column.index];
                    if (header.styles) {
                        data.cell.styles = {
                            ...data.cell.styles,
                            ...header.styles
                        };
                    }
                }
                // Apply custom styles to body cells
                if (data.section === 'body' && signatureData.rows[data.row.index]) {
                    const cell = signatureData.rows[data.row.index][data.column.index];
                    if (cell && cell.styles) {
                        data.cell.styles = {
                            ...data.cell.styles,
                            ...cell.styles
                        };
                    }
                }
            }
        });

        // Update currentY based on the table height
        currentY = (doc as any).lastAutoTable.finalY + 10;


    };

    // Footer
    const renderFooter = () => {
        const pageCount = (doc as any).internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Page number
            doc.setFontSize(fonts.small);
            doc.setTextColor(colors.secondary);
            doc.text(
                `Página ${i} de ${pageCount}`,
                pageWidth / 2,
                pageHeight - 10,
                { align: 'center' }
            );

            // Company info
            doc.text(
                'SIGO - Sistema Integrado de Gestión de Operaciones',
                margins.left,
                pageHeight - 10
            );

            // Generation date
            doc.text(
                `Generado: ${new Date().toLocaleDateString('es-ES')}`,
                pageWidth - margins.right,
                pageHeight - 10,
                { align: 'right' }
            );
        }
    };

    // Generate PDF
    try {
        renderHeader();
        renderWorkOrderInfo();
        renderVehicleAndProblemSections(); // Nueva función combinada
        renderItemsTables();
        renderTotals();
        renderFooter();

        // Generate filename
        const orderNumber = workOrder.id?.slice(-8) || 'unknown';
        const clientSlug = clientName.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 20);

        const filename = `OT-${orderNumber}-${clientSlug}.pdf`;
        doc.save(filename);

    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Error al generar el PDF de la orden de trabajo');
    }
};