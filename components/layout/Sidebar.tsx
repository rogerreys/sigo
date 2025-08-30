import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  StatsIcon,
  CustomersIcon,
  InventoryIcon,
  MdAssignmentIcon,
  SettingsIcon,
  MenuIcon,
  CloseIcon
} from "../../utils/icons";

const navItems = [
  { to: '/stats', icon: StatsIcon, label: 'Estadisticas' },
  { to: '/clients', icon: CustomersIcon, label: 'Clientes' },
  { to: '/inventory', icon: InventoryIcon, label: 'Inventario' },
  { to: '/work-orders', icon: MdAssignmentIcon, label: 'Órdenes de Trabajo' },
  { to: '/settings', icon: SettingsIcon, label: 'Configuración' },
];

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Check if mobile view
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when a link is clicked on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-primary-600 text-white";
  
  // Sidebar width classes
  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const mobileSidebarClasses = isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0';
  const overlayClasses = isOpen ? 'opacity-50 visible' : 'opacity-0 invisible';

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-md text-white bg-gray-800 md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 md:hidden ${overlayClasses}`}
        onClick={toggleSidebar}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative h-screen bg-sidebar text-white z-50 transition-all duration-300 ease-in-out ${sidebarWidth} ${mobileSidebarClasses}`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-20 border-b border-gray-700 px-4`}>
          {!isCollapsed && (
            <h1 className="text-2xl font-bold text-white">
              <NavLink to="/dashboard">SIGO</NavLink>
            </h1>
          )}
          {!isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-full hover:bg-gray-700"
              aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
            >
              {isCollapsed ? (
                <MenuIcon className="h-6 w-6" />
              ) : (
                <CloseIcon className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
        
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) => 
                `${linkClasses} ${isActive ? activeLinkClasses : ''} mb-2 ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? item.label : ''}
            >
              <item.icon className="h-6 w-6" />
              {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
