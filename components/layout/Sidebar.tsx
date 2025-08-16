
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  DashboardIcon,
  CustomersIcon,
  InventoryIcon,
  MdAssignmentIcon,
  SettingsIcon
} from "../../utils/icons";

const navItems = [
  { to: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { to: '/clients', icon: CustomersIcon, label: 'Clientes' },
  { to: '/inventory', icon: InventoryIcon, label: 'Inventario' },
  { to: '/work-orders', icon: MdAssignmentIcon, label: 'Órdenes de Trabajo' },
  { to: '/settings', icon: SettingsIcon, label: 'Configuración' },
];

const Sidebar: React.FC = () => {
  const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-primary-600 text-white";

  return (
    <div className="flex flex-col w-64 bg-sidebar text-white">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">SIGVS</h1>
      </div>
      <nav className="flex-1 px-4 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <item.icon className="h-6 w-6 mr-3" />
            <span className="mx-4 font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
