import React, { useState } from 'react';
import { profileService, roleService, groupsService } from '../services/supabase';
import Button from '../components/common/Button';
import { InformationCircleIcon } from '../utils/icons';
import {useAuth} from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Database } from '../types/supabase';

interface NewUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const NewUserForm: React.FC<NewUserFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role_id: '',
  });
  const [roles, setRoles] = useState<{id: string; name: string}[]>([]);
  const [groups, setGroups] = useState<{id: string; name: string}[]>([]);
  const [users, setUsers] = useState<Database['public']['Tables']['profiles']['Row'][]>([]);
  const [loading, setLoading] = useState(false);
  const [dataloaded, setDataloaded] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Fetch roles on component mount
  React.useEffect(() => {
    const fetchRoles = async () => {
      const { data, error } = await roleService.getAll();
      if (data) {
        setRoles(data);
        // Set default role to 'staff' if available
        const staffRole = data.find(role => role.name === 'staff');
        if (staffRole) {
          setFormData(prev => ({ ...prev, role_id: staffRole.id }));
        }
      }
    };
    const fetchGroups = async () => {
      const { data, error } = await groupsService.getAll();
      if (error) throw error;
      if (data) {
        setGroups(data);
      }
    }
    const fetchUser = async () => {
      const { data, error } = await profileService.getAll();
      if (error) throw error;
      if (data) {
        setUsers(data);
      }
    }
    fetchRoles();
    fetchGroups();
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if(value){
      console.log(value);
      setDataloaded(true);
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. First, sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No se pudo crear el usuario');

      // 2. Get the role name for the profile
      const rolesResponse = await roleService.getAll();
      if (rolesResponse.error) throw rolesResponse.error;
      
      const role = rolesResponse.data?.find(r => r.id === formData.role_id);
      if (!role) throw new Error('Rol no encontrado');

      // 3. Create the user profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.full_name,
          role_id: formData.role_id,
          role: role.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;

      // 4. If email confirmation is required, show success message
      if (authData.user.identities && authData.user.identities.length === 0) {
        // User already exists
        throw new Error('El correo electrónico ya está registrado');
      }

      // 5. Show success message and reset form
      if (onSuccess) onSuccess();
      
      // 6. Optionally sign in the user immediately
      if (authData.session) {
        const { error: signInError } = await signIn(formData.email, formData.password);
        if (signInError) throw signInError;
      }

      // 7. Show success message
      alert('Usuario creado exitosamente. ' + 
        (authData.user.identities ? 'Por favor revisa tu correo para confirmar tu cuenta.' : ''));
      
      // 8. Navigate to settings
      navigate('/settings');
      
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.message || 'Error al crear el usuario. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  onCancel = () => {
    navigate('/settings');
  };
  onSuccess = () => {
    navigate('/settings');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Nuevo Usuario</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <select
            name="user_id"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione un usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Grupo <span className="text-red-500">*</span>
          </label>
          <select
            name="group_id"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione un grupo</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Rol <span className="text-red-500">*</span>
            </label>
            <div className="group relative ml-1">
              <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-500 cursor-help" />
              <div className="absolute z-10 hidden group-hover:block w-64 p-2 -ml-2 mt-1 text-xs text-gray-600 bg-white border border-gray-200 rounded shadow-lg">
                Seleccione el nivel de acceso del nuevo usuario.
              </div>
            </div>
          </div>
          <select
            name="role_id"
            value={formData.role_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Seleccione un rol</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Cancelar
          </button>
          <Button
            type="submit"
            disabled={loading}
            className="px-4 py-2"
            onClick={handleSubmit}
          >
            {loading ? 'Creando...' : 'Crear Usuario'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewUserForm;