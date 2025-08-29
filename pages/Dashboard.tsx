import React from 'react';
import { FaUsers, FaClipboardCheck, FaChartLine, FaFileInvoiceDollar } from 'react-icons/fa';
import { MdOutlineSupportAgent, MdOutlineInventory } from 'react-icons/md';
import { GiAutoRepair } from 'react-icons/gi';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
                <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                        <span className="block">SIGO</span>
                        <span className="block text-blue-200">Sistema Integral de Gestión de Ventas y Servicios</span>
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-blue-100">
                        Optimice su taller mecánico o negocio automotriz con nuestra solución todo en uno. Gestione clientes, inventario, órdenes de trabajo y facturación desde una sola plataforma.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={() => navigate('/work-orders/new')}
                            className="bg-white text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
                        >
                            Crear Nueva Orden
                        </button>
                        <button 
                            onClick={() => navigate('/inventory')}
                            className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
                        >
                            Ver Inventario
                        </button>
                    </div>
                </div>
            </div>

            {/* Value Proposition */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">¿Por qué elegir SIGO?</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            La solución completa para su negocio automotriz
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: <FaUsers className="h-12 w-12 text-blue-600" />,
                                title: 'Gestión de Clientes',
                                description: 'Mantenga un registro completo de sus clientes, historial de servicios y vehículos. Envíe recordatorios de mantenimiento y ofertas personalizadas.'
                            },
                            {
                                icon: <FaClipboardCheck className="h-12 w-12 text-blue-600" />,
                                title: 'Órdenes de Trabajo',
                                description: 'Cree y gestione órdenes de trabajo de forma eficiente, con seguimiento en tiempo real del estado de cada reparación y servicio.'
                            },
                            {
                                icon: <MdOutlineInventory className="h-12 w-12 text-blue-600" />,
                                title: 'Control de Inventario',
                                description: 'Gestione su inventario con alertas de stock bajo, seguimiento de proveedores y control de precios de manera sencilla.'
                            },
                            {
                                icon: <FaFileInvoiceDollar className="h-12 w-12 text-blue-600" />,
                                title: 'Facturación Electrónica',
                                description: 'Genere facturas electrónicas que cumplen con las regulaciones fiscales y envíelas directamente a sus clientes por correo electrónico.'
                            },
                            {
                                icon: <FaChartLine className="h-12 w-12 text-blue-600" />,
                                title: 'Reportes Avanzados',
                                description: 'Analice el rendimiento de su negocio con reportes detallados de ventas, servicios, rentabilidad y más.'
                            },
                            {
                                icon: <MdOutlineSupportAgent className="h-12 w-12 text-blue-600" />,
                                title: 'Soporte Personalizado',
                                description: 'Nuestro equipo de soporte está listo para ayudarle en cada paso del camino, con capacitación y asistencia continua.'
                            }
                        ].map((feature, index) => (
                            <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">{feature.title}</h3>
                                <p className="text-gray-600 text-center">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            Lo que dicen nuestros clientes
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {[
                            {
                                quote: "Desde que implementamos SIGO, hemos reducido el tiempo de facturación en un 40% y mejorado significativamente la satisfacción de nuestros clientes.",
                                author: "Carlos Mendez",
                                role: "Dueño, Taller Mecánico Rápido"
                            },
                            {
                                quote: "La gestión de inventario nunca fue tan sencilla. Las alertas de stock bajo nos han ayudado a evitar pérdidas por falta de repuestos.",
                                author: "Ana Torres",
                                role: "Gerente, AutoServicio Total"
                            },
                            {
                                quote: "Excelente soporte y una plataforma intuitiva. Nuestros técnicos la adoptaron rápidamente y ahora todo el flujo de trabajo es más eficiente.",
                                author: "Roberto Jiménez",
                                role: "Director, Centro de Servicio Automotriz"
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                                <div className="mb-4">
                                    <div className="flex items-center text-yellow-400 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                                </div>
                                <div className="mt-4">
                                    <p className="font-medium text-gray-900">{testimonial.author}</p>
                                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-blue-700">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                    <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        <span className="block">¿Listo para transformar su negocio?</span>
                        <span className="block text-blue-200">Comience su prueba gratuita hoy mismo.</span>
                    </h2>
                    <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                        <div className="inline-flex rounded-md shadow">
                            <button
                                onClick={() => navigate('/signup')}
                                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                            >
                                Comenzar Ahora
                            </button>
                        </div>
                        <div className="ml-3 inline-flex rounded-md shadow">
                            <button
                                onClick={() => navigate('/contact')}
                                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 bg-opacity-60 hover:bg-opacity-70"
                            >
                                Hablar con un asesor
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        <div className="space-y-8 xl:col-span-1">
                            <div className="flex items-center">
                                <GiAutoRepair className="h-10 w-10 text-blue-400 mr-3" />
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">SIGO</span>
                            </div>
                            <p className="text-gray-300 text-base">
                                Solución integral para la gestión de talleres mecánicos y negocios de servicios automotrices. Optimice sus operaciones y haga crecer su negocio con nuestras herramientas especializadas.
                            </p>
                            <div className="flex space-x-6">
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Facebook</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Instagram</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Solución</h3>
                                    <ul className="mt-4 space-y-4">
                                        <li><a href="/features" className="text-base text-gray-300 hover:text-white">Características</a></li>
                                        <li><a href="/pricing" className="text-base text-gray-300 hover:text-white">Precios</a></li>
                                        <li><a href="/integrations" className="text-base text-gray-300 hover:text-white">Integraciones</a></li>
                                        <li><a href="/updates" className="text-base text-gray-300 hover:text-white">Actualizaciones</a></li>
                                    </ul>
                                </div>
                                <div className="mt-12 md:mt-0">
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Soporte</h3>
                                    <ul className="mt-4 space-y-4">
                                        <li><a href="/help-center" className="text-base text-gray-300 hover:text-white">Centro de Ayuda</a></li>
                                        <li><a href="/tutorials" className="text-base text-gray-300 hover:text-white">Tutoriales</a></li>
                                        <li><a href="/blog" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                                        <li><a href="/contact" className="text-base text-gray-300 hover:text-white">Contacto</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Compañía</h3>
                                    <ul className="mt-4 space-y-4">
                                        <li><a href="/about" className="text-base text-gray-300 hover:text-white">Nosotros</a></li>
                                        <li><a href="/careers" className="text-base text-gray-300 hover:text-white">Carreras</a></li>
                                        <li><a href="/partners" className="text-base text-gray-300 hover:text-white">Socios</a></li>
                                    </ul>
                                </div>
                                <div className="mt-12 md:mt-0">
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                                    <ul className="mt-4 space-y-4">
                                        <li><a href="/privacy" className="text-base text-gray-300 hover:text-white">Política de Privacidad</a></li>
                                        <li><a href="/terms" className="text-base text-gray-300 hover:text-white">Términos de Servicio</a></li>
                                        <li><a href="/security" className="text-base text-gray-300 hover:text-white">Seguridad</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-800">
                        <p className="text-base text-gray-400 text-center">
                            &copy; {new Date().getFullYear()} SIGO. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
