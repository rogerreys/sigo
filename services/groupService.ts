import { supabase } from './supabase';
import { Database } from '../types/supabase';

type GroupInsert = Database['public']['Tables']['groups']['Insert'];
type GroupUpdate = Database['public']['Tables']['groups']['Update'];

export const groupService = {
  // Obtener todos los grupos (solo para administradores)
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching groups:', error);
      return { data: null, error };
    }
  },

  // Obtener grupos creados por el usuario actual
  getMyGroups: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .or(`created_by.eq.${user.id},id.in.(${
          supabase
            .from('profiles')
            .select('group_id')
            .eq('id', user.id)
            .not('group_id', 'is', null)
        })`)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return { data: null, error };
    }
  },

  // Obtener un grupo por ID
  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching group by ID:', error);
      return { data: null, error };
    }
  },

  // Crear un nuevo grupo
  create: async (groupData: Omit<GroupInsert, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('groups')
        .insert([
          {
            ...groupData,
            created_by: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating group:', error);
      return { data: null, error };
    }
  },

  // Actualizar un grupo
  update: async (id: string, groupData: Partial<GroupUpdate>) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update({
          ...groupData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating group:', error);
      return { data: null, error };
    }
  },

  // Eliminar un grupo
  delete: async (id: string) => {
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting group:', error);
      return { error };
    }
  },

  // Obtener miembros de un grupo
  getGroupMembers: async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('group_id', groupId)
        .order('full_name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching group members:', error);
      return { data: null, error };
    }
  },

  // Agregar usuario a un grupo
  addUserToGroup: async (userId: string, groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ group_id: groupId })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error adding user to group:', error);
      return { data: null, error };
    }
  },

  // Remover usuario de un grupo
  removeUserFromGroup: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ group_id: null })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error removing user from group:', error);
      return { data: null, error };
    }
  },

  // Verificar si el usuario actual es administrador del grupo
  isGroupAdmin: async (groupId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { isAdmin: false, error: 'Usuario no autenticado' };

      // Verificar si el usuario es administrador del sistema
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'admin') {
        return { isAdmin: true, error: null };
      }

      // Verificar si el usuario es el creador del grupo
      const { data: group, error } = await supabase
        .from('groups')
        .select('created_by')
        .eq('id', groupId)
        .single();

      if (error) throw error;
      return { isAdmin: group?.created_by === user.id, error: null };
    } catch (error) {
      console.error('Error checking group admin status:', error);
      return { isAdmin: false, error };
    }
  },
};
