import React, { useState, useEffect } from 'react';
import { Configurations } from '../../types';

interface EditConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuration: Configurations | null;
  onSave: (id: number, data: { option_value: string }) => Promise<void>;
}

export const EditConfigurationModal: React.FC<EditConfigurationModalProps> = ({
  isOpen,
  onClose,
  configuration,
  onSave,
}) => {
  const [value, setValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (configuration) {
      setValue(configuration.option_value || '');
    }
  }, [configuration]);

  if (!isOpen || !configuration) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    try {
      setIsSaving(true);
      await onSave(configuration.id, { option_value: value });
      onClose();
    } catch (error) {
      console.error('Error updating configuration:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Editar Configuración
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="config-name" className="block text-sm font-medium text-gray-700 mb-1">
                {configuration.description || configuration.option_name}
              </label>
              {configuration.data_type === 'boolean' && (
                <div className="mt-1">
                  <input
                    type="checkbox"
                    id="config-value"
                    checked={value === 'true'}
                    onChange={(e) => setValue(e.target.checked ? 'true' : 'false')}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
              )}
              {configuration.data_type === 'number' || configuration.data_type === 'integer' && (
                <input
                type="number"
                id="config-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
              )}
              {configuration.data_type === 'text' && (
                <input
                type="text"
                id="config-value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={isSaving || !value.trim()}
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
