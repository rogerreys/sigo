
import { WorkOrders } from "../../types";
import { clientService } from "../../services/supabase";
import Swal from 'sweetalert2';

interface NotificationEmailProps {
    order: WorkOrders;
    assignedTo: string;
}

export const sendNotification = async ({ order, assignedTo }: NotificationEmailProps) => {
    try {
        // Obtener datos del cliente
        const clientResponse = await clientService.getById(order.client_id);
        const clientData = clientResponse.data;

        if (!clientData) {
            throw new Error('No se encontraron datos del cliente');
        }

        // Preparar datos para el webhook
        const webhookData = {
            orden_id: order.id,
            numero_orden: order.id,
            cliente: `${clientData.first_name} ${clientData.last_name}`.trim(),
            telefono: clientData.phone || 'No especificado',
            correo: clientData.email || 'No especificado',
            automovil: [order.vehicle_make, order.vehicle_model, order.vehicle_year]
                .filter(Boolean)
                .join(' '),
            tecnico: assignedTo || 'No asignado',
            tipo_servicio: order.problem_description || 'Sin descripción',
            fecha_terminacion: new Date().toISOString(),
            total: order.total || 0
        };

        // Configuración del tiempo de espera para la petición (5 segundos)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(process.env.WEBHOOK_NOTIFICATION_EMAIL || '', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webhookData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Try to parse as JSON, fallback to text if it fails
            let responseData;
            const responseText = await response.text();

            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                // If it's not valid JSON, use the text response as is
                responseData = responseText;
            }

            Swal.fire({
                title: 'Éxito',
                text: 'Se ha enviado la notificación correctamente',
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#52c41a'
            });

            console.log('Notificación enviada:', responseData);
            return responseData;

        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }

    } catch (error) {
        console.error('Error en sendNotification:', error);

        const errorMessage = error instanceof Error ? error.message : 'Error desconocido al enviar la notificación';

        await Swal.fire({
            title: 'Error',
            text: `No se pudo enviar la notificación: ${errorMessage}`,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ff4d4f'
        });

        throw error;
    }
};

export default sendNotification;