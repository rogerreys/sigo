import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, singUp } = useAuth();
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
        const { data, error } = await singUp(email, password);
        if (error) throw error;
        // Si el registro es exitoso, cambiamos al modo de inicio de sesión
        profileService.create({
          user_id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata.full_name,
          role_id: data.user.user_metadata.role_id,
          role: data.user.user_metadata.role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        setIsLogin(true);
        setError('¡Registro exitoso! Por favor inicia sesión.');
      }
      
      if (isLogin) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error. Por favor intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">SIGVS</h1>
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
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
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
              placeholder="correo@ejemplo.com"
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
