// app/contexts/GroupContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Group, RoleService } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { groupsService } from '../../services/supabase';
import { canEdit as canEditUtil, canDelete as canDeleteUtil, canView as canViewUtil } from '@/utils/rbac';

type GroupContextType = {
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  groups: Group[];
  loading: boolean;
  fetchGroups: () => void;
  canEdit: () => boolean;
  canDelete: () => boolean;
  canView: () => boolean;
  hasRole: (role: RoleService) => void;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profileGroup } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<RoleService | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    if (!user) {
      setLoading(false);
      setGroups([]);
      setSelectedGroup(null);
      return;
    }

    try {
      setLoading(true);
      // Obtener el grupo al que pertenece el usuario
      const { data: groups, error } = await profileGroup(user.id);
      if (error) throw error;
      // Obtener detalle de los grupos
      if (groups) {
        const { data, error } = await groupsService.getById(groups);
        if (error) throw error;
        setGroups(data || []);
      }
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const canEdit = (): boolean => {
    return role ? canEditUtil(role) : false;
  };

  const canDelete = (): boolean => {
    return role ? canDeleteUtil(role) : false;
  };

  const canView = (): boolean => {
    return role ? canViewUtil(role) : false;
  };

  const hasRole = (role: RoleService) => {
    setRole(role);
  };

  return (
    <GroupContext.Provider value={{ selectedGroup, setSelectedGroup, groups, loading, fetchGroups, canEdit, canDelete, canView, hasRole }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};