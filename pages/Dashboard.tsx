
import React from 'react';
import { FaTools, FaCreditCard, FaShieldAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Login/Register */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center
                    ">
                        <FaTools className="h-8 w-8 text-blue-600 mr-2" />
                        <h1 className="text-2xl font-bold text-gray-800">AutoMech Solutions</h1>
                    </div>
                    <div className="space-x-2">
                        <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                            Iniciar Sesión
                        </button>
                        {/*<button onClick={() => navigate('/register')} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                            Registrarse
                        </button>*/}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <div className="bg-white">
                <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Servicio Automotriz Profesional
                    </h1>
                    <p className="mt-6 max-w-3xl mx-auto text-xl text-gray-500">
                        Expertos en mantenimiento y reparación de vehículos con más de 10 años de experiencia. 
                        Ofrecemos servicios de calidad con garantía y tecnología de punta.
                    </p>
                    <div className="mt-10 flex justify-center">
                        <button onClick={() => navigate('/services')} className="bg-blue-600 text-white px-8 py-3 rounded-md text-base font-medium hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                            Nuestros Servicios
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-12 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Servicios</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Todo lo que tu auto necesita
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                            {[
                                {
                                    icon: <FaTools className="h-6 w-6 text-blue-600" />,
                                    title: 'Mantenimiento',
                                    description: 'Servicio preventivo y correctivo para mantener tu vehículo en óptimas condiciones.'
                                },
                                {
                                    icon: <FaShieldAlt className="h-6 w-6 text-blue-600" />,
                                    title: 'Garantía',
                                    description: 'Trabajos garantizados con repuestos de la más alta calidad.'
                                },
                                {
                                    icon: <FaCreditCard className="h-6 w-6 text-blue-600" />,
                                    title: 'Múltiples formas de pago',
                                    description: 'Aceptamos todas las tarjetas, transferencias y efectivo.'
                                }
                            ].map((feature, index) => (
                                <div key={index} className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                    <div className="flex items-center">
                                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-50 text-blue-600">
                                            {feature.icon}
                                        </div>
                                        <h3 className="ml-4 text-lg leading-6 font-medium text-gray-900">{feature.title}</h3>
                                    </div>
                                    <p className="mt-2 text-base text-gray-500">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Formas de Pago</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Aceptamos múltiples métodos de pago
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Realiza tus pagos de manera segura y sencilla
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
                            {['Visa', 'Mastercard', 'American Express', 'PayPal', 'Efectivo'].map((method, index) => (
                                <div key={index} className="col-span-1 flex justify-center py-8 px-8 bg-gray-50 rounded-lg">
                                    <div className="max-h-12 flex items-center">
                                        <p className="text-gray-700 font-medium">{method}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-blue-700">
                <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                        <span className="block">¿Listo para agendar tu cita?</span>
                    </h2>
                    <p className="mt-4 text-lg leading-6 text-blue-200">
                        Regístrate ahora y obtén un 10% de descuento en tu primer servicio.
                    </p>
                    <button onClick={() => navigate('/register')} className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto">
                        Comenzar ahora
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        <div className="space-y-8 xl:col-span-1">
                            <div className="flex items-center">
                                <FaTools className="h-8 w-8 text-blue-400 mr-2" />
                                <span className="text-white text-xl font-bold">AutoMech Solutions</span>
                            </div>
                            <p className="text-gray-300 text-base">
                                Expertos en servicio automotriz con años de experiencia ofreciendo la mejor calidad en mantenimiento y reparación de vehículos.
                            </p>
                        </div>
                        <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Empresa</h3>
                                    <ul className="mt-4 space-y-4">
                                        <li><a href="#" className="text-base text-gray-300 hover:text-white">Sobre Nosotros</a></li>
                                        <li><a href="#" className="text-base text-gray-300 hover:text-white">Servicios</a></li>
                                        <li><a href="#" className="text-base text-gray-300 hover:text-white">Contacto</a></li>
                                    </ul>
                                </div>
                                <div className="mt-12 md:mt-0">
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Soporte</h3>
                                    <ul className="mt-4 space-y-4">
                                        <li><a href="#" className="text-base text-gray-300 hover:text-white">Preguntas Frecuentes</a></li>
                                        <li><a href="#" className="text-base text-gray-300 hover:text-white">Términos y Condiciones</a></li>
                                        <li><a href="#" className="text-base text-gray-300 hover:text-white">Política de Privacidad</a></li>
                                    </ul>
                                </div>
                            </div>
                            <div className="md:grid md:grid-cols-1 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contacto</h3>
                                    <ul className="mt-4 space-y-4">
                                        <li className="text-base text-gray-300">contacto@automech.com</li>
                                        <li className="text-base text-gray-300">+1 (555) 123-4567</li>
                                        <li className="text-base text-gray-300">Av. Principal #123, Ciudad</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-gray-700 pt-8">
                        <p className="text-base text-gray-400 text-center">
                            &copy; {new Date().getFullYear()} AutoMech Solutions. Todos los derechos reservados.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;
