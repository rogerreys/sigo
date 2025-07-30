
import { useContext } from 'react';
import { useAuth as useAuthFromContext } from '../contexts/AuthContext';

export const useAuth = () => {
    return useAuthFromContext();
};
