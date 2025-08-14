import React from 'react';
import { useGroup } from './GroupContext';

type GroupGuardProps = {
  children: React.ReactNode;
  message?: string;
};

const GroupGuard: React.FC<GroupGuardProps> = ({ 
  children, 
  message = 'Por favor seleccione un grupo para continuar' 
}) => {
  const { selectedGroup } = useGroup();

  if (!selectedGroup) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
        <div className="text-4xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Grupo no seleccionado</h3>
        <p className="text-gray-600 text-center">{message}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default GroupGuard;
