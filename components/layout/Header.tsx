
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogoutIcon, ChevronDownIcon } from '../../utils/icons';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center py-4 px-6 bg-surface border-b-2 border-gray-100">
      <div className="flex items-center">
        {/* Can add search bar here if needed */}
      </div>
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="relative z-10 block h-8 w-8 rounded-full overflow-hidden border-2 border-gray-600 focus:outline-none focus:border-white flex items-center justify-center bg-primary-500 text-white font-bold"
        >
          {user?.name?.charAt(0).toUpperCase()}
        </button>
        {dropdownOpen && (
          <div
            onClick={() => setDropdownOpen(false)}
            className="fixed inset-0 h-full w-full z-10"
          ></div>
        )}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md overflow-hidden shadow-xl z-20">
            <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <a
              href="#"
              onClick={handleLogout}
              className="flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
            >
              <LogoutIcon className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
