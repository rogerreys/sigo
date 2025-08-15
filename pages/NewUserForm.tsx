import React, { useState, useCallback } from 'react';
import { profileService, roleService, groupsService, profileGroupService } from '../services/supabase';
import Button from '../components/common/Button';
import { InformationCircleIcon } from '../utils/icons';
import { useNavigate } from 'react-router-dom';
import { Database } from '../types/supabase';
import GroupGuard from '../components/common/GroupGuard';
import { useGroup } from '../components/common/GroupContext';

interface NewUserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const NewUserForm: React.FC<NewUserFormProps> = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    group: '',
    profile_name: '',
    profile_id: '',
  });
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<Database['public']['Tables']['profiles']['Row'][]>([]);
  const [group, setGroup] = useState<Database['public']['Tables']['groups']['Row'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataloaded, setDataloaded] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { selectedGroup } = useGroup();

  const fetchGets = useCallback(async () => {
    if (!selectedGroup) return;
    const [rolesRes, usersRes, groupsRes] = await Promise.all([
      roleService.getAll(),
      profileService.getAll(),
      groupsService.getById([{ group_id: selectedGroup.id }])
    ]);
    if (rolesRes.error) throw rolesRes.error;
    if (usersRes.error) throw usersRes.error;
    if (groupsRes.error) throw groupsRes.error;
    if (rolesRes.data) setRoles(rolesRes.data as { id: string; name: string }[]);
    if (usersRes.data) setUsers(usersRes.data as Database['public']['Tables']['profiles']['Row'][]);
    if (groupsRes.data) {
      const group_unique: Database['public']['Tables']['groups']['Row'] = groupsRes.data[0];
      setGroup(group_unique);
    };

    setDataloaded(true);
  }, [selectedGroup]);

  // Fetch roles on component mount
  React.useEffect(() => {
    fetchGets();
  }, [fetchGets]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'profile_name' && value) {
      const selectedUser = users.find(user => user.id === value);
      if (selectedUser) {

        setFormData(prev => ({
          ...prev,
          profile_name: value,
          profile_id: selectedUser.id,
          email: selectedUser.email || '',
          full_name: selectedUser.full_name || ''
        }));
        return;
      }
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
      if (!selectedGroup) throw new Error('No se seleccionó un grupo');
      if (!formData.role) throw new Error('Por favor selecciona un rol');
      if (!formData.profile_id) throw new Error('Por favor selecciona un usuario');
      
      const { data, error } = await profileGroupService.create(
        formData.profile_id, 
        selectedGroup.id, 
        formData.role
      );
      if (error) throw error;
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
      <GroupGuard>
        <h2 className="text-xl font-semibold mb-4">Nuevo Personal</h2>

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
              name="profile_name"
              value={formData.profile_name || ''}
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
              disabled
              readOnly
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
            <input
              type="text"
              name="group_id"
              disabled
              readOnly
              value={group?.name || ''}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Seleccione un rol</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
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
      </GroupGuard>
    </div>
  );
};

export default NewUserForm;