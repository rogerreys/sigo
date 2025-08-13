// app/contexts/GroupContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Group } from '../../types';
import { groupsService } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

type GroupContextType = {
  selectedGroup: Group | null;
  setSelectedGroup: (group: Group | null) => void;
  groups: Group[];
  loading: boolean;
};

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const { data, error } = await groupsService.getAll();
        if (data) {
          setGroups(data);
          if (user?.group_id) {
            const currentGroup = data.find(g => g.id === user.group_id);
            setSelectedGroup(currentGroup || null);
          }
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [user?.group_id]);

  return (
    <GroupContext.Provider value={{ selectedGroup, setSelectedGroup, groups, loading }}>
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