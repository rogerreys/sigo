import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogoutIcon, ChevronDownIcon, UserCircleIcon } from '@/utils/icons';
import { useGroup } from '@/components/common/GroupContext';
import { profileGroupService } from '@/services/supabase';
import { RoleService } from '@/types';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { groups, selectedGroup, setSelectedGroup, loading, hasRole, canEdit, canDelete } = useGroup();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Clear Supabase session and auth state
      await signOut();

      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear local storage and session storage
      localStorage.clear();
      sessionStorage.clear();

      // Reset group selection
      setSelectedGroup(null);

      // Navigate to login page
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/login');
    }
  };

  const handleGroupChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    if (!groupId) return;
    const group = groups.find(g => g.id === groupId) || null;
    setSelectedGroup(group);

    if (!user || !group) return;
    // Obtener roles por grupos
    const { data: roles, error: rolesError } = await profileGroupService.getByIdaGroup(user.id, group.id);
    if (rolesError) throw rolesError;
    if (!roles || roles.length === 0) return;
    if (roles[0] && roles[0].role) {
      hasRole(roles[0].role as RoleService);
    }
    console.log("hasRole: ", roles[0].role);
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              {selectedGroup?.image_url && (
                <div className="h-6 w-6 flex items-center justify-center">
                  <img
                    src={selectedGroup.image_url}
                    alt={selectedGroup.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              )}
              <h1 className="text-lg font-medium text-gray-800">
                {selectedGroup?.name || ''}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Group Selector */}
            <div className="relative group">
              {
                loading ? (
                  <div className="w-48 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-500">Cargando grupos...</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedGroup?.id || ''}
                      onChange={handleGroupChange}
                      className={`block w-48 appearance-none bg-white border-2 ${!selectedGroup ? 'border-red-500 animate-pulse' : 'border-gray-200 hover:border-gray-300'} pl-10 pr-8 py-2 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 cursor-pointer`}
                      title={!selectedGroup ? 'Por favor selecciona un grupo' : ''}
                    >
                      <option value="" disabled>Seleccionar grupo</option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.id} className="flex items-center">
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      {selectedGroup?.image_url ? (
                        <img 
                          src={selectedGroup.image_url} 
                          alt={selectedGroup.name}
                          className="h-5 w-5 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                          {selectedGroup?.name?.charAt(0)?.toUpperCase() || 'G'}
                        </div>
                      )}
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <ChevronDownIcon className="h-4 w-4" />
                    </div>
                  </div>
                )
              }
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || <UserCircleIcon className="h-6 w-6" />}
                </div>
              </button>

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1" role="menu">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || ''}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center transition-colors"
                        role="menuitem"
                      >
                        <LogoutIcon className="mr-3 h-5 w-5 text-gray-400" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;