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

const NewUserForm: React.FC<NewUserFormProps> = () => {
  interface FormData {
    email: string;
    role: string;
    group: string;
    profile_name: string;
    profile_id: string;
    full_name?: string;
  }

  const [formData, setFormData] = useState<FormData>({
    email: '',
    role: '',
    group: '',
    profile_name: '',
    profile_id: '',
    full_name: ''
  });
  const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<Database['public']['Tables']['profiles']['Row'][]>([]);
  const [group, setGroup] = useState<Database['public']['Tables']['groups']['Row'] | null>(null);
  const [loading, setLoading] = useState(false);
  // Removed unused state variable
  const [error, setError] = useState('');
  const [existingRole, setExistingRole] = useState<string | null>(null);
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
  }, [selectedGroup]);

  // Fetch roles on component mount
  React.useEffect(() => {
    fetchGets();
  }, [fetchGets]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update form data first
    const updatedFormData = {
      ...formData,
      [name]: value
    };

    // If profile_name is being changed
    if (name === 'profile_name' && value && selectedGroup) {
      try {
        const selectedUser = users.find(user => user.id === value);
        if (selectedUser) {
          // Update user details in form data
          updatedFormData.profile_id = selectedUser.id;
          updatedFormData.email = selectedUser.email || '';
          updatedFormData.full_name = selectedUser.full_name || '';
          updatedFormData.profile_name = value;

          // Check if user already has a role in this group
          const { data: existingRoles, error } = await profileGroupService.getProfilesGroupsRoleByIds(
            [selectedUser.id],
            selectedGroup.id
          );

          if (error) throw error;

          if (existingRoles && existingRoles.length > 0) {
            setExistingRole(existingRoles[0].role);
          } else {
            setExistingRole(null);
          }
        }
      } catch (error) {
        console.error('Error al verificar roles existentes:', error);
        setError('Error al verificar los roles del usuario');
      }
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!selectedGroup) throw new Error('No se seleccionó un grupo');
      if (!formData.role) throw new Error('Por favor selecciona un rol');
      if (!formData.profile_id) throw new Error('Por favor selecciona un usuario');

      const { error } = await profileGroupService.create(
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

  const handleCancel = () => {
    navigate('/settings');
  };

  // Removed unused handleSuccess function

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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="profile_name"
                value={formData.profile_name || ''}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border ${existingRole ? 'border-yellow-400 bg-yellow-50' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Seleccione un usuario</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>
            {existingRole && (
              <div className="absolute right-3 top-2 grap-10 transform -translate-y-1/2 text-yellow-600 text-sm">
                Ya tiene rol: {existingRole}
              </div>
            )}
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
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={!!existingRole}
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