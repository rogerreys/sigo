import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { profileService } from '@/services/supabase';
import { RoleService } from '@/types';
import { FaHome } from 'react-icons/fa';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHomeText, setShowHomeText] = useState(false);
  const { signIn, singUp, deleteUserById } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { data, error } = await singUp(email, password, fullName, phone);
        if (error) throw error;
        // Si el registro es exitoso, cambiamos al modo de inicio de sesión
        const { data: profileData, error: profileError } = await profileService.create({
          id: data.user.id,
          email: email,
          full_name: fullName,
          role: RoleService.administrador,
          user_id: data.user.id,
          phone: phone,
        });
        if (profileError) {
          await deleteUserById(data.user.id);
          throw profileError;
        }

        setIsLogin(true);
        setError('¡Registro exitoso! Por favor inicia sesión.');
      }

      if (isLogin) {
        navigate('/stats');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Por favor intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 relative">
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
          <FaHome className="w-5 h-5" />
        </button>
      </div>
      
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900" onClick={() => navigate('/dashboard')}>SIGO</h1>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea una nueva cuenta'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Nombre Completo
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ingresar Nombre Completo"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Ingresar Telefono"
                  minLength={10}
                  maxLength={10}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ingresar Correo Electrónico"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder={isLogin ? '••••••••' : 'Mínimo 6 caracteres'}
              minLength={isLogin ? 1 : 6}
            />
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={loading}
            >
              {loading ? (
                'Cargando...'
              ) : isLogin ? (
                'Iniciar sesión'
              ) : (
                'Registrarse'
              )}
            </Button>
          </div>
        </form>

        <div className="text-sm text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
          >
            {isLogin
              ? '¿No tienes una cuenta? Regístrate'
              : '¿Ya tienes una cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
