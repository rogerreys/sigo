// app/contexts/GroupContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Group } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { groupsService } from '../../services/supabase';

type GroupContextType = {
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  groups: Group[];
  loading: boolean;
  fetchGroups: () => void;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profileGroup } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

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
      const { data: groups, error } = await profileGroup(user.id);
      if (error) throw error;

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

  return (
    <GroupContext.Provider value={{ selectedGroup, setSelectedGroup, groups, loading, fetchGroups }}>
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