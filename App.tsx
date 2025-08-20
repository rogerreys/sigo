
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Inventory from './pages/Inventory';
import WorkOrders from './pages/WorkOrders';
import NewWorkOrder from './pages/NewWorkOrder';
import Settings from './pages/Settings';
import NewUserForm from './pages/NewUserForm';
import NewClient from './pages/NewClient';
import NewProduct from './pages/NewProduct';
import { GroupProvider } from './components/common/GroupContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-background">
            <div className="text-xl font-semibold text-gray-700">Cargando...</div>
        </div>
    );
  }
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="users" element={<Settings />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="inventory/new" element={<NewProduct />} />
                <Route path="inventory/new/:id" element={<NewProduct />} />
                <Route path="work-orders" element={<WorkOrders />} />
                <Route path="work-orders/new" element={<NewWorkOrder />} />
                <Route path="work-orders/new/:id" element={<NewWorkOrder />} />
                <Route path="settings" element={<Settings />} />
                <Route path="settings/user" element={<NewUserForm />} />
                <Route path="settings/user/:id" element={<NewUserForm />} />
                <Route path="clients/new" element={<NewClient />} />
                <Route path="clients/new/:id" element={<NewClient />} />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <GroupProvider>
          <AppRoutes />
        </GroupProvider>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
