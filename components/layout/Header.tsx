import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogoutIcon, ChevronDownIcon, UserCircleIcon } from '../../utils/icons';
import { groupsService } from '../../services/supabase';
import { useGroup } from '../../components/common/GroupContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { groups, selectedGroup, setSelectedGroup, loading } = useGroup();
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

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    if (!groupId) return;
    const group = groups.find(g => g.id === groupId) || null;
    setSelectedGroup(group);
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">{selectedGroup?.description || ''}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Group Selector */}
            <div className="relative group">
              {
                loading ? (<div>Cargando grupos...</div>) : (
                  <select
                    value={selectedGroup?.id || ''}
                    onChange={handleGroupChange}
                    className="block w-48 appearance-none bg-white border border-gray-200 hover:border-gray-300 px-4 py-2 pr-8 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                  >
                    <option value="" disabled>Seleccionar grupo</option>
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                )
              }
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <ChevronDownIcon className="h-4 w-4" />
              </div>
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