import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, PhoneIcon, MapPinIcon, HomeIcon } from '../utils/icons';
import Swal from 'sweetalert2';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHomeText, setShowHomeText] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Here you would typically send the form data to your backend
            console.log('Form submitted:', formData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            Swal.fire({
                icon: 'success',
                title: 'Gracias por tu mensaje!',
                text: 'Nos pondremos en contacto contigo pronto.',
            });
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar el mensaje',
                text: 'Por favor, inténtalo de nuevo.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Home Button */}
            <div
                className="absolute top-4 left-4 flex items-center space-x-2 cursor-pointer"
                onMouseEnter={() => setShowHomeText(true)}
                onMouseLeave={() => setShowHomeText(false)}
                onClick={() => navigate('/dashboard')}
            >
                {showHomeText && (
                    <span className="bg-white bg-opacity-80 text-gray-700 text-sm font-medium px-3 py-1 rounded-full transition-all duration-300">
                        Home
                    </span>
                )}
                <button
                    className="p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-300 text-gray-700 shadow-md"
                    title="Volver al inicio"
                >
                    <HomeIcon className="w-5 h-5" />
                </button>
            </div>
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Contáctanos</h1>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Información de contacto</h2>
                            <p className="mb-6 text-gray-600">
                                ¿Necesitas ayuda o tienes alguna pregunta? No dudes en contactarnos.
                            </p>

                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <MailIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-gray-900">Correo electrónico de soporte</h3>
                                        <a
                                            href="mailto:soporte@sigowebs.com"
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            soporte@sigowebs.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <PhoneIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-gray-900">Teléfono de soporte</h3>
                                        <p className="text-gray-600 text-sm">Disponible de Lunes a Viernes, 9:00 AM - 6:00 PM</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <MapPinIcon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-gray-900">Ubicación</h3>
                                        <p className="text-gray-600 text-sm">Ecuador</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4">Envíanos un mensaje</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                        Nombre completo
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                        Mensaje
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={4}
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">¿Necesitas ayuda inmediata?</h2>
                        <p className="text-gray-600 text-sm">
                            Si necesitas asistencia inmediata, por favor comunícate directamente a nuestro correo de soporte:
                            <a
                                href="mailto:soporte@sigowebs.com"
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                soporte@sigowebs.com
                            </a>
                        </p>
                        <p className="mt-2 text-gray-600 text-sm">
                            Nuestro equipo de soporte está listo para ayudarte con cualquier consulta o problema que puedas tener.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
